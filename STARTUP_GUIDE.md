# SmartCare SIH26133 — Complete Startup Guide

> **Project:** SmartCare — Smart Hospital Queue & Healthcare Management System  
> **Team:** SIH 2026 | Problem Statement ID: SIH26133

---

## 🚀 Quick Start (Every Time You Open the Laptop)

### Option A — One Double-Click ⚡ (Recommended)
```
Double-click:  start-all.bat   (in the project root folder)
```
This automatically:
- Kills any process blocking ports **8000 / 5173 / 5174 / 5175**
- Opens Windows Firewall for **port 8000** (Android scanner needs this)
- Prints your current Wi-Fi IP in the console window
- Launches all 4 services in separate terminal windows

---

### Option B — Manual Launch (if bat does not work)

Open **4 separate terminals** and run:

```bash
# Terminal 1 — FastAPI Backend
cd C:\Users\maste\.gemini\antigravity-ide\scratch\SIH-SMART-INDIAN-HACTHON-2026\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2 — Patient Portal
cd C:\Users\maste\.gemini\antigravity-ide\scratch\SIH-SMART-INDIAN-HACTHON-2026\patient-portal
npm run dev -- --port 5173 --host

# Terminal 3 — Admin / Doctor Portal
cd C:\Users\maste\.gemini\antigravity-ide\scratch\SIH-SMART-INDIAN-HACTHON-2026\admin-portal
npm run dev -- --port 5174 --host

# Terminal 4 — Govt Observer Portal
cd C:\Users\maste\.gemini\antigravity-ide\scratch\SIH-SMART-INDIAN-HACTHON-2026\govt-portal
npm run dev -- --port 5175 --host
```

---

## 🌐 Service URLs

| Service | URL | Who Uses It |
|---|---|---|
| **FastAPI Backend** | http://localhost:8000 | All portals + Android app |
| **Swagger API Docs** | http://localhost:8000/docs | Developer testing & API schema |
| **Patient Portal** | http://localhost:5173 | Patients (book OPD, get dynamic QR pass) |
| **Admin / Doctor Panel** | http://localhost:5174 | Hospital staff, doctors (calling desk, live attendance) |
| **Govt Observer Portal** | http://localhost:5175 | Government oversight & doctor salary bonus |

---

## 📱 Android Scanner App Setup (Every Session)

> **Important:** Your laptop Wi-Fi IP changes across networks (DHCP). Update it in the app each time OR set a static IP (see below).

### Step 1 — Find Your Laptop's Current Wi-Fi IP
Open PowerShell and run:
```powershell
ipconfig | findstr /i "IPv4"
```
Look for your Wi-Fi IPv4 address (e.g. `10.151.32.21` or `192.168.1.x`).

### Step 2 — Update App Settings on Your Phone
1. Open **SmartCare Scanner** app on your phone
2. Tap **Settings** (bottom right gear icon)
3. In **Base URL** field, enter:
   ```
   http://<YOUR_LAPTOP_IP>:8000
   ```
   *(Example: `http://10.151.32.21:8000` — do NOT append `/health` or `/api`)*
4. Tap **Save**
5. Tap **Ping Server** — should show **Connected** (Green badge)

### Step 3 — Windows Firewall for Port 8000
`start-all.bat` does this automatically. If running manually, open PowerShell **as Administrator** and run:
```powershell
netsh advfirewall firewall delete rule name="SmartCare Port 8000"
netsh advfirewall firewall add rule name="SmartCare Port 8000" dir=in action=allow protocol=TCP localport=8000
```

---

## 🔒 Permanent Fix — Set Static Wi-Fi IP (Do Once)

To avoid updating the phone every session:

1. Open **Settings** > **Network & Internet** > **Wi-Fi**
2. Click your connected Wi-Fi > **Properties**
3. Click **Edit** next to IP assignment > change to **Manual**
4. Set:
   - IP address: `10.151.32.100` (pick any free IP in your subnet)
   - Subnet prefix: `24`
   - Gateway: your router IP (e.g. `10.151.32.1`)
   - DNS: `8.8.8.8`
