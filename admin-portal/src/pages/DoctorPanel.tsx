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
  Activity,
  Plus,
  Search,
  Timer,
  History,
  ChevronRight,
  CheckCircle,
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
    dept: 'Cardiology (Chamber 204)',
    hospital_id: 'hosp-001',
    department_id: 'dept-cardio'
  });

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [referralSent, setReferralSent] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedLabs, setSelectedLabs] = useState<string[]>(['12-Lead Rest ECG']);
  const [consultCompleted, setConsultCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [consultTimerSeconds, setConsultTimerSeconds] = useState(245);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [viewTreatedPatient, setViewTreatedPatient] = useState<TreatedPatient | null>(null);
  const [latestScanNotification, setLatestScanNotification] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);

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
      priority_tag: 'Priority 2 - Senior Citizen Accelerated',
      chief_complaint: 'Crushing chest tightness radiating to left shoulder on fast walking, exertional fatigue since 3 days',
      observed_symptoms: ['Mild Chest Tightness on Exertion', 'Breathlessness on Incline', 'Profuse Sweating during Episodes'],
      vitals: {
        bp: '148/92 mmHg',
        bpStatus: 'Elevated Stage 1',
        hr: '88 bpm',
        hrStatus: 'Normal Regular',
        spo2: '97%',
        spo2Status: 'Adequate',
        temp: '98.4 °F',
        tempStatus: 'Normal'
      },
      ai_assessment: 'Exertional angina symptom constellation in senior patient with hypertension history. Immediate 12-lead ECG and Troponin screen advised before treadmill testing.',
      medical_history: {
        surgeries: 'Appendectomy (1998), Left Knee Arthroscopy (2018)',
        chronic: 'Hypertension (12 yrs on Telmisartan 40mg), Mild Dyslipidemia',
        social: 'Non-smoker, Non-alcoholic, Retired Civil Engineer',
        family: 'Father: Acute Myocardial Infarction at 64 yrs'
      },
      scanned: true,
      scanned_at: '10:48 AM',
      scanned_by: 'Turnstile Gate B (North Wing)',
      status: 'at_door'
    },
    {
      token: 'CARD-205',
      name: 'Pooja Verma',
      age: 42,
      gender: 'Female',
      aadhaar_verified: true,
      phone: '+91 98112 33445',
      triage_level: 3,
      priority_tag: 'Priority 3 - Routine Outpatient Follow-up',
      chief_complaint: 'Routine follow-up for mitral valve prolapse murmur, occasional palpitations during evening stress',
      observed_symptoms: ['Palpitations / Fluttering', 'Mild Lightheadedness when standing up abruptly'],
      vitals: {
        bp: '122/78 mmHg',
        bpStatus: 'Normal Optimal',
        hr: '76 bpm',
        hrStatus: 'Regular Rhythm',
        spo2: '99%',
        spo2Status: 'Optimal',
        temp: '98.6 °F',
        tempStatus: 'Normal'
      },
      ai_assessment: 'Hemodynamically stable follow-up patient. Previous echocardiography showed mild MVP with trace regurgitation.',
      medical_history: {
        surgeries: 'None',
        chronic: 'Mild MVP diagnosed 2022, General anxiety disorder',
        social: 'Occasional tea/coffee consumer, Desk professional',
        family: 'Mother: Osteoarthritis, No premature CAD'
      },
      scanned: false,
      status: 'waiting'
    },
    {
      token: 'CARD-206',
      name: 'Vikramjit Singh',
      age: 55,
      gender: 'Male',
      aadhaar_verified: true,
      phone: '+91 98450 11223',
      triage_level: 2,
      priority_tag: 'Priority 2 - Post-Stent Follow-up',
      chief_complaint: 'Follow-up 6 months post LAD Stenting. Reports good exercise tolerance without angina.',
      observed_symptoms: ['Mild exertional fatigue', 'Occasional calf stiffness'],
      vitals: {
        bp: '130/82 mmHg',
        bpStatus: 'Pre-hypertensive',
        hr: '68 bpm',
        hrStatus: 'Controlled',
        spo2: '98%',
        spo2Status: 'Normal',
        temp: '98.2 °F',
        tempStatus: 'Normal'
      },
      ai_assessment: 'Post-PCI stable patient on dual antiplatelet therapy. Review lipid profile and renal panel.',
      medical_history: {
        surgeries: 'PCI with DES to LAD (Nov 2025)',
        chronic: 'Type 2 Diabetes (HbA1c 6.9%), CAD',
        social: 'Ex-smoker (quit 2024)',
        family: 'Brother: CABG at age 58'
      },
      scanned: false,
      status: 'waiting'
    }
  ];

  const [patientsQueue, setPatientsQueue] = useState<PatientInQueue[]>(initialPatientsQueue);

  // WebSocket Live Connection to Turnstile Gateway
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWS = () => {
      const apiHost = window.location.hostname || 'localhost';
      const wsUrl = `ws://${apiHost}:8000/ws/queue/${staffInfo.hospital_id || 'hosp-001'}/${staffInfo.department_id || 'dept-cardio'}`;
      
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connectWS, 4000);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'scanned_turnstile' || data.status === 'at_door') {
              const scannedToken = data.token || data.token_id;
              setPatientsQueue(prev => prev.map(p => {
                if (p.token === scannedToken) {
                  return {
                    ...p,
                    scanned: true,
                    scanned_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    scanned_by: data.turnstile_name || 'Turnstile Gate B',
                    status: 'at_door'
                  };
                }
                return p;
              }));
              setLatestScanNotification({
                token: scannedToken,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              });
            }
          } catch (err) {
            console.error('WS parse error:', err);
          }
        };
      } catch (err) {
        setWsConnected(false);
      }
    };

    connectWS();
    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [staffInfo.hospital_id, staffInfo.department_id]);

  // Consultation Timer
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
    setPatientsQueue(prev => prev.filter(p => p.token !== currentPatient.token));
    setSelectedTokenId(null);
    setConsultCompleted(true);
    setDoctorNotes('');
    setConsultTimerSeconds(0);
  };

  const toggleLab = (lab: string) => {
    setSelectedLabs(prev => 
      prev.includes(lab) ? prev.filter(l => l !== lab) : [...prev, lab]
    );
  };

  const filteredQueue = patientsQueue.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.token.toLowerCase().includes(q) ||
      p.priority_tag.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#0F172A] text-[#F8FAFC] min-h-screen pb-32 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header Bar - 8pt Grid */}
      <header className="bg-[#1E293B] p-5 sm:p-6 rounded-xl border border-[#334155] shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <BackButton />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs bg-blue-900/60 text-blue-300 font-semibold px-2.5 py-0.5 rounded-md border border-blue-700/50 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                {staffInfo.roleTitle}
              </span>
              <span className="text-xs text-slate-400 font-normal flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-500" />
                {staffInfo.dept}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
              {staffInfo.name}
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-normal">
                AIIMS New Delhi
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${
                wsConnected 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                <span>{wsConnected ? 'Live Turnstile Feed' : 'Local Verification'}</span>
              </span>
            </h1>
          </div>
        </div>

        {/* Timer and Call Next actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-xs">
            <Timer className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Consultation Timer</span>
              <span className="text-sm font-semibold text-blue-300">{formatTimer(consultTimerSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNext}
              disabled={patientsQueue.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-4 py-3 rounded-xl text-xs transition-colors cursor-pointer min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Call Next Patient</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={patientsQueue.length === 0}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3.5 py-3 rounded-xl text-xs transition-colors border border-slate-700 min-h-[44px]"
            >
              <SkipForward className="w-4 h-4 text-slate-400" />
              <span>Skip</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Restrained KPI Row (8pt Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Waiting In Queue</span>
          <p className="text-2xl font-semibold text-white">{patientsQueue.length}</p>
          <p className="text-xs text-blue-400">Triaged for Room 204</p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Average Consult Duration</span>
          <p className="text-2xl font-semibold text-white">6.2 mins</p>
          <p className="text-xs text-slate-400">Target &lt; 8.0 mins</p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Treated Today</span>
          <p className="text-2xl font-semibold text-emerald-400">{recentHistory.length + 18}</p>
          <p className="text-xs text-slate-400">Completed consultations</p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">DPI Performance Bonus</span>
          <p className="text-2xl font-semibold text-blue-400">Tier 1</p>
          <p className="text-xs text-emerald-400">Turnstile verified</p>
        </div>
      </div>

      {/* 3. Main Workstation Layout - Asymmetrical (4 Cols Queue : 8 Cols Consultation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 4 Cols: Queue Rail */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Patient Queue ({patientsQueue.length})</span>
              </h2>
              <span className="text-xs text-slate-400">Room 204</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by token or patient name..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0F172A] border border-[#334155] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 min-h-[38px]"
              />
            </div>

            {/* Patient Cards in Queue */}
            <div className="space-y-2 pt-1 max-h-[600px] overflow-y-auto">
              {filteredQueue.map((patient) => {
                const isSelected = currentPatient?.token === patient.token;
                const isAtDoor = patient.status === 'at_door' || patient.scanned;

                return (
                  <button
                    key={patient.token}
                    type="button"
                    onClick={() => setSelectedTokenId(patient.token)}
                    className={`w-full p-3.5 rounded-lg border text-left transition-colors flex flex-col gap-2 min-h-[48px] ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/40 text-white'
                        : 'bg-[#0F172A] hover:bg-slate-800/80 border-[#334155] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono text-blue-400">
                        {patient.token}
                      </span>

                      {/* Clean flat status pill - NO pulsing strobe */}
                      {isAtDoor ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-semibold px-2 py-0.5 rounded text-[10px]">
                          AT DOOR (Gate B)
                        </span>
                      ) : (
                        <span className="bg-slate-700 text-slate-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                          WAITING
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">{patient.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {patient.age}Y • {patient.gender} • {patient.priority_tag}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Active Patient Consultation Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {currentPatient ? (
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] shadow-card p-6 space-y-6">
              
              {/* Patient Identity & Verification */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#334155]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold font-mono text-blue-400">
                      Token {currentPatient.token}
                    </span>
                    <span className="text-xs bg-emerald-950/60 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-700/50">
                      Aadhaar Verified
                    </span>
                    {currentPatient.status === 'at_door' && (
                      <span className="text-xs bg-amber-500 text-slate-950 font-semibold px-2 py-0.5 rounded">
                        AT DOOR • Turnstile Gate B
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    {currentPatient.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentPatient.age} Years • {currentPatient.gender} • Phone: {currentPatient.phone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 min-h-[40px]"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    <span>View Medical History</span>
                  </button>
                </div>
              </div>

              {/* Vitals Grid - Clean Data Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155] space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Blood Pressure</span>
                  <p className="text-base font-semibold text-white font-mono">{currentPatient.vitals.bp}</p>
                  <span className="text-[11px] text-amber-400 block">{currentPatient.vitals.bpStatus}</span>
                </div>

                <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155] space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Heart Rate</span>
                  <p className="text-base font-semibold text-white font-mono">{currentPatient.vitals.hr}</p>
                  <span className="text-[11px] text-slate-400 block">{currentPatient.vitals.hrStatus}</span>
                </div>

                <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155] space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Oxygen SpO2</span>
                  <p className="text-base font-semibold text-white font-mono">{currentPatient.vitals.spo2}</p>
                  <span className="text-[11px] text-emerald-400 block">{currentPatient.vitals.spo2Status}</span>
                </div>

                <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155] space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Temperature</span>
                  <p className="text-base font-semibold text-white font-mono">{currentPatient.vitals.temp}</p>
                  <span className="text-[11px] text-slate-400 block">{currentPatient.vitals.tempStatus}</span>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155] space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Reported Symptoms & Chief Complaint
                </span>
                <p className="text-sm text-slate-200 font-normal leading-relaxed">
                  {currentPatient.chief_complaint}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {currentPatient.observed_symptoms.map((sym, idx) => (
                    <span key={idx} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Doctor Clinical Notes / Diagnosis Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Clinical Diagnosis & Examination Notes
                </label>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Record clinical impressions, heart sounds S1/S2, murmurs, and management plan..."
                  className="w-full p-3.5 rounded-lg bg-[#0F172A] border border-[#334155] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Lab Investigations Pad */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Order Lab Investigations
                  </label>
                  <span className="text-xs text-slate-400">Selected: {selectedLabs.length}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {labOptions.map((lab) => {
                    const isChecked = selectedLabs.includes(lab);
                    return (
                      <button
                        key={lab}
                        type="button"
                        onClick={() => toggleLab(lab)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-colors min-h-[44px] flex items-center justify-between ${
                          isChecked
                            ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                            : 'bg-[#0F172A] border-[#334155] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{lab}</span>
                        {isChecked && <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar - Standard 48px touch targets */}
              <div className="pt-4 border-t border-[#334155] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReferralSent(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-3 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 min-h-[48px]"
                  >
                    <Send className="w-4 h-4 text-slate-400" />
                    <span>{referralSent ? 'Referral Sent' : 'Refer to Specialist'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-subtle transition-colors flex items-center gap-2 min-h-[48px] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation & Release Token</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-12 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-base font-semibold text-white">All patients in Room 204 queue have been seen</p>
              <p className="text-xs text-slate-400">New arrivals will appear automatically as they scan at Turnstile Gate B.</p>
            </div>
          )}

          {/* Recent History Table */}
          <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 shadow-subtle space-y-4">
            <h3 className="text-sm font-semibold text-white">Consultations Completed Today</h3>
            <div className="space-y-2">
              {recentHistory.map((rec) => (
                <div key={rec.id} className="p-3 bg-[#0F172A] rounded-lg border border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-semibold text-blue-400 mr-2">{rec.token}</span>
                    <strong className="text-white">{rec.name}</strong>
                    <span className="text-slate-400 ml-2">({rec.age}Y • {rec.gender})</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{rec.diagnosis}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">{rec.time}</span>
                    <p className="text-emerald-400 text-[11px]">{rec.rxSummary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* History Modal */}
      {showHistoryModal && currentPatient && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <h3 className="text-base font-semibold text-white">Medical History • {currentPatient.name}</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Chronic Conditions:</span>
                <p className="text-slate-200 mt-0.5">{currentPatient.medical_history.chronic}</p>
              </div>
              <div className="pt-2 border-t border-[#334155]">
                <span className="text-slate-400 block font-semibold">Prior Surgeries:</span>
                <p className="text-slate-200 mt-0.5">{currentPatient.medical_history.surgeries}</p>
              </div>
              <div className="pt-2 border-t border-[#334155]">
                <span className="text-slate-400 block font-semibold">Family History:</span>
                <p className="text-slate-200 mt-0.5">{currentPatient.medical_history.family}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#334155] flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold min-h-[36px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
