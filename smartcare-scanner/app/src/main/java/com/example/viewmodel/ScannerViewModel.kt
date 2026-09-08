package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.SettingsRepository
import com.example.model.AppSettings
import com.example.model.QrPayload
import com.example.model.ScanHistoryItem
import com.example.model.ScanRequestBody
import com.example.model.ScanResult
import com.example.model.ScanStatus
import com.example.network.ScanApiClient
import com.example.util.QrParser
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID

sealed class FeedbackUiState {
    object Idle : FeedbackUiState()
    
    data class Success(
        val tokenId: String,
        val patientName: String?,
        val dept: String?,
        val message: String
    ) : FeedbackUiState()

    data class Error(
        val tokenId: String?,
        val message: String
    ) : FeedbackUiState()
}

class ScannerViewModel(
    private val settingsRepository: SettingsRepository,
    private val apiClient: ScanApiClient = ScanApiClient()
) : ViewModel() {

    val settings: StateFlow<AppSettings> = settingsRepository.settings

    private val _feedbackState = MutableStateFlow<FeedbackUiState>(FeedbackUiState.Idle)
    val feedbackState: StateFlow<FeedbackUiState> = _feedbackState.asStateFlow()

    private val _isProcessing = MutableStateFlow(false)
    val isProcessing: StateFlow<Boolean> = _isProcessing.asStateFlow()

    private val _scanHistory = MutableStateFlow<List<ScanHistoryItem>>(emptyList())
    val scanHistory: StateFlow<List<ScanHistoryItem>> = _scanHistory.asStateFlow()

    private val _testConnectionStatus = MutableStateFlow<String?>(null)
    val testConnectionStatus: StateFlow<String?> = _testConnectionStatus.asStateFlow()

    private val _isTestingConnection = MutableStateFlow(false)
    val isTestingConnection: StateFlow<Boolean> = _isTestingConnection.asStateFlow()

    private var lastScannedToken: String? = null
    private var lastScannedTimestamp: Long = 0L
    private val debounceTimeMs = 3000L

    private var feedbackDismissJob: Job? = null

    val isScanningAllowed: Boolean
        get() = !_isProcessing.value && _feedbackState.value is FeedbackUiState.Idle

    fun onQrCodeDetected(rawContent: String) {
        if (!isScanningAllowed) return

        val now = System.currentTimeMillis()
        if (rawContent == lastScannedToken && (now - lastScannedTimestamp) < debounceTimeMs) {
            return
        }

        lastScannedToken = rawContent
        lastScannedTimestamp = now

        processScannedPayload(rawContent)
    }

    fun processScannedPayload(rawContent: String) {
        viewModelScope.launch {
            _isProcessing.value = true

            val parseResult = QrParser.parse(rawContent)
            if (parseResult.isFailure) {
                val errorMsg = parseResult.exceptionOrNull()?.message ?: "Invalid QR payload"
                recordHistoryItem(
                    tokenId = "UNKNOWN",
                    status = ScanStatus.ERROR,
                    details = "Format error: $errorMsg"
                )
                showErrorFeedback(tokenId = null, message = errorMsg)
                _isProcessing.value = false
                return@launch
            }

            val qrPayload = parseResult.getOrThrow()
            val currentSettings = settings.value
            val isoTimestamp = Instant.now().toString()

            val requestBody = ScanRequestBody(
                tokenId = qrPayload.tokenId,
                tokenNumber = qrPayload.tokenNumber ?: qrPayload.tokenId,
                hash = qrPayload.hash,
                scannedBy = currentSettings.staffId,
                timestamp = isoTimestamp,
                dept = qrPayload.dept,
                patientId = qrPayload.patientId
            )

            val apiResult = apiClient.sendScanToken(
                baseUrl = currentSettings.baseUrl,
                requestBody = requestBody
            )

            _isProcessing.value = false

            when (apiResult) {
                is ScanResult.Success -> {
                    val resolvedName = apiResult.patientName
                    val resolvedDept = apiResult.dept ?: qrPayload.dept

                    recordHistoryItem(
                        tokenId = qrPayload.tokenNumber ?: qrPayload.tokenId,
                        status = ScanStatus.SUCCESS,
                        details = apiResult.message,
                        dept = resolvedDept,
                        patientName = resolvedName
                    )

                    showSuccessFeedback(
                        tokenId = qrPayload.tokenNumber ?: qrPayload.tokenId,
                        patientName = resolvedName,
                        dept = resolvedDept,
                        message = apiResult.message
                    )
                }

                is ScanResult.Failure -> {
                    recordHistoryItem(
                        tokenId = qrPayload.tokenNumber ?: qrPayload.tokenId,
                        status = ScanStatus.ERROR,
                        details = apiResult.errorMessage,
                        dept = qrPayload.dept
                    )

                    showErrorFeedback(
                        tokenId = qrPayload.tokenNumber ?: qrPayload.tokenId,
                        message = apiResult.errorMessage
                    )
                }
            }
        }
    }

    private fun showSuccessFeedback(
        tokenId: String,
        patientName: String?,
        dept: String?,
        message: String
    ) {
        feedbackDismissJob?.cancel()
        _feedbackState.value = FeedbackUiState.Success(
            tokenId = tokenId,
            patientName = patientName,
            dept = dept,
            message = message
        )

        feedbackDismissJob = viewModelScope.launch {
            delay(2500)
            _feedbackState.value = FeedbackUiState.Idle
        }
    }

    private fun showErrorFeedback(tokenId: String?, message: String) {
        feedbackDismissJob?.cancel()
        _feedbackState.value = FeedbackUiState.Error(
            tokenId = tokenId,
            message = message
        )

        feedbackDismissJob = viewModelScope.launch {
            delay(3000)
            _feedbackState.value = FeedbackUiState.Idle
        }
    }

    fun dismissFeedbackNow() {
        feedbackDismissJob?.cancel()
        _feedbackState.value = FeedbackUiState.Idle
    }

    private fun recordHistoryItem(
        tokenId: String,
        status: ScanStatus,
        details: String,
        dept: String? = null,
        patientName: String? = null
    ) {
        val timeFormatted = formatCurrentTime()
        val item = ScanHistoryItem(
            id = UUID.randomUUID().toString(),
            tokenId = tokenId,
            status = status,
            timestamp = timeFormatted,
            details = details,
            dept = dept,
            patientName = patientName
        )
        _scanHistory.value = listOf(item) + _scanHistory.value.take(19)
    }

    private fun formatCurrentTime(): String {
        return try {
            val formatter = DateTimeFormatter.ofPattern("HH:mm:ss")
                .withZone(ZoneId.systemDefault())
            formatter.format(Instant.now())
        } catch (_: Exception) {
            Instant.now().toString()
        }
    }

    fun clearHistory() {
        _scanHistory.value = emptyList()
    }

    fun updateSettings(baseUrl: String, staffId: String) {
        settingsRepository.updateSettings(baseUrl, staffId)
    }

    fun resetSettingsToDefault() {
        settingsRepository.resetToDefaults()
        _testConnectionStatus.value = null
    }

    fun testBackendConnection() {
        viewModelScope.launch {
            _isTestingConnection.value = true
            _testConnectionStatus.value = "Testing connection..."
            val (ok, message) = apiClient.pingBackend(settings.value.baseUrl)
            _testConnectionStatus.value = message
            _isTestingConnection.value = false
        }
    }

    class Factory(private val settingsRepository: SettingsRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(ScannerViewModel::class.java)) {
                return ScannerViewModel(settingsRepository) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
