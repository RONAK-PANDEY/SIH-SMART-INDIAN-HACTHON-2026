"""
Unit tests for app/rbac.py's role-based access control dependencies.

These call the inner dependency functions directly with a hand-built
`TokenPayload`, bypassing FastAPI's `Depends`/JWT-decoding machinery
(`get_current_user`) entirely. That's intentional: `require_roles`,
`require_min_role`, and `require_self_or_roles` all take the already-
authenticated user as a parameter, so their *authorization* logic (as
opposed to authentication/token-decoding) can be unit tested in
isolation, without a real JWT, a running app, or a database.

Token decoding itself (`get_current_user`) is exercised separately in
`test_get_current_user.py` / integration tests against the running app,
since it depends on env-configured secrets and is more naturally an
integration concern.
"""

import pytest
from fastapi import HTTPException, Request

from app.rbac import require_roles, require_min_role, require_self_or_roles, ROLE_ORDER, TokenPayload


def make_user(role: str, sub: str = "user-1") -> TokenPayload:
    return TokenPayload(sub=sub, role=role, type="access", jti="jti-1")


def make_request(path_params: dict) -> Request:
    """Builds a minimal ASGI Request with the given path_params populated,
    since require_self_or_roles reads request.path_params directly."""
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [],
        "path_params": path_params,
    }
    return Request(scope)


# ---------------------------------------------------------------------
# require_roles: explicit allow-list
# ---------------------------------------------------------------------


def test_require_roles_allows_listed_role():
    dependency = require_roles("doctor", "staff", "admin")
    user = make_user("staff")
    assert dependency(user=user) is user


@pytest.mark.parametrize("role", ["patient", "doctor"])
def test_require_roles_denies_role_not_in_list(role):
    dependency = require_roles("staff", "admin")
    user = make_user(role)
    with pytest.raises(HTTPException) as exc_info:
        dependency(user=user)
    assert exc_info.value.status_code == 403


def test_require_roles_denies_unknown_role_string():
    # A malformed/unexpected role in the token (e.g. stale token after a
    # role rename) must not be silently allowed through.
    dependency = require_roles("admin")
    user = make_user("not_a_real_role")
    with pytest.raises(HTTPException) as exc_info:
        dependency(user=user)
    assert exc_info.value.status_code == 403


def test_require_roles_error_message_lists_allowed_roles():
    dependency = require_roles("admin", "superadmin")
    user = make_user("patient")
    with pytest.raises(HTTPException) as exc_info:
        dependency(user=user)
    assert "admin" in exc_info.value.detail
    assert "superadmin" in exc_info.value.detail


# ---------------------------------------------------------------------
# require_min_role: hierarchy-based check
# ---------------------------------------------------------------------


@pytest.mark.parametrize("role", ["staff", "admin", "superadmin"])
def test_require_min_role_allows_role_at_or_above_minimum(role):
    dependency = require_min_role("staff")
    user = make_user(role)
    assert dependency(user=user) is user


@pytest.mark.parametrize("role", ["patient", "doctor"])
def test_require_min_role_denies_role_below_minimum(role):
    dependency = require_min_role("staff")
    user = make_user(role)
    with pytest.raises(HTTPException) as exc_info:
        dependency(user=user)
    assert exc_info.value.status_code == 403


def test_require_min_role_denies_lowest_role_when_minimum_is_highest():
    dependency = require_min_role("superadmin")
    user = make_user("patient")
    with pytest.raises(HTTPException) as exc_info:
        dependency(user=user)
    assert exc_info.value.status_code == 403


def test_require_min_role_denies_unknown_role_string():
    dependency = require_min_role("staff")
    user = make_user("not_a_real_role")
    with pytest.raises(HTTPException) as exc_info:
        dependency(user=user)
    assert exc_info.value.status_code == 403
    assert "Unknown role" in exc_info.value.detail


def test_require_min_role_rejects_unknown_minimum_at_construction_time():
    # Guards against a typo'd role string in route code (e.g.
    # require_min_role("staf")) failing loudly at import/setup time
    # rather than silently misbehaving at request time.
    with pytest.raises(ValueError):
        require_min_role("not_a_real_role")


def test_role_order_is_ascending_privilege():
    # Sanity-check the ordering the whole hierarchy check depends on.
    assert ROLE_ORDER == ["patient", "doctor", "staff", "admin", "superadmin"]


# ---------------------------------------------------------------------
# require_self_or_roles: owner-or-elevated-role check
# ---------------------------------------------------------------------


def test_require_self_or_roles_allows_the_resource_owner_with_low_role():
    dependency = require_self_or_roles("user_id", "staff", "admin")
    user = make_user("patient", sub="user-42")
    request = make_request({"user_id": "user-42"})
    assert dependency(request=request, user=user) is user


def test_require_self_or_roles_allows_elevated_role_for_other_users_resource():
    dependency = require_self_or_roles("user_id", "staff", "admin")
    user = make_user("staff", sub="staff-1")
    request = make_request({"user_id": "someone-else"})
    assert dependency(request=request, user=user) is user


def test_require_self_or_roles_denies_wrong_role_accessing_others_resource():
    dependency = require_self_or_roles("user_id", "staff", "admin")
    user = make_user("patient", sub="user-42")
    request = make_request({"user_id": "someone-else"})
    with pytest.raises(HTTPException) as exc_info:
        dependency(request=request, user=user)
    assert exc_info.value.status_code == 403


def test_require_self_or_roles_missing_path_param_raises_server_error():
    dependency = require_self_or_roles("user_id", "staff", "admin")
    user = make_user("admin", sub="admin-1")
    request = make_request({})  # route mis-wired: no user_id in path
    with pytest.raises(HTTPException) as exc_info:
        dependency(request=request, user=user)
    assert exc_info.value.status_code == 500


if __name__ == "__main__":
    import sys

    sys.exit(pytest.main([__file__, "-v"]))
