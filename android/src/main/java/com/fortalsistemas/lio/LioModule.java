package com.fortalsistemas.lio;


import android.app.Activity;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.HashMap;
import java.util.Map;
import android.util.Log;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.support.annotation.Nullable;

import org.json.JSONException;
import org.json.JSONObject;

import cielo.orders.domain.Credentials;
import cielo.orders.domain.Order;
import cielo.sdk.order.OrderManager;
import cielo.sdk.order.ServiceBindListener;

public class LioModule extends ReactContextBaseJavaModule {
  private String clientID = "";
  private String accessToken = "";
  private Credentials credentials;
  private OrderManager orderManager;
  private Order order;

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
        Log.d("DEBUG", "Serviço conectado com Sucesso");
      }

      @Override
      public void onServiceUnbound() {
        // O serviço foi desvinculado
        Log.d("DEBUG", "O serviço foi desvinculado");
      }
    };

    orderManager.bind(getCurrentActivity(), serviceBindListener);
  }

  @ReactMethod
  public void createDraftOrder(String orderId){
    order = orderManager.createDraftOrder(orderId);
  }

  @ReactMethod
  public void addItems(String items){
    Log.d("DEBUG", items);
    /*try {
      JSONObject jsonItems = new JSONObject(items);
      for(int i = 0; i < jsonItems.length(); i++){

      }
    } catch (JSONException e) {
      e.printStackTrace();
    }*/

  }
  private void sendEvent(ReactContext reactContext,
                         String eventName,
                         @Nullable WritableMap params) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }

}