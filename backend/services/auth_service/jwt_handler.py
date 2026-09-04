from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta
from config import settings
from services.auth_service.rbac import UserRole

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

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

@auth_router.post("/register")
async def register(req: RegisterRequest):
    token = create_access_token({"sub": req.phone, "role": req.role, "name": req.full_name})
    return {
        "status": "success",
        "user_id": f"usr_{abs(hash(req.phone)) % 1000000}",
        "access_token": token,
        "token_type": "bearer",
        "role": req.role,
        "name": req.full_name
    }

@auth_router.post("/login")
async def login(req: LoginRequest):
    token = create_access_token({"sub": req.phone, "role": UserRole.PATIENT, "name": "Verified User"})
    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer"
    }
