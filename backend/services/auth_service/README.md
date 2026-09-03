# auth_service

FastAPI authentication + RBAC service. Roles: `patient`, `doctor`, `staff`, `admin`, `superadmin`.

> **Note:** `docs/api-contracts.md` was not found in this workspace, so the endpoints
> below follow a standard, documented convention. If your actual contract differs
> (field names, paths, response envelope), tell me and I'll align it.

## Run locally

```bash
cp .env.example .env   # edit JWT_SECRET_KEY etc.
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Interactive docs: `http://localhost:8000/docs`

Run tests: `pytest -q`

## Endpoints

| Method | Path                     | Auth              | Description                                   |
|--------|--------------------------|-------------------|------------------------------------------------|
| POST   | `/auth/register`         | none              | Self-register (role forced to `patient`)       |
| POST   | `/auth/login`             | none              | Returns access + refresh token pair            |
| POST   | `/auth/refresh`           | refresh token     | Rotates/reissues an access token                |
| POST   | `/auth/logout`            | refresh token     | Revokes a refresh token                         |
| GET    | `/auth/me`                | access token      | Current user profile                            |
| GET    | `/users`                  | admin+            | List users                                      |
| POST   | `/users`                  | admin+            | Create user with any role (admin/superadmin gate) |
| GET    | `/users/{id}`             | staff+            | Get a user                                      |
| PATCH  | `/users/{id}/role`        | admin+            | Change a user's role                            |
| PATCH  | `/users/{id}/deactivate`  | staff+            | Deactivate a user                               |
| GET    | `/health`                 | none              | Liveness check                                  |

**Token pair response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 900
}
```

Access tokens: 15 min TTL. Refresh tokens: 7 days, stored server-side (revocable), rotated on each use.

## Design decisions / assumptions (flag if these don't match your contract)

- **Public registration is patient-only.** `doctor`/`staff`/`admin`/`superadmin` accounts
  are created via `POST /users` by an existing `admin`/`superadmin` — open self-service
  registration for clinical/staff roles is a common compliance requirement in health apps.
- **Only `superadmin` can mint `admin`/`superadmin` accounts**, to avoid privilege escalation
  by a compromised admin account.
- **JWT claims:** `sub` (user id), `role`, `type` (`access`|`refresh`), `iat`, `exp`, `iss`, `jti`.
- **Refresh tokens are stateful** (DB-tracked by `jti`) so logout / revocation actually works;
  access tokens are stateless (fast to verify, no DB hit) — that's the RBAC dependency's job.
- SQLite is the dev default; swap `DATABASE_URL` for Postgres in staging/prod, and replace
  `Base.metadata.create_all` in `main.py` with Alembic migrations.

## Using RBAC from other services

`app/rbac.py` is self-contained (only needs `fastapi`, `python-jose`, and three shared
env vars: `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_ISSUER`). Copy it into any other service
in this platform (or extract it to a shared internal package) and use:

```python
from fastapi import APIRouter, Depends
from app.rbac import require_roles, require_min_role, require_self_or_roles, TokenPayload

router = APIRouter()

# Exact role allow-list
@router.get("/records/{patient_id}")
def get_record(patient_id: str, user: TokenPayload = Depends(require_roles("doctor", "staff", "admin"))):
    ...

# Anything at or above a role in the hierarchy
# patient < doctor < staff < admin < superadmin
@router.delete("/records/{id}")
def delete_record(id: str, user: TokenPayload = Depends(require_min_role("admin"))):
    ...

# Owner OR elevated role (e.g. patient viewing own data, or staff viewing anyone's)
@router.get("/patients/{user_id}/appointments")
def list_appointments(user_id: str, user: TokenPayload = Depends(require_self_or_roles("user_id", "staff", "admin"))):
    ...
```

Every downstream service must be configured with the **same** `JWT_SECRET_KEY` /
`JWT_ALGORITHM` / `JWT_ISSUER` as `auth_service` so token validation succeeds without
a network call back to auth_service (services stay decoupled — no DB or RPC sharing
needed just to check "is this user a doctor?").

## Security notes

- Passwords hashed with bcrypt (cost configurable via `BCRYPT_ROUNDS`).
- Refresh token reuse after revocation/logout is rejected — treat as a compromise signal
  if you see it in logs (consider revoking *all* of that user's tokens in that case; not
  implemented here but straightforward to add in `routers/auth.py::refresh`).
- CORS is wide open (`*`) for dev — tighten `allow_origins` before deploying.
- Move `JWT_SECRET_KEY` to a real secrets manager in production; consider RS256 with a
  public/private keypair so downstream services only hold the public key.
