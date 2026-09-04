import uuid
from datetime import datetime
from typing import Dict, List, Optional
from services.patient_service.models import (
    PatientProfile,
    PatientCreateRequest,
    PatientUpdateRequest,
    EmergencyContact,
    PatientHistoryItem,
    PatientVitals
)

class PatientService:
    """
    Manages Patient registration, lookup, demographic profiles, ABHA ID mappings,
    and clinical visit history.
    """

    # In-memory store seeded with realistic demo patients
    _patients: Dict[str, PatientProfile] = {
        "9876543210": PatientProfile(
            id="usr-pat-001",
            full_name="Aarav Sharma",
            phone="9876543210",
            abha_id="ABHA-9821-4432-1109",
            age=34,
            gender="male",
            allergies=["Penicillin"],
            chronic_conditions=["Mild Asthma"],
            emergency_contact=EmergencyContact(
                name="Sunita Sharma",
                relationship="Spouse",
                phone="9876543211"
            ),
            address="B-104, Green Park Extension, New Delhi",
            pincode="110016"
        ),
        "9812345678": PatientProfile(
            id="usr-pat-002",
            full_name="Rajesh Verma",
            phone="9812345678",
            abha_id="ABHA-1122-3344-5566",
            age=58,
            gender="male",
            allergies=["Sulfa drugs"],
            chronic_conditions=["Hypertension", "Type 2 Diabetes"],
            emergency_contact=EmergencyContact(
                name="Anjali Verma",
                relationship="Daughter",
                phone="9812345679"
            ),
            address="Plot 45, Sector 12, Dwarka, New Delhi",
            pincode="110075"
        ),
        "9899887766": PatientProfile(
            id="usr-pat-003",
            full_name="Ananya Iyer",
            phone="9899887766",
            abha_id="ABHA-5544-3322-1100",
            age=7,
            gender="female",
            allergies=[],
            chronic_conditions=[],
            emergency_contact=EmergencyContact(
                name="Karthik Iyer",
                relationship="Father",
                phone="9899887760"
            ),
            address="Flat 302, Mayur Vihar Phase 1, New Delhi",
            pincode="110091"
        )
    }

    _history: Dict[str, List[PatientHistoryItem]] = {
        "usr-pat-001": [
            PatientHistoryItem(
                record_id="rec-101",
                visit_date="2026-08-15",
                hospital_name="AIIMS New Delhi",
                department_name="General Internal Medicine",
                doctor_name="Dr. Rajesh Khanna",
                diagnosis="Seasonal allergic rhinitis with mild bronchospasm",
                prescription_summary="Levocetirizine 5mg OD x 5 days, Salbutamol Inhaler PRN",
                token_number="GEN-014"
            )
        ],
        "usr-pat-002": [
            PatientHistoryItem(
                record_id="rec-102",
                visit_date="2026-08-20",
                hospital_name="Safdarjung Super Speciality Hospital",
                department_name="Cardiology",
                doctor_name="Dr. Priya Sharma",
                diagnosis="Essential Hypertension Grade 1",
                prescription_summary="Telmisartan 40mg OD, Lifestyle & low sodium diet advised",
                token_number="CARD-008"
            )
        ]
    }

    _vitals: Dict[str, PatientVitals] = {
        "usr-pat-001": PatientVitals(
            heart_rate=76,
            blood_pressure_systolic=120,
            blood_pressure_diastolic=80,
            temperature_f=98.6,
            spo2_pct=99
        ),
        "usr-pat-002": PatientVitals(
            heart_rate=88,
            blood_pressure_systolic=142,
            blood_pressure_diastolic=90,
            temperature_f=98.8,
            spo2_pct=97
        )
    }

    @classmethod
    async def get_patient_by_phone(cls, phone: str) -> Optional[PatientProfile]:
        return cls._patients.get(phone)

    @classmethod
    async def get_patient_by_id(cls, patient_id: str) -> Optional[PatientProfile]:
        for patient in cls._patients.values():
            if patient.id == patient_id:
                return patient
        return None

    @classmethod
    async def get_patient_by_abha(cls, abha_id: str) -> Optional[PatientProfile]:
        for patient in cls._patients.values():
            if patient.abha_id and patient.abha_id.lower() == abha_id.lower():
                return patient
        return None

    @classmethod
    async def register_patient(cls, req: PatientCreateRequest) -> PatientProfile:
        # Check if already exists by phone
        if req.phone in cls._patients:
            # Update existing
            existing = cls._patients[req.phone]
            update_data = req.dict(exclude_unset=True)
            for k, v in update_data.items():
                setattr(existing, k, v)
            existing.updated_at = datetime.utcnow()
            return existing

        patient_id = f"usr-pat-{uuid.uuid4().hex[:6]}"
        profile = PatientProfile(
            id=patient_id,
            full_name=req.full_name,
            phone=req.phone,
            abha_id=req.abha_id,
            age=req.age,
            gender=req.gender,
            allergies=req.allergies,
            chronic_conditions=req.chronic_conditions,
            emergency_contact=req.emergency_contact,
            address=req.address,
            pincode=req.pincode,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        cls._patients[req.phone] = profile
        return profile

    @classmethod
    async def update_patient(cls, patient_id: str, req: PatientUpdateRequest) -> Optional[PatientProfile]:
        patient = await cls.get_patient_by_id(patient_id)
        if not patient:
            return None

        update_data = req.dict(exclude_unset=True)
        for k, v in update_data.items():
            if v is not None:
                setattr(patient, k, v)
        patient.updated_at = datetime.utcnow()
        return patient

    @classmethod
    async def get_patient_history(cls, patient_id: str) -> List[PatientHistoryItem]:
        return cls._history.get(patient_id, [])

    @classmethod
    async def get_patient_vitals(cls, patient_id: str) -> Optional[PatientVitals]:
        return cls._vitals.get(patient_id)

    @classmethod
    async def record_vitals(cls, patient_id: str, vitals: PatientVitals) -> PatientVitals:
        cls._vitals[patient_id] = vitals
        return vitals
