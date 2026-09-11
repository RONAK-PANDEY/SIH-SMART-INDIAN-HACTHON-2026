package com.example.network

import com.example.model.ScanRequestBody
import com.example.model.ScanResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.util.concurrent.TimeUnit

class ScanApiClient(
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(8, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .writeTimeout(8, TimeUnit.SECONDS)
        .build()
) {

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun sendScanToken(
        baseUrl: String,
        requestBody: ScanRequestBody
    ): ScanResult = withContext(Dispatchers.IO) {
        val cleanBaseUrl = baseUrl.trim().trimEnd('/')
        val endpoint = "$cleanBaseUrl/api/v1/tokens/scan"

        val jsonPayload = JSONObject().apply {
            put("token_id", requestBody.tokenId)
            put("token_number", requestBody.tokenNumber ?: requestBody.tokenId)
            put("qr_hash", requestBody.hash)
            put("hash", requestBody.hash)
            put("scanned_by", requestBody.scannedBy)
            put("timestamp", requestBody.timestamp)
            if (!requestBody.dept.isNullOrBlank()) {
                put("dept", requestBody.dept)
                put("department", requestBody.dept)
            }
            if (!requestBody.patientId.isNullOrBlank()) {
                put("patient_id", requestBody.patientId)
            }
        }.toString()

        val request = Request.Builder()
            .url(endpoint)
            .post(jsonPayload.toRequestBody(jsonMediaType))
            .header("Accept", "application/json")
            .build()

        try {
            client.newCall(request).execute().use { response ->
                val bodyString = response.body?.string().orEmpty()

                if (response.isSuccessful) {
                    var patientName: String? = null
                    var dept: String? = null
                    var message = "Token verified successfully"

                    if (bodyString.isNotBlank()) {
                        try {
                            val json = JSONObject(bodyString)
                            patientName = when {
                                json.has("patient_name") -> json.optString("patient_name")
                                json.has("patientName") -> json.optString("patientName")
                                json.has("name") -> json.optString("name")
                                else -> null
                            }
                            dept = when {
                                json.has("dept") -> json.optString("dept")
                                json.has("department") -> json.optString("department")
                                else -> null
                            }
                            if (json.has("message")) {
                                message = json.optString("message", message)
                            }
                        } catch (_: Exception) {
                            // Non-JSON response body
                        }
                    }

                    ScanResult.Success(
                        tokenId = requestBody.tokenNumber ?: requestBody.tokenId,
                        patientName = patientName?.takeIf { it.isNotBlank() },
                        dept = dept?.takeIf { it.isNotBlank() },
                        message = message
                    )
                } else {
                    val code = response.code
                    var errorDetail = "Server error ($code)"

                    if (bodyString.isNotBlank()) {
                        try {
                            val json = JSONObject(bodyString)
                            errorDetail = when {
                                json.has("detail") -> json.optString("detail")
                                json.has("error") -> json.optString("error")
                                json.has("message") -> json.optString("message")
                                else -> "HTTP $code: ${response.message}"
                            }
                        } catch (_: Exception) {
                            errorDetail = "HTTP $code: $bodyString"
                        }
                    } else if (response.message.isNotBlank()) {
                        errorDetail = "HTTP $code: ${response.message}"
                    }

                    ScanResult.Failure(
                        tokenId = requestBody.tokenNumber ?: requestBody.tokenId,
                        errorMessage = errorDetail,
                        statusCode = code
                    )
                }
            }
        } catch (e: UnknownHostException) {
            ScanResult.Failure(
                tokenId = requestBody.tokenId,
                errorMessage = "Host unreachable ($cleanBaseUrl). Please verify Backend URL in Settings."
            )
        } catch (e: ConnectException) {
            ScanResult.Failure(
                tokenId = requestBody.tokenId,
                errorMessage = "Connection refused at $cleanBaseUrl. Verify backend server is running."
            )
        } catch (e: SocketTimeoutException) {
            ScanResult.Failure(
                tokenId = requestBody.tokenId,
                errorMessage = "Request timed out after 8s connecting to $cleanBaseUrl."
            )
        } catch (e: IOException) {
            ScanResult.Failure(
                tokenId = requestBody.tokenId,
                errorMessage = e.localizedMessage ?: "Network I/O error occurred"
            )
        } catch (e: Exception) {
            ScanResult.Failure(
                tokenId = requestBody.tokenId,
                errorMessage = e.localizedMessage ?: "Unexpected error during token transmission"
            )
        }
    }

    suspend fun pingBackend(baseUrl: String): Pair<Boolean, String> = withContext(Dispatchers.IO) {
        val cleanBaseUrl = baseUrl.trim().trimEnd('/')
        val healthUrl = "$cleanBaseUrl/health"
        try {
            val request = Request.Builder()
                .url(healthUrl)
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    Pair(true, "Connected to $cleanBaseUrl (HTTP ${response.code})")
                } else {
                    Pair(false, "Server responded with HTTP ${response.code}")
                }
            }
        } catch (e: Exception) {
            try {
                val baseReq = Request.Builder().url(cleanBaseUrl).get().build()
                client.newCall(baseReq).execute().use { res ->
                    Pair(true, "Server reachable at $cleanBaseUrl (HTTP ${res.code})")
                }
            } catch (err: Exception) {
                Pair(false, err.localizedMessage ?: "Unable to reach server")
            }
        }
    }
}
