package com.example.model

data class QrPayload(
    val tokenId: String,
    val tokenNumber: String? = null,
    val hash: String,
    val patientId: String? = null,
    val dept: String? = null
)
