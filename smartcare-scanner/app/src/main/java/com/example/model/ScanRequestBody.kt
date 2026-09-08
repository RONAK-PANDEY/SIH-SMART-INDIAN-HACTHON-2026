package com.example.model

data class ScanRequestBody(
    val tokenId: String,
    val tokenNumber: String? = null,
    val hash: String,
    val scannedBy: String,
    val timestamp: String,
    val dept: String? = null,
    val patientId: String? = null
)
