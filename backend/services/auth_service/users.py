from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db import get_db
from app.deps import get_current_db_user
from app.models import User, Role
from app.rbac import require_roles, require_min_role, TokenPayload
from app.core.security import hash_password
from app.schemas import UserAdminCreateRequest, RoleChangeRequest, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: TokenPayload = Depends(require_roles("admin", "superadmin")),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserAdminCreateRequest,
    db: Session = Depends(get_db),
    caller: TokenPayload = Depends(require_roles("admin", "superadmin")),
):
    # Only superadmin can mint other admin/superadmin accounts.
    if payload.role in (Role.admin, Role.superadmin) and caller.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmin can create admin/superadmin accounts",
        )

    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        is_verified=True,  # admin-created accounts are pre-verified
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    db.refresh(user)
    return user


@router.patch("/{user_id}/role", response_model=UserOut)
def change_role(
    user_id: str,
    payload: RoleChangeRequest,
    db: Session = Depends(get_db),
    caller: TokenPayload = Depends(require_roles("admin", "superadmin")),
):
    if payload.role in (Role.admin, Role.superadmin) and caller.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmin can grant admin/superadmin roles",
        )
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: TokenPayload = Depends(require_min_role("staff")),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: TokenPayload = Depends(require_min_role("staff")),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
