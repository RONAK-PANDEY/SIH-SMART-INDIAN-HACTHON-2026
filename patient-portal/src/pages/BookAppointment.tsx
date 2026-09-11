import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown, 
  Building2, 
  Stethoscope, 
  User, 
  Calendar, 
  Clock,
  MapPin,
  Navigation,
  Globe,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  Activity,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HospitalOption {
  id: string;
  name: string;
  distance: string;
  address: string;
}

export interface DoctorDetail {
  name: string;
  title: string;
  experienceYears: number;
  specialty: string;
  rating: number;
  patientsTreated: string;
  matchReason: string;
}

export interface InjuryPreset {
  id: string;
  name: string;
  icon: string;
  dept: string;
  suggestedInjury: string;
  recommendedDocName: string;
}

const LOCATION_HOSPITALS_MAP: Record<string, HospitalOption[]> = {
  'Ansari Nagar, New Delhi': [
    { id: 'AIIMS Delhi', name: 'AIIMS Delhi (Apex Center)', distance: '0.8 km away', address: 'Ansari Nagar, New Delhi' },
    { id: 'Safdarjung', name: 'Safdarjung Hospital', distance: '1.4 km away', address: 'Ring Road, New Delhi' },
    { id: 'RML', name: 'Dr. RML Hospital', distance: '4.5 km away', address: 'Baba Kharak Singh Marg' },
  ],
  'Safdarjung Enclave, New Delhi': [
    { id: 'Safdarjung', name: 'Safdarjung Hospital', distance: '0.4 km away', address: 'Ring Road, New Delhi' },
    { id: 'AIIMS Delhi', name: 'AIIMS Delhi (Apex Center)', distance: '1.2 km away', address: 'Ansari Nagar, New Delhi' },
    { id: 'RML', name: 'Dr. RML Hospital', distance: '5.1 km away', address: 'Baba Kharak Singh Marg' },
  ],
  'Connaught Place, Central Delhi': [
    { id: 'RML', name: 'Dr. RML Hospital', distance: '1.1 km away', address: 'Baba Kharak Singh Marg' },
    { id: 'AIIMS Delhi', name: 'AIIMS Delhi (Apex Center)', distance: '4.2 km away', address: 'Ansari Nagar, New Delhi' },
    { id: 'Safdarjung', name: 'Safdarjung Hospital', distance: '5.8 km away', address: 'Ring Road, New Delhi' },
  ],
  'Sector 44, Gurugram': [
    { id: 'Fortis Gurugram', name: 'Fortis Memorial Research Institute', distance: '1.5 km away', address: 'Sector 44, Gurugram' },
    { id: 'AIIMS Delhi', name: 'AIIMS Delhi (Apex Referral)', distance: '18.5 km away', address: 'Ansari Nagar, New Delhi' },
    { id: 'Safdarjung', name: 'Safdarjung Hospital', distance: '19.2 km away', address: 'Ring Road, New Delhi' },
  ]
};

export const INJURY_PRESETS: InjuryPreset[] = [
  {
    id: 'fracture',
    name: 'Bone Fracture / Joint Trauma / Accident',
    icon: '🦴',
    dept: 'Orthopedics',
    suggestedInjury: 'Bone dislocation, ligament tear or trauma accident',
    recommendedDocName: 'Dr. Harpreet Singh'
  },
  {
    id: 'chest_pain',
    name: 'Chest Discomfort / Heart Urgency',
    icon: '🫀',
    dept: 'Cardiology',
    suggestedInjury: 'Sharp chest tightness, shortness of breath or arrhythmia',
    recommendedDocName: 'Dr. Rajesh Sharma'
  },
  {
    id: 'child_illness',
    name: 'Child Fever / Pediatric Concern',
    icon: '👶',
    dept: 'Pediatrics',
    suggestedInjury: 'High temperature, pediatric cough or infection',
    recommendedDocName: 'Dr. Priya Patel'
  },
  {
    id: 'fever_infection',
    name: 'High Fever / Flu / Viral Infection',
    icon: '🤒',
    dept: 'General Medicine',
    suggestedInjury: 'Persistent fever, viral symptoms or body ache',
    recommendedDocName: 'Dr. Vikas Gupta'
  },
  {
    id: 'headache_neuro',
    name: 'Severe Headache / Dizziness',
    icon: '🧠',
    dept: 'General Medicine',
    suggestedInjury: 'Acute migraine, dizziness or neurological discomfort',
    recommendedDocName: 'Dr. Sunita Rao'
  }
];

