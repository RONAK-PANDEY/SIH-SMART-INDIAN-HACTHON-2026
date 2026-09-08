package com.example.util

import com.example.model.QrPayload
import org.json.JSONObject

object QrParser {
    fun parse(rawString: String): Result<QrPayload> {
        return runCatching {
            val trimmed = rawString.trim()

            if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                val obj = JSONObject(trimmed)

                val tokenId = when {
                    obj.has("token_id") -> obj.getString("token_id")
                    obj.has("tokenId") -> obj.getString("tokenId")
                    obj.has("token_number") -> obj.getString("token_number")
                    obj.has("tokenNumber") -> obj.getString("tokenNumber")
                    obj.has("token") -> obj.getString("token")
                    else -> throw IllegalArgumentException("QR payload missing token identifier")
                }

                val tokenNumber = when {
                    obj.has("token_number") -> obj.getString("token_number")
                    obj.has("tokenNumber") -> obj.getString("tokenNumber")
                    else -> null
                }

                val hash = when {
                    obj.has("hash") -> obj.getString("hash")
                    obj.has("qr_hash") -> obj.getString("qr_hash")
                    else -> ""
                }

                val patientId = when {
                    obj.has("patient_id") && !obj.isNull("patient_id") -> obj.optString("patient_id").takeIf { it.isNotBlank() }
                    obj.has("patientId") && !obj.isNull("patientId") -> obj.optString("patientId").takeIf { it.isNotBlank() }
                    else -> null
                }

                val dept = when {
                    obj.has("dept") && !obj.isNull("dept") -> obj.optString("dept").takeIf { it.isNotBlank() }
                    obj.has("department") && !obj.isNull("department") -> obj.optString("department").takeIf { it.isNotBlank() }
                    obj.has("department_id") && !obj.isNull("department_id") -> obj.optString("department_id").takeIf { it.isNotBlank() }
                    else -> null
                }

                QrPayload(
                    tokenId = tokenId,
                    tokenNumber = tokenNumber,
                    hash = hash,
                    patientId = patientId,
                    dept = dept
                )
            } else if (trimmed.contains(":")) {
                val parts = trimmed.split(":")
                val tokenId = parts.getOrNull(0) ?: trimmed
                val patientId = parts.getOrNull(1)
                val dept = parts.getOrNull(2)
                val hash = parts.getOrNull(3) ?: ""
                QrPayload(
                    tokenId = tokenId,
                    tokenNumber = tokenId,
                    hash = hash,
                    patientId = patientId,
                    dept = dept
                )
            } else {
                QrPayload(
                    tokenId = trimmed,
                    tokenNumber = trimmed,
                    hash = "",
                    patientId = null,
                    dept = null
                )
            }
        }
    }
}
