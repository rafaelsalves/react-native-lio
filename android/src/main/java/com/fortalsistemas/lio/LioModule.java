package com.fortalsistemas.lio;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

import android.util.Log;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import androidx.annotation.Nullable;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import cielo.orders.domain.Credentials;
import cielo.orders.domain.Order;
import cielo.sdk.order.OrderManager;
import cielo.sdk.order.ServiceBindListener;
import cielo.sdk.order.payment.PaymentCode;
import cielo.sdk.order.payment.PaymentError;
import cielo.sdk.order.payment.PaymentListener;

public class LioModule extends ReactContextBaseJavaModule {
    //CONSTANTS
    private String TAG = "RNLio";
    private static final int STATE_SERVICE_ACTIVE = 0;
    private static final int STATE_SERVICE_ERROR = 1;
    private static final int STATE_SERVICE_INACTIVE = 2;

    private String clientID = "";
    private String accessToken = "";
    private Credentials credentials;
    private OrderManager orderManager;
    private Order order;
    private PaymentListener paymentListener;
    private RCTEventEmitter eventEmitter;
    private ReactApplicationContext reactContext;

    public enum Events {
        ON_CHANGE_SERVICE_STATE("onChangeServiceState"),
        ON_SERVICE_BOUND_ERROR("onServiceBoundError"),
        ON_SERVICE_UNBOUND("onServiceUnbound");

        private final String mName;

        Events(final String name) {
            mName = name;
        }

        @Override
        public String toString() {
            return mName;
        }
    }

    public LioModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
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
    public void setup(String clientID, String accessToken) {
        this.clientID = clientID;
        this.accessToken = accessToken;

        credentials = new Credentials(this.clientID, this.accessToken);
        orderManager = new OrderManager(credentials, this.reactContext);

        ServiceBindListener serviceBindListener = new ServiceBindListener() {
            @Override
            public void onServiceBound() {
                Log.d(TAG, "Serviço CIELO conectado com Sucesso");
                WritableMap stateService = Arguments.createMap();
                stateService.putInt("stateService", STATE_SERVICE_ACTIVE);
                sendEvent(Events.ON_CHANGE_SERVICE_STATE.toString(), stateService);
            }

            @Override
            public void onServiceBoundError(Throwable throwable) {
                Log.d(TAG, "O serviço foi desvinculado");
                WritableMap stateService = Arguments.createMap();
                stateService.putInt("stateService", STATE_SERVICE_ERROR);
                sendEvent(Events.ON_CHANGE_SERVICE_STATE.toString(), stateService);
            }

            @Override
            public void onServiceUnbound() {
                Log.d(TAG, "O serviço foi desvinculado");
                WritableMap stateService = Arguments.createMap();
                stateService.putInt("stateService", STATE_SERVICE_INACTIVE);
                sendEvent(Events.ON_CHANGE_SERVICE_STATE.toString(), stateService);
            }
        };

        orderManager.bind(getCurrentActivity(), serviceBindListener);

        paymentListener = new PaymentListener() {
            @Override
            public void onStart() {
                WritableMap params = Arguments.createMap();
                params.putString("status", "O pagamento começou.");
                params.putInt("code", 0);
                //sendEvent(getReactApplicationContext(), "LioOnPayment", params);
                Log.d(TAG, "O pagamento começou.");
            }

            @Override
            public void onPayment(@NotNull Order order) {
                Log.d(TAG, "Um pagamento foi realizado.");
                WritableMap params = Arguments.createMap();
                params.putString("status", "Um pagamento foi realizado.");
                params.putInt("code", 1);
                //sendEvent(getReactApplicationContext(), "LioOnPayment", params);
            }

            @Override
            public void onCancel() {
                Log.d(TAG, "A operação foi cancelada.");
                WritableMap params = Arguments.createMap();
                params.putString("status", "A operação foi cancelada.");
                params.putInt("code", 2);
                //sendEvent(getReactApplicationContext(), "LioOnPayment", params);
            }

            @Override
            public void onError(@NotNull PaymentError paymentError) {
                Log.d(TAG, "Houve um erro no pagamento.");
                WritableMap params = Arguments.createMap();
                params.putString("status", "Houve um erro no pagamento.");
                params.putInt("code", 3);
                //sendEvent(getReactApplicationContext(), "LioOnPayment", params);
            }
        };
    }

    @ReactMethod
    public void createDraftOrder(String orderId) {
        order = orderManager.createDraftOrder(orderId);
    }

    @ReactMethod
    public void addItems(String items) {
        try {
            JSONArray jsonItems = new JSONArray(items);
            for (int i = 0; i < jsonItems.length(); i++) {
                JSONObject jsonItem = jsonItems.getJSONObject(i);
                Log.d(TAG, jsonItem.getString("descricao"));
                order.addItem(jsonItem.getString("id_produto"), jsonItem.getString("descricao"), jsonItem.getLong("preco"), jsonItem.getInt("quantidade"), "unidade");
            }
            orderManager.placeOrder(order);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void placeOrder() {
        orderManager.placeOrder(order);
    }

    @ReactMethod
    public void checkoutOrder(int value, String paymentCode) {
        if (paymentCode.equals("debito")) {
            Log.d(TAG, paymentCode + " " + value);
            orderManager.checkoutOrder(order.getId(), 5000, PaymentCode.DEBITO_AVISTA, paymentListener);
        } else {
            if (paymentCode.equals("credito")) {
                orderManager.checkoutOrder(order.getId(), 5000, PaymentCode.DEBITO_AVISTA, paymentListener);
            }
        }

    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {

        this.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);

    }

}