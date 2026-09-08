import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

from services.observer_service.router import (
    calculate_doctor_performance,
    surveys_db,
    grievances_db
)

def test_zero_surveys_doctor_not_awarded_bonus():
    """Verify doctor with 0 reviews is NOT silently awarded Grade A/B or cash bonus."""
    perf = calculate_doctor_performance("doc-non-existent-99")
    assert perf["review_count"] == 0
    assert perf["avg_score"] == 0.0
    assert perf["bonus_percentage"] == 0.0
    assert "Pending" in perf["performance_grade"] or "No Surveys" in perf["performance_grade"]
    assert perf["vigilance_status"] == "UNRATED"

def test_small_sample_size_guard():
    """Verify single 5-star review does not immediately grant permanent Grade A+ bonus."""
    doc_id = "doc-test-small-sample"
    # Inject exactly 1 review
    surveys_db.append({
        "id": "srv-test-1",
        "doctor_id": doc_id,
        "doctor_name": "Dr. Test Sample",
        "department": "Cardiology",
        "overall_score": 5.0,
        "politeness_rating": 5,
        "communication_rating": 5,
        "diagnosis_quality_rating": 5,
        "wait_time_satisfaction": 5,
        "is_grievance": False,
        "created_at": "2026-09-08T12:00:00"
    })

    perf = calculate_doctor_performance(doc_id)
    assert perf["review_count"] == 1
    assert perf["avg_score"] == 5.0
    # Must be marked Provisional with 0.0% bonus until MIN_SAMPLE_SIZE (3) is reached
    assert "Provisional" in perf["performance_grade"]
    assert perf["bonus_percentage"] == 0.0

def test_grade_thresholds_with_adequate_sample():
    """Verify strict mathematical grade boundaries when sample size >= 3."""
    doc_id = "doc-test-thresholds"
    
    # Inject 3 reviews with average 4.80 -> Grade A+
    surveys_db.extend([
        {"id": f"srv-t-{i}", "doctor_id": doc_id, "overall_score": 4.8, "politeness_rating": 5, "communication_rating": 5, "diagnosis_quality_rating": 5, "wait_time_satisfaction": 4, "is_grievance": False}
        for i in range(1, 4)
    ])

    perf = calculate_doctor_performance(doc_id)
    assert perf["review_count"] == 3
    assert perf["avg_score"] == 4.80
    assert perf["bonus_percentage"] == 15.0
    assert "Grade A+" in perf["performance_grade"]
    assert perf["vigilance_status"] == "EXCELLENT"

def test_active_grievance_penalty_override():
    """Verify active grievance triggers Grade C penalty deduction regardless of rating score."""
    doc_id = "doc-test-grievance"
    
    # 3 High score reviews
    surveys_db.extend([
        {"id": f"srv-g-{i}", "doctor_id": doc_id, "overall_score": 5.0, "politeness_rating": 5, "communication_rating": 5, "diagnosis_quality_rating": 5, "wait_time_satisfaction": 5, "is_grievance": False}
        for i in range(1, 4)
    ])
    
    # Add active unresolved grievance
    grievances_db.append({
        "id": "grv-test-1",
        "doctor_id": doc_id,
        "status": "OPEN",
        "category": "Behavioral Complaint"
    })

    perf = calculate_doctor_performance(doc_id)
    assert perf["grievance_count"] == 1
    assert perf["bonus_percentage"] == -10.0
    assert "Grade C" in perf["performance_grade"]
    assert perf["vigilance_status"] == "ALERT"
