package com.fortalsistemas.comunicationapps;

import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.widget.Toast;
import android.content.ContentResolver;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.HashMap;
import java.util.Map;
import android.util.Log;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.support.annotation.Nullable;

import org.json.JSONException;
import org.json.JSONObject;

public class Module extends ReactContextBaseJavaModule {

  private int PROGRESS;

  public Module(ReactApplicationContext reactContext) {
    super(reactContext);

    SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getReactApplicationContext());
    int value = preferences.getInt("progress", -1);
    if(value == -1)
    {
      SharedPreferences.Editor editor = preferences.edit();
      editor.putInt("progress", 0);
      editor.apply();
      PROGRESS = 0;
    }
    else{
      this.PROGRESS = value;
    }
  }

  @Override
  public String getName() {
    return "Lio";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
    constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
    return constants;
  }

  @ReactMethod
  public void getProgress() {
    WritableMap params = Arguments.createMap();
    params.putInt("progress", this.PROGRESS);

    sendEvent(getReactApplicationContext(), "changeProgressValue",params);
  }

  @ReactMethod
  public void setProgress(int progress) throws JSONException {

    Context c = getReactApplicationContext();
    Uri uriLauncher = Uri.parse("content://com.fortalsistemas.launcher.provider/general/1");

    this.PROGRESS = progress;
    ContentValues valueUp = new ContentValues();
    valueUp.put("_progress", this.PROGRESS);
    long id = c.getContentResolver().update(uriLauncher, valueUp, null, null);

    SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getReactApplicationContext());
    SharedPreferences.Editor editor = preferences.edit();
    editor.putInt("progress", this.PROGRESS);
    editor.apply();
    WritableMap params = Arguments.createMap();
    params.putInt("progress", this.PROGRESS);


    sendEvent(getReactApplicationContext(), "changeProgressValue",params);
  }

  private void sendEvent(ReactContext reactContext,
                         String eventName,
                         @Nullable WritableMap params) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }

}