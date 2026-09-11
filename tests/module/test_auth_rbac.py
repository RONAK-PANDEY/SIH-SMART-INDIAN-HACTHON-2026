import pytest
import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from auth.rbac import UserRole, has_permission

def test_patient_permissions():
    assert has_permission(UserRole.PATIENT, "book_token") is True
    assert has_permission(UserRole.PATIENT, "call_patient") is False

def test_doctor_permissions():
    assert has_permission(UserRole.DOCTOR, "call_patient") is True
    assert has_permission(UserRole.DOCTOR, "create_referral") is True
