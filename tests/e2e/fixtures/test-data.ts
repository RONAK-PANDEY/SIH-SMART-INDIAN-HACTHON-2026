/**
 * Synthetic Test Datasets & Fixtures for SmartCare E2E Testing
 * Target: Smart Indian Hackathon 2026 - SmartCare Queue & Triage System
 */

export interface PatientProfile {
  fullName: string;
  phone: string;
  abhaId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: string;
  pincode?: string;
}

export interface HospitalInfo {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  departments: Array<{
    id: string;
    name: string;
    code: string;
    floor: string;
    currentWaitMinutes: number;
    activeDoctors: number;
  }>;
}

export interface TriageScenario {
  id: string;
  title: string;
  symptoms: string[];
  duration: string;
  painScale: number; // 1 to 10
  feverLevel?: string;
  difficultyBreathing: boolean;
  chestPain: boolean;
  expectedAcuity: {
    level: 1 | 2 | 3 | 4; // 1: Emergency (Red), 2: Urgent (Orange), 3: Semi-Urgent (Yellow), 4: Routine (Green)
    label: string;
    color: string;
    maxWaitMinutes: number;
    recommendedDepartment: string;
  };
}

export interface BookingDetails {
  preferredDate: string;
  timeSlot: string;
  consultationType: 'NEW' | 'FOLLOW_UP' | 'EMERGENCY_WALKIN';
  reasonForVisit: string;
  isTeleconsultation?: boolean;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  opdShift: 'MORNING' | 'EVENING';
}

// ---------------------------------------------------------------------------
// TEST DATA EXPORTS
// ---------------------------------------------------------------------------

export const TEST_PATIENTS: Record<string, PatientProfile> = {
  primary: {
    fullName: 'Aarav Sharma',
    phone: '9876543210',
    abhaId: 'ABHA-9821-4432-1109',
    age: 34,
    gender: 'male',
    emergencyContact: {
      name: 'Sunita Sharma',
      relationship: 'Spouse',
      phone: '9876543211'
    },
    address: 'B-104, Green Park Extension',
    pincode: '110016'
  },
  emergencyPatient: {
    fullName: 'Rajesh Verma',
    phone: '9812345678',
    abhaId: 'ABHA-1122-3344-5566',
    age: 58,
    gender: 'male',
    emergencyContact: {
      name: 'Anjali Verma',
      relationship: 'Daughter',
      phone: '9812345679'
    },
    address: 'Plot 45, Sector 12, Dwarka',
    pincode: '110075'
  },
  pediatricPatient: {
    fullName: 'Ananya Iyer',
    phone: '9899887766',
    abhaId: 'ABHA-5544-3322-1100',
    age: 7,
    gender: 'female',
    emergencyContact: {
      name: 'Karthik Iyer',
      relationship: 'Father',
      phone: '9899887760'
    },
    address: 'Flat 302, Mayur Vihar Phase 1',
    pincode: '110091'
  }
};

