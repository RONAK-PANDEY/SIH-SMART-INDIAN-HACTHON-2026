from enum import Enum

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    STAFF = "staff"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"

ROLE_PERMISSIONS = {
    UserRole.PATIENT: ["book_token", "view_own_queue", "request_referral"],
    UserRole.DOCTOR: ["call_patient", "skip_patient", "complete_consultation", "create_referral"],
    UserRole.STAFF: ["register_walkin", "check_in_patient", "view_department_queue"],
    UserRole.ADMIN: ["manage_doctors", "view_analytics", "override_queue", "view_heatmap"],
    UserRole.SUPERADMIN: ["manage_hospitals", "system_config", "full_access"],
}

def has_permission(role: UserRole, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, [])
