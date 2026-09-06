"""
SmartCare Observer & Vigilance Service
Handles Doctor Behavioral Feedback Surveys, Performance Bonus & Salary Calculation,
Hospital Queue Auditing, and Citizen Grievance Redressal.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

observer_router = APIRouter()

# Data models
class CitizenSurveyRequest(BaseModel):
    doctor_id: str
    doctor_name: str
    department: str
    hospital_name: str = "AIIMS New Delhi - Main Campus"
    token_number: str
    patient_name: str
    politeness_rating: int = Field(..., ge=1, le=5, description="1 to 5 star rating for doctor courtesy and talking behavior")
    communication_rating: int = Field(..., ge=1, le=5, description="1 to 5 star rating for how well doctor explained diagnosis & meds")
    diagnosis_quality_rating: int = Field(..., ge=1, le=5, description="1 to 5 star rating for examination thoroughness")
    wait_time_satisfaction: int = Field(..., ge=1, le=5, description="1 to 5 star rating for punctuality and queue wait")
    feedback_text: Optional[str] = ""
    is_grievance: Optional[bool] = False
    grievance_category: Optional[str] = None

class GrievanceActionRequest(BaseModel):
    action: str  # "RESOLVE", "ISSUE_NOTICE", "INITIATE_INQUIRY", "DEDUCT_BONUS"
    notes: str
    investigator_name: str = "Central Vigilance Officer - MoHFW"

# In-memory storage for demonstration & live sync
INITIAL_SURVEYS = [
    {
        "id": "srv-001",
        "doctor_id": "doc-001",
        "doctor_name": "Dr. Rajesh Sharma",
        "department": "Cardiology",
        "hospital_name": "AIIMS New Delhi - Main Campus",
        "token_number": "CARD-042",
        "patient_name": "Amit Kumar",
        "politeness_rating": 5,
        "communication_rating": 5,
        "diagnosis_quality_rating": 5,
        "wait_time_satisfaction": 4,
        "overall_score": 4.75,
        "feedback_text": "Very patient, listened to all my symptoms carefully and explained ECG report clearly.",
        "is_grievance": False,
        "created_at": "2026-09-06T10:30:00"
    },
    {
        "id": "srv-002",
        "doctor_id": "doc-002",
        "doctor_name": "Dr. Priya Patel",
        "department": "Pediatrics",
        "hospital_name": "Safdarjung Hospital",
        "token_number": "PED-018",
        "patient_name": "Sunita Devi",
        "politeness_rating": 5,
        "communication_rating": 5,
        "diagnosis_quality_rating": 5,
        "wait_time_satisfaction": 5,
        "overall_score": 5.0,
        "feedback_text": "Excellent pediatrician. Calm and reassuring with my daughter.",
        "is_grievance": False,
        "created_at": "2026-09-06T11:15:00"
    },
    {
        "id": "srv-003",
        "doctor_id": "doc-004",
        "doctor_name": "Dr. Sneha Roy",
        "department": "Dermatology",
        "hospital_name": "AIIMS New Delhi - Main Campus",
        "token_number": "DERM-009",
        "patient_name": "Rahul Verma",
        "politeness_rating": 2,
        "communication_rating": 3,
        "diagnosis_quality_rating": 3,
        "wait_time_satisfaction": 2,
        "overall_score": 2.5,
        "feedback_text": "Doctor rushed through the appointment and arrived 35 minutes late to the OPD room.",
        "is_grievance": True,
        "grievance_category": "Doctor Delay & Rushed Consultation",
        "created_at": "2026-09-06T12:00:00"
    }
]

INITIAL_GRIEVANCES = [
    {
        "id": "grv-101",
        "doctor_id": "doc-004",
        "doctor_name": "Dr. Sneha Roy",
        "department": "Dermatology",
        "hospital_name": "AIIMS New Delhi - Main Campus",
        "patient_name": "Rahul Verma",
        "token_number": "DERM-009",
        "category": "Doctor Delay & Rushed Consultation",
        "description": "Doctor rushed through the consultation in under 2 minutes and was 35 mins late.",
        "status": "UNDER_INVESTIGATION",
        "severity": "MEDIUM",
        "action_history": [
            {
                "timestamp": "2026-09-06T12:05:00",
                "officer": "MoHFW Quality Cell",
                "action": "FLAGGED_FOR_AUDIT",
                "note": "Citizen survey triggered automatic vigilance alert due to rating < 3.0"
            }
        ],
        "created_at": "2026-09-06T12:00:00"
    },
    {
        "id": "grv-102",
        "doctor_id": "doc-007",
        "doctor_name": "Dr. Manoj Saxena",
        "department": "Orthopedics",
        "hospital_name": "Ram Manohar Lohia Hospital",
        "patient_name": "Kavita Rao",
        "token_number": "ORTH-065",
        "category": "Queue Jumping / Priority Violation",
        "description": "Counter staff allowed unbooked walk-in ahead of senior citizen token.",
        "status": "OPEN",
        "severity": "HIGH",
        "action_history": [],
        "created_at": "2026-09-06T13:45:00"
    }
]

DOCTOR_REGISTRY = [
    {"id": "doc-001", "name": "Dr. Rajesh Sharma", "department": "Cardiology", "hospital": "AIIMS New Delhi", "base_salary": 145000, "designation": "Senior Consultant"},
    {"id": "doc-002", "name": "Dr. Priya Patel", "department": "Pediatrics", "hospital": "Safdarjung Hospital", "base_salary": 125000, "designation": "Associate Specialist"},
    {"id": "doc-003", "name": "Dr. Vikram Sethi", "department": "Orthopedics", "hospital": "AIIMS New Delhi", "base_salary": 135000, "designation": "Consultant Surgeon"},
    {"id": "doc-004", "name": "Dr. Sneha Roy", "department": "Dermatology", "hospital": "AIIMS New Delhi", "base_salary": 115000, "designation": "Assistant Professor"},
    {"id": "doc-005", "name": "Dr. Ananya Mishra", "department": "Ophthalmology", "hospital": "Safdarjung Hospital", "base_salary": 120000, "designation": "Consultant Specialist"},
    {"id": "doc-006", "name": "Dr. Harpreet Singh", "department": "General Medicine", "hospital": "AIIMS New Delhi", "base_salary": 130000, "designation": "Chief Medical Officer"},
    {"id": "doc-007", "name": "Dr. Manoj Saxena", "department": "Orthopedics", "hospital": "RML Hospital", "base_salary": 128000, "designation": "Specialist Grade I"},
]

surveys_db = list(INITIAL_SURVEYS)
grievances_db = list(INITIAL_GRIEVANCES)

def calculate_doctor_performance(doctor_id: str):
    doc_surveys = [s for s in surveys_db if s["doctor_id"] == doctor_id]
    doc_grievances = [g for g in grievances_db if g["doctor_id"] == doctor_id and g["status"] != "RESOLVED"]
    
    if not doc_surveys:
        # Default baseline if no reviews yet
        avg_score = 4.5
        politeness = 4.5
        communication = 4.5
        diagnosis = 4.5
        punctuality = 4.5
        review_count = 0
    else:
        review_count = len(doc_surveys)
        avg_score = round(sum(s["overall_score"] for s in doc_surveys) / review_count, 2)
        politeness = round(sum(s["politeness_rating"] for s in doc_surveys) / review_count, 2)
        communication = round(sum(s["communication_rating"] for s in doc_surveys) / review_count, 2)
        diagnosis = round(sum(s["diagnosis_quality_rating"] for s in doc_surveys) / review_count, 2)
        punctuality = round(sum(s["wait_time_satisfaction"] for s in doc_surveys) / review_count, 2)
        
    grievance_count = len(doc_grievances)
    
    # Govt Performance Bonus / Penalty Matrix (MoHFW Direct Linkage)
    if grievance_count > 0 or avg_score < 3.2:
        bonus_pct = -10.0  # Disciplinary Deduction & Audit Notice
        grade = "Grade C (Disciplinary Audit / Penalty)"
        status = "ALERT"
    elif avg_score >= 4.75 and review_count >= 1:
        bonus_pct = 15.0   # Exceptional Citizen Satisfaction (+15%)
        grade = "Grade A+ (Distinguished Excellence)"
        status = "EXCELLENT"
    elif avg_score >= 4.2:
        bonus_pct = 8.0    # Meritorious Performance (+8%)
        grade = "Grade A (Meritorious)"
        status = "GOOD"
    elif avg_score >= 3.5:
        bonus_pct = 0.0    # Standard Base Salary
        grade = "Grade B (Standard Compliance)"
        status = "SATISFACTORY"
    else:
        bonus_pct = -5.0
        grade = "Grade C- (Needs Improvement)"
        status = "WARNING"
        
    return {
        "doctor_id": doctor_id,
        "avg_score": avg_score,
        "politeness_score": politeness,
        "communication_score": communication,
        "diagnosis_score": diagnosis,
        "punctuality_score": punctuality,
        "review_count": review_count,
        "grievance_count": grievance_count,
        "bonus_percentage": bonus_pct,
        "performance_grade": grade,
        "vigilance_status": status
    }

@observer_router.post("/surveys")
async def submit_survey(survey: CitizenSurveyRequest):
    overall = round((survey.politeness_rating + survey.communication_rating + 
                     survey.diagnosis_quality_rating + survey.wait_time_satisfaction) / 4.0, 2)
    
    survey_record = {
        "id": f"srv-{uuid.uuid4().hex[:6]}",
        "doctor_id": survey.doctor_id,
        "doctor_name": survey.doctor_name,
        "department": survey.department,
        "hospital_name": survey.hospital_name,
        "token_number": survey.token_number,
        "patient_name": survey.patient_name,
        "politeness_rating": survey.politeness_rating,
        "communication_rating": survey.communication_rating,
        "diagnosis_quality_rating": survey.diagnosis_quality_rating,
        "wait_time_satisfaction": survey.wait_time_satisfaction,
        "overall_score": overall,
        "feedback_text": survey.feedback_text or "No comment provided.",
        "is_grievance": survey.is_grievance or (overall < 3.0),
        "grievance_category": survey.grievance_category if survey.is_grievance else ("Low Rating Automatic Alert" if overall < 3.0 else None),
        "created_at": datetime.now().isoformat()
    }
    surveys_db.insert(0, survey_record)
    
    # If low rating or marked grievance, create an automatic vigilance grievance
    if survey_record["is_grievance"]:
        grv_record = {
            "id": f"grv-{uuid.uuid4().hex[:6]}",
            "doctor_id": survey.doctor_id,
            "doctor_name": survey.doctor_name,
            "department": survey.department,
            "hospital_name": survey.hospital_name,
            "patient_name": survey.patient_name,
            "token_number": survey.token_number,
            "category": survey_record["grievance_category"] or "Citizen Behavioral Complaint",
            "description": survey.feedback_text or "Citizen gave rating below acceptable government hospital threshold.",
            "status": "OPEN",
            "severity": "HIGH" if overall <= 2.0 else "MEDIUM",
            "action_history": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "officer": "National Health Vigilance System",
                    "action": "AUTO_ESCALATION",
                    "note": f"Automatic grievance logged from citizen OPD survey score {overall}/5.0"
                }
            ],
            "created_at": datetime.now().isoformat()
        }
        grievances_db.insert(0, grv_record)
        
    perf = calculate_doctor_performance(survey.doctor_id)
    return {
        "success": True,
        "message": "Citizen feedback survey submitted successfully. Government oversight recorded.",
        "survey_id": survey_record["id"],
        "calculated_overall": overall,
        "updated_doctor_performance": perf
    }

@observer_router.get("/surveys/doctor/{doctor_id}")
async def get_doctor_surveys(doctor_id: str):
    perf = calculate_doctor_performance(doctor_id)
    doc_surveys = [s for s in surveys_db if s["doctor_id"] == doctor_id]
    return {
        "performance": perf,
        "surveys": doc_surveys
    }

@observer_router.get("/doctors/performance")
async def get_all_doctor_performance():
    results = []
    for doc in DOCTOR_REGISTRY:
        perf = calculate_doctor_performance(doc["id"])
        base_salary = doc["base_salary"]
        bonus_pct = perf["bonus_percentage"]
        bonus_amount = round(base_salary * (bonus_pct / 100.0), 2)
        total_payroll = round(base_salary + bonus_amount, 2)
        
        results.append({
            **doc,
            **perf,
            "bonus_amount": bonus_amount,
            "total_effective_payroll": total_payroll
        })
    return {
        "total_doctors": len(results),
        "evaluated_at": datetime.now().isoformat(),
        "doctors": results
    }

@observer_router.get("/grievances")
async def get_grievances(status: Optional[str] = None):
    if status:
        filtered = [g for g in grievances_db if g["status"].upper() == status.upper()]
    else:
        filtered = grievances_db
    return {
        "total_grievances": len(filtered),
        "grievances": filtered
    }

@observer_router.post("/grievances/{grievance_id}/action")
async def take_grievance_action(grievance_id: str, payload: GrievanceActionRequest):
    grv = next((g for g in grievances_db if g["id"] == grievance_id), None)
    if not grv:
        raise HTTPException(status_code=404, detail="Grievance record not found")
        
    action_entry = {
        "timestamp": datetime.now().isoformat(),
        "officer": payload.investigator_name,
        "action": payload.action,
        "note": payload.notes
    }
    grv["action_history"].append(action_entry)
    
    if payload.action == "RESOLVE":
        grv["status"] = "RESOLVED"
    elif payload.action == "ISSUE_NOTICE":
        grv["status"] = "SHOW_CAUSE_ISSUED"
    elif payload.action == "INITIATE_INQUIRY":
        grv["status"] = "FORMAL_INQUIRY_ACTIVE"
    elif payload.action == "DEDUCT_BONUS":
        grv["status"] = "PENALTY_APPLIED"
        
    return {
        "success": True,
        "message": f"Action {payload.action} recorded on grievance {grievance_id}",
        "updated_grievance": grv
    }

@observer_router.get("/audits")
async def get_queue_audits():
    """Live hospital queue integrity audit for the Government Ombudsman"""
    return {
        "generated_at": datetime.now().isoformat(),
        "audit_summary": {
            "hospitals_monitored": 3,
            "active_opd_queues": 28,
            "anomalies_detected": 2,
            "compliance_index": "96.4%"
        },
        "anomalies": [
            {
                "id": "anom-01",
                "hospital": "AIIMS New Delhi",
                "department": "Cardiology",
                "type": "WAIT_TIME_EXCEEDED",
                "severity": "WARNING",
                "message": "Token CARD-048 has been waiting for 48 mins (Threshold: 40 mins). Priority queue auto-escalation active.",
                "timestamp": datetime.now().isoformat()
            },
            {
                "id": "anom-02",
                "hospital": "Safdarjung Hospital",
                "department": "Orthopedics",
                "type": "DOCTOR_UNAVAILABLE_SLOT",
                "severity": "INFO",
                "message": "Doctor Room 104 resumed OPD consultation following 15 min emergency ward call.",
                "timestamp": datetime.now().isoformat()
            }
        ]
    }
