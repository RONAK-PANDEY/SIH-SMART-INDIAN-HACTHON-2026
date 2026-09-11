package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Dns
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.NetworkCheck
import androidx.compose.material.icons.filled.Restore
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import com.example.ui.theme.LavenderContainer
import com.example.ui.theme.OnLavenderContainer
import com.example.ui.theme.SuccessContainer
import com.example.ui.theme.SuccessEmerald
import com.example.ui.theme.TextMutedDark
import com.example.ui.theme.TextPrimaryDark
import com.example.ui.theme.TextSecondaryDark
import com.example.viewmodel.ScannerViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: ScannerViewModel,
    modifier: Modifier = Modifier
) {
    val currentSettings by viewModel.settings.collectAsState()
    val testConnectionStatus by viewModel.testConnectionStatus.collectAsState()
    val isTestingConnection by viewModel.isTestingConnection.collectAsState()

    var baseUrlInput by remember(currentSettings.baseUrl) {
        mutableStateOf(currentSettings.baseUrl)
    }
    var staffIdInput by remember(currentSettings.staffId) {
        mutableStateOf(currentSettings.staffId)
    }
    var showSavedMessage by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Settings",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimaryDark
                            )
                        )
                        Text(
                            text = "Scanner connection & workstation setup",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondaryDark
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkCanvas,
                    titleContentColor = TextPrimaryDark
                ),
                modifier = Modifier.statusBarsPadding()
            )
        },
        containerColor = DarkCanvas,
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Save Feedback Notification
            AnimatedVisibility(visible = showSavedMessage) {
                Surface(
                    color = SuccessContainer,
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SuccessEmerald.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = SuccessEmerald,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Settings saved successfully",
                            color = SuccessEmerald,
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                        )
                    }
                }
            }

            // Section 1: Backend Connection
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, DarkOutline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Dns,
                            contentDescription = null,
                            tint = ElegantLavender,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Backend Server",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimaryDark
                        )
                    }

                    Text(
                        text = "Base URL of the hospital verification service. POST requests are sent to /api/v1/tokens/scan.",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondaryDark
                    )

                    OutlinedTextField(
                        value = baseUrlInput,
                        onValueChange = {
                            baseUrlInput = it
                            showSavedMessage = false
                        },
                        label = { Text("Base URL", color = TextSecondaryDark) },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("backend_base_url_input"),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElegantLavender,
                            unfocusedBorderColor = DarkOutline,
                            focusedTextColor = TextPrimaryDark,
                            unfocusedTextColor = TextPrimaryDark,
                            cursorColor = ElegantLavender
                        )
                    )

                    // Quick URL Presets
                    Text(
                        text = "Common Targets:",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondaryDark
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        FilterChip(
                            selected = baseUrlInput == "http://10.0.2.2:8000",
                            onClick = { baseUrlInput = "http://10.0.2.2:8000" },
                            label = { Text("10.0.2.2 (Emulator)") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LavenderContainer,
                                selectedLabelColor = OnLavenderContainer,
                                containerColor = DarkCanvas,
                                labelColor = TextSecondaryDark
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = baseUrlInput == "http://10.0.2.2:8000",
                                borderColor = DarkOutline,
                                selectedBorderColor = ElegantLavender
                            )
                        )
                        FilterChip(
                            selected = baseUrlInput == "http://localhost:8000",
                            onClick = { baseUrlInput = "http://localhost:8000" },
                            label = { Text("localhost") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LavenderContainer,
                                selectedLabelColor = OnLavenderContainer,
                                containerColor = DarkCanvas,
                                labelColor = TextSecondaryDark
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = baseUrlInput == "http://localhost:8000",
                                borderColor = DarkOutline,
                                selectedBorderColor = ElegantLavender
                            )
                        )
                    }

                    // Test Connection Button & Status
                    OutlinedButton(
                        onClick = { viewModel.testBackendConnection() },
                        enabled = !isTestingConnection,
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkOutline),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("test_connection_button")
                    ) {
                        if (isTestingConnection) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = ElegantLavender
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Testing Connection...", color = TextPrimaryDark)
                        } else {
                            Icon(
                                imageVector = Icons.Default.NetworkCheck,
                                contentDescription = null,
                                tint = ElegantLavender,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Ping Server", color = TextPrimaryDark)
                        }
                    }

                    if (!testConnectionStatus.isNullOrBlank()) {
                        Surface(
                            color = DarkCanvas,
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, DarkOutline),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = testConnectionStatus.orEmpty(),
                                style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                                color = TextPrimaryDark,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                }
            }

            // Section 2: Staff / Workstation Identity
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, DarkOutline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Badge,
                            contentDescription = null,
                            tint = ElegantLavender,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Staff & Device ID",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimaryDark
                        )
                    }

                    Text(
                        text = "Identifier attached as 'scanned_by' in each scan request to track front-desk intake station.",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondaryDark
                    )

                    OutlinedTextField(
                        value = staffIdInput,
                        onValueChange = {
                            staffIdInput = it
                            showSavedMessage = false
                        },
                        label = { Text("Staff / Station ID", color = TextSecondaryDark) },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("staff_id_input"),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElegantLavender,
                            unfocusedBorderColor = DarkOutline,
                            focusedTextColor = TextPrimaryDark,
                            unfocusedTextColor = TextPrimaryDark,
                            cursorColor = ElegantLavender
                        )
                    )

                    // Quick ID presets
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        FilterChip(
                            selected = staffIdInput == "STAFF-DESK-01",
                            onClick = { staffIdInput = "STAFF-DESK-01" },
                            label = { Text("Desk 01") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LavenderContainer,
                                selectedLabelColor = OnLavenderContainer,
                                containerColor = DarkCanvas,
                                labelColor = TextSecondaryDark
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = staffIdInput == "STAFF-DESK-01",
                                borderColor = DarkOutline,
                                selectedBorderColor = ElegantLavender
                            )
                        )
                        FilterChip(
                            selected = staffIdInput == "STAFF-TRIAGE",
                            onClick = { staffIdInput = "STAFF-TRIAGE" },
                            label = { Text("Triage") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LavenderContainer,
                                selectedLabelColor = OnLavenderContainer,
                                containerColor = DarkCanvas,
                                labelColor = TextSecondaryDark
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = staffIdInput == "STAFF-TRIAGE",
                                borderColor = DarkOutline,
                                selectedBorderColor = ElegantLavender
                            )
                        )
                        FilterChip(
                            selected = staffIdInput == "STAFF-EMERGENCY",
                            onClick = { staffIdInput = "STAFF-EMERGENCY" },
                            label = { Text("ER") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LavenderContainer,
                                selectedLabelColor = OnLavenderContainer,
                                containerColor = DarkCanvas,
                                labelColor = TextSecondaryDark
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = staffIdInput == "STAFF-EMERGENCY",
                                borderColor = DarkOutline,
                                selectedBorderColor = ElegantLavender
                            )
                        )
                    }
                }
            }

            // Action Buttons: Save & Reset
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = {
                        viewModel.updateSettings(baseUrlInput, staffIdInput)
                        showSavedMessage = true
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ElegantLavender,
                        contentColor = DeepPurpleOnPrimary
                    ),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("save_settings_button")
                ) {
                    Icon(imageVector = Icons.Default.Save, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Save Settings", fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = {
                        viewModel.resetSettingsToDefault()
                        baseUrlInput = "http://10.0.2.2:8000"
                        staffIdInput = "STAFF-DESK-01"
                        showSavedMessage = false
                    },
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkOutline),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("reset_defaults_button")
                ) {
                    Icon(imageVector = Icons.Default.Restore, contentDescription = null, tint = TextPrimaryDark)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Reset to Defaults", color = TextPrimaryDark)
                }
            }

            // Technical Architecture & Privacy Box
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, DarkOutline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = ElegantLavender,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Privacy & Protocol Compliant",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimaryDark
                        )
                        Text(
                            text = "Patient health records are not stored on this device. Scanned tokens are transmitted directly to the configured endpoint using ISO 8601 UTC timestamps and logged only in ephemeral session memory.",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondaryDark
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