5. Save
6. Update phone app Settings once to `http://10.151.32.100:8000` — done forever

---

## 🔄 Test the Full Scan Loop

### 1. Book a Token
- Open Patient Portal: [http://localhost:5173](http://localhost:5173)
- Login / Register > Book OPD appointment
- View the scannable SHA-256 QR code pass on screen

### 2. Scan the QR
- Open SmartCare Scanner app on phone
- Point camera at the QR code
- Scanner verifies token with backend and shows **TOKEN VERIFIED** with patient details

### 3. Verify Real-Time Update
- Open Admin Portal: [http://localhost:5174](http://localhost:5174) > Doctor Panel
- Scanned token status updates live to **AT DOOR**

### 4. Quick cURL Test (Without Phone)
```bash
curl -X POST "http://localhost:8000/api/v1/tokens/scan" ^
  -H "Content-Type: application/json" ^
  -d "{\"token_number\": \"CARD-001\", \"hash\": \"your-hash-here\", \"scanner_id\": \"desk-01\", \"scanned_by\": \"desk-01\"}"
```

---

## 🛠️ Common Problems and Fixes

| Problem | Cause | Fix |
|---|---|---|
| Connection refused in phone app | Wrong IP or firewall blocking | Check IP with `ipconfig`, re-run `start-all.bat` as Administrator |
| `/health/api/v1/tokens/scan` 404 | `/health` appended in app Settings URL | Remove `/health` from Base URL in app Settings — only use `http://IP:8000` |
| Port already in use error | Previous server still running | `start-all.bat` auto-kills old processes on ports 8000/5173/5174/5175 |
| Backend starts then crashes | Python package missing | Run `pip install -r requirements.txt` in `/backend` folder |
| npm not found | Node.js not in PATH | Install Node.js from https://nodejs.org |
| Phone cannot see laptop | Different Wi-Fi networks | Make sure phone and laptop are connected to the SAME Wi-Fi / hotspot |

---

## 🤖 Antigravity AI Prompt

Paste this in Antigravity chat to auto-setup and start everything:

```text
Run the SmartCare SIH26133 project at:
C:\Users\maste\.gemini\antigravity-ide\scratch\SIH-SMART-INDIAN-HACTHON-2026

Steps:
1. Kill any processes on ports 8000, 5173, 5174, 5175
2. Add Windows Firewall rule for TCP port 8000:
   netsh advfirewall firewall add rule name="SmartCare Port 8000" dir=in action=allow protocol=TCP localport=8000
3. Show current Wi-Fi IP: ipconfig | findstr /i "IPv4" - tell me the IP to use in Android app
4. Start backend (daemon): cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000
5. Start Patient Portal (daemon): cd patient-portal && npm run dev -- --port 5173 --host
6. Start Admin Portal (daemon): cd admin-portal && npm run dev -- --port 5174 --host
7. Start Govt Portal (daemon): cd govt-portal && npm run dev -- --port 5175 --host
8. Confirm all 4 are running and print the URLs
9. Remind me to update the Android scanner app Settings with the current Wi-Fi IP
```

---

## 📁 Repository Structure

```
SIH-SMART-INDIAN-HACTHON-2026/
├── start-all.bat           <- Double-click to launch all services
├── STARTUP_GUIDE.md        <- Complete startup & troubleshooting guide
├── README.md               <- Full v3.0.0 architecture & ecosystem documentation
├── backend/                <- FastAPI Python Backend (Port 8000)
├── patient-portal/         <- React 18 + Vite + TS (Port 5173) - Citizen OPD
├── admin-portal/           <- React 18 + Vite + TS (Port 5174) - Doctor Suite
├── govt-portal/            <- React 18 + Vite + TS (Port 5175) - National Vigilance
├── smartcare-scanner/      <- Native Android Scanner App (Kotlin + Compose)
└── docs/                   <- System integration guides
```

---

*SmartCare Team SIH26133 | Ministry of Health & Family Welfare*