export const DETAILED_DOCTORS_BY_DEPT: Record<string, DoctorDetail[]> = {
  'Orthopedics': [
    {
      name: 'Dr. Harpreet Singh',
      title: 'Senior Trauma & Joint Surgeon',
      experienceYears: 22,
      specialty: 'Accidental Injury, Bone Fractures & Joint Surgery',
      rating: 4.9,
      patientsTreated: '12,500+',
      matchReason: 'Highest experienced trauma surgeon (22 yrs exp, 1,400+ trauma surgeries)'
    },
    {
      name: 'Dr. Sneha Roy',
      title: 'Orthopedic Surgeon & Arthroscopy Specialist',
      experienceYears: 16,
      specialty: 'Ligament Tear, Sports Injury & Joint Scope',
      rating: 4.8,
      patientsTreated: '8,200+',
      matchReason: 'Specialist in sports trauma & ligament repairs (16 yrs exp)'
    },
    {
      name: 'Dr. Amit Verma',
      title: 'Spine & Joint Specialist',
      experienceYears: 14,
      specialty: 'Spinal Alignment & Chronic Joint Care',
      rating: 4.7,
      patientsTreated: '6,400+',
      matchReason: 'Spine and chronic joint Specialist (14 yrs exp)'
    }
  ],
  'Cardiology': [
    {
      name: 'Dr. Rajesh Sharma',
      title: 'Senior Interventional Cardiologist',
      experienceYears: 24,
      specialty: 'Chest Discomfort, Coronary Angioplasty & Heart Failure',
      rating: 4.95,
      patientsTreated: '18,000+',
      matchReason: 'Apex Interventional Cardiologist (24 yrs exp, lead heart specialist)'
    },
    {
      name: 'Dr. Ananya Iyer',
      title: 'ECG & Cardiac Electrophysiologist',
      experienceYears: 18,
      specialty: 'Arrhythmia, ECG Diagnostics & Pacemaker',
      rating: 4.85,
      patientsTreated: '10,500+',
      matchReason: 'Lead specialist for cardiac rhythm & ECG diagnostics (18 yrs exp)'
    },
    {
      name: 'Dr. K. S. Reddy',
      title: 'Heart & Vascular Specialist',
      experienceYears: 15,
      specialty: 'Hypertension & Preventive Cardiology',
      rating: 4.75,
      patientsTreated: '7,800+',
      matchReason: 'Preventive cardiology & vascular health (15 yrs exp)'
    }
  ],
  'General Medicine': [
    {
      name: 'Dr. Vikas Gupta',
      title: 'Senior Internal Medicine Specialist',
      experienceYears: 18,
      specialty: 'High Fever, Viral Infections, Diabetes & Acute Care',
      rating: 4.88,
      patientsTreated: '15,000+',
      matchReason: 'Lead Physician for acute viral infections & fever (18 yrs exp)'
    },
    {
      name: 'Dr. Sunita Rao',
      title: 'Primary Physician & Neuro Triage Specialist',
      experienceYears: 16,
      specialty: 'Severe Headache, Dizziness & Metabolic Care',
      rating: 4.8,
      patientsTreated: '11,200+',
      matchReason: 'Senior specialist in neuro-triage & acute headache care (16 yrs exp)'
    },
    {
      name: 'Dr. Rajesh Sharma',
      title: 'Senior General Consultant',
      experienceYears: 22,
      specialty: 'Complex Multi-system Diagnosis',
      rating: 4.9,
      patientsTreated: '16,000+',
      matchReason: 'Senior diagnosis consultant (22 yrs exp)'
    }
  ],
  'Pediatrics': [
    {
      name: 'Dr. Priya Patel',
      title: 'Chief Senior Pediatrician',
      experienceYears: 19,
      specialty: 'Child Fever, Respiratory Infections & Neonatology',
      rating: 4.92,
      patientsTreated: '14,000+',
      matchReason: 'Chief Pediatrician (19 yrs exp, Gold Medalist in Child Care)'
    },
    {
      name: 'Dr. Rohan Mehta',
      title: 'Child Specialist & Growth Care',
      experienceYears: 14,
      specialty: 'Pediatric Asthma & Gastrointestinal Care',
      rating: 4.78,
      patientsTreated: '7,500+',
      matchReason: 'Pediatric asthma & child growth specialist (14 yrs exp)'
    },
    {
      name: 'Dr. Kavita Singh',
      title: 'Neonatology & Child Emergency Specialist',
      experienceYears: 12,
      specialty: 'Infant Emergency & Neonatal Care',
      rating: 4.75,
      patientsTreated: '5,900+',
      matchReason: 'Infant emergency specialist (12 yrs exp)'
    }
  ]
};

