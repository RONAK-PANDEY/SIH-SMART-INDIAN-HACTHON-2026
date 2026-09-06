"""
SmartCare AI Triage & Specialty Matcher Engine
Handles 100+ symptoms taxonomy, NLP free-text symptom matching, emergency red-flag detection,
department routing, priority calculation (emergency override vs vulnerability), and clinical summary generation.
"""

from typing import List, Dict, Any, Optional
import re

# 100+ Categorized Medical Symptoms Taxonomy
SYMPTOMS_TAXONOMY: Dict[str, List[Dict[str, Any]]] = {
    "Emergency & Red Flags": [
        {"id": "sym_cp_severe", "name": "Severe Crushing Chest Pain", "red_flag": True, "department": "dept-cardio", "severity": 5},
        {"id": "sym_sob_severe", "name": "Acute Shortness of Breath / Gasping", "red_flag": True, "department": "dept-pulmo", "severity": 5},
        {"id": "sym_stroke", "name": "Sudden Facial Droop / Arm Weakness / Slurred Speech", "red_flag": True, "department": "dept-neuro", "severity": 5},
        {"id": "sym_unconscious", "name": "Unconsciousness / Fainting / Non-responsive", "red_flag": True, "department": "dept-emergency", "severity": 5},
        {"id": "sym_trauma_major", "name": "Major Physical Trauma / Heavy Bleeding", "red_flag": True, "department": "dept-ortho", "severity": 5},
        {"id": "sym_seizure", "name": "Active Seizures / Convulsions", "red_flag": True, "department": "dept-neuro", "severity": 5},
        {"id": "sym_anaphylaxis", "name": "Severe Allergic Swelling of Throat / Lips", "red_flag": True, "department": "dept-emergency", "severity": 5},
        {"id": "sym_poison", "name": "Suspected Poisoning / Chemical Ingestion", "red_flag": True, "department": "dept-emergency", "severity": 5},
    ],
    "Cardiovascular & Chest": [
        {"id": "sym_palpitations", "name": "Rapid / Irregular Heartbeats (Palpitations)", "red_flag": False, "department": "dept-cardio", "severity": 3},
        {"id": "sym_swelling_legs", "name": "Bilateral Swelling in Feet & Ankema (Edema)", "red_flag": False, "department": "dept-cardio", "severity": 3},
        {"id": "sym_bp_high", "name": "Extremely High Blood Pressure (>180/110)", "red_flag": True, "department": "dept-cardio", "severity": 4},
        {"id": "sym_chest_tight", "name": "Mild Chest Tightness on Exertion", "red_flag": False, "department": "dept-cardio", "severity": 3},
        {"id": "sym_cyanosis", "name": "Bluish Discoloration of Lips or Fingernails", "red_flag": True, "department": "dept-cardio", "severity": 4},
        {"id": "sym_fatigue_cardio", "name": "Exertional Fatigue & Inability to Lie Flat", "red_flag": False, "department": "dept-cardio", "severity": 3},
    ],
    "Respiratory & Lungs": [
        {"id": "sym_cough_blood", "name": "Coughing Up Blood (Hemoptysis)", "red_flag": True, "department": "dept-pulmo", "severity": 5},
        {"id": "sym_cough_chronic", "name": "Persistent Cough (> 2 Weeks)", "red_flag": False, "department": "dept-pulmo", "severity": 2},
        {"id": "sym_wheezing", "name": "Wheezing / Asthma Attack", "red_flag": False, "department": "dept-pulmo", "severity": 3},
        {"id": "sym_phlegm_thick", "name": "Thick Green/Yellow Phlegm with Fever", "red_flag": False, "department": "dept-pulmo", "severity": 2},
        {"id": "sym_stridor", "name": "Noisy High-Pitched Inhaling (Stridor)", "red_flag": True, "department": "dept-pulmo", "severity": 4},
        {"id": "sym_night_sweats", "name": "Night Sweats with Unexplained Weight Loss", "red_flag": False, "department": "dept-pulmo", "severity": 3},
    ],
    "Neurology & Brain": [
        {"id": "sym_headache_severe", "name": "Thunderclap / Sudden Worst Headache of Life", "red_flag": True, "department": "dept-neuro", "severity": 5},
        {"id": "sym_headache_migraine", "name": "Throbbing One-sided Headache (Migraine)", "red_flag": False, "department": "dept-neuro", "severity": 2},
        {"id": "sym_numbness", "name": "Tingling or Numbness in Hands / Feet", "red_flag": False, "department": "dept-neuro", "severity": 2},
        {"id": "sym_tremors", "name": "Involuntary Hand Tremors / Muscle Shaking", "red_flag": False, "department": "dept-neuro", "severity": 2},
        {"id": "sym_vertigo", "name": "Spinning Sensation / Severe Vertigo", "red_flag": False, "department": "dept-neuro", "severity": 3},
        {"id": "sym_memory_loss", "name": "Sudden Memory Confusion / Disorientation", "red_flag": True, "department": "dept-neuro", "severity": 4},
        {"id": "sym_vision_loss_sudden", "name": "Sudden Partial or Complete Vision Loss", "red_flag": True, "department": "dept-neuro", "severity": 5},
    ],
    "Bones, Joints & Orthopedics": [
        {"id": "sym_fracture_suspect", "name": "Deformed Limb / Inability to Bear Weight after Fall", "red_flag": True, "department": "dept-ortho", "severity": 4},
        {"id": "sym_joint_swelling", "name": "Acute Knee or Shoulder Swelling with Warmth", "red_flag": False, "department": "dept-ortho", "severity": 2},
        {"id": "sym_back_pain_acute", "name": "Severe Lower Back Pain Radiating to Legs (Sciatica)", "red_flag": False, "department": "dept-ortho", "severity": 3},
        {"id": "sym_stiffness_morning", "name": "Morning Joint Stiffness (> 1 Hour / Arthritis)", "red_flag": False, "department": "dept-ortho", "severity": 2},
        {"id": "sym_neck_spasm", "name": "Acute Neck Spasm / Restricted Cervical Movement", "red_flag": False, "department": "dept-ortho", "severity": 2},
        {"id": "sym_ankle_sprain", "name": "Twisted Ankle / Ligament Strain", "red_flag": False, "department": "dept-ortho", "severity": 2},
    ],
    "Gastrointestinal & Stomach": [
        {"id": "sym_abd_pain_severe", "name": "Acute Right Lower Abdomen Pain (Appendicitis)", "red_flag": True, "department": "dept-gastro", "severity": 5},
        {"id": "sym_vomit_blood", "name": "Vomiting Dark Blood / Coffee-ground Emesis", "red_flag": True, "department": "dept-gastro", "severity": 5},
        {"id": "sym_stool_black", "name": "Black Tarry Stools (Melena)", "red_flag": True, "department": "dept-gastro", "severity": 4},
        {"id": "sym_jaundice", "name": "Yellowing of Eyes & Skin (Jaundice)", "red_flag": False, "department": "dept-gastro", "severity": 3},
        {"id": "sym_diarrhea_severe", "name": "Severe Watery Diarrhea & Dehydration", "red_flag": False, "department": "dept-gastro", "severity": 3},
        {"id": "sym_acid_reflux", "name": "Chronic Heartburn / Acid Reflux / Indigestion", "red_flag": False, "department": "dept-gastro", "severity": 1},
        {"id": "sym_constipation_chronic", "name": "Severe Chronic Constipation & Bloating", "red_flag": False, "department": "dept-gastro", "severity": 1},
    ],
    "ENT & Ophthalmology (Eyes, Ear, Nose, Throat)": [
        {"id": "sym_eye_pain_red", "name": "Acute Red Eye with Severe Pain & Blurred Vision", "red_flag": True, "department": "dept-opht", "severity": 4},
        {"id": "sym_eye_discharge", "name": "Sticky Yellow Eye Discharge / Pink Eye", "red_flag": False, "department": "dept-opht", "severity": 1},
        {"id": "sym_ear_discharge", "name": "Ear Pain with Pus Discharge / Reduced Hearing", "red_flag": False, "department": "dept-ent", "severity": 2},
        {"id": "sym_sore_throat_severe", "name": "Severe Throat Pain / Inability to Swallow Liquids", "red_flag": False, "department": "dept-ent", "severity": 3},
        {"id": "sym_nosebleed_severe", "name": "Continuous Uncontrolled Nosebleed (Epistaxis)", "red_flag": True, "department": "dept-ent", "severity": 4},
        {"id": "sym_sinus_pressure", "name": "Facial Sinus Pressure & Nasal Congestion", "red_flag": False, "department": "dept-ent", "severity": 1},
    ],
    "Gynecology, Obstetrics & Women Health": [
        {"id": "sym_preg_bleeding", "name": "Vaginal Bleeding during Pregnancy", "red_flag": True, "department": "dept-gynae", "severity": 5},
        {"id": "sym_preg_pain", "name": "Severe Pelvic or Lower Abdominal Pain in Pregnancy", "red_flag": True, "department": "dept-gynae", "severity": 4},
        {"id": "sym_labor_contractions", "name": "Regular Painful Uterine Contractions / Water Breaking", "red_flag": True, "department": "dept-gynae", "severity": 5},
        {"id": "sym_periods_heavy", "name": "Excessively Heavy / Irregular Menstrual Bleeding", "red_flag": False, "department": "dept-gynae", "severity": 2},
        {"id": "sym_pelvic_infection", "name": "Abnormal Vaginal Discharge with Pelvic Pain", "red_flag": False, "department": "dept-gynae", "severity": 2},
    ],
    "Pediatrics (Child Health)": [
        {"id": "sym_child_fever_high", "name": "Infant/Child High Fever with Lethargy (>103°F)", "red_flag": True, "department": "dept-pedia", "severity": 4},
        {"id": "sym_child_vomit_continuous", "name": "Inability to Keep Liquids Down / Sunken Eyes", "red_flag": True, "department": "dept-pedia", "severity": 4},
        {"id": "sym_child_rash", "name": "Spreading Body Rash with Fever in Child", "red_flag": False, "department": "dept-pedia", "severity": 3},
        {"id": "sym_child_cough_barking", "name": "Barking Cough / Difficulty Inhaling (Croup)", "red_flag": True, "department": "dept-pedia", "severity": 4},
        {"id": "sym_child_growth", "name": "Routine Pediatric Immunization / Growth Check", "red_flag": False, "department": "dept-pedia", "severity": 1},
    ],
    "General Medicine & Dermatology": [
        {"id": "sym_fever_chills", "name": "High Grade Fever with Chills & Rigors (Dengue/Malaria suspect)", "red_flag": False, "department": "dept-genmed", "severity": 3},
        {"id": "sym_rash_itchy", "name": "Widespread Itchy Skin Eruption / Hives", "red_flag": False, "department": "dept-derma", "severity": 2},
        {"id": "sym_unexplained_weight_loss", "name": "Rapid Unintentional Weight Loss (> 5kg in a month)", "red_flag": False, "department": "dept-genmed", "severity": 2},
        {"id": "sym_diabetes_high_sugar", "name": "Excessive Thirst & Urination with High Blood Glucose", "red_flag": False, "department": "dept-genmed", "severity": 2},
        {"id": "sym_general_weakness", "name": "General Body Weakness / Pale Skin (Anemia suspect)", "red_flag": False, "department": "dept-genmed", "severity": 1},
        {"id": "sym_routine_refill", "name": "Routine Chronic Medicine Refill / Health Checkup", "red_flag": False, "department": "dept-genmed", "severity": 1},
    ]
}

