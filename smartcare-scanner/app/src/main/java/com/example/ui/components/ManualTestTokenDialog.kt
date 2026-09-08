package com.example.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.DarkCanvas
import com.example.ui.theme.DarkOutline
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DeepPurpleOnPrimary
import com.example.ui.theme.ElegantLavender
import com.example.ui.theme.TextMutedDark
import com.example.ui.theme.TextPrimaryDark
import com.example.ui.theme.TextSecondaryDark

private val SampleTokens = listOf(
    SampleTokenPreset(
        title = "Valid Cardiology Intake",
        description = "Patient: Sarah Jenkins (Cardiology)",
        json = """{"token_id":"TKN-CARD-8912","hash":"9a8f4c21b3e70d65","patient_id":"PAT-2026-4401","dept":"Cardiology"}"""
    ),
    SampleTokenPreset(
        title = "Emergency Room Admission",
        description = "Patient: Michael Chang (ER)",
        json = """{"token_id":"TKN-ER-3304","hash":"5c7e112d8a0f9b44","patient_id":"PAT-2026-9022","dept":"Emergency"}"""
    ),
    SampleTokenPreset(
        title = "Invalid Hash / Tampered",
        description = "Simulates hash mismatch rejection",
        json = """{"token_id":"TKN-FAIL-001","hash":"invalid_tampered_hash_12345","patient_id":"PAT-0000","dept":"Neurology"}"""
    ),
    SampleTokenPreset(
        title = "Malformed QR Payload",
        description = "Missing token_id key",
        json = """{"patient_id":"PAT-9999","dept":"Radiology"}"""
    )
)

private data class SampleTokenPreset(
    val title: String,
    val description: String,
    val json: String
)

@Composable
fun ManualTestTokenDialog(
    onDismiss: () -> Unit,
    onSubmitToken: (String) -> Unit
) {
    var customJson by remember {
        mutableStateOf(SampleTokens[0].json)
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DarkSurface,
        titleContentColor = TextPrimaryDark,
        textContentColor = TextSecondaryDark,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Bolt,
                        contentDescription = null,
                        tint = ElegantLavender,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Test QR Token",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimaryDark
                        )
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = TextSecondaryDark
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Quickly test scanner behavior on emulator or front-desk verification:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondaryDark
                )

                Text(
                    text = "PRESET SAMPLE TOKENS",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = ElegantLavender
                )

                SampleTokens.forEach { preset ->
                    val isSelected = customJson == preset.json
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { customJson = preset.json },
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) DarkOutline.copy(alpha = 0.5f) else DarkCanvas
                        ),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) ElegantLavender else DarkOutline
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = preset.title,
                                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                color = if (isSelected) ElegantLavender else TextPrimaryDark
                            )
                            Text(
                                text = preset.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondaryDark
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "EDIT OR PASTE QR JSON PAYLOAD",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = ElegantLavender
                )

                OutlinedTextField(
                    value = customJson,
                    onValueChange = { customJson = it },
                    label = { Text("QR Payload JSON", color = TextSecondaryDark) },
                    textStyle = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = TextPrimaryDark
                    ),
                    maxLines = 5,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("test_token_input_field"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ElegantLavender,
                        unfocusedBorderColor = DarkOutline,
                        focusedTextColor = TextPrimaryDark,
                        unfocusedTextColor = TextPrimaryDark,
                        cursorColor = ElegantLavender
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSubmitToken(customJson)
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = ElegantLavender,
                    contentColor = DeepPurpleOnPrimary
                ),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.testTag("submit_test_token_button")
            ) {
                Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Simulate Scan")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondaryDark)
            }
        },
        shape = RoundedCornerShape(24.dp)
    )
}
