package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.SettingsRepository
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class SettingsRepositoryRobolectricTest {

    @Test
    fun `default settings are loaded correctly`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val repo = SettingsRepository(context)
        assertEquals("http://10.0.2.2:8000", repo.settings.value.baseUrl)
        assertEquals("STAFF-DESK-01", repo.settings.value.staffId)
    }

    @Test
    fun `updating settings saves and updates state`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val repo = SettingsRepository(context)
        repo.updateSettings("http://192.168.1.50:8000/", "STAFF-ER-02")
        assertEquals("http://192.168.1.50:8000", repo.settings.value.baseUrl)
        assertEquals("STAFF-ER-02", repo.settings.value.staffId)
    }
}