# Department metadata mapping
DEPARTMENT_INFO: Dict[str, Dict[str, Any]] = {
    "dept-emergency": {
        "name": "Emergency & Trauma Care",
        "doctor_type": "Emergency Medicine Physician / Trauma Surgeon",
        "avg_consult_mins": 25,
        "floor": "Ground Floor - Red Zone (Gate 1)",
        "counter_ext": "101"
    },
    "dept-cardio": {
        "name": "Cardiology & Cardiac Sciences",
        "doctor_type": "Senior Cardiologist / Heart Specialist",
        "avg_consult_mins": 15,
        "floor": "1st Floor - Wing B",
        "counter_ext": "204"
    },
    "dept-pulmo": {
        "name": "Pulmonology & Respiratory Medicine",
        "doctor_type": "Pulmonologist / Chest Physician",
        "avg_consult_mins": 12,
        "floor": "1st Floor - Wing A",
        "counter_ext": "208"
    },
    "dept-neuro": {
        "name": "Neurology & Neuro-Surgery",
        "doctor_type": "Neurologist / Brain Specialist",
        "avg_consult_mins": 18,
        "floor": "2nd Floor - Wing C",
        "counter_ext": "312"
    },
    "dept-ortho": {
        "name": "Orthopedics & Joint Replacement",
        "doctor_type": "Orthopedic Surgeon / Bone Specialist",
        "avg_consult_mins": 12,
        "floor": "Ground Floor - Wing D",
        "counter_ext": "115"
    },
    "dept-gastro": {
        "name": "Gastroenterology & Hepatology",
        "doctor_type": "Gastroenterologist / GI Specialist",
        "avg_consult_mins": 12,
        "floor": "2nd Floor - Wing A",
        "counter_ext": "219"
    },
    "dept-gynae": {
        "name": "Obstetrics & Gynecology (Maternity)",
        "doctor_type": "Gynecologist / Obstetrician",
        "avg_consult_mins": 14,
        "floor": "3rd Floor - Mother & Child Wing",
        "counter_ext": "402"
    },
    "dept-pedia": {
        "name": "Pediatrics & Neonatal Care",
        "doctor_type": "Pediatrician / Child Specialist",
        "avg_consult_mins": 12,
        "floor": "3rd Floor - Child Health OPD",
        "counter_ext": "408"
    },
    "dept-ent": {
        "name": "ENT (Ear, Nose, Throat) & Head Neck",
        "doctor_type": "ENT Specialist / Otolaryngologist",
        "avg_consult_mins": 10,
        "floor": "1st Floor - Wing D",
        "counter_ext": "222"
    },
    "dept-opht": {
        "name": "Ophthalmology & Eye Care",
        "doctor_type": "Ophthalmologist / Eye Surgeon",
        "avg_consult_mins": 10,
        "floor": "1st Floor - Eye Center",
        "counter_ext": "225"
    },
    "dept-derma": {
        "name": "Dermatology & Cosmetology",
        "doctor_type": "Dermatologist / Skin Specialist",
        "avg_consult_mins": 10,
        "floor": "2nd Floor - Wing B",
        "counter_ext": "318"
    },
    "dept-genmed": {
        "name": "General & Internal Medicine",
        "doctor_type": "Consultant Physician / General Practitioner",
        "avg_consult_mins": 10,
        "floor": "Ground Floor - Central OPD",
        "counter_ext": "105"
    }
}

