package com.reactnativelio

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Base64
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONObject

class LioDeepLinkModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val reactContext: ReactApplicationContext = reactContext

    init {
        instance = this
    }

    override fun getName(): String {
        return "LioDeepLink"
    }

    companion object {
        @Volatile
        private var instance: LioDeepLinkModule? = null

        fun getInstance(): LioDeepLinkModule? = instance
    }

    /**
     * Checks if a package is installed
     */
    private fun isPackageInstalled(packageManager: android.content.pm.PackageManager, packageName: String): Boolean {
        return try {
            packageManager.getPackageInfo(packageName, 0)
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Saves a Base64 image to storage and returns the path
     * @param base64Image - Base64 string of the image
     * @param fileName - File name (without extension)
     * @param promise - Promise that returns the file path
     */
    @ReactMethod
    fun saveBase64Image(base64Image: String, fileName: String, promise: Promise) {
        try {
            val base64Clean = base64Image.replace(Regex("^data:image/[a-z]+;base64,"), "")
            val imageBytes = Base64.decode(base64Clean, Base64.DEFAULT)
            val bitmap = android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)

            val imagesDir = java.io.File(reactContext.getExternalFilesDir(null), "images")
            if (!imagesDir.exists()) {
                imagesDir.mkdirs()
            }

            val imageFile = java.io.File(imagesDir, "$fileName.jpg")
            val outputStream = java.io.FileOutputStream(imageFile)
            bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 90, outputStream)
            outputStream.flush()
            outputStream.close()

            promise.resolve(imageFile.absolutePath)

        } catch (e: Exception) {
            promise.reject("SAVE_IMAGE_ERROR", "Error saving image: ${e.message}", e)
        }
    }

    /**
     * Sends an intent via deeplink to Cielo LIO
     * @param action - Action to be executed (eg: "payment", "payment-reversal", "print")
     * @param params - Request parameters in object format
     * @param callbackScheme - Scheme to receive the response (eg: "lio://payment-response")
     * @param promise - Promise to return success or error
     */
    @ReactMethod
    fun sendIntent(
        action: String,
        params: ReadableMap,
        callbackScheme: String,
        promise: Promise
    ) {
        try {
            val jsonParams = convertMapToJson(params)
            val jsonString = jsonParams.toString()
            val base64Params = Base64.encodeToString(
                jsonString.toByteArray(),
                Base64.NO_WRAP
            )

            val deeplinkUri = "lio://$action?request=$base64Params&urlCallback=$callbackScheme"

            val packageManager = reactContext.packageManager
            val targetPackage = when {
                isPackageInstalled(packageManager, "com.ads.lio.uriappclient") -> "com.ads.lio.uriappclient"
                isPackageInstalled(packageManager, "br.com.cielosmart.orderservice") -> "br.com.cielosmart.orderservice"
                else -> null
            }

            if (targetPackage == null) {
                promise.reject("NO_HANDLER", "No LIO application found. Check if the Cielo LIO app is installed.")
                return
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse(deeplinkUri)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION or Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS)
                `package` = targetPackage
            }

            reactContext.startActivity(intent)
            promise.resolve(true)

        } catch (e: Exception) {
            promise.reject("SEND_INTENT_ERROR", "Error sending intent: ${e.message}", e)
        }
    }

    /**
     * Sends event to JavaScript when receiving deeplink response
     */
    fun sendEventToJS(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    /**
     * Processes the response received via deeplink
     */
    fun handleDeepLinkResponse(uri: Uri?) {
        try {
            if (uri == null) {
                return
            }

            val responseParam = uri.getQueryParameter("response")
            val responseCode = uri.getQueryParameter("responsecode")

            if (responseParam != null) {
                val decodedBytes = Base64.decode(responseParam, Base64.NO_WRAP)
                val jsonString = String(decodedBytes)
                val jsonObject = JSONObject(jsonString)

                if (responseCode != null) {
                    jsonObject.put("responseCode", responseCode.toIntOrNull() ?: 0)
                }

                val responseMap = convertJsonToMap(jsonObject)

                sendEventToJS("onLioDeepLinkResponse", responseMap)
            }

        } catch (e: Exception) {
            val errorMap = Arguments.createMap().apply {
                putString("error", e.message)
            }
            sendEventToJS("onLioDeepLinkResponse", errorMap)
        }
    }

    /**
     * Converts ReadableMap to JSONObject
     */
    private fun convertMapToJson(readableMap: ReadableMap): JSONObject {
        val jsonObject = JSONObject()
        val iterator = readableMap.keySetIterator()

        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            when (readableMap.getType(key)) {
                ReadableType.Null -> jsonObject.put(key, JSONObject.NULL)
                ReadableType.Boolean -> jsonObject.put(key, readableMap.getBoolean(key))
                ReadableType.Number -> jsonObject.put(key, readableMap.getDouble(key))
                ReadableType.String -> jsonObject.put(key, readableMap.getString(key))
                ReadableType.Map -> jsonObject.put(key, convertMapToJson(readableMap.getMap(key)!!))
                ReadableType.Array -> jsonObject.put(key, convertArrayToJson(readableMap.getArray(key)!!))
            }
        }

        return jsonObject
    }

    /**
     * Converts ReadableArray to JSONArray
     */
    private fun convertArrayToJson(readableArray: ReadableArray): org.json.JSONArray {
        val jsonArray = org.json.JSONArray()

        for (i in 0 until readableArray.size()) {
            when (readableArray.getType(i)) {
                ReadableType.Null -> jsonArray.put(JSONObject.NULL)
                ReadableType.Boolean -> jsonArray.put(readableArray.getBoolean(i))
                ReadableType.Number -> jsonArray.put(readableArray.getDouble(i))
                ReadableType.String -> jsonArray.put(readableArray.getString(i))
                ReadableType.Map -> {
                    val map = readableArray.getMap(i)
                    if (map != null) {
                        jsonArray.put(convertMapToJson(map))
                    } else {
                        jsonArray.put(JSONObject.NULL)
                    }
                }
                ReadableType.Array -> {
                    val array = readableArray.getArray(i)
                    if (array != null) {
                        jsonArray.put(convertArrayToJson(array))
                    } else {
                        jsonArray.put(JSONObject.NULL)
                    }
                }
            }
        }

        return jsonArray
    }

    /**
     * Converts JSONObject to WritableMap
     */
    private fun convertJsonToMap(jsonObject: JSONObject): WritableMap {
        val map = Arguments.createMap()
        val iterator = jsonObject.keys()

        while (iterator.hasNext()) {
            val key = iterator.next()
            val value = jsonObject.get(key)

            when (value) {
                is org.json.JSONArray -> map.putArray(key, convertJsonArrayToWritableArray(value))
                is JSONObject -> map.putMap(key, convertJsonToMap(value))
                is Boolean -> map.putBoolean(key, value)
                is Int -> map.putInt(key, value)
                is Double -> map.putDouble(key, value)
                is String -> {
                    if (value.startsWith("[") || value.startsWith("{")) {
                        try {
                            if (value.startsWith("[")) {
                                val jsonArray = org.json.JSONArray(value)
                                map.putArray(key, convertJsonArrayToWritableArray(jsonArray))
                            } else {
                                val jsonObj = JSONObject(value)
                                map.putMap(key, convertJsonToMap(jsonObj))
                            }
                        } catch (e: Exception) {
                            map.putString(key, value)
                        }
                    } else {
                        map.putString(key, value)
                    }
                }
                JSONObject.NULL -> map.putNull(key)
                else -> map.putString(key, value.toString())
            }
        }

        return map
    }

    /**
     * Converts JSONArray to WritableArray
     */
    private fun convertJsonArrayToWritableArray(jsonArray: org.json.JSONArray): WritableArray {
        val array = Arguments.createArray()

        for (i in 0 until jsonArray.length()) {
            val value = jsonArray.get(i)

            when (value) {
                is org.json.JSONArray -> array.pushArray(convertJsonArrayToWritableArray(value))
                is JSONObject -> array.pushMap(convertJsonToMap(value))
                is Boolean -> array.pushBoolean(value)
                is Int -> array.pushInt(value)
                is Double -> array.pushDouble(value)
                is String -> array.pushString(value)
                JSONObject.NULL -> array.pushNull()
                else -> array.pushString(value.toString())
            }
        }

        return array
    }
}
