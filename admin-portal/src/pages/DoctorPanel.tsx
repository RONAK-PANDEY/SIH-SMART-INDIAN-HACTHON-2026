import React, { useState, useEffect } from 'react';
import { 
  User,
  Users,
  CheckCircle2, 
  Play, 
  SkipForward, 
  Share2, 
  Stethoscope, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Building2, 
  ArrowRight,
  Send,
  Printer,
  FlaskConical,
  Heart,
  Eye,
  Activity,
  Plus,
  Search,
  Timer,
  History,
  Sparkles,
  ChevronRight,
  CheckCircle,
  AlertOctagon,
  Thermometer,
  Wind,
  QrCode,
  Radio,
  X
} from 'lucide-react';
import { BackButton } from '../components/BackButton';

interface TreatedPatient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  time: string;
  diagnosis: string;
  rxSummary: string;
}

interface PatientInQueue {
  token: string;
  name: string;
  age: number;
  gender: string;
  aadhaar_verified: boolean;
  phone: string;
  triage_level: number;
  priority_tag: string;
  chief_complaint: string;
  observed_symptoms: string[];
  vitals: {
    bp: string;
    bpStatus: string;
    hr: string;
    hrStatus: string;
    spo2: string;
    spo2Status: string;
    temp: string;
    tempStatus: string;
  };
  ai_assessment: string;
  medical_history: {
    surgeries: string;
    chronic: string;
    social: string;
    family: string;
  };
  scanned?: boolean;
  scanned_at?: string;
  scanned_by?: string;
  status?: string;
}

