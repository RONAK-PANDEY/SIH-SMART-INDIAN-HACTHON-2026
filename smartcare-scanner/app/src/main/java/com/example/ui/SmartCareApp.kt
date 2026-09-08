package com.example.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.QrCodeScanner
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.screens.HistoryScreen
import com.example.ui.screens.ScannerScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.theme.DarkCanvas
import com.example.ui.theme.DarkOutline
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DeepPurpleOnPrimary
import com.example.ui.theme.ElegantLavender
import com.example.ui.theme.LavenderContainer
import com.example.ui.theme.OnLavenderContainer
import com.example.ui.theme.TextMutedDark
import com.example.ui.theme.TextPrimaryDark
import com.example.viewmodel.ScannerViewModel

enum class NavigationTab(val label: String) {
    SCAN("Scan"),
    HISTORY("History"),
    SETTINGS("Settings")
}

@Composable
fun SmartCareApp(
    viewModel: ScannerViewModel,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(NavigationTab.SCAN) }
    val history by viewModel.scanHistory.collectAsState()

    Scaffold(
        containerColor = DarkCanvas,
        bottomBar = {
            Box(
                modifier = Modifier.border(BorderStroke(1.dp, DarkOutline))
            ) {
                NavigationBar(
                    containerColor = DarkSurface,
                    tonalElevation = 0.dp,
                    modifier = Modifier.testTag("main_navigation_bar")
                ) {
                    val navItemColors = NavigationBarItemDefaults.colors(
                        selectedIconColor = OnLavenderContainer,
                        selectedTextColor = TextPrimaryDark,
                        indicatorColor = LavenderContainer,
                        unselectedIconColor = TextMutedDark,
                        unselectedTextColor = TextMutedDark
                    )

                    // Scan Tab
                    val isScanSelected = selectedTab == NavigationTab.SCAN
                    NavigationBarItem(
                        selected = isScanSelected,
                        onClick = { selectedTab = NavigationTab.SCAN },
                        icon = {
                            Icon(
                                imageVector = if (isScanSelected) Icons.Filled.QrCodeScanner else Icons.Outlined.QrCodeScanner,
                                contentDescription = "Scan Tab"
                            )
                        },
                        label = {
                            Text(
                                text = "Scan",
                                fontWeight = if (isScanSelected) FontWeight.SemiBold else FontWeight.Medium,
                                fontSize = 12.sp
                            )
                        },
                        colors = navItemColors,
                        modifier = Modifier.testTag("nav_tab_scan")
                    )

                    // History Tab
                    val isHistorySelected = selectedTab == NavigationTab.HISTORY
                    NavigationBarItem(
                        selected = isHistorySelected,
                        onClick = { selectedTab = NavigationTab.HISTORY },
                        icon = {
                            if (history.isNotEmpty()) {
                                BadgedBox(
                                    badge = {
                                        Badge(
                                            containerColor = ElegantLavender,
                                            contentColor = DeepPurpleOnPrimary
                                        ) {
                                            Text(text = history.size.toString())
                                        }
                                    }
                                ) {
                                    Icon(
                                        imageVector = if (isHistorySelected) Icons.Filled.History else Icons.Outlined.History,
                                        contentDescription = "History Tab"
                                    )
                                }
                            } else {
                                Icon(
                                    imageVector = if (isHistorySelected) Icons.Filled.History else Icons.Outlined.History,
                                    contentDescription = "History Tab"
                                )
                            }
                        },
                        label = {
                            Text(
                                text = "History",
                                fontWeight = if (isHistorySelected) FontWeight.SemiBold else FontWeight.Medium,
                                fontSize = 12.sp
                            )
                        },
                        colors = navItemColors,
                        modifier = Modifier.testTag("nav_tab_history")
                    )

                    // Settings Tab
                    val isSettingsSelected = selectedTab == NavigationTab.SETTINGS
                    NavigationBarItem(
                        selected = isSettingsSelected,
                        onClick = { selectedTab = NavigationTab.SETTINGS },
                        icon = {
                            Icon(
                                imageVector = if (isSettingsSelected) Icons.Filled.Settings else Icons.Outlined.Settings,
                                contentDescription = "Settings Tab"
                            )
                        },
                        label = {
                            Text(
                                text = "Settings",
                                fontWeight = if (isSettingsSelected) FontWeight.SemiBold else FontWeight.Medium,
                                fontSize = 12.sp
                            )
                        },
                        colors = navItemColors,
                        modifier = Modifier.testTag("nav_tab_settings")
                    )
                }
            }
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        when (selectedTab) {
            NavigationTab.SCAN -> {
                ScannerScreen(
                    viewModel = viewModel,
                    modifier = Modifier.padding(bottom = innerPadding.calculateBottomPadding())
                )
            }
            NavigationTab.HISTORY -> {
                HistoryScreen(
                    viewModel = viewModel,
                    modifier = Modifier.padding(bottom = innerPadding.calculateBottomPadding())
                )
            }
            NavigationTab.SETTINGS -> {
                SettingsScreen(
                    viewModel = viewModel,
                    modifier = Modifier.padding(bottom = innerPadding.calculateBottomPadding())
                )
            }
        }
    }
}
