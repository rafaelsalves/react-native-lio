package com.fortalsistemas.lio;


import android.app.Activity;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import android.util.Log;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.support.annotation.Nullable;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import cielo.orders.domain.Credentials;
import cielo.orders.domain.Order;
import cielo.orders.domain.product.PrimaryProduct;
import cielo.orders.domain.product.SecondaryProduct;
import cielo.sdk.order.OrderManager;
import cielo.sdk.order.ServiceBindListener;
import cielo.sdk.order.payment.PaymentCode;
import cielo.sdk.order.payment.PaymentError;
import cielo.sdk.order.payment.PaymentListener;

public class LioModule extends ReactContextBaseJavaModule {
  private String clientID = "";
  private String accessToken = "";
  private Credentials credentials;
  private OrderManager orderManager;
  private Order order;
  private PaymentListener paymentListener;

  public LioModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "Lio";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    return constants;
  }

  @ReactMethod
  public void initializeLio(String clientID, String accessToken){
    this.clientID = clientID;
    this.accessToken = accessToken;

    credentials = new Credentials(clientID, accessToken);
    orderManager = new OrderManager(credentials, getReactApplicationContext());

    ServiceBindListener serviceBindListener = new ServiceBindListener() {

      @Override public void onServiceBoundError(Throwable throwable) {
        //Ocorreu um erro ao tentar se conectar com o serviço OrderManager
        WritableMap params = Arguments.createMap();
        params.putString("error", throwable.toString());
        sendEvent(getReactApplicationContext(), "LioServiceErrorReceived",params);
      }

      @Override
      public void onServiceBound() {
        //Você deve garantir que sua aplicação se conectou com a LIO a partir desse listener
        //A partir desse momento você pode utilizar as funções do OrderManager, caso contrário uma exceção será lançada.
        Log.d("DEBUG", "Serviço CIELO conectado com Sucesso");
      }

      @Override
      public void onServiceUnbound() {
        // O serviço foi desvinculado
        Log.d("DEBUG", "O serviço foi desvinculado");
      }
    };

    orderManager.bind(getCurrentActivity(), serviceBindListener);

    paymentListener = new PaymentListener() {
      @Override
      public void onStart() {
        WritableMap params = Arguments.createMap();
        params.putString("status", "O pagamento começou.");
        params.putInt("code", 0);
        sendEvent(getReactApplicationContext(), "LioOnPayment", params);
        Log.d("DEBUG", "O pagamento começou.");
      }

      @Override
      public void onPayment(@NotNull Order order) {
        Log.d("DEBUG", "Um pagamento foi realizado.");
        WritableMap params = Arguments.createMap();
        params.putString("status", "Um pagamento foi realizado.");
        params.putInt("code", 1);
        sendEvent(getReactApplicationContext(), "LioOnPayment", params);
      }

      @Override public void onCancel() {
        Log.d("DEBUG", "A operação foi cancelada.");
        WritableMap params = Arguments.createMap();
        params.putString("status", "A operação foi cancelada.");
        params.putInt("code", 2);
        sendEvent(getReactApplicationContext(), "LioOnPayment", params);
      }

      @Override public void onError(@NotNull PaymentError paymentError) {
        Log.d("DEBUG", "Houve um erro no pagamento.");
        WritableMap params = Arguments.createMap();
        params.putString("status", "Houve um erro no pagamento.");
        params.putInt("code", 3);
        sendEvent(getReactApplicationContext(), "LioOnPayment", params);
      }
    };
  }

  @ReactMethod
  public void createDraftOrder(String orderId){
    order = orderManager.createDraftOrder(orderId);
  }

  @ReactMethod
  public void addItems(String items){
    try {
      JSONArray jsonItems = new JSONArray(items);
      for(int i = 0; i < jsonItems.length(); i++){
        JSONObject jsonItem = jsonItems.getJSONObject(i);
        Log.d("DEBUG", jsonItem.getString("descricao"));
        order.addItem(jsonItem.getString("id_produto"), jsonItem.getString("descricao"), jsonItem.getLong("preco"), jsonItem.getInt("quantidade"), "unidade");
      }
      orderManager.placeOrder(order);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void placeOrder(){
    orderManager.placeOrder(order);
  }

  @ReactMethod
  public void checkoutOrder(int value, String paymentCode){
    if(paymentCode.equals("debito")){
      Log.d("DEBUG", paymentCode + " " + value);
      orderManager.checkoutOrder(order.getId(), 5000, PaymentCode.DEBITO_AVISTA, paymentListener);
    }
    else{
      if(paymentCode.equals("credito")){
        orderManager.checkoutOrder(order.getId(), 5000, PaymentCode.DEBITO_AVISTA, paymentListener);
      }
    }

  }

  private void sendEvent(ReactContext reactContext,
                         String eventName,
                         @Nullable WritableMap params) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }

}