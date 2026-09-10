# 📸 SmartCare Screenshots Directory

This directory contains UI screenshots for documentation and demo purposes.

## Directory Structure

```
screenshots/
├── patient/                    # Patient Portal (:5173)
│   ├── patient_landing.png     # Landing page with language selector
│   ├── patient_triage.png      # AI triage symptom selection
│   ├── patient_qr_token.png    # Generated SHA-256 QR token pass
│   ├── patient_token_status.png# Real-time token tracking
│   ├── patient_sos.png         # 108 emergency ambulance dispatch
│   ├── patient_health_vault.png# Digital health records vault
│   ├── patient_rating.png      # Doctor rating survey
│   └── patient_multilang.png   # Multi-language interface demo
│
├── doctor/                     # Doctor Console (:5174)
│   ├── doctor_login.png        # Doctor duty authentication
│   ├── doctor_queue.png        # Live patient queue panel
│   ├── doctor_at_door.png      # "AT DOOR" turnstile badge
│   ├── doctor_consultation.png # Clinical notes + E-Rx
│   ├── doctor_emr.png          # Patient EMR view
│   └── doctor_referral.png     # Inter-hospital referral
│
├── govt/                       # Government Vigilance (:5175)
│   ├── govt_dashboard.png      # Sentinel command dashboard
│   ├── govt_dpi.png            # Doctor Performance Index
│   ├── govt_bonus.png          # Salary bonus engine
│   ├── govt_grievance.png      # Grievance tribunal
│   ├── govt_heatmap.png        # NCR congestion heatmap
│   ├── govt_fleet.png          # 108 ambulance fleet map
│   └── govt_scan_feed.png      # Live turnstile scan feed
│
└── scanner/                    # Android QR Scanner App
    ├── scanner_camera.png      # Camera view with QR overlay
    ├── scanner_success.png     # Token verified confirmation
    ├── scanner_settings.png    # Backend URL configuration
    └── scanner_error.png       # Invalid/expired token rejection
```

## How to Add Screenshots

1. Take screenshots of each screen listed above
2. Save them in the appropriate subdirectory with the exact filename
3. Recommended dimensions: **1920×1080** (desktop) or **1080×2400** (mobile)
4. Use **PNG** format for clarity
5. Screenshots are referenced in [DEMO.md](../../DEMO.md) and [README.md](../../README.md)