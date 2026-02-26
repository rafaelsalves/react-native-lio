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
     * Verifica se um package está instalado
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
     * Salva uma imagem Base64 no storage e retorna o caminho
     * @param base64Image - String Base64 da imagem
     * @param fileName - Nome do arquivo (sem extensão)
     * @param promise - Promise que retorna o caminho do arquivo
     */
    @ReactMethod
    fun saveBase64Image(base64Image: String, fileName: String, promise: Promise) {
        try {
            // Remove o prefixo data:image se existir
            val base64Clean = base64Image.replace(Regex("^data:image/[a-z]+;base64,"), "")

            // Decodifica o Base64
            val imageBytes = Base64.decode(base64Clean, Base64.DEFAULT)

            // Decodifica para Bitmap
            val bitmap = android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)

            // Cria o diretório se não existir
            val imagesDir = java.io.File(reactContext.getExternalFilesDir(null), "images")
            if (!imagesDir.exists()) {
                imagesDir.mkdirs()
            }

            // Salva a imagem como JPG
            val imageFile = java.io.File(imagesDir, "$fileName.jpg")
            val outputStream = java.io.FileOutputStream(imageFile)
            bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 90, outputStream)
            outputStream.flush()
            outputStream.close()

            promise.resolve(imageFile.absolutePath)

        } catch (e: Exception) {
            promise.reject("SAVE_IMAGE_ERROR", "Erro ao salvar imagem: ${e.message}", e)
        }
    }

    /**
     * Envia um intent via deeplink para a Cielo LIO
     * @param action - Ação a ser executada (ex: "payment", "payment-reversal", "print")
     * @param params - Parâmetros da requisição em formato de objeto
     * @param callbackScheme - Scheme para receber a resposta (ex: "lio://payment-response")
     * @param promise - Promise para retornar sucesso ou erro
     */
    @ReactMethod
    fun sendIntent(
        action: String,
        params: ReadableMap,
        callbackScheme: String,
        promise: Promise
    ) {
        try {
            // Converte ReadableMap para JSONObject
            val jsonParams = convertMapToJson(params)

            // Codifica os parâmetros em base64
            val jsonString = jsonParams.toString()
            val base64Params = Base64.encodeToString(
                jsonString.toByteArray(),
                Base64.NO_WRAP
            )

            // Constrói a URI do deeplink
            val deeplinkUri = "lio://$action?request=$base64Params&urlCallback=$callbackScheme"

            // Tenta primeiro com o package da LIO real, depois fallback
            val packageManager = reactContext.packageManager
            val targetPackage = when {
                // Verifica se é máquina LIO real (tem o package novo)
                isPackageInstalled(packageManager, "com.ads.lio.uriappclient") -> "com.ads.lio.uriappclient"
                // Fallback para simulador/desenvolvimento (package antigo)
                isPackageInstalled(packageManager, "br.com.cielosmart.orderservice") -> "br.com.cielosmart.orderservice"
                else -> null
            }

            if (targetPackage == null) {
                promise.reject("NO_HANDLER", "Nenhum aplicativo LIO encontrado. Verifique se o app Cielo LIO está instalado.")
                return
            }

            // Launch the deep link
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse(deeplinkUri)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION or Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS)
                `package` = targetPackage
            }

            reactContext.startActivity(intent)
            promise.resolve(true)

        } catch (e: Exception) {
            promise.reject("SEND_INTENT_ERROR", "Erro ao enviar intent: ${e.message}", e)
        }
    }

    /**
     * Envia evento para o JavaScript quando receber resposta do deeplink
     */
    fun sendEventToJS(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    /**
     * Processa a resposta recebida via deeplink
     */
    fun handleDeepLinkResponse(uri: Uri?) {
        try {
            android.util.Log.d("LioDeepLink", "handleDeepLinkResponse called with URI: $uri")

            if (uri == null) {
                android.util.Log.w("LioDeepLink", "URI is null")
                return
            }

            // Cielo LIO retorna o parâmetro como "response" e não "request"
            val responseParam = uri.getQueryParameter("response")
            val responseCode = uri.getQueryParameter("responsecode")
            android.util.Log.d("LioDeepLink", "Response param: $responseParam")
            android.util.Log.d("LioDeepLink", "Response code: $responseCode")

            if (responseParam != null) {
                // Decodifica o base64
                val decodedBytes = Base64.decode(responseParam, Base64.NO_WRAP)
                val jsonString = String(decodedBytes)
                android.util.Log.d("LioDeepLink", "Decoded JSON: $jsonString")

                val jsonObject = JSONObject(jsonString)

                // Adiciona o responsecode ao objeto
                if (responseCode != null) {
                    jsonObject.put("responseCode", responseCode.toIntOrNull() ?: 0)
                }

                // Converte JSONObject para WritableMap
                val responseMap = convertJsonToMap(jsonObject)

                // Envia evento para o JavaScript
                android.util.Log.d("LioDeepLink", "Sending event to JS: onLioDeepLinkResponse")
                sendEventToJS("onLioDeepLinkResponse", responseMap)
            } else {
                android.util.Log.w("LioDeepLink", "No response parameter found in URI")
            }

        } catch (e: Exception) {
            android.util.Log.e("LioDeepLink", "Error handling deeplink response", e)
            val errorMap = Arguments.createMap().apply {
                putString("error", e.message)
            }
            sendEventToJS("onLioDeepLinkResponse", errorMap)
        }
    }

    /**
     * Converte ReadableMap para JSONObject
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
     * Converte ReadableArray para JSONArray
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
     * Converte JSONObject para WritableMap
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
                    // Tenta fazer parse se a string parece ser JSON
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
                            // Se falhar o parse, mantém como string
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
     * Converte JSONArray para WritableArray
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