export const DoctorPanel: React.FC = () => {
  const [staffInfo, setStaffInfo] = useState<any>({
    name: 'Dr. Rajesh Sharma',
    roleTitle: 'Senior Cardiologist & HOD',
    dept: 'Cardiology (Chamber 204)'
  });

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [referralSent, setReferralSent] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedLabs, setSelectedLabs] = useState<string[]>(['12-Lead Rest ECG']);
  const [consultCompleted, setConsultCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [consultTimerSeconds, setConsultTimerSeconds] = useState(245); // e.g. 4m 05s
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [viewTreatedPatient, setViewTreatedPatient] = useState<TreatedPatient | null>(null);
  const [latestScanNotification, setLatestScanNotification] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Initial recent treated patients (last treated today in Chamber 204)
  const [recentHistory, setRecentHistory] = useState<TreatedPatient[]>([
    {
      id: 'TP-1',
      token: 'CARD-201',
      name: 'Suresh Patel',
      age: 62,
      gender: 'Male',
      department: 'Cardiology',
      time: '10:14 AM',
      diagnosis: 'Stable Angina Pectoris (CCS Class II)',
      rxSummary: 'Tab Sorbitrate 5mg SL SOS, Tab Atorvastatin 40mg HS'
    },
    {
      id: 'TP-2',
      token: 'CARD-202',
      name: 'Meena Devi Kumari',
      age: 58,
      gender: 'Female',
      department: 'Cardiology',
      time: '10:31 AM',
      diagnosis: 'Essential Hypertension Stage 2 with Sinus Tachycardia',
      rxSummary: 'Tab Telmisartan 40mg + Amlodipine 5mg, Tab Metoprolol 25mg OD'
    },
    {
      id: 'TP-3',
      token: 'CARD-203',
      name: 'Harish Chandra',
      age: 71,
      gender: 'Male',
      department: 'Cardiology',
      time: '10:52 AM',
      diagnosis: 'Mild Sinus Bradycardia (Asymptomatic), Post-Pacemaker Review',
      rxSummary: 'Routine surveillance, Repeat 12-lead ECG in 6 months'
    },
    {
      id: 'TP-4',
      token: 'CARD-199',
      name: 'Ananya Deshmukh',
      age: 34,
      gender: 'Female',
      department: 'Cardiology',
      time: '09:45 AM',
      diagnosis: 'Atypical Non-Cardiac Chest Wall Pain (Costochondritis)',
      rxSummary: 'Tab Paracetamol 650mg SOS, Local NSAID Gel BID'
    },
    {
      id: 'TP-5',
      token: 'CARD-198',
      name: 'Mohammad Tariq',
      age: 65,
      gender: 'Male',
      department: 'Cardiology',
      time: '09:20 AM',
      diagnosis: 'Type 2 Diabetes Mellitus with Microvascular Anginopathy',
      rxSummary: 'Tab Empagliflozin 10mg OD, Tab Rosuvastatin 20mg HS'
    }
  ]);

  const labOptions = [
    '12-Lead Rest ECG',
    'Cardiac Troponin I & T',
    'Comprehensive Lipid Profile',
    'Complete Blood Count (CBC)',
    '2D Echocardiography',
    'Chest X-Ray (PA View)',
    'Serum Creatinine & Electrolytes',
    'HbA1c Glycated Hemoglobin'
  ];

  const initialPatientsQueue: PatientInQueue[] = [
    {
      token: 'CARD-204',
      name: 'Aarav Sharma',
      age: 68,
      gender: 'Male',
      aadhaar_verified: true,
      phone: '+91 98765 43210',
      triage_level: 2,
      priority_tag: 'P2 - SENIOR CITIZEN ACCELERATED',
      chief_complaint: 'Crushing chest tightness radiating to left shoulder on fast walking, exertional fatigue since 3 days',
      observed_symptoms: ['Mild Chest Tightness on Exertion', 'Rapid Heartbeats', 'Bilateral Leg Swelling'],
      vitals: {
        bp: '148/92 mmHg',
        bpStatus: 'warning',
        hr: '88 bpm',
        hrStatus: 'normal',
        spo2: '97%',
        spo2Status: 'normal',
        temp: '98.4°F',
        tempStatus: 'normal'
      },
      ai_assessment: 'AI Urgency Score: Moderate-High (Cardiac Angina suspect). Fast-tracked as Senior Citizen (Aadhaar Verified).',
      medical_history: {
        surgeries: 'Appendectomy (2018), Knee Arthroscopy (2021)',
        chronic: 'Essential Hypertension (Stage 1), Type 2 Diabetes',
        social: 'Non-smoker, Occasional alcohol, 30m morning walk',
        family: 'Father (Coronary Artery Disease & Stroke), Mother (Type 2 Diabetes)'
      }
    },
    {
      token: 'CARD-205',
      name: 'Vikram Malhotra',
      age: 54,
      gender: 'Male',
      aadhaar_verified: true,
      phone: '+91 98110 99481',
      triage_level: 1,
      priority_tag: 'P1 - CRITICAL EMERGENCY OVERRIDE',
      chief_complaint: 'Acute severe chest pain, diaphoresis, shortness of breath. History of Prior Angioplasty (2021).',
      observed_symptoms: ['Severe Crushing Chest Pain', 'Acute Shortness of Breath'],
      vitals: {
        bp: '168/104 mmHg',
        bpStatus: 'danger',
        hr: '112 bpm',
        hrStatus: 'danger',
        spo2: '92%',
        spo2Status: 'danger',
        temp: '99.1°F',
        tempStatus: 'warning'
      },
      ai_assessment: 'CRITICAL EMERGENCY RED-FLAG: High risk STEMI/ACS. Immediate ECG and Troponin I ordered.',
      medical_history: {
        surgeries: 'PTCA Stent Implantation to LAD (2021)',
        chronic: 'Dyslipidemia, Hypertension',
        social: 'Ex-smoker (Quit 2021), Sedentary lifestyle',
        family: 'Brother (Myocardial Infarction at age 50)'
      }
    },
    {
      token: 'CARD-206',
      name: 'Pooja Verma',
      age: 30,
      gender: 'Female',
      aadhaar_verified: true,
      phone: '+91 98112 34567',
      triage_level: 2,
      priority_tag: 'P2 - MATERNAL / PREGNANT PRIORITY',
      chief_complaint: 'Palpitations during 2nd trimester pregnancy with occasional dizziness',
      observed_symptoms: ['Rapid / Irregular Heartbeats', 'Sudden Dizziness'],
      vitals: {
        bp: '118/76 mmHg',
        bpStatus: 'normal',
        hr: '84 bpm',
        hrStatus: 'normal',
        spo2: '99%',
        spo2Status: 'normal',
        temp: '98.6°F',
        tempStatus: 'normal'
      },
      ai_assessment: 'Maternal Care Priority Protocol: Monitor maternal hemodynamic response.',
      medical_history: {
        surgeries: 'None',
        chronic: 'Mild Gestational Anemia (Hb 10.2)',
        social: 'Non-smoker, Vegetarian diet',
        family: 'No known hereditary cardiovascular disease'
      }
    },
    {
      token: 'CARD-207',
      name: 'Gurmeet Singh',
      age: 49,
      gender: 'Male',
      aadhaar_verified: true,
      phone: '+91 98711 22334',
      triage_level: 3,
      priority_tag: 'P3 - STANDARD OPD CONSULTATION',
      chief_complaint: 'Routine follow-up for medication titration and review of post-treadmill ECG',
      observed_symptoms: ['None acute', 'Mild ankle edema in evening'],
      vitals: {
        bp: '130/84 mmHg',
        bpStatus: 'normal',
        hr: '72 bpm',
        hrStatus: 'normal',
        spo2: '98%',
        spo2Status: 'normal',
        temp: '98.2°F',
        tempStatus: 'normal'
      },
      ai_assessment: 'Standard follow-up. Vital indicators within stable parameters.',
      medical_history: {
        surgeries: 'None',
        chronic: 'Dyslipidemia, Mild Fatty Liver',
        social: 'Non-smoker, moderate diet',
        family: 'Hypertension in paternal grandparents'
      }
    }
  ];

  const [patientsQueue, setPatientsQueue] = useState<PatientInQueue[]>(initialPatientsQueue);

  // Real-time Turnstile QR Scan WebSocket listener
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hospitalId = searchParams.get('hospital_id') || staffInfo.hospital_id || 'hosp-001';
    let departmentId = searchParams.get('department_id') || staffInfo.department_id;
    if (!departmentId) {
      if (staffInfo.dept?.toLowerCase().includes('cardio')) departmentId = 'dept-cardio';
      else if (staffInfo.dept?.toLowerCase().includes('general') || staffInfo.dept?.toLowerCase().includes('med')) departmentId = 'dept-genmed';
      else if (staffInfo.dept?.toLowerCase().includes('ortho')) departmentId = 'dept-ortho';
      else if (staffInfo.dept?.toLowerCase().includes('ped')) departmentId = 'dept-peds';
      else if (staffInfo.dept?.toLowerCase().includes('neuro')) departmentId = 'dept-neuro-sjh';
      else departmentId = 'dept-cardio';
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/api/v1/ws/connect/doctor:${departmentId}`;
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
          console.log('[DoctorPanel] Live Queue WebSocket connected to:', wsUrl);
          // Subscribe to additional aliases
          ws?.send(JSON.stringify({ action: 'subscribe', channel: `doctor:${hospitalId}:${departmentId}` }));
          ws?.send(JSON.stringify({ action: 'subscribe', channel: departmentId }));
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const eventType = data.event || data.type;

            if (eventType === 'token_scanned' || data.status === 'scanned_by_staff') {
              setLatestScanNotification(data);
              setPatientsQueue(prev => {
                const idx = prev.findIndex(p => p.token === data.token_number || p.token === data.token_id);
                if (idx !== -1) {
                  const updated = [...prev];
                  const [scannedPatient] = updated.splice(idx, 1);
                  const newScanned = {
                    ...scannedPatient,
                    scanned: true,
                    scanned_at: data.scanned_at,
                    scanned_by: data.scanned_by,
                    status: 'scanned_by_staff',
                    priority_tag: 'P2 - SCANNED AT DOOR (VERIFIED)'
                  };
                  // Place at top of active queue
                  return [newScanned, ...updated];
                } else {
                  // Add newly scanned token to queue
                  const newPatient: PatientInQueue = {
                    token: data.token_number || data.token_id,
                    name: data.patient_name || `Citizen (${data.token_number})`,
                    age: 45,
                    gender: 'Citizen',
                    aadhaar_verified: true,
                    phone: '+91 98XXX XXXXX',
                    triage_level: 2,
                    priority_tag: 'P2 - SCANNED AT DOOR (VERIFIED)',
                    chief_complaint: 'Turnstile gate verified. Ready for doctor consultation.',
                    observed_symptoms: ['Arrived at Door', 'Turnstile Verified'],
                    vitals: {
                      bp: '124/82 mmHg',
                      bpStatus: 'normal',
                      hr: '76 bpm',
                      hrStatus: 'normal',
                      spo2: '99%',
                      spo2Status: 'normal',
                      temp: '98.4°F',
                      tempStatus: 'normal'
                    },
                    ai_assessment: `Turnstile Scanned by ${data.scanned_by || 'Security Staff'}. Patient is waiting at door.`,
                    medical_history: {
                      surgeries: 'None recorded',
                      chronic: 'Under assessment',
                      social: 'OPD Attendee',
                      family: 'N/A'
                    },
                    scanned: true,
                    scanned_at: data.scanned_at,
                    scanned_by: data.scanned_by,
                    status: 'scanned_by_staff'
                  };
                  return [newPatient, ...prev];
                }
              });
            } else if (eventType === 'token_created') {
              setPatientsQueue(prev => {
                if (prev.some(p => p.token === data.token_number)) return prev;
                const newPatient: PatientInQueue = {
                  token: data.token_number,
                  name: `Patient (${data.token_number})`,
                  age: 40,
                  gender: 'Citizen',
                  aadhaar_verified: true,
                  phone: '+91 98XXX XXXXX',
                  triage_level: 3,
                  priority_tag: 'P3 - OPD QUEUE TOKEN ISSUED',
                  chief_complaint: 'New appointment booked from patient portal.',
                  observed_symptoms: ['Routine OPD'],
                  vitals: {
                    bp: '120/80 mmHg',
                    bpStatus: 'normal',
                    hr: '72 bpm',
                    hrStatus: 'normal',
                    spo2: '98%',
                    spo2Status: 'normal',
                    temp: '98.6°F',
                    tempStatus: 'normal'
                  },
                  ai_assessment: 'Queued via smartcare digital portal.',
                  medical_history: {
                    surgeries: 'None',
                    chronic: 'None',
                    social: 'N/A',
                    family: 'N/A'
                  },
                  status: 'waiting'
                };
                return [...prev, newPatient];
              });
            }
          } catch (e) {
            console.error('[DoctorPanel] WS Message parse error:', e);
          }
        };
        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };
        ws.onerror = () => {
          ws?.close();
        };
      } catch (err) {
        console.error('[DoctorPanel] WS setup error:', err);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [staffInfo.hospital_id, staffInfo.department_id, staffInfo.dept]);

  useEffect(() => {
    const saved = localStorage.getItem('smartcare_staff');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let deptId = parsed.department_id || parsed.deptId;
        if (!deptId && parsed.dept) {
          if (parsed.dept.toLowerCase().includes('cardio')) deptId = 'dept-cardio';
          else if (parsed.dept.toLowerCase().includes('general') || parsed.dept.toLowerCase().includes('med')) deptId = 'dept-genmed';
          else if (parsed.dept.toLowerCase().includes('ortho')) deptId = 'dept-ortho';
          else if (parsed.dept.toLowerCase().includes('ped')) deptId = 'dept-peds';
          else if (parsed.dept.toLowerCase().includes('neuro')) deptId = 'dept-neuro-sjh';
          else deptId = 'dept-cardio';
        }
        setStaffInfo({
          ...parsed,
          hospital_id: parsed.hospital_id || parsed.hospitalId || 'hosp-001',
          department_id: deptId || 'dept-cardio'
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setConsultTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const currentPatient = (selectedTokenId ? patientsQueue.find(p => p.token === selectedTokenId) : null) || (patientsQueue.length > 0 ? patientsQueue[0] : null);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (patientsQueue.length === 0) return;
    const currentIndex = currentPatient ? patientsQueue.findIndex(p => p.token === currentPatient.token) : -1;
    const nextIndex = (currentIndex + 1) % patientsQueue.length;
    setSelectedTokenId(patientsQueue[nextIndex]?.token || null);
    setDoctorNotes('');
    setReferralSent(false);
    setConsultCompleted(false);
    setConsultTimerSeconds(0);
  };

  const handleComplete = async () => {
    if (!currentPatient) return;
    const tokenToComplete = currentPatient.token;
    const apiHost = window.location.hostname || 'localhost';

    try {
      await fetch(`http://${apiHost}:8000/api/v1/tokens/${encodeURIComponent(tokenToComplete)}/complete`, {
        method: 'POST'
      });
    } catch (err) {
      console.warn('Backend complete endpoint call failed, updating local state:', err);
    }

    // Save to Recent Patient History
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const newTreated: TreatedPatient = {
      id: `TP-${Date.now()}`,
      token: currentPatient.token,
      name: currentPatient.name,
      age: currentPatient.age,
      gender: currentPatient.gender,
      department: 'Cardiology',
      time: nowTime,
      diagnosis: doctorNotes.trim() ? doctorNotes.split('\n')[0].substring(0, 70) : 'Clinical Consultation Completed - Stable',
      rxSummary: selectedLabs.length > 0 ? `Labs: ${selectedLabs.join(', ')}` : 'Standard Cardiac Rx Issued'
    };

    setRecentHistory(prev => [newTreated, ...prev.slice(0, 5)]);
    setConsultCompleted(true);

    const remaining = patientsQueue.filter(p => p.token !== currentPatient.token);
    setPatientsQueue(remaining);

    setTimeout(() => {
      setSelectedTokenId(remaining.length > 0 ? remaining[0].token : null);
      setDoctorNotes('');
      setReferralSent(false);
      setConsultCompleted(false);
      setConsultTimerSeconds(0);
    }, 1000);
  };

  const toggleLab = (lab: string) => {
    setSelectedLabs(prev =>
      prev.includes(lab) ? prev.filter(l => l !== lab) : [...prev, lab]
    );
  };

  const filteredQueue = patientsQueue.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.token.toLowerCase().includes(q) ||
      p.priority_tag.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#061224] text-[#F8FAFC] min-h-screen pb-36">
      
      {/* Top Clinical Header with Back Navigation & Live Status */}
      <header className="bg-[#0D1B34] p-5 sm:p-6 rounded-2xl border border-[#1E2E4A] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <BackButton />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs bg-blue-900/60 text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-700/50 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                {staffInfo.roleTitle}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-500" />
                {staffInfo.dept}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {staffInfo.name}
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 font-semibold font-mono">
                AIIMS New Delhi
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                wsConnected 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60' 
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span>{wsConnected ? 'Live Gateway Sync' : 'Reconnecting...'}</span>
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live Clinical Consultation & Prescription Console — calling turnstiles, nurse intake vitals & AI diagnostic orders in real time.
            </p>
          </div>
        </div>

        {/* Live Consultation Timer & Action Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Active Session Timer */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#061224] border border-[#1E2E4A] rounded-xl text-xs">
            <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase leading-tight">Consultation Timer</span>
              <strong className="text-sm font-mono text-amber-300 font-bold">{formatTimer(consultTimerSeconds)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNext}
              disabled={patientsQueue.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Call Next Patient</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={patientsQueue.length === 0}
              className="flex items-center gap-2 bg-[#132647] hover:bg-[#1E2E4A] disabled:opacity-50 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer active:scale-95 border border-[#1E2E4A]"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip / No-Show</span>
            </button>
          </div>
        </div>
      </header>

      {/* ONE-SHOT COMPREHENSION KPI STRIP FOR DOCTOR CONSOLE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#0D1B34] border border-[#1E2E4A] rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Waiting In Room Queue</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <strong className="text-xl font-mono text-blue-400 font-black">{patientsQueue.length}</strong>
              <span className="text-[10px] text-emerald-400 font-mono">Triaged</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0D1B34] border border-[#1E2E4A] rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Avg Consult Duration</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <strong className="text-xl font-mono text-amber-300 font-black">6.2m</strong>
              <span className="text-[10px] text-slate-400 font-mono">Target &lt;8m</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0D1B34] border border-[#1E2E4A] rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Consulted Today</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <strong className="text-xl font-mono text-emerald-400 font-black">{recentHistory.length + 18}</strong>
              <span className="text-[10px] text-emerald-400 font-mono">Completed</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0D1B34] to-blue-950/40 border border-blue-500/40 rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black shrink-0">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">DPI & Bonus Status</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <strong className="text-xl font-mono text-purple-300 font-black">4.85 ★</strong>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded font-mono">+15% Bonus</span>
            </div>
          </div>
        </div>
      </div>

      {/* WHY THIS MATTERS: DOCTOR PERFORMANCE LINK MICROCOPY */}
      <div className="px-4 py-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center gap-2.5 text-xs text-blue-200">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong>Why this matters:</strong> Every completed consultation with documented diagnosis updates your <strong>Doctor Performance Index (DPI)</strong> in real time on the MoHFW Oversight Portal, directly rewarding clinical adherence with performance salary incentives.
        </span>
      </div>

      {/* Real-Time Turnstile Scanner Alert */}
      {latestScanNotification && (
        <div className="p-4 bg-gradient-to-r from-emerald-950/90 via-blue-950/80 to-[#0D1B34] border border-emerald-500/60 text-emerald-200 text-xs rounded-2xl flex items-center justify-between gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[11px] border border-emerald-500/40">
                  {latestScanNotification.token_number}
                </span>
                <strong className="text-white text-sm">
                  {latestScanNotification.patient_name || 'Citizen'}
                </strong>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/50">
                  ✓ Scanned at Turnstile
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                {latestScanNotification.message || `Turnstile QR verified by ${latestScanNotification.scanned_by}. Citizen is present outside Chamber 204.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLatestScanNotification(null)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {consultCompleted && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Consultation Completed! Electronic Prescription & Diagnostics dispatched to AIIMS Central Pharmacy & Citizen Health Portal.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Patient Detail */}
        <div className="lg:col-span-2 space-y-6">
          {currentPatient ? (
          <div className="bg-[#0D1B34] rounded-2xl p-6 border border-[#1E2E4A] shadow-md space-y-5">
            {/* Header: Token + Urgency Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2E4A] pb-4">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                  Currently Consulting in Room 204
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <h3 className="text-4xl font-black text-blue-400 tracking-tight">{currentPatient.token}</h3>
                  <span className="text-xs text-slate-400 font-mono">OPD Ticket #{currentPatient.token.replace('CARD-', '2026-')}</span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${
                  currentPatient.triage_level === 1
                    ? 'bg-rose-950/70 text-rose-300 border-rose-700/80 animate-pulse'
                    : currentPatient.triage_level === 2
                    ? 'bg-amber-950/70 text-amber-300 border-amber-700/80'
                    : 'bg-blue-950/70 text-blue-300 border-blue-700/80'
                }`}>
                  {currentPatient.triage_level === 1 && <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
                  {currentPatient.priority_tag}
                </span>
                <span className="text-[11px] text-slate-400 block">Queue Status: <strong>Inside Chamber</strong></span>
                {currentPatient.scanned && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-mono mt-1">
                    <QrCode className="w-3 h-3 text-emerald-400" /> Turnstile Verified • Standing at Door
                  </span>
                )}
              </div>
            </div>

            {/* Patient Demographics & KYC Bar */}
            <div className="bg-[#061224] rounded-xl p-4 border border-[#1E2E4A] space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Patient Full Name</span>
                  <strong className="text-white text-sm font-semibold">{currentPatient.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Demographics</span>
                  <strong className="text-white">{currentPatient.age} Yrs • {currentPatient.gender}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Registered Mobile</span>
                  <strong className="text-slate-300 font-mono">{currentPatient.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">National Health KYC</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Aadhaar Verified
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#1E2E4A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-slate-300">
                  <strong className="text-amber-400">Known Chronic:</strong> {currentPatient.medical_history.chronic}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 cursor-pointer underline decoration-blue-500/50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect Complete Medical Record</span>
                </button>
              </div>
            </div>

            {/* Colored Clinical Vitals Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  Nurse Intake Vitals & Triaged Thresholds
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Recorded 12 mins ago</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* BP */}
                <div className={`p-3 rounded-xl border ${
                  currentPatient.vitals.bpStatus === 'danger'
                    ? 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                    : currentPatient.vitals.bpStatus === 'warning'
                    ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                    : 'bg-[#061224] border-[#1E2E4A] text-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> Blood Pressure</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      currentPatient.vitals.bpStatus === 'danger' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {currentPatient.vitals.bpStatus}
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono">{currentPatient.vitals.bp}</div>
                </div>

                {/* Heart Rate */}
                <div className={`p-3 rounded-xl border ${
                  currentPatient.vitals.hrStatus === 'danger'
                    ? 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                    : currentPatient.vitals.hrStatus === 'warning'
                    ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                    : 'bg-[#061224] border-[#1E2E4A] text-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-400" /> Pulse / HR</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      currentPatient.vitals.hrStatus === 'danger' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {currentPatient.vitals.hrStatus}
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono">{currentPatient.vitals.hr}</div>
                </div>

                {/* SpO2 */}
                <div className={`p-3 rounded-xl border ${
                  currentPatient.vitals.spo2Status === 'danger'
                    ? 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                    : currentPatient.vitals.spo2Status === 'warning'
                    ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                    : 'bg-[#061224] border-[#1E2E4A] text-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-cyan-400" /> Oxygen (SpO2)</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      currentPatient.vitals.spo2Status === 'danger' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {currentPatient.vitals.spo2Status}
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono">{currentPatient.vitals.spo2}</div>
                </div>

                {/* Temperature */}
                <div className={`p-3 rounded-xl border ${
                  currentPatient.vitals.tempStatus === 'danger'
                    ? 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                    : currentPatient.vitals.tempStatus === 'warning'
                    ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                    : 'bg-[#061224] border-[#1E2E4A] text-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-amber-400" /> Temp</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      currentPatient.vitals.tempStatus === 'danger' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {currentPatient.vitals.tempStatus}
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono">{currentPatient.vitals.temp}</div>
                </div>
              </div>
            </div>

            {/* Narrative Complaints & AI Clinical Summary */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Citizen Chief Complaint (Speech / Kiosk Narrative)
                </label>
                <div className="p-3.5 bg-[#061224] border border-blue-900/40 rounded-xl text-xs text-blue-200 font-medium italic">
                  "{currentPatient.chief_complaint}"
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  AI Clinical Inference & Sentinel Triage Alert
                </label>
                <div className="p-3.5 bg-[#061224] border border-[#1E2E4A] rounded-xl text-xs space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Reported Symptoms:</span>
                    {currentPatient.observed_symptoms.map((s, idx) => (
                      <span key={idx} className="bg-[#132647] text-slate-200 px-2 py-0.5 rounded-md text-[11px] border border-[#1E2E4A]">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-amber-300 font-mono text-[11px] pt-1 border-t border-[#1E2E4A]">
                    <strong>AI Protocol:</strong> {currentPatient.ai_assessment}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Clinical Notes & Orders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Doctor Clinical Diagnosis, Rx & Follow-up Instructions
                </label>
                <button
                  type="button"
                  onClick={() => setShowLabModal(true)}
                  className="text-xs bg-indigo-950/70 text-indigo-300 hover:bg-indigo-900 font-bold px-3 py-1.5 rounded-xl border border-indigo-700/60 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Order Lab Diagnostics ({selectedLabs.length})</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Document clinical impression (e.g. Angina CCS-II), prescribed dosage, timing (Morning / Afternoon / Evening / Night), dietary warnings, and SOS protocols..."
                className="w-full px-4 py-3 rounded-xl bg-[#061224] border border-[#1E2E4A] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            {/* Quick Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E2E4A]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReferralSent(!referralSent)}
                  className="bg-[#132647] hover:bg-[#1E2E4A] text-amber-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-[#1E2E4A]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{referralSent ? '✓ Referred to AIIMS Super-Specialty' : 'Refer to Specialty'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#132647] hover:bg-[#1E2E4A] text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-[#1E2E4A]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print OPD Rx</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg flex items-center gap-2 transition cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Consultation</span>
              </button>
            </div>
          </div>
          ) : (
            <div className="bg-[#0D1B34] rounded-2xl p-10 border border-[#1E2E4A] shadow-md text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-white">Chamber 204 OPD Queue Clear</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  All waiting patients have completed consultation! When a new citizen checks in via QR scan at the hospital entrance turnstile, their medical file will appear here in real time.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs px-3.5 py-1.5 bg-[#061224] border border-[#1E2E4A] text-slate-300 rounded-full flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Listening on Live Gateway: doctor:dept-cardio
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Chamber Queue & Doctor Search Filter */}
        <div className="space-y-6">
          {/* Chamber Live Queue */}
          <div className="bg-[#0D1B34] rounded-2xl p-5 border border-[#1E2E4A] shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>Chamber 204 OPD Queue</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h3>
                <p className="text-[11px] text-slate-400">Live AI Token Sequence</p>
              </div>
              <span className="text-xs bg-blue-950/70 text-blue-300 font-mono font-bold px-2.5 py-1 rounded-md border border-blue-800">
                {patientsQueue.length} Active
              </span>
            </div>

            {/* Doctor / Patient Queue Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter queue by name, token or tag..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#061224] border border-[#1E2E4A] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="divide-y divide-[#1E2E4A] text-xs max-h-80 overflow-y-auto pr-1">
              {filteredQueue.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No waiting patients in Chamber 204 queue.
                </div>
              ) : (
                filteredQueue.map((p) => {
                  const isCurrent = currentPatient && p.token === currentPatient.token;
                  return (
                    <div
                      key={p.token}
                      onClick={() => {
                        setSelectedTokenId(p.token);
                        setDoctorNotes('');
                        setReferralSent(false);
                        setConsultCompleted(false);
                        setConsultTimerSeconds(0);
                      }}
                      className={`py-3 px-3 rounded-xl transition flex items-center justify-between cursor-pointer ${
                        isCurrent 
                          ? 'bg-blue-900/30 border border-blue-500/50 text-white shadow-inner' 
                          : 'hover:bg-[#132647]/50 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-mono text-sm">{p.token}</strong>
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded font-mono">
                              NOW
                            </span>
                          )}
                          {p.scanned && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-1.5 py-0.2 rounded flex items-center gap-1 font-mono animate-pulse">
                              <QrCode className="w-3 h-3 text-emerald-400" /> AT DOOR
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.name} • {p.age}y, {p.gender}</p>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          p.triage_level === 1
                            ? 'bg-rose-950/70 text-rose-300 border-rose-800'
                            : p.triage_level === 2
                            ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {p.priority_tag.split(' - ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Room Stats */}
          <div className="bg-[#0D1B34] rounded-2xl p-4 border border-[#1E2E4A] space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Chamber 204 Efficiency KPI
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#061224] p-2.5 rounded-xl border border-[#1E2E4A]">
                <span className="text-[10px] text-slate-400 uppercase block">Avg Consult Time</span>
                <strong className="text-emerald-400 font-mono text-sm">6.2 mins</strong>
              </div>
              <div className="bg-[#061224] p-2.5 rounded-xl border border-[#1E2E4A]">
                <span className="text-[10px] text-slate-400 uppercase block">Treated Today</span>
                <strong className="text-blue-400 font-mono text-sm">{recentHistory.length + 18} Patients</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT PATIENT HISTORY (Last 5-6 Treated Patients) */}
      <section className="bg-[#0D1B34] rounded-2xl p-6 border border-[#1E2E4A] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white">Recent Consultation History (Today's Treated OPD Roster)</h3>
              <p className="text-xs text-slate-400">Past 5-6 treated patients from Chamber 204 for doctor review and follow-up adjustments</p>
            </div>
          </div>
          <span className="text-xs bg-[#061224] text-slate-300 font-mono px-3 py-1 rounded-lg border border-[#1E2E4A]">
            Showing {recentHistory.length} Recent Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#061224] text-slate-400 border-b border-[#1E2E4A]">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Token #</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Patient Name</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Demographics</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Time Completed</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Clinical Impression / Diagnosis</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Rx / Orders</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]">
              {recentHistory.map((pt) => (
                <tr key={pt.id} className="hover:bg-[#132647]/50 transition text-slate-200">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">{pt.token}</td>
                  <td className="py-3 px-4 font-semibold text-white">{pt.name}</td>
                  <td className="py-3 px-4 text-slate-400">{pt.age}y • {pt.gender}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{pt.time}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{pt.diagnosis}</td>
                  <td className="py-3 px-4 text-emerald-400 font-mono text-[11px] max-w-xs truncate">{pt.rxSummary}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setViewTreatedPatient(pt)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold px-2.5 py-1 rounded bg-[#061224] border border-[#1E2E4A] hover:border-blue-500/50 transition cursor-pointer"
                    >
                      View Summary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Patient Medical History Inspector Modal */}
      {showHistoryModal && currentPatient && (
        <div 
          onClick={() => setShowHistoryModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D1B34] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#1E2E4A] space-y-4 max-h-[85vh] overflow-y-auto text-[#F8FAFC]"
          >
            <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Complete Citizen Electronic Medical History</h3>
                <span className="text-xs text-slate-400">{currentPatient.name} ({currentPatient.age}y, {currentPatient.gender})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#061224] rounded-xl border border-[#1E2E4A]">
                <span className="text-slate-400 block text-[11px] font-bold uppercase mb-0.5">1. Past Surgeries / Hospitalizations</span>
                <strong className="text-white">{currentPatient.medical_history.surgeries}</strong>
              </div>
              <div className="p-3 bg-[#061224] rounded-xl border border-[#1E2E4A]">
                <span className="text-slate-400 block text-[11px] font-bold uppercase mb-0.5">2. Current Active Chronic Conditions</span>
                <strong className="text-amber-400">{currentPatient.medical_history.chronic}</strong>
              </div>
              <div className="p-3 bg-[#061224] rounded-xl border border-[#1E2E4A]">
                <span className="text-slate-400 block text-[11px] font-bold uppercase mb-0.5">3. Social & Lifestyle History</span>
                <strong className="text-slate-200">{currentPatient.medical_history.social}</strong>
              </div>
              <div className="p-3 bg-[#061224] rounded-xl border border-[#1E2E4A]">
                <span className="text-slate-400 block text-[11px] font-bold uppercase mb-0.5">4. Family Genetic History</span>
                <strong className="text-slate-200">{currentPatient.medical_history.family}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="w-full bg-[#132647] hover:bg-[#1E2E4A] text-white font-bold py-2.5 rounded-xl text-xs border border-[#1E2E4A] transition cursor-pointer"
            >
              Return to Consultation
            </button>
          </div>
        </div>
      )}

      {/* Lab Order Modal */}
      {showLabModal && (
        <div 
          onClick={() => setShowLabModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D1B34] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#1E2E4A] space-y-4 text-[#F8FAFC]"
          >
            <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Order Diagnostic Tests</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLabModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {labOptions.map((lab) => {
                const isChecked = selectedLabs.includes(lab);
                return (
                  <button
                    key={lab}
                    type="button"
                    onClick={() => toggleLab(lab)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                      isChecked 
                        ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-bold' 
                        : 'border-[#1E2E4A] bg-[#061224] hover:bg-[#132647] text-slate-300'
                    }`}
                  >
                    <span>{lab}</span>
                    {isChecked && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowLabModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              Confirm {selectedLabs.length} Diagnostic Orders
            </button>
          </div>
        </div>
      )}

      {/* Treated Patient Record Detail Modal */}
      {viewTreatedPatient && (
        <div 
          onClick={() => setViewTreatedPatient(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D1B34] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#1E2E4A] space-y-4 text-[#F8FAFC]"
          >
            <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Consultation Archive</span>
                <h3 className="text-base font-bold text-white">{viewTreatedPatient.name} ({viewTreatedPatient.token})</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewTreatedPatient(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#061224] rounded-xl border border-[#1E2E4A]">
                <span className="text-slate-400 block text-[10px] uppercase">Completed Time</span>
                <strong className="text-white font-mono">{viewTreatedPatient.time} Today</strong>
              </div>
              <div className="p-3 bg-[#061224] rounded-xl border border-[#1E2E4A]">
                <span className="text-slate-400 block text-[10px] uppercase">Diagnosed Condition</span>
                <strong className="text-amber-300">{viewTreatedPatient.diagnosis}</strong>
              </div>
              <div className="p-3 bg-[#061224] rounded-xl border border-[#1E2E4A]">
                <span className="text-slate-400 block text-[10px] uppercase">Prescription / Diagnostic Orders</span>
                <strong className="text-emerald-400 font-mono text-[11px]">{viewTreatedPatient.rxSummary}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewTreatedPatient(null)}
              className="w-full bg-[#132647] hover:bg-[#1E2E4A] text-white font-bold py-2.5 rounded-xl text-xs border border-[#1E2E4A] transition cursor-pointer"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
