"""
RBAC dependency module.

This file is intentionally self-contained (only needs `fastapi`, `python-jose`,
and three env vars) so OTHER services in the platform can copy it verbatim
(or `pip install` this package if it's published internally) and guard their
own routes without depending on the rest of auth_service.

Usage in another service:

    from app.rbac import get_current_user, require_roles, require_min_role, TokenPayload
    from app.models import Role  # or redefine the same Role enum locally

    @router.get("/appointments/{id}")
    def get_appointment(id: str, user: TokenPayload = Depends(require_roles("doctor", "staff", "admin"))):
        ...

    @router.delete("/patients/{id}")
    def delete_patient(id: str, user: TokenPayload = Depends(require_min_role("admin"))):
        ...

Required environment variables (must match auth_service's issuing config):
    JWT_SECRET_KEY   - shared HMAC secret (or public key if moving to RS256)
    JWT_ALGORITHM    - e.g. "HS256"
    JWT_ISSUER       - e.g. "auth_service"
"""
import os
from typing import Iterable

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CHANGE_ME_IN_PRODUCTION")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ISSUER = os.getenv("JWT_ISSUER", "auth_service")

# Ordered least -> most privileged. Keep in sync with app/models.py::Role.
ROLE_ORDER = ["patient", "doctor", "staff", "admin", "superadmin"]

bearer_scheme = HTTPBearer(auto_error=True)


class TokenPayload(BaseModel):
    sub: str  # user id
    role: str
    type: str
    jti: str


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenPayload:
    """Decodes and validates the bearer access token. Rejects refresh tokens."""
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
        )
    except JWTError:
        raise _unauthorized("Invalid or expired token")

    if payload.get("type") != "access":
        raise _unauthorized("Access token required")

    try:
        return TokenPayload(**payload)
    except Exception:
        raise _unauthorized("Malformed token payload")


def require_roles(*allowed_roles: str):
    """
    Dependency factory: allow only an explicit set of roles.

        Depends(require_roles("doctor", "admin"))
    """
    allowed = set(allowed_roles)

    def _dependency(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {sorted(allowed)}",
            )
        return user

    return _dependency


def require_min_role(min_role: str):
    """
    Dependency factory: allow the given role and anything above it in
    ROLE_ORDER (e.g. require_min_role("staff") also allows admin/superadmin).
    """
    if min_role not in ROLE_ORDER:
        raise ValueError(f"Unknown role '{min_role}', expected one of {ROLE_ORDER}")
    min_index = ROLE_ORDER.index(min_role)

    def _dependency(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        try:
            user_index = ROLE_ORDER.index(user.role)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unknown role")
        if user_index < min_index:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role '{min_role}' or higher",
            )
        return user

    return _dependency


def require_self_or_roles(user_id_param: str, *allowed_roles: str):
    """
    Dependency factory for "owner or elevated role" routes, e.g. a patient
    viewing their own record OR staff/admin viewing anyone's.

    `user_id_param` is the name of the path parameter holding the target
    user id, e.g. Depends(require_self_or_roles("user_id", "staff", "admin"))
    on a route like `GET /users/{user_id}`.

    Reads the raw Request so it works regardless of the route's own
    parameter names/order (avoids fragile dynamic-signature tricks).
    """
    allowed = set(allowed_roles)

    def _dependency(
        request: Request,
        user: TokenPayload = Depends(get_current_user),
    ) -> TokenPayload:
        target_id = request.path_params.get(user_id_param)
        if target_id is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Route is missing path param '{user_id_param}' required by require_self_or_roles",
            )
        if user.sub != target_id and user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this resource",
            )
        return user

    return _dependency
