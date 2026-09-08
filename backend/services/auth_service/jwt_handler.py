from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional
import hashlib
import jwt
from datetime import datetime, timedelta
from config import settings
from services.auth_service.rbac import UserRole
from db.supabase_client import supabase_pool

auth_router = APIRouter()

class RegisterRequest(BaseModel):
    full_name: str
    phone: str
    abha_id: Optional[str] = None
    role: UserRole = UserRole.PATIENT
    password: str

class LoginRequest(BaseModel):
    phone: str
    password: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

@auth_router.post("/register")
async def register(req: RegisterRequest):
    phone = req.phone.strip()
    full_name = req.full_name.strip()
    password = req.password.strip()

    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required."
        )
    if not phone or len(phone) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid 10-digit mobile number is required."
        )
    if not password or len(password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters long."
        )

    existing_user = supabase_pool.get_user_by_phone(phone)
    if existing_user:
        # If user exists, verify password or allow login
        if existing_user.get("password_hash") != hash_password(req.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this phone number already exists with different credentials."
            )
        user_id = existing_user.get("id", f"usr_{abs(hash(phone)) % 1000000}")
        name = existing_user.get("name", req.full_name)
    else:
        user_id = f"usr_{abs(hash(phone)) % 1000000}"
        user_record = {
            "id": user_id,
            "phone": phone,
            "name": req.full_name,
            "abha_id": req.abha_id,
            "role": req.role.value if hasattr(req.role, "value") else str(req.role),
            "password_hash": hash_password(req.password),
            "created_at": datetime.utcnow().isoformat()
        }
        supabase_pool.save_user(user_record)
        name = req.full_name

    token = create_access_token({
        "sub": phone,
        "user_id": user_id,
        "role": req.role.value if hasattr(req.role, "value") else str(req.role),
        "name": name,
        "phone": phone
    })

    return {
        "status": "success",
        "user_id": user_id,
        "access_token": token,
        "token_type": "bearer",
        "role": req.role.value if hasattr(req.role, "value") else str(req.role),
        "name": name,
        "phone": phone,
        "message": "User registered and authenticated successfully"
    }

@auth_router.post("/login")
async def login(req: LoginRequest):
    phone = req.phone.strip()
    user = supabase_pool.get_user_by_phone(phone)
    
    # Auto-register standard demo/first-time credentials for seamless hackathon UX
    if not user:
        user_id = f"usr_{abs(hash(phone)) % 1000000}"
        name = "Aarav Sharma" if phone in ("9876543210", "usr-pat-001") else f"Patient {phone[-4:]}"
        user = {
            "id": user_id,
            "phone": phone,
            "name": name,
            "role": "patient",
            "password_hash": hash_password(req.password),
            "created_at": datetime.utcnow().isoformat()
        }
        supabase_pool.save_user(user)
    else:
        if user.get("password_hash") and user.get("password_hash") != hash_password(req.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect phone number or password"
            )

    token = create_access_token({
        "sub": phone,
        "user_id": user.get("id", f"usr_{abs(hash(phone)) % 1000000}"),
        "role": user.get("role", "patient"),
        "name": user.get("name", "Verified Patient"),
        "phone": phone
    })

    return {
        "status": "success",
        "user_id": user.get("id"),
        "access_token": token,
        "token_type": "bearer",
        "role": user.get("role", "patient"),
        "name": user.get("name", "Verified Patient"),
        "phone": phone
    }
