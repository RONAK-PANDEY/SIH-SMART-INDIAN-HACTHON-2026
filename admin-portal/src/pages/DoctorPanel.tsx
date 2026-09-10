import React, { useState, useEffect } from 'react';
import { API_V1_URL, websocketUrl } from '../lib/api';
import { 
  User,
  Users,
  CheckCircle2, 
  Play, 
  SkipForward, 
  Stethoscope, 
  Clock, 
  Building2, 
  ArrowRight,
  Send,
  Timer,
  Heart,
  Thermometer,
  Activity,
  Wind,
  Search,
  CheckCircle,
  X,
  History
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
    roleTitle: 'Senior Cardiologist',
    dept: 'Cardiology (Chamber 204)',
    hospital_id: 'hosp-001',
    department_id: 'dept-cardio'
  });

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [selectedLabs, setSelectedLabs] = useState<string[]>(['12-Lead Rest ECG']);
  const [searchQuery, setSearchQuery] = useState('');
  const [consultTimerSeconds, setConsultTimerSeconds] = useState(245);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
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
      diagnosis: 'Stable Angina Pectoris',
      rxSummary: 'Tab Sorbitrate 5mg'
    },
    {
      id: 'TP-2',
      token: 'CARD-202',
      name: 'Meena Devi Kumari',
      age: 58,
      gender: 'Female',
      department: 'Cardiology',
      time: '10:31 AM',
      diagnosis: 'Hypertension Stage 2',
      rxSummary: 'Tab Telmisartan 40mg'
    }
  ]);

  const labOptions = [
    '12-Lead Rest ECG',
    'Cardiac Troponin I & T',
    'Comprehensive Lipid Profile',
    'Complete Blood Count (CBC)',
    '2D Echocardiography',
    'Chest X-Ray (PA View)'
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
      priority_tag: 'Priority 2 • Senior Citizen',
      chief_complaint: 'Crushing chest tightness radiating to left shoulder on fast walking',
      observed_symptoms: ['Chest Tightness', 'Breathlessness on stairs', 'Sweating episodes'],
      vitals: {
        bp: '148/92',
        bpStatus: 'Elevated Stage 1',
        hr: '88 bpm',
        hrStatus: 'Regular',
        spo2: '97%',
        spo2Status: 'Normal',
        temp: '98.4 °F',
        tempStatus: 'Normal'
      },
      ai_assessment: 'Exertional angina in senior patient. 12-lead ECG and Troponin advised.',
      medical_history: {
        surgeries: 'Appendectomy (1998)',
        chronic: 'Hypertension (12 yrs on Telmisartan)',
        social: 'Non-smoker',
        family: 'Father: MI at 64 yrs'
      },
      scanned: true,
      scanned_at: '10:48 AM',
      scanned_by: 'Turnstile Gate B',
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
      priority_tag: 'Priority 3 • Routine Follow-up',
      chief_complaint: 'Routine review for murmur and evening palpitations',
      observed_symptoms: ['Palpitations', 'Mild lightheadedness'],
      vitals: {
        bp: '122/78',
        bpStatus: 'Normal',
        hr: '76 bpm',
        hrStatus: 'Optimal',
        spo2: '99%',
        spo2Status: 'Optimal',
        temp: '98.6 °F',
        tempStatus: 'Normal'
      },
      ai_assessment: 'Stable MVP follow-up.',
      medical_history: {
        surgeries: 'None',
        chronic: 'Mild MVP (2022)',
        social: 'Coffee drinker',
        family: 'None'
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
      priority_tag: 'Priority 2 • Post-Stent',
      chief_complaint: 'Routine follow-up 6 months post LAD stenting. Asymptomatic.',
      observed_symptoms: ['Mild fatigue'],
      vitals: {
        bp: '130/82',
        bpStatus: 'Controlled',
        hr: '68 bpm',
        hrStatus: 'Normal',
        spo2: '98%',
        spo2Status: 'Normal',
        temp: '98.2 °F',
        tempStatus: 'Normal'
      },
      ai_assessment: 'Post-PCI stable patient on DAPT.',
      medical_history: {
        surgeries: 'PCI to LAD (Nov 2025)',
        chronic: 'Diabetes Type 2',
        social: 'Ex-smoker',
        family: 'Brother: CAD'
      },
      scanned: false,
      status: 'waiting'
    }
  ];

  const [patientsQueue, setPatientsQueue] = useState<PatientInQueue[]>(initialPatientsQueue);

  // WebSocket Live Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWS = () => {
      const wsUrl = websocketUrl(`/api/v1/ws/queue/${staffInfo.hospital_id || 'hosp-001'}/${staffInfo.department_id || 'dept-cardio'}`);
      
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
    setConsultTimerSeconds(0);
  };

  const handleComplete = async () => {
    if (!currentPatient) return;
    const tokenToComplete = currentPatient.token;
    try {
      await fetch(`${API_V1_URL}/tokens/${encodeURIComponent(tokenToComplete)}/complete`, {
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
      diagnosis: doctorNotes.trim() ? doctorNotes.split('\n')[0].substring(0, 70) : 'Clinical Consultation Completed',
      rxSummary: selectedLabs.length > 0 ? `Labs: ${selectedLabs.join(', ')}` : 'Standard Rx'
    };

    setRecentHistory(prev => [newTreated, ...prev.slice(0, 5)]);
    setPatientsQueue(prev => prev.filter(p => p.token !== currentPatient.token));
    setSelectedTokenId(null);
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
      p.token.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 pb-24 font-sans max-w-7xl mx-auto">
      
      {/* 1. Header Bar with Massive Action Buttons */}
      <header className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                {staffInfo.name}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                wsConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                {wsConnected ? 'Gate Live' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              AIIMS New Delhi • Cardiology Chamber 204
            </p>
          </div>
        </div>

        {/* Timer & Gigantic Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold font-mono text-slate-900">{formatTimer(consultTimerSeconds)}</span>
          </div>

          {/* Massive 60px tactile green button: CALL NEXT PATIENT */}
          <button
            type="button"
            onClick={handleNext}
            disabled={patientsQueue.length === 0}
            className="flex-1 sm:flex-none btn-tactile-green font-semibold text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 min-h-[56px] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Call Next Patient</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={patientsQueue.length === 0}
            className="btn-tactile-slate font-semibold text-sm px-4 py-3.5 rounded-xl flex items-center justify-center gap-1.5 min-h-[56px] cursor-pointer"
            title="Skip to next patient"
          >
            <SkipForward className="w-5 h-5 text-slate-500" />
            <span>Skip</span>
          </button>
        </div>
      </header>

      {/* 2. Single-Screen Flat Layout (Queue Left : Consultation Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 4 Cols: Queue Rail */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Patient Queue</span>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                {patientsQueue.length} Waiting
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient or token..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 min-h-[44px]"
              />
            </div>

            {/* Queue Cards with Gigantic Visual Status Lights */}
            <div className="space-y-3 pt-1">
              {filteredQueue.map((patient) => {
                const isSelected = currentPatient?.token === patient.token;
                const isAtDoor = patient.status === 'at_door' || patient.scanned;

                return (
                  <button
                    key={patient.token}
                    type="button"
                    onClick={() => setSelectedTokenId(patient.token)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-2 min-h-[64px] ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold font-mono text-blue-700">
                        {patient.token}
                      </span>

                      {/* Gigantic visual status light */}
                      {isAtDoor ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-semibold px-2.5 py-1 rounded-lg text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                          AT DOOR
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                          WAITING
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-base font-semibold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {patient.age} Y • {patient.gender} • {patient.priority_tag}
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
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Patient Identity & Arrival Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b-2 border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      Token {currentPatient.token}
                    </span>
                    {currentPatient.status === 'at_door' && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Turnstile Gate B Verified
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                    {currentPatient.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {currentPatient.age} Years • {currentPatient.gender} • Phone: {currentPatient.phone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-200">
                    Aadhaar Linked
                  </span>
                </div>
              </div>

              {/* 4 Massive Visual Vitals Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase block font-semibold">Blood Pressure</span>
                  <p className="text-xl font-semibold text-slate-900 font-mono">{currentPatient.vitals.bp}</p>
                  <span className="text-xs text-amber-700 font-medium block">{currentPatient.vitals.bpStatus}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase block font-semibold">Heart Rate</span>
                  <p className="text-xl font-semibold text-slate-900 font-mono">{currentPatient.vitals.hr}</p>
                  <span className="text-xs text-slate-500 font-medium block">{currentPatient.vitals.hrStatus}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase block font-semibold">Oxygen SpO2</span>
                  <p className="text-xl font-semibold text-emerald-700 font-mono">{currentPatient.vitals.spo2}</p>
                  <span className="text-xs text-emerald-700 font-medium block">{currentPatient.vitals.spo2Status}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase block font-semibold">Temperature</span>
                  <p className="text-xl font-semibold text-slate-900 font-mono">{currentPatient.vitals.temp}</p>
                  <span className="text-xs text-slate-500 font-medium block">{currentPatient.vitals.tempStatus}</span>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="bg-blue-50/50 rounded-xl p-4 border-2 border-blue-100 space-y-2">
                <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide block">
                  Reported Symptoms
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {currentPatient.chief_complaint}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentPatient.observed_symptoms.map((sym, idx) => (
                    <span key={idx} className="text-xs bg-white text-slate-800 px-3 py-1 rounded-lg border border-slate-200 font-medium shadow-xs">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Doctor Clinical Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-900 uppercase tracking-wide block">
                  Doctor Diagnosis & Prescription Notes
                </label>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Type clinical diagnosis, medications prescribed, or dietary advice..."
                  className="w-full p-4 rounded-xl border-2 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Lab Investigations Pad - 48px Touch Targets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-900 uppercase tracking-wide block">
                  Order Diagnostic Lab Tests
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {labOptions.map((lab) => {
                    const isChecked = selectedLabs.includes(lab);
                    return (
                      <button
                        key={lab}
                        type="button"
                        onClick={() => toggleLab(lab)}
                        className={`p-3 rounded-xl border-2 text-left text-xs font-semibold transition-all min-h-[48px] flex items-center justify-between ${
                          isChecked
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{lab}</span>
                        {isChecked && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Giant 64px Tactile Action Button: Complete & Release */}
              <div className="pt-4 border-t-2 border-slate-100 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleComplete}
                  className="w-full sm:w-auto btn-tactile-green font-semibold text-base px-8 py-4 rounded-xl flex items-center justify-center gap-2 min-h-[64px] cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Complete Consultation & Release Token</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-lg font-semibold text-slate-900">All patients in queue have been treated</p>
              <p className="text-xs text-slate-500">New arrivals will appear here when they scan at Turnstile Gate B.</p>
            </div>
          )}

          {/* Recent Completed History */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Consultations Completed Today</h3>
            <div className="space-y-2">
              {recentHistory.map((rec) => (
                <div key={rec.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-semibold text-blue-700 mr-2">{rec.token}</span>
                    <strong className="text-slate-900">{rec.name}</strong>
                    <span className="text-slate-500 ml-2">({rec.age}Y • {rec.gender})</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{rec.diagnosis}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">{rec.time}</span>
                    <p className="text-emerald-700 font-semibold text-[11px]">{rec.rxSummary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
