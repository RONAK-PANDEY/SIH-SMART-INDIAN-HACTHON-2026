"""
SmartCare Demo Data Seeder (SIH 2026)
Seeds:
 - 3 Regional Hospitals (AIIMS New Delhi, Safdarjung, Apollo)
 - 6 OPD Departments per hospital
 - 15 Doctors with active consultation assignments
 - 250+ Mock Patients & Live Priority Queue Tokens
"""
import random
from datetime import datetime, timedelta

def generate_seed_data():
    hospitals = [
        {"id": "hosp-001", "name": "AIIMS New Delhi", "city": "New Delhi", "state": "Delhi", "tier": "tertiary", "total_beds": 2478, "available_beds": 142, "current_load_pct": 88.0},
        {"id": "hosp-002", "name": "Safdarjung District Hospital", "city": "New Delhi", "state": "Delhi", "tier": "secondary", "total_beds": 1530, "available_beds": 410, "current_load_pct": 54.0},
        {"id": "hosp-003", "name": "Apollo Super Speciality Facility", "city": "New Delhi", "state": "Delhi", "tier": "tertiary", "total_beds": 850, "available_beds": 310, "current_load_pct": 35.0},
    ]

    departments = [
        "Cardiology", "General Medicine", "Pediatrics", "Orthopedics", "Neurology", "ENT"
    ]

    doctors = [
        {"id": "doc-01", "name": "Dr. A. K. Verma", "dept": "Cardiology", "room": "104", "hospital_id": "hosp-001"},
        {"id": "doc-02", "name": "Dr. Priya Sharma", "dept": "Cardiology", "room": "105", "hospital_id": "hosp-001"},
        {"id": "doc-03", "name": "Dr. S. K. Gupta", "dept": "General Medicine", "room": "101", "hospital_id": "hosp-001"},
        {"id": "doc-04", "name": "Dr. Neha Kapoor", "dept": "Pediatrics", "room": "108", "hospital_id": "hosp-001"},
        {"id": "doc-05", "name": "Dr. Rajesh Rao", "dept": "Orthopedics", "room": "202", "hospital_id": "hosp-001"},
        {"id": "doc-06", "name": "Dr. Meenakshi Sundaram", "dept": "Neurology", "room": "205", "hospital_id": "hosp-001"},
        {"id": "doc-07", "name": "Dr. Amit Roy", "dept": "ENT", "room": "210", "hospital_id": "hosp-001"},
        {"id": "doc-08", "name": "Dr. Vandana Sethi", "dept": "General Medicine", "room": "102", "hospital_id": "hosp-002"},
        {"id": "doc-09", "name": "Dr. Harsh Vardhan", "dept": "Cardiology", "room": "103", "hospital_id": "hosp-002"},
        {"id": "doc-10", "name": "Dr. Anita Desai", "dept": "Pediatrics", "room": "107", "hospital_id": "hosp-002"},
        {"id": "doc-11", "name": "Dr. Sanjay Bhatt", "dept": "Orthopedics", "room": "201", "hospital_id": "hosp-002"},
        {"id": "doc-12", "name": "Dr. Tarun Khanna", "dept": "General Medicine", "room": "101", "hospital_id": "hosp-003"},
        {"id": "doc-13", "name": "Dr. Sunita Sen", "dept": "Cardiology", "room": "104", "hospital_id": "hosp-003"},
        {"id": "doc-14", "name": "Dr. Deepak Nair", "dept": "Neurology", "room": "206", "hospital_id": "hosp-003"},
        {"id": "doc-15", "name": "Dr. Pooja Joshi", "dept": "Pediatrics", "room": "109", "hospital_id": "hosp-003"},
    ]

    patients = []
    tokens = []
    
    first_names = ["Rohan", "Ananya", "Vikram", "Sunita", "Mohit", "Pooja", "Rahul", "Deepak", "Sneha", "Karan"]
    last_names = ["Sharma", "Verma", "Malhotra", "Devi", "Kumar", "Singh", "Gupta", "Patel", "Reddy", "Joshi"]

    for i in range(1, 251):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        phone = f"+9198{random.randint(10000000, 99999999)}"
        abha = f"{random.randint(10,99)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}"
        age = random.randint(5, 82)
        gender = random.choice(["male", "female"])
        
        patient_id = f"usr_{i:04d}"
        patients.append({
            "id": patient_id,
            "full_name": f"{fn} {ln}",
            "phone": phone,
            "abha_id": abha,
            "age": age,
            "gender": gender
        })

        # Create active OPD token
        hosp = random.choice(hospitals)
        dept = random.choice(departments)
        esi = random.choices([1, 2, 3, 4, 5], weights=[0.02, 0.08, 0.25, 0.45, 0.20])[0]
        
        tokens.append({
            "id": f"tok_{i:04d}",
            "token_number": f"{dept[:4].upper()}-{i:03d}",
            "patient_id": patient_id,
            "hospital_id": hosp["id"],
            "department": dept,
            "triage_level": esi,
            "status": "WAITING" if i > 30 else "IN_CONSULTATION" if i > 15 else "COMPLETED"
        })

    print(f"✅ Generated Demo Data:")
    print(f" - Hospitals: {len(hospitals)}")
    print(f" - Departments: {len(departments)} per facility")
    print(f" - Doctors on Duty: {len(doctors)}")
    print(f" - Registered Patients: {len(patients)}")
    print(f" - Active OPD Queue Tokens: {len(tokens)}")

    return {
        "hospitals": hospitals,
        "doctors": doctors,
        "patients": patients,
        "tokens": tokens
    }

if __name__ == "__main__":
    generate_seed_data()
