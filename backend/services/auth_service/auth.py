from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.db import get_db
from app.deps import get_current_db_user
from app.models import User, RefreshToken, Role
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    RefreshRequest,
    LogoutRequest,
    TokenPair,
    AccessTokenOut,
    UserOut,
)
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_token_pair(db: Session, user: User) -> TokenPair:
    access_token, expires_in = create_access_token(user.id, user.role.value)
    refresh_token, jti, expires_at = create_refresh_token(user.id, user.role.value)

    db.add(RefreshToken(jti=jti, user_id=user.id, expires_at=expires_at))
    db.commit()

    return TokenPair(access_token=access_token, refresh_token=refresh_token, expires_in=expires_in)


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Public self-registration is restricted to the "patient" role. Elevated
    # roles must be created by an admin/superadmin (see routers/users.py).
    if payload.role != Role.patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Self-registration only allowed for role 'patient'. "
            "Ask an admin to create elevated-role accounts.",
        )

    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    db.refresh(user)

    return _issue_token_pair(db, user)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    return _issue_token_pair(db, user)


@router.post("/refresh", response_model=AccessTokenOut)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        claims = decode_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    if claims.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required")

    jti = claims.get("jti")
    stored = db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
    if stored is None or stored.revoked:
        # Reuse of a revoked/unknown token: treat as compromised.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked")
    if stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    user = db.get(User, claims["sub"])
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    access_token, expires_in = create_access_token(user.id, user.role.value)
    return AccessTokenOut(access_token=access_token, expires_in=expires_in)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    try:
        claims = decode_token(payload.refresh_token)
    except JWTError:
        # Already invalid/expired — logout is idempotent, nothing to revoke.
        return
    jti = claims.get("jti")
    stored = db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
    if stored is not None:
        stored.revoked = True
        db.commit()
    return


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_db_user)):
    return current_user