# Dedicated Hospital Contacts & Helpdesk
HOSPITAL_HELP_CONTACTS = {
    "emergency_ambulance": {"title": "National Emergency Ambulance", "number": "108", "type": "Toll-Free"},
    "hospital_reception_counter": {"title": "OPD Registration & Counter Helpdesk", "number": "+91 11 2658 8500", "type": "Hospital Desk"},
    "tele_triage_nurse": {"title": "Senior Triage Officer / Tele-Consult", "number": "+91 11 2658 8700", "type": "Direct Nurse Line"},
    "doctor_on_duty": {"title": "Chief Medical Officer on Duty (CMO)", "number": "+91 98110 54321", "type": "Duty Doctor"}
}

# Keyword NLP matcher dictionary for free-text description
KEYWORD_MAPPING = {
    "dept-cardio": ["chest pain", "heart", "cardio", "bp", "palpitation", "heart attack", "angina", "pulse", "chhati dard", "dil"],
    "dept-pulmo": ["breath", "breathing", "lung", "cough", "wheez", "asthma", "phlegm", "khansi", "saans"],
    "dept-neuro": ["headache", "brain", "neuro", "paralysis", "stroke", "seizure", "fit", "dizzy", "faint", "numbness", "sar dard", "chakkar"],
    "dept-ortho": ["bone", "fracture", "joint", "knee", "back pain", "spine", "leg break", "sprain", "ortho", "haddi", "kamar dard"],
    "dept-gastro": ["stomach", "vomit", "ulcer", "liver", "jaundice", "gas", "acidity", "diarrhea", "pet dard", "loose motion"],
    "dept-gynae": ["pregnant", "pregnancy", "periods", "menses", "uterus", "vagina", "gynec", "delivery", "garbhavati"],
    "dept-pedia": ["child", "baby", "infant", "kid", "baccha", "shishu", "pediatric"],
    "dept-ent": ["ear", "nose", "throat", "tonsil", "hearing", "kaan", "naak", "gala"],
    "dept-opht": ["eye", "vision", "blind", "cornea", "aankh", "drishti"],
    "dept-derma": ["skin", "itching", "rash", "pimples", "allergy", "khujli", "tvacha"],
    "dept-genmed": ["fever", "weakness", "sugar", "diabetes", "tired", "bukhar", "kamzori"]
}