const DOCTORS_BY_DEPT: Record<string, string[]> = {
  'General Medicine': [
    'Dr. Vikas Gupta (18 Yrs Exp - Internal Medicine)',
    'Dr. Sunita Rao (16 Yrs Exp - Neuro Triage)',
    'Dr. Rajesh Sharma (22 Yrs Exp - Senior Consultant)'
  ],
  'Cardiology': [
    'Dr. Rajesh Sharma (24 Yrs Exp - Senior Cardiologist)',
    'Dr. Ananya Iyer (18 Yrs Exp - ECG & Interventional)',
    'Dr. K. S. Reddy (15 Yrs Exp - Heart Specialist)'
  ],
  'Orthopedics': [
    'Dr. Harpreet Singh (22 Yrs Exp - Trauma & Joints)',
    'Dr. Sneha Roy (16 Yrs Exp - Orthopedic Surgeon)',
    'Dr. Amit Verma (14 Yrs Exp - Spine Specialist)'
  ],
  'Pediatrics': [
    'Dr. Priya Patel (19 Yrs Exp - Senior Pediatrician)',
    'Dr. Rohan Mehta (14 Yrs Exp - Child Specialist)',
    'Dr. Kavita Singh (12 Yrs Exp - Neonatology)'
  ]
};

export const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('Aarav Sharma');
  
  // Location & GPS States
  const [selectedLocation, setSelectedLocation] = useState('Ansari Nagar, New Delhi');
  const [locationInput, setLocationInput] = useState('Ansari Nagar, New Delhi');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Injury Auto-Match State
  const [selectedInjuryPreset, setSelectedInjuryPreset] = useState<string>('fracture');

  // Dynamic Hospital & Dept States
  const nearbyHospitals = LOCATION_HOSPITALS_MAP[selectedLocation] || LOCATION_HOSPITALS_MAP['Ansari Nagar, New Delhi'];
  const [hospital, setHospital] = useState(nearbyHospitals[0].name);
  const [showHospitalPicker, setShowHospitalPicker] = useState(false);
  const [department, setDepartment] = useState('Orthopedics');
  
  // Dynamic Doctors according to selected Department
  const availableDoctors = DOCTORS_BY_DEPT[department] || DOCTORS_BY_DEPT['Orthopedics'];
  const [doctor, setDoctor] = useState(availableDoctors[0]);
  
  const [date, setDate] = useState('2026-09-12');
  const [slot, setSlot] = useState('10:30 AM');
  const [showScheduleModal, setShowScheduleModal] = useState(false);



  // Helper to find detailed doctor profile based on current selection
  const currentDocList = DETAILED_DOCTORS_BY_DEPT[department] || DETAILED_DOCTORS_BY_DEPT['Orthopedics'];
  const activeDoctorDetail = currentDocList.find(d => doctor.includes(d.name)) || currentDocList[0];

  const doctorScheduleSlots = [
    { time: '09:00 AM', status: 'Available', shift: 'Morning OPD', slotsLeft: 8 },
    { time: '10:30 AM', status: 'Available', shift: 'Morning OPD (Recommended)', slotsLeft: 4 },
    { time: '02:00 PM', status: 'Available', shift: 'Afternoon OPD', slotsLeft: 12 },
    { time: '04:30 PM', status: 'Available', shift: 'Evening OPD', slotsLeft: 6 },
  ];

  const handleSelectInjuryPreset = (preset: InjuryPreset) => {
    setSelectedInjuryPreset(preset.id);
    setDepartment(preset.dept);
    
    // Auto-select doctor with highest relevant experience for this injury
    const deptDocList = DETAILED_DOCTORS_BY_DEPT[preset.dept] || [];
    const targetDoc = deptDocList.find(d => d.name === preset.recommendedDocName) || deptDocList[0];
    
    const formattedDocs = DOCTORS_BY_DEPT[preset.dept] || [];
    const matchedFormatted = formattedDocs.find(d => d.includes(targetDoc.name)) || formattedDocs[0];
    
    setDoctor(matchedFormatted);
  };

  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    setGpsNotice(null);
    setTimeout(() => {
      setIsDetectingGps(false);
      setLocationInput('Ansari Nagar, New Delhi (Live GPS)');
      setSelectedLocation('Ansari Nagar, New Delhi');
      const updatedHospitals = LOCATION_HOSPITALS_MAP['Ansari Nagar, New Delhi'];
      setHospital(updatedHospitals[0].name);
      setGpsNotice('✓ Live GPS Active: Ansari Nagar, New Delhi (Accuracy 5m)');
      setTimeout(() => setGpsNotice(null), 4000);
    }, 900);
  };

  const handleLocationTextChange = (text: string) => {
    setLocationInput(text);
    const lower = text.toLowerCase();
    let targetKey = 'Ansari Nagar, New Delhi';
    if (lower.includes('safdarjung')) {
      targetKey = 'Safdarjung Enclave, New Delhi';
    } else if (lower.includes('connaught') || lower.includes('cp') || lower.includes('central')) {
      targetKey = 'Connaught Place, Central Delhi';
    } else if (lower.includes('gurugram') || lower.includes('gurgaon') || lower.includes('sector 44')) {
      targetKey = 'Sector 44, Gurugram';
    }
    setSelectedLocation(targetKey);
    const updatedHospitals = LOCATION_HOSPITALS_MAP[targetKey] || LOCATION_HOSPITALS_MAP['Ansari Nagar, New Delhi'];
    setHospital(updatedHospitals[0].name);
  };

  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
    setSelectedInjuryPreset('');
    const docs = DOCTORS_BY_DEPT[dept] || DOCTORS_BY_DEPT['General Medicine'];
    setDoctor(docs[0]);
  };

  const handleContinue = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/tokens/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: 'P-10024',
          hospital_id: 'hosp-001',
          department_id: department.toLowerCase().includes('cardio') ? 'dept-cardio' : 'dept-genmed',
          triage_score: 3
        })
      });
      if (res.ok) {
        const token = await res.json();
        const newTokenObj = {
          token_id: token.token_id,
          token_number: token.token_number,
          patient_id: token.patient_id,
          hospital: hospital,
          hospital_name: hospital,
          department: department,
          doctor: activeDoctorDetail ? `${activeDoctorDetail.name} (${activeDoctorDetail.experienceYears} Yrs Exp)` : doctor,
          doctor_name: activeDoctorDetail ? activeDoctorDetail.name : doctor,
          hash: token.qr_hash || token.hash || '7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e',
          estimated_wait_minutes: token.estimated_wait_minutes || 20,
          estimated_wait: `${token.estimated_wait_minutes || 20} min`,
          timestamp: new Date().toISOString()
        };

        const existingRaw = localStorage.getItem('smartcare_all_tokens');
        let list = existingRaw ? JSON.parse(existingRaw) : [];
        list.push(newTokenObj);
        localStorage.setItem('smartcare_all_tokens', JSON.stringify(list));
        localStorage.setItem('smartcare_active_token', JSON.stringify(newTokenObj));
      }
    } catch {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const newTokenId = `tok_${Date.now().toString(36)}`;
      const newTokenNumber = `OPD-${randomNum}`;
      const newTokenObj = {
        token_id: newTokenId,
        token_number: newTokenNumber,
        patient_id: 'P-10024',
        hospital: hospital,
        hospital_name: hospital,
        department: department,
        doctor: activeDoctorDetail ? `${activeDoctorDetail.name} (${activeDoctorDetail.experienceYears} Yrs Exp)` : doctor,
        doctor_name: activeDoctorDetail ? activeDoctorDetail.name : doctor,
        hash: '7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e',
        estimated_wait_minutes: 25,
        estimated_wait: '25 min',
        timestamp: new Date().toISOString()
      };

      const existingRaw = localStorage.getItem('smartcare_all_tokens');
      let list = existingRaw ? JSON.parse(existingRaw) : [];
      list.push(newTokenObj);
      localStorage.setItem('smartcare_all_tokens', JSON.stringify(list));
      localStorage.setItem('smartcare_active_token', JSON.stringify(newTokenObj));
    }
    localStorage.removeItem('smartcare_cancelled');
    navigate('/my-token');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-[0_0_40px_rgba(0,0,0,0.05)] relative font-sans">
      
      {/* Top Header with Back Arrow */}
      <header className="flex items-center justify-between p-5 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">Book OPD</h1>
      </header>

      <main className="flex-1 px-6 pt-5 pb-48 overflow-y-auto">
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* STEP 1: PATIENT NAME */}
          <div className="group relative">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> 1. Patient Name
            </label>
            <input 
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter Patient Full Name"
              className="w-full bg-white border-2 border-slate-200/80 text-slate-900 py-3.5 px-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold shadow-xs transition-all text-sm"
            />
          </div>

          {/* STEP 2: LOCATION AREA */}
          <div className="bg-white border-2 border-slate-200/80 rounded-3xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> 2. Location Area
              </label>

              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingGps}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                {isDetectingGps ? 'Locating...' : 'Turn On Live Location'}
              </button>
            </div>

            {gpsNotice && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {gpsNotice}
              </div>
            )}

            <div>
              <div className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => handleLocationTextChange(e.target.value)}
                  placeholder="Type location (Ansari Nagar, Safdarjung, Connaught Place, Gurugram)..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 py-2.5 px-3.5 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold text-xs shadow-2xs transition"
                />
                <MapPin className="absolute right-3.5 top-2.5 w-4 h-4 text-blue-600 pointer-events-none" />
              </div>

              {/* Quick Area Suggestion Chips */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto hide-scrollbar pb-0.5">
                <span className="text-[10px] text-slate-400 font-medium shrink-0">Quick Area:</span>
                {[
                  { label: 'Ansari Nagar', key: 'Ansari Nagar, New Delhi' },
                  { label: 'Safdarjung', key: 'Safdarjung Enclave, New Delhi' },
                  { label: 'Connaught Place', key: 'Connaught Place, Central Delhi' },
                  { label: 'Gurugram', key: 'Sector 44, Gurugram' }
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => handleLocationTextChange(chip.key)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 transition cursor-pointer ${
                      selectedLocation === chip.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: SELECT NEARBY HOSPITAL (TAP TO SHOW HOSPITALS) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> 3. Select Nearby Hospital
              </span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {selectedLocation.split(',')[0]}
              </span>
            </label>

            {/* Tap Button to View/Change Hospital */}
            <button
              type="button"
              onClick={() => setShowHospitalPicker(!showHospitalPicker)}
              className="w-full bg-white border-2 border-slate-200/80 hover:border-blue-300 text-slate-900 p-3.5 rounded-2xl font-extrabold text-xs transition flex items-center justify-between shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Building2 className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <div className="font-extrabold text-xs text-slate-900">{hospital}</div>
                  <div className="text-[10px] text-blue-600 font-bold">
                    Tap to choose hospital ({nearbyHospitals.length} available)
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${showHospitalPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Hospital List Options (Show when tapped) */}
            {showHospitalPicker && (
              <div className="mt-2 space-y-2 p-3 bg-slate-50 border-2 border-blue-100 rounded-3xl animate-in fade-in duration-200 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
                  Hospitals Near {selectedLocation.split(',')[0]} (Tap to select):
                </div>
                {nearbyHospitals.map((h) => {
                  const isSelected = hospital === h.name;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setHospital(h.name);
                        setShowHospitalPicker(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-900 border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-white bg-white text-blue-600' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="font-extrabold text-xs">{h.name}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                            {h.address}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {h.distance}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 4: DEPARTMENT */}
          <div className="group relative">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" /> 4. Medical Department
            </label>
            <div className="relative">
              <select 
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full appearance-none bg-white border-2 border-slate-200/80 text-slate-900 py-3 px-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold shadow-xs transition-all cursor-pointer text-xs"
              >
                <option value="General Medicine">General & Internal Medicine</option>
                <option value="Cardiology">Cardiology & Heart Care</option>
                <option value="Orthopedics">Orthopedics & Joint Care</option>
                <option value="Pediatrics">Pediatrics & Child Care</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
            </div>
          </div>

          {/* STEP 5: APPOINTMENT DATE */}
          <div className="group relative">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> 5. Appointment Date
            </label>
            <div className="relative">
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full appearance-none bg-white border-2 border-slate-200/80 text-slate-900 py-3 px-4 pr-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold shadow-xs transition-all cursor-pointer text-xs"
              />
              <Calendar className="absolute right-4 top-3 w-4 h-4 text-blue-600 pointer-events-none group-hover:text-blue-700 transition-colors" />
            </div>
          </div>

          {/* STEP 6: AVAILABLE SCHEDULE */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> 6. Available OPD Schedule
              </span>
            </label>

            {/* Compressed Schedule Icon Button */}
            <button
              type="button"
              onClick={() => setShowScheduleModal(!showScheduleModal)}
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 text-blue-900 p-3.5 rounded-2xl font-extrabold text-xs transition flex items-center justify-between shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-blue-600 text-white">
                  <Calendar className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <div className="font-extrabold text-xs text-slate-900">Check OPD Available Schedule</div>
                  <div className="text-[11px] text-blue-700 font-medium">Click icon to view shift timings</div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${showScheduleModal ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Compressed Schedule View */}
            {showScheduleModal && (
              <div className="mt-2.5 p-3.5 bg-white border-2 border-blue-100 rounded-3xl shadow-lg space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span>{activeDoctorDetail.name}'s Available Shifts</span>
                  <span className="text-blue-600 text-[10px]">Select a Time Slot</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {doctorScheduleSlots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      onClick={() => {
                        setSlot(s.time);
                        setShowScheduleModal(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        slot === s.time
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm">{s.time}</span>
                        {slot === s.time && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className={`text-[10px] mt-1 font-medium ${slot === s.time ? 'text-blue-100' : 'text-slate-500'}`}>
                        {s.shift} ({s.slotsLeft} left)
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Elevated Bottom Action Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl max-w-lg mx-auto pointer-events-none z-40 border-t border-slate-200/80 shadow-[0_-10px_25px_rgba(0,0,0,0.12)] rounded-2xl">
        <button 
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-2xl hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-500/30 pointer-events-auto cursor-pointer"
        >
          Confirm & Book OPD Token <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
