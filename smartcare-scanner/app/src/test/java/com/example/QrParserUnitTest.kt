package com.example

import com.example.util.QrParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class QrParserUnitTest {

    @Test
    fun `valid qr json parses correctly`() {
        val json = """
            {
              "token_id": "TKN-12345",
              "hash": "a8f5b2c1d0e9",
              "patient_id": "PAT-9081",
              "dept": "Cardiology"
            }
        """.trimIndent()

        val result = QrParser.parse(json)
        assertTrue(result.isSuccess)
        val payload = result.getOrNull()
        assertNotNull(payload)
        assertEquals("TKN-12345", payload?.tokenId)
        assertEquals("a8f5b2c1d0e9", payload?.hash)
        assertEquals("PAT-9081", payload?.patientId)
        assertEquals("Cardiology", payload?.dept)
    }

    @Test
    fun `missing token_id fails`() {
        val json = """
            {
              "hash": "a8f5b2c1d0e9",
              "patient_id": "PAT-9081"
            }
        """.trimIndent()

        val result = QrParser.parse(json)
        assertTrue(result.isFailure)
    }

    @Test
    fun `missing hash fails`() {
        val json = """
            {
              "token_id": "TKN-12345",
              "dept": "Radiology"
            }
        """.trimIndent()

        val result = QrParser.parse(json)
        assertTrue(result.isFailure)
    }

    @Test
    fun `malformed non-json string fails gracefully`() {
        val result = QrParser.parse("this is not json at all")
        assertTrue(result.isFailure)
    }
}