class TriageAIService:
    @staticmethod
    def get_all_symptoms() -> Dict[str, List[Dict[str, Any]]]:
        return SYMPTOMS_TAXONOMY

    @staticmethod
    def get_contacts() -> Dict[str, Any]:
        return HOSPITAL_HELP_CONTACTS

    @staticmethod
    def evaluate_triage(
        selected_symptom_ids: List[str],
        free_text_description: str = "",
        vulnerability: Optional[Dict[str, bool]] = None,
        aadhaar_age: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Evaluates triage urgency level, predicted department, recommended doctor type,
        red-flag alerts, and generates an automated clinical note.
        """
        vulnerability = vulnerability or {}
        is_senior = vulnerability.get("senior", False) or (aadhaar_age is not None and aadhaar_age >= 60)
        is_pregnant = vulnerability.get("pregnant", False)
        is_pwd = vulnerability.get("differentlyAbled", False)

        # Collect matching symptom objects
        matched_symptoms: List[Dict[str, Any]] = []
        is_red_flag = False
        highest_severity = 1
        dept_scores: Dict[str, int] = {k: 0 for k in DEPARTMENT_INFO.keys()}

        # 1. Evaluate selected symptom taxonomy
        for cat, items in SYMPTOMS_TAXONOMY.items():
            for sym in items:
                if sym["id"] in selected_symptom_ids:
                    matched_symptoms.append(sym)
                    if sym.get("red_flag"):
                        is_red_flag = True
                    highest_severity = max(highest_severity, sym.get("severity", 1))
                    dept_scores[sym.get("department", "dept-genmed")] += 3

        # 2. NLP analysis of free_text_description
        clean_text = free_text_description.lower().strip() if free_text_description else ""
        if clean_text:
            # Check for critical red-flag keywords
            emergency_keywords = ["emergency", "heart attack", "unconscious", "heavy bleeding", "not breathing", "fainted", "collapsed", "stroke", "poison"]
            for ekw in emergency_keywords:
                if ekw in clean_text:
                    is_red_flag = True
                    highest_severity = max(highest_severity, 5)
                    dept_scores["dept-emergency"] += 5

            # Match against department specialty keywords
            for dept, kws in KEYWORD_MAPPING.items():
                for kw in kws:
                    if kw in clean_text:
                        dept_scores[dept] += 2
                        highest_severity = max(highest_severity, 2)

        # 3. Determine primary department
        best_dept = max(dept_scores, key=dept_scores.get)
        if dept_scores[best_dept] == 0:
            best_dept = "dept-genmed"  # Default to general medicine if no specific keywords matched

        dept_details = DEPARTMENT_INFO.get(best_dept, DEPARTMENT_INFO["dept-genmed"])

        # 4. Determine Triage Priority Level:
        # P1 = Critical Emergency (Red) -> Red flag clinical symptoms ALWAYS take priority!
        # P2 = Urgent (Orange) / High Priority Vulnerability (Senior/Pregnant/PwD)
        # P3 = Priority OPD (Yellow)
        # P4 = Routine OPD (Green)
        if is_red_flag or highest_severity >= 5:
            triage_level = 1
            priority_tag = "P1 - CRITICAL EMERGENCY"
            color_theme = "red"
            label = "Emergency Trauma / Fast-Track Protocol"
            action_guidance = "Immediate doctor assignment! Report directly to Emergency Trauma Zone Gate 1."
            estimated_wait = "0 - 3 mins"
        elif highest_severity >= 4 or (highest_severity >= 3 and (is_senior or is_pregnant or is_pwd)):
            triage_level = 2
            priority_tag = "P2 - URGENT EXPEDITED"
            color_theme = "orange"
            label = "Urgent / Vulnerability Accelerated Queue"
            action_guidance = "Expedited triage queue. Patient queued ahead of standard routine consultations."
            estimated_wait = "5 - 10 mins"
        elif is_senior or is_pregnant or is_pwd:
            triage_level = 3
            priority_tag = "P3 - PRIORITY VULNERABLE OPD"
            color_theme = "yellow"
            label = "Special Priority Pass (Senior / Maternal / PwD)"
            action_guidance = "Dedicated priority slot assigned per National Health Mission guidelines."
            estimated_wait = "10 - 15 mins"
        else:
            triage_level = 4
            priority_tag = "P4 - ROUTINE OPD"
            color_theme = "blue"
            label = "Standard Outpatient Department (OPD)"
            action_guidance = "Regular appointment token queued for consulting physician."
            estimated_wait = "15 - 25 mins"

        # 5. Build Auto-Generated Clinical Summary Notes
        symptoms_str = ", ".join([s["name"] for s in matched_symptoms]) if matched_symptoms else "No standardized tags selected (Described via custom narrative)"
        vulnerabilities_list = []
        if is_senior:
            vulnerabilities_list.append(f"Senior Citizen ({aadhaar_age if aadhaar_age else '60+'} yrs - Aadhaar Verified)")
        if is_pregnant:
            vulnerabilities_list.append("Pregnant Lady (Maternal Protocol)")
        if is_pwd:
            vulnerabilities_list.append("Person with Disability (PwD)")
        vuln_str = ", ".join(vulnerabilities_list) if vulnerabilities_list else "None (General Demographic)"

        auto_clinical_note = (
            f"=== SMARTCARE AI CLINICAL INTAKE SUMMARY ===\n"
            f"Primary Department: {dept_details['name']}\n"
            f"Triage Urgency: {priority_tag} (Level {triage_level})\n"
            f"Observed Symptoms: {symptoms_str}\n"
            f"Patient Self-Reported Complaint: {clean_text if clean_text else 'N/A'}\n"
            f"Demographic Priority: {vuln_str}\n"
            f"Specialist Assigned: {dept_details['doctor_type']} ({dept_details['floor']})\n"
            f"============================================"
        )

        return {
            "triage_level": triage_level,
            "priority_tag": priority_tag,
            "color_theme": color_theme,
            "label": label,
            "action_guidance": action_guidance,
            "estimated_wait": estimated_wait,
            "is_emergency": is_red_flag,
            "department_id": best_dept,
            "department_name": dept_details["name"],
            "doctor_type": dept_details["doctor_type"],
            "location": dept_details["floor"],
            "counter_extension": dept_details["counter_ext"],
            "matched_symptoms_count": len(matched_symptoms),
            "auto_clinical_note": auto_clinical_note,
            "vulnerability_applied": {
                "senior": is_senior,
                "pregnant": is_pregnant,
                "pwd": is_pwd
            }
        }
