package com.example.data

import android.content.Context
import android.content.SharedPreferences
import com.example.model.AppSettings
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SettingsRepository(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("smartcare_scanner_settings", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_BASE_URL = "backend_base_url"
        private const val KEY_STAFF_ID = "scanned_by_staff_id"
        const val DEFAULT_BASE_URL = "http://10.0.2.2:8000"
        const val DEFAULT_STAFF_ID = "STAFF-DESK-01"
    }

    private val _settings = MutableStateFlow(loadSettings())
    val settings: StateFlow<AppSettings> = _settings.asStateFlow()

    private fun loadSettings(): AppSettings {
        val baseUrl = prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
        val staffId = prefs.getString(KEY_STAFF_ID, DEFAULT_STAFF_ID) ?: DEFAULT_STAFF_ID
        return AppSettings(baseUrl = baseUrl.trim(), staffId = staffId.trim())
    }

    fun updateSettings(baseUrl: String, staffId: String) {
        val sanitizedUrl = baseUrl.trim().trimEnd('/')
        val sanitizedStaffId = staffId.trim()
        prefs.edit()
            .putString(KEY_BASE_URL, sanitizedUrl)
            .putString(KEY_STAFF_ID, sanitizedStaffId)
            .apply()
        _settings.value = AppSettings(baseUrl = sanitizedUrl, staffId = sanitizedStaffId)
    }

    fun resetToDefaults() {
        updateSettings(DEFAULT_BASE_URL, DEFAULT_STAFF_ID)
    }
}