export const TEST_HOSPITALS: HospitalInfo[] = [
  {
    id: 'hosp-001',
    name: 'AIIMS New Delhi - Apex Trauma & OPD Center',
    code: 'AIIMS-ND-01',
    city: 'New Delhi',
    state: 'Delhi',
    departments: [
      {
        id: 'dept-cardio',
        name: 'Cardiology & Cardiovascular Sciences',
        code: 'CARD-OPD',
        floor: '2nd Floor, Block B',
        currentWaitMinutes: 25,
        activeDoctors: 4
      },
      {
        id: 'dept-genmed',
        name: 'General Internal Medicine',
        code: 'GEN-OPD',
        floor: 'Ground Floor, Block A',
        currentWaitMinutes: 40,
        activeDoctors: 8
      },
      {
        id: 'dept-ortho',
        name: 'Orthopedics & Joint Replacement',
        code: 'ORTH-OPD',
        floor: '1st Floor, Block C',
        currentWaitMinutes: 30,
        activeDoctors: 3
      },
      {
        id: 'dept-peds',
        name: 'Pediatrics & Child Care',
        code: 'PEDS-OPD',
        floor: '3rd Floor, Block A',
        currentWaitMinutes: 15,
        activeDoctors: 5
      }
    ]
  },
  {
    id: 'hosp-002',
    name: 'Safdarjung Super Speciality Hospital',
    code: 'SJH-DEL-02',
    city: 'New Delhi',
    state: 'Delhi',
    departments: [
      {
        id: 'dept-genmed-sjh',
        name: 'General Internal Medicine',
        code: 'SJH-GEN',
        floor: 'Ground Floor',
        currentWaitMinutes: 35,
        activeDoctors: 6
      },
      {
        id: 'dept-neuro-sjh',
        name: 'Neurology & Neuro Surgery',
        code: 'SJH-NEURO',
        floor: '4th Floor, Super Speciality Wing',
        currentWaitMinutes: 50,
        activeDoctors: 2
      }
    ]
  }
];

export const TRIAGE_SCENARIOS: Record<string, TriageScenario> = {
  criticalChestPain: {
    id: 'triage-crit-01',
    title: 'Severe Acute Chest Pain & Radiating Discomfort',
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Profuse Sweating', 'Left Arm Radiating Pain'],
    duration: '< 1 hour',
    painScale: 9,
    difficultyBreathing: true,
    chestPain: true,
    expectedAcuity: {
      level: 1,
      label: 'Level 1 - Critical Emergency',
      color: '#EF4444',
      maxWaitMinutes: 0,
      recommendedDepartment: 'Cardiology & Cardiovascular Sciences'
    }
  },
  moderateFeverFlu: {
    id: 'triage-mod-02',
    title: 'High Grade Fever with Body Ache',
    symptoms: ['Fever (102 F)', 'Fatigue', 'Headache', 'Mild Throat Irritation'],
    duration: '3 days',
    painScale: 4,
    feverLevel: '102 F',
    difficultyBreathing: false,
    chestPain: false,
    expectedAcuity: {
      level: 3,
      label: 'Level 3 - Semi-Urgent OPD',
      color: '#EAB308',
      maxWaitMinutes: 45,
      recommendedDepartment: 'General Internal Medicine'
    }
  },
  routineJointPain: {
    id: 'triage-rout-03',
    title: 'Chronic Knee Stiffness on Walking',
    symptoms: ['Knee Stiffness', 'Joint Ache after Exercise', 'Mild Swelling'],
    duration: '> 2 weeks',
    painScale: 3,
    difficultyBreathing: false,
    chestPain: false,
    expectedAcuity: {
      level: 4,
      label: 'Level 4 - Routine OPD Consultation',
      color: '#22C55E',
      maxWaitMinutes: 90,
      recommendedDepartment: 'Orthopedics & Joint Replacement'
    }
  }
};

export const TEST_DOCTORS: Record<string, DoctorProfile> = {
  cardiologist: {
    id: 'doc-card-01',
    name: 'Dr. Priya Sharma, MD, DM (Cardiology)',
    specialization: 'Senior Consultant Cardiologist',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology & Cardiovascular Sciences',
    roomNumber: 'OPD Room 204',
    opdShift: 'MORNING'
  },
  generalPhysician: {
    id: 'doc-gen-02',
    name: 'Dr. Rajesh Khanna, MBBS, MD (Medicine)',
    specialization: 'Chief Medical Officer',
    departmentId: 'dept-genmed',
    departmentName: 'General Internal Medicine',
    roomNumber: 'OPD Room 102',
    opdShift: 'MORNING'
  }
};

export const TEST_BOOKING_DEFAULTS: BookingDetails = {
  preferredDate: new Date().toISOString().split('T')[0],
  timeSlot: '09:30 AM - 10:00 AM',
  consultationType: 'NEW',
  reasonForVisit: 'Routine health evaluation & symptom triage checkup'
};
