package com.example.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FlashOff
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.DarkCanvas
import com.example.ui.theme.DarkOutline
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DeepPurpleOnPrimary
import com.example.ui.theme.ElegantLavender
import com.example.ui.theme.TextPrimaryDark
import com.example.ui.theme.TextSecondaryDark

@Composable
fun ScanOverlay(
    isScanning: Boolean,
    isTorchOn: Boolean,
    onToggleTorch: () -> Unit,
    onOpenTestTokenDialog: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Scanning laser animation
    val infiniteTransition = rememberInfiniteTransition(label = "laser_sweep")
    val laserProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "laser_y"
    )

    Box(modifier = modifier.fillMaxSize()) {
        // Darkened mask with cut-out viewfinder
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer(alpha = 0.99f) // Required for BlendMode.Clear
        ) {
            val canvasWidth = size.width
            val canvasHeight = size.height
            val frameSize = minOf(canvasWidth * 0.72f, 290.dp.toPx())
            val frameLeft = (canvasWidth - frameSize) / 2f
            val frameTop = (canvasHeight - frameSize) / 2f - 30.dp.toPx()

            // Draw semi-transparent dark backdrop
            drawRect(
                color = Color(0xBB1C1B1F),
                size = size
            )

            // Cut out transparent rounded rectangle
            val cutoutPath = Path().apply {
                addRoundRect(
                    RoundRect(
                        rect = Rect(
                            offset = Offset(frameLeft, frameTop),
                            size = Size(frameSize, frameSize)
                        ),
                        cornerRadius = CornerRadius(24.dp.toPx(), 24.dp.toPx())
                    )
                )
            }
            drawPath(
                path = cutoutPath,
                color = Color.Transparent,
                blendMode = BlendMode.Clear
            )

            // Subtle inner glow
            drawRoundRect(
                color = ElegantLavender.copy(alpha = 0.05f),
                topLeft = Offset(frameLeft, frameTop),
                size = Size(frameSize, frameSize),
                cornerRadius = CornerRadius(24.dp.toPx(), 24.dp.toPx())
            )

            // Draw Viewfinder Corner Brackets in Elegant Lavender
            val cornerLength = 36.dp.toPx()
            val strokeWidth = 4.dp.toPx()
            val bracketColor = ElegantLavender

            // Top-left
            drawLine(
                color = bracketColor,
                start = Offset(frameLeft, frameTop + cornerLength),
                end = Offset(frameLeft, frameTop),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )
            drawLine(
                color = bracketColor,
                start = Offset(frameLeft, frameTop),
                end = Offset(frameLeft + cornerLength, frameTop),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )

            // Top-right
            drawLine(
                color = bracketColor,
                start = Offset(frameLeft + frameSize - cornerLength, frameTop),
                end = Offset(frameLeft + frameSize, frameTop),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )
            drawLine(
                color = bracketColor,
                start = Offset(frameLeft + frameSize, frameTop),
                end = Offset(frameLeft + frameSize, frameTop + cornerLength),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )

            // Bottom-left
            drawLine(
                color = bracketColor,
                start = Offset(frameLeft, frameTop + frameSize - cornerLength),
                end = Offset(frameLeft, frameTop + frameSize),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )
            drawLine(
                color = bracketColor,
                start = Offset(frameLeft, frameTop + frameSize),
                end = Offset(frameLeft + cornerLength, frameTop + frameSize),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )

            // Bottom-right
            drawLine(
                color = bracketColor,
                start = Offset(frameLeft + frameSize - cornerLength, frameTop + frameSize),
                end = Offset(frameLeft + frameSize, frameTop + frameSize),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )
            drawLine(
                color = bracketColor,
                start = Offset(frameLeft + frameSize, frameTop + frameSize - cornerLength),
                end = Offset(frameLeft + frameSize, frameTop + frameSize),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )

            // Draw laser bar if scanning
            if (isScanning) {
                val laserY = frameTop + (frameSize * laserProgress)
                val gradientBrush = Brush.horizontalGradient(
                    colors = listOf(
                        Color.Transparent,
                        ElegantLavender.copy(alpha = 0.5f),
                        ElegantLavender,
                        Color.White,
                        ElegantLavender,
                        ElegantLavender.copy(alpha = 0.5f),
                        Color.Transparent
                    ),
                    startX = frameLeft + 8.dp.toPx(),
                    endX = frameLeft + frameSize - 8.dp.toPx()
                )

                drawLine(
                    brush = gradientBrush,
                    start = Offset(frameLeft + 12.dp.toPx(), laserY),
                    end = Offset(frameLeft + frameSize - 12.dp.toPx(), laserY),
                    strokeWidth = 3.dp.toPx(),
                    cap = StrokeCap.Round
                )
            }
        }

        // Instruction and Action controls under the viewfinder
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Surface(
                color = Color(0xD92B2930),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, DarkOutline.copy(alpha = 0.6f)),
                modifier = Modifier.padding(bottom = 4.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 18.dp, vertical = 9.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.QrCodeScanner,
                        contentDescription = "Scanner Active",
                        tint = ElegantLavender,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = "Align QR code within the frame",
                        color = TextPrimaryDark,
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Medium,
                            letterSpacing = 0.3.sp
                        )
                    )
                }
            }

            Text(
                text = "ML Kit active • Auto-focusing...",
                color = TextSecondaryDark,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp)
            )

            // Quick actions: Torch toggle & Manual Test QR
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Torch toggle
                FilledTonalIconButton(
                    onClick = onToggleTorch,
                    colors = IconButtonDefaults.filledTonalIconButtonColors(
                        containerColor = if (isTorchOn) ElegantLavender else Color(0x662B2930),
                        contentColor = if (isTorchOn) DeepPurpleOnPrimary else TextPrimaryDark
                    ),
                    modifier = Modifier
                        .size(48.dp)
                        .border(
                            1.dp,
                            if (isTorchOn) ElegantLavender else DarkOutline.copy(alpha = 0.5f),
                            CircleShape
                        )
                        .testTag("torch_toggle_button")
                ) {
                    Icon(
                        imageVector = if (isTorchOn) Icons.Default.FlashOn else Icons.Default.FlashOff,
                        contentDescription = if (isTorchOn) "Turn Flash Off" else "Turn Flash On",
                        modifier = Modifier.size(22.dp)
                    )
                }

                Spacer(modifier = Modifier.size(16.dp))

                // Test QR code dialog trigger (convenient for emulator & staff testing)
                Button(
                    onClick = onOpenTestTokenDialog,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ElegantLavender,
                        contentColor = DeepPurpleOnPrimary
                    ),
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier
                        .height(48.dp)
                        .testTag("test_token_dialog_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.QrCode,
                        contentDescription = "Test Sample QR",
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.size(8.dp))
                    Text(
                        text = "Test Sample QR",
                        fontWeight = FontWeight.SemiBold,
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
        }
    }
}
