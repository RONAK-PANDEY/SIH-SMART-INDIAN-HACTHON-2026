package com.example.model

sealed class ScanResult {
    data class Success(
        val tokenId: String,
        val patientName: String?,
        val dept: String?,
        val message: String
    ) : ScanResult()

    data class Failure(
        val tokenId: String?,
        val errorMessage: String,
        val statusCode: Int? = null
    ) : ScanResult()
}

enum class ScanStatus {
    SUCCESS,
    ERROR
}

data class ScanHistoryItem(
    val id: String,
    val tokenId: String,
    val status: ScanStatus,
    val timestamp: String,
    val details: String,
    val dept: String? = null,
    val patientName: String? = null
)

data class AppSettings(
    val baseUrl: String = "http://10.0.2.2:8000",
    val staffId: String = "STAFF-DESK-01"
)
