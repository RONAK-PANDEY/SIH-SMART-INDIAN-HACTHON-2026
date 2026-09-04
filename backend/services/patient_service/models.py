from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str

class PatientVitals(BaseModel):
    heart_rate: Optional[int] = None  # bpm
    blood_pressure_systolic: Optional[int] = None  # mmHg
    blood_pressure_diastolic: Optional[int] = None  # mmHg
    temperature_f: Optional[float] = None  # Fahrenheit
    spo2_pct: Optional[int] = None  # %
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

class PatientHistoryItem(BaseModel):
    record_id: str
    visit_date: str
    hospital_name: str
    department_name: str
    doctor_name: str
    diagnosis: str
    prescription_summary: Optional[str] = None
    token_number: Optional[str] = None

class PatientProfile(BaseModel):
    id: str
    full_name: str
    phone: str
    abha_id: Optional[str] = None
    age: int
    gender: str  # male, female, other
    allergies: List[str] = Field(default_factory=list)
    chronic_conditions: List[str] = Field(default_factory=list)
    emergency_contact: Optional[EmergencyContact] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PatientCreateRequest(BaseModel):
    full_name: str
    phone: str
    abha_id: Optional[str] = None
    age: int
    gender: str
    allergies: List[str] = Field(default_factory=list)
    chronic_conditions: List[str] = Field(default_factory=list)
    emergency_contact: Optional[EmergencyContact] = None
    address: Optional[str] = None
    pincode: Optional[str] = None

class PatientUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    abha_id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    emergency_contact: Optional[EmergencyContact] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
