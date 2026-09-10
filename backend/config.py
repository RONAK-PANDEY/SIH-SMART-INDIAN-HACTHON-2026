import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartCare OPD & Emergency AI Queue Engine"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/smartcare")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-sih2026-key-replace-in-prod")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://localhost:5175,"
        "http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175",
    )

    # Supabase Multi-Key Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://smartcare-sih2026.supabase.co")
    
    # 1. Patient Portal Pool (Member 1 Arpan & Member 2 Rishikesh)
    SUPABASE_KEY_PATIENT_1: str = os.getenv("SUPABASE_KEY_PATIENT_1", "")
    SUPABASE_KEY_PATIENT_2: str = os.getenv("SUPABASE_KEY_PATIENT_2", "")
    
    # 2. Doctor Console Pool (Member 3 Kartik & Member 4 Alok)
    SUPABASE_KEY_DOCTOR_1: str = os.getenv("SUPABASE_KEY_DOCTOR_1", "")
    SUPABASE_KEY_DOCTOR_2: str = os.getenv("SUPABASE_KEY_DOCTOR_2", "")
    
    # 3. National Vigilance & Observer Pool (Member 5 Ajay Kumar)
    SUPABASE_KEY_OBSERVER: str = os.getenv("SUPABASE_KEY_OBSERVER", "")
    
    # 4. Android QR Scanner Pool (Member 6 Shristi)
    SUPABASE_KEY_SCANNER: str = os.getenv("SUPABASE_KEY_SCANNER", "")
    
    # Generic Service Key
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # -------------------------------------------------------------
    # Google Gemini Multi-Key Routing Pool (6 Free-Tier Keys)
    # -------------------------------------------------------------
    GEMINI_KEY_1: str = os.getenv("GEMINI_KEY_1", "")  # Member 1: Arpan
    GEMINI_KEY_2: str = os.getenv("GEMINI_KEY_2", "")  # Member 2: Rishikesh
    GEMINI_KEY_3: str = os.getenv("GEMINI_KEY_3", "")  # Member 3: Kartik
    GEMINI_KEY_4: str = os.getenv("GEMINI_KEY_4", "")  # Member 4: Alok
    GEMINI_KEY_5: str = os.getenv("GEMINI_KEY_5", "")  # Member 5: Ajay Kumar
    GEMINI_KEY_6: str = os.getenv("GEMINI_KEY_6", "")  # Member 6: Shristi
    
    GEMINI_RPM_LIMIT_PER_KEY: int = int(os.getenv("GEMINI_RPM_LIMIT_PER_KEY", "15"))

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
