from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from services.patient_service.service import PatientService
from services.patient_service.models import (
    PatientProfile,
    PatientCreateRequest,
    PatientUpdateRequest,
    PatientHistoryItem,
    PatientVitals
)

patient_router = APIRouter()

@patient_router.post("/register", response_model=PatientProfile, status_code=status.HTTP_201_CREATED)
async def register_patient(req: PatientCreateRequest):
    """
    Register a new patient or retrieve existing profile by phone number.
    """
    return await PatientService.register_patient(req)

@patient_router.get("/{phone}", response_model=PatientProfile)
async def get_patient_by_phone(phone: str):
    """
    Lookup patient profile by registered mobile phone number.
    """
    patient = await PatientService.get_patient_by_phone(phone)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with phone {phone} not found"
        )
    return patient

@patient_router.get("/id/{patient_id}", response_model=PatientProfile)
async def get_patient_by_id(patient_id: str):
    """
    Lookup patient profile by system user ID.
    """
    patient = await PatientService.get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient ID {patient_id} not found"
        )
    return patient

@patient_router.get("/abha/{abha_id}", response_model=PatientProfile)
async def get_patient_by_abha(abha_id: str):
    """
    Lookup patient profile by Ayushman Bharat Health Account (ABHA) ID.
    """
    patient = await PatientService.get_patient_by_abha(abha_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ABHA ID {abha_id} not found"
        )
    return patient

@patient_router.put("/{patient_id}", response_model=PatientProfile)
async def update_patient(patient_id: str, req: PatientUpdateRequest):
    """
    Update patient demographics, emergency contacts, or medical conditions.
    """
    updated = await PatientService.update_patient(patient_id, req)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient ID {patient_id} not found"
        )
    return updated

@patient_router.get("/{patient_id}/history", response_model=List[PatientHistoryItem])
async def get_patient_history(patient_id: str):
    """
    Retrieve clinical consultation and visit history for a patient.
    """
    return await PatientService.get_patient_history(patient_id)

@patient_router.get("/{patient_id}/vitals", response_model=Optional[PatientVitals])
async def get_patient_vitals(patient_id: str):
    """
    Retrieve latest recorded vitals for a patient.
    """
    return await PatientService.get_patient_vitals(patient_id)

@patient_router.post("/{patient_id}/vitals", response_model=PatientVitals)
async def record_patient_vitals(patient_id: str, vitals: PatientVitals):
    """
    Record or update vitals for a patient during OPD intake.
    """
    return await PatientService.record_vitals(patient_id, vitals)
