from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud import patient as crud
from app.database import get_db
from app.schemas.schemas import (
    AppointmentOut,
    PatientCreate,
    PatientLinkAccount,
    PatientOut,
    PatientUpdate,
    ReferralOut,
    TriageAssessmentOut,
    VisitOut,
)
from shared.auth import CurrentUser, forbidden, get_current_user, not_found, validation_error
from shared.pagination import PageParams, build_page

router = APIRouter(prefix="/api/v1/patients", tags=["patients"])

GENDER_VALUES = {"male", "female", "other", "unspecified"}


def _is_self(user: CurrentUser, patient) -> bool:
    return user.role == "patient" and patient.user_id is not None and str(patient.user_id) == user.user_id


@router.post("", response_model=dict, status_code=201)
def create_patient(
    body: PatientCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    """staff+ full create; patient role may self-register (user_id forced to self)."""
    data = body.model_dump(exclude_unset=True)

    if user.role == "patient":
        data["user_id"] = uuid.UUID(user.user_id)
        if crud.get_patient_by_user_id(db, uuid.UUID(user.user_id)) is not None:
            raise validation_error("This account is already linked to a patient record")
    elif not user.has_min_role("staff"):
        raise forbidden()

    if not data.get("full_name"):
        raise validation_error("full_name is required")

    if data.get("gender") is not None and data["gender"] not in GENDER_VALUES:
        raise validation_error(f"gender must be one of {sorted(GENDER_VALUES)}")

    data.pop("email", None)
    if body.email is not None:
        data["email"] = str(body.email)

    patient = crud.create_patient(db, data)
    return {"patient": PatientOut.model_validate(patient).model_dump(mode="json")}


@router.get("", response_model=dict)
def list_patients(
    search: Optional[str] = None,
    medical_record_number: Optional[str] = None,
    phone: Optional[str] = None,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.has_min_role("staff"):
        raise forbidden()
    rows, total = crud.list_patients(
        db,
        search=search,
        medical_record_number=medical_record_number,
        phone=phone,
        offset=params.offset,
        limit=params.page_size,
    )
    items = [PatientOut.model_validate(r).model_dump(mode="json") for r in rows]
    return build_page(items, total, params)


def _get_patient_or_404(db: Session, patient_id: uuid.UUID):
    patient = crud.get_patient(db, patient_id)
    if patient is None:
        raise not_found("Patient not found")
    return patient


@router.get("/{patient_id}", response_model=dict)
def get_patient(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    patient = _get_patient_or_404(db, patient_id)
    if not (user.has_min_role("staff") or _is_self(user, patient)):
        raise forbidden()
    return {"patient": PatientOut.model_validate(patient).model_dump(mode="json")}


@router.patch("/{patient_id}", response_model=dict)
def update_patient(
    patient_id: uuid.UUID,
    body: PatientUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    patient = _get_patient_or_404(db, patient_id)
    if not (user.has_min_role("staff") or _is_self(user, patient)):
        raise forbidden()

    data = body.model_dump(exclude_unset=True)
    if "gender" in data and data["gender"] is not None and data["gender"] not in GENDER_VALUES:
        raise validation_error(f"gender must be one of {sorted(GENDER_VALUES)}")
    if "email" in data and data["email"] is not None:
        data["email"] = str(data["email"])

    patient = crud.update_patient(db, patient, data)
    return {"patient": PatientOut.model_validate(patient).model_dump(mode="json")}


@router.delete("/{patient_id}", response_model=dict)
def delete_patient(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.is_admin():
        raise forbidden()
    patient = _get_patient_or_404(db, patient_id)
    crud.delete_patient(db, patient)
    return {"success": True}


@router.get("/{patient_id}/visits", response_model=dict)
def get_patient_visits(
    patient_id: uuid.UUID,
    status: Optional[str] = None,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    patient = _get_patient_or_404(db, patient_id)
    if not (user.has_min_role("doctor") or _is_self(user, patient)):
        raise forbidden()
    rows, total = crud.list_visits(db, patient_id=patient_id, status=status, offset=params.offset, limit=params.page_size)
    items = [VisitOut.model_validate(r).model_dump(mode="json") for r in rows]
    return build_page(items, total, params)


@router.get("/{patient_id}/appointments", response_model=dict)
def get_patient_appointments(
    patient_id: uuid.UUID,
    status: Optional[str] = None,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    patient = _get_patient_or_404(db, patient_id)
    if not (user.has_min_role("doctor") or _is_self(user, patient)):
        raise forbidden()
    rows, total = crud.list_appointments(db, patient_id=patient_id, status=status, offset=params.offset, limit=params.page_size)
    items = [AppointmentOut.model_validate(r).model_dump(mode="json") for r in rows]
    return build_page(items, total, params)


@router.get("/{patient_id}/triage-assessments", response_model=dict)
def get_patient_triage_assessments(
    patient_id: uuid.UUID,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    _get_patient_or_404(db, patient_id)
    if not user.has_min_role("doctor"):
        raise forbidden()
    rows, total = crud.list_triage_assessments(db, patient_id=patient_id, offset=params.offset, limit=params.page_size)
    items = [TriageAssessmentOut.model_validate(r).model_dump(mode="json") for r in rows]
    return build_page(items, total, params)


@router.get("/{patient_id}/referrals", response_model=dict)
def get_patient_referrals(
    patient_id: uuid.UUID,
    status: Optional[str] = None,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    patient = _get_patient_or_404(db, patient_id)
    if not (user.has_min_role("doctor") or _is_self(user, patient)):
        raise forbidden()
    rows, total = crud.list_referrals(db, patient_id=patient_id, status=status, offset=params.offset, limit=params.page_size)
    items = [ReferralOut.model_validate(r).model_dump(mode="json") for r in rows]
    return build_page(items, total, params)


@router.post("/{patient_id}/link-account", response_model=dict)
def link_account(
    patient_id: uuid.UUID,
    body: PatientLinkAccount,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.has_min_role("staff"):
        raise forbidden()
    patient = _get_patient_or_404(db, patient_id)
    patient = crud.link_account(db, patient, body.user_id)
    return {"patient": PatientOut.model_validate(patient).model_dump(mode="json")}
