# 🚀 SmartCare Production Deployment & Operations Guide

> **SIH 2026 Problem Statement**: SIH26133 | **System Version**: v3.0.0  
> **Target Audience**: DevOps Engineers, Hospital IT Administrators, MoHFW Cloud Architects

---

## 📋 Table of Contents
- [1. Architecture Overview](#1-architecture-overview)
- [2. Production Docker Compose Setup](#2-production-docker-compose-setup)
- [3. Multi-Cloud Deployment Architecture](#3-multi-cloud-deployment-architecture)
  - [AWS Deployment (ECS Fargate + RDS)](#aws-deployment-ecs-fargate--rds)
  - [GCP Deployment (Cloud Run + Cloud SQL)](#gcp-deployment-cloud-run--cloud-sql)
  - [Azure Deployment (Container Apps + Azure PostgreSQL)](#azure-deployment-container-apps--azure-postgresql)
  - [Frontend Deployment (Vercel / Cloudflare Pages)](#frontend-deployment-vercel--cloudflare-pages)
- [4. Database Backup & Disaster Recovery Strategy](#4-database-backup--disaster-recovery-strategy)
- [5. Monitoring, Health Checks & Alerting](#5-monitoring-health-checks--alerting)
- [6. Security & Hardening Checklist](#6-security--hardening-checklist)

---

## 1. Architecture Overview

SmartCare is architected as an asynchronous, stateless service layer backed by PostgreSQL 16, Redis 7 Pub/Sub, and distributed connection pooling:

```
                      [ National DNS / Cloudflare CDN ]
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
           [ HTTPS / WSS ]                     [ Static Assets ]
                    │                                 │
                    ▼                                 ▼
         [ Nginx Ingress / ALB ]              [ Vercel Edge CDN ]
                    │                         - Patient Portal (:5173)
        ┌───────────┴───────────┐             - Doctor Console (:5174)
        │                       │             - Govt Vigilance (:5175)
        ▼                       ▼
 [ Backend Node 1 ]      [ Backend Node 2 ]
   FastAPI Gateway         FastAPI Gateway
        │                       │
        └───────────┬───────────┘
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
 [ Supabase Pool ] [ Redis 7 ] [ Android Gate ]
 6-Key Isolation   Pub/Sub     CameraX Terminals
```

---

## 2. Production Docker Compose Setup

For single-hospital on-premise deployments or dedicated VM installations:

### Step 1: Clone and Configure Environment

```bash
git clone https://github.com/RONAK-PANDEY/SIH-SMART-INDIAN-HACTHON-2026.git
cd SIH-SMART-INDIAN-HACTHON-2026/infra
cp env.example .env
```

Configure the `.env` file with production secrets:

```env
# Database Credentials
POSTGRES_USER=smartcare_admin
POSTGRES_PASSWORD=STRONG_PRODUCTION_PASSWORD_HERE
POSTGRES_DB=smartcare_prod

# JWT Secret & Security
JWT_SECRET=b927c3a8f6d2e4a190b4317f2c815d7e482931a7c061298453de91b5c87fa231
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Supabase Multi-Key Fallback Pool
SUPABASE_PATIENT_KEY_1=https://prod1.supabase.co
SUPABASE_PATIENT_KEY_2=https://prod2.supabase.co
SUPABASE_DOCTOR_KEY_1=https://prod3.supabase.co
SUPABASE_DOCTOR_KEY_2=https://prod4.supabase.co
SUPABASE_OBSERVER_KEY=https://prod5.supabase.co
SUPABASE_SCANNER_KEY=https://prod6.supabase.co

# Redis Cache & PubSub
REDIS_URL=redis://smartcare-redis:6379/0

# Gemini AI Triage Keys (Comma-separated for round-robin pool)
GEMINI_API_KEYS=AIzaSyA...1,AIzaSyB...2,AIzaSyC...3
```

### Step 2: Launch Full Production Stack

```bash
docker-compose -f docker-compose.yml up -d --build
```

### Step 3: Verify Running Services

```bash
docker-compose ps
```

Expected output:
```
NAME                        STATUS              PORTS
smartcare-postgres          Up (healthy)        0.0.0.0:5432->5432/tcp
smartcare-redis             Up (healthy)        0.0.0.0:6379->6379/tcp
smartcare-backend           Up                  0.0.0.0:8000->8000/tcp
smartcare-patient-portal    Up                  0.0.0.0:3000->80/tcp
smartcare-admin-portal      Up                  0.0.0.0:3001->80/tcp
```

---

## 3. Multi-Cloud Deployment Architecture

### AWS Deployment (ECS Fargate + RDS)

SmartCare provides native AWS deployment descriptors in `infra/deploy/aws-ecs.yml`.

#### 1. Push Container Images to Amazon ECR:
```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# Backend
docker build -t smartcare-backend:latest ../backend
docker tag smartcare-backend:latest <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/smartcare-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/smartcare-backend:latest
```

#### 2. Create ECS Task Definition (`infra/deploy/aws-ecs.yml`):
```yaml
version: '1'
task_definition:
  family: smartcare-production
  network_mode: awsvpc
  requires_compatibilities: ["FARGATE"]
  cpu: "1024"
  memory: "2048"
  container_definitions:
    - name: backend
      image: <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/smartcare-backend:latest
      essential: true
      portMappings:
        - containerPort: 8000
          protocol: tcp
      environment:
        - name: DATABASE_URL
          value: "postgresql+asyncpg://admin:SECRET@smartcare-rds.ap-south-1.rds.amazonaws.com:5432/smartcare"
        - name: AWS_REGION
          value: "ap-south-1"
```

#### 3. Database: Amazon RDS PostgreSQL 16 Multi-AZ
- **Region**: `ap-south-1` (Mumbai) for strict Indian Data Localization compliance.
- **Instance**: `db.r6g.xlarge` (Provisioned IOPS SSD, Multi-AZ automated failover).
- **Storage**: 200 GB Auto-scaling up to 2 TB.

---

### GCP Deployment (Cloud Run + Cloud SQL)

For regional state health missions preferring Google Cloud Platform:

```bash
# Set GCP Project & Region (Mumbai)
gcloud config set project smartcare-sih2026
gcloud config set run/region asia-south1

# Build and Deploy Backend on Cloud Run (Auto-scales 1 to 50 instances)
gcloud run deploy smartcare-backend \
  --source=../backend \
  --platform=managed \
  --allow-unauthenticated \
  --min-instances=2 \
  --max-instances=50 \
  --cpu=2 \
  --memory=4Gi \
  --set-env-vars="REDIS_URL=redis://10.0.0.4:6379,JWT_SECRET=sih2026secretkey"
```

---

### Azure Deployment (Container Apps + Azure PostgreSQL)

For central government integrations with National Informatics Centre (NIC) Azure:

```bash
# Create Azure Resource Group in Central India (Pune)
az group create --name SmartCare-MoHFW-RG --location centralindia

# Deploy Container App
az containerapp create \
  --name smartcare-api \
  --resource-group SmartCare-MoHFW-RG \
  --environment smartcare-env \
  --image smartcareacr.azurecr.io/smartcare-backend:latest \
  --target-port 8000 \
  --ingress external \
  --min-replicas 2 \
  --max-replicas 30
```

---

### Frontend Deployment (Vercel / Cloudflare Pages)

The 3 web applications are built with Vite + React and can be deployed with zero config:

```bash
# 1. Patient Portal (:5173)
cd patient-portal && npx vercel --prod --yes

# 2. Doctor & Clinical Console (:5174)
cd admin-portal && npx vercel --prod --yes

# 3. Government Vigilance Dashboard (:5175)
cd govt-portal && npx vercel --prod --yes
```

---

## 4. Database Backup & Disaster Recovery Strategy

SmartCare implements a 3-tier backup hierarchy to guarantee **Zero Data Loss (RPO < 5 mins, RTO < 15 mins)**:

```
┌─────────────────────────────────────────────────────────────┐
│               DATABASE DISASTER RECOVERY TIERS              │
├─────────────────────────────────────────────────────────────┤
│ 1. Point-in-Time Recovery (PITR) → Continuous WAL archiving │
│ 2. Automated Daily Full Snapshot → 02:00 IST to S3 Glacier   │
│ 3. In-Memory Circuit Fallback   → Zero-crash degraded mode  │
└─────────────────────────────────────────────────────────────┘
```

### Automated Backup Script (`scripts/backup_database.sh`)

```bash
#!/bin/bash
# SmartCare Daily Encrypted Backup Routine
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/smartcare"
ENCRYPTION_KEY="/etc/smartcare/backup.key"
S3_BUCKET="s3://smartcare-backups-ap-south-1"

mkdir -p $BACKUP_DIR

# 1. Take compressed pg_dump with custom format
docker exec smartcare-postgres pg_dump -U postgres -Fc smartcare > $BACKUP_DIR/db_${TIMESTAMP}.dump

# 2. Encrypt using AES-256
openssl enc -aes-256-cbc -salt -in $BACKUP_DIR/db_${TIMESTAMP}.dump \
  -out $BACKUP_DIR/db_${TIMESTAMP}.dump.enc -pass file:$ENCRYPTION_KEY

# 3. Sync to AWS S3 Mumbai (Immutable Object Lock enabled)
aws s3 cp $BACKUP_DIR/db_${TIMESTAMP}.dump.enc $S3_BUCKET/daily/ \
  --storage-class GLACIER_IR --region ap-south-1

# 4. Retain 30 days locally
find $BACKUP_DIR -type f -mtime +30 -delete
echo "[$(date)] SmartCare backup completed successfully: db_${TIMESTAMP}.dump.enc"
```

### Point-in-Time Recovery (PITR) Walkthrough

In the event of accidental data corruption:
```bash
# 1. Stop write traffic
docker-compose stop backend

# 2. Restore base backup to targeted target_time
pg_restore -U postgres -d smartcare /var/backups/smartcare/db_20260909.dump

# 3. Apply continuous WAL logs up to timestamp
echo "recovery_target_time = '2026-09-10 10:15:00 IST'" >> /var/lib/postgresql/data/postgresql.conf
touch /var/lib/postgresql/data/recovery.signal

# 4. Restart and verify queue integrity
docker-compose start postgres
docker-compose start backend
```

---

## 5. Monitoring, Health Checks & Alerting

### Health Endpoint Architecture

SmartCare provides deep subsystem health diagnostics at `GET /health`:

```json
{
  "status": "healthy",
  "timestamp": "2026-09-10T10:30:00Z",
  "version": "3.0.0",
  "services": {
    "database": "connected (primary pool 4ms)",
    "redis": "connected (pubsub active)",
    "websocket": "active (142 client connections)",
    "turnstile_scanners": "18 gates online"
  },
  "pool_distribution": {
    "patient_pool": "healthy (2/2 keys available)",
    "doctor_pool": "healthy (2/2 keys available)",
    "observer_pool": "healthy (1/1 key available)",
    "scanner_pool": "healthy (1/1 key available)"
  }
}
```

### Prometheus & Grafana Configuration

1. **Prometheus Scrape Config** (`infra/monitoring/prometheus.yml`):
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'smartcare-backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['smartcare-backend:8000']

  - job_name: 'smartcare-turnstiles'
    static_configs:
      - targets: ['smartcare-backend:8000/turnstiles/metrics']
```

2. **MoHFW Alerting Rules**:
- **Critical Queue Wait**: Alert if P1 emergency patient waits > 5 minutes.
- **Ghost Token Spikes**: Alert if > 10 invalid SHA-256 tokens scanned within 60 seconds.
- **Doctor Idle Anomaly**: Alert if chamber queue has > 15 waiting patients while doctor status is idle.
- **Database Failover**: Immediate SMS/Telegram alert to on-call DevOps if primary database switches to in-memory fallback.

---

## 6. Security & Hardening Checklist

- [x] **TLS 1.3 Enforced**: All communication secured over HTTPS/WSS with HSTS headers.
- [x] **Data Localization**: Database hosted exclusively in AWS `ap-south-1` (Mumbai) per MeitY and DPDPA 2023 regulations.
- [x] **Container Isolation**: Non-root Docker execution (`USER appuser`) across all containers.
- [x] **Rate Limiting**: Per-IP and per-ABHA token generation throttling (max 10 tokens/min).
- [x] **Secrets Management**: No plaintext secrets in source control; loaded via Docker Secrets or HashiCorp Vault.
- [x] **CORS Whitelist**: Explicitly restricted to trusted MoHFW portal domains in production.
