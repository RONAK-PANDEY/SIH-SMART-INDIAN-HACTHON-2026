import React, { useState, useEffect } from 'react';
import { 
  User, 
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
  Plus
} from 'lucide-react';

export const DoctorPanel: React.FC = () => {
  const [staffInfo, setStaffInfo] = useState<any>({
    name: 'Dr. Rajesh Sharma',
    roleTitle: 'Senior Cardiologist & HOD',
    dept: 'Cardiology (Chamber 204)'
  });

  const [queueIndex, setQueueIndex] = useState(0);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [referralSent, setReferralSent] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedLabs, setSelectedLabs] = useState<string[]>(['12-Lead ECG']);
  const [consultCompleted, setConsultCompleted] = useState(false);

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

  const patientsQueue = [
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
      vitals: 'BP 148/92 mmHg, HR 88 bpm, SpO2 97%, Temp 98.4°F',
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
      vitals: 'BP 168/104 mmHg, HR 112 bpm, SpO2 92%, Temp 99.1°F',
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
      vitals: 'BP 118/76 mmHg, HR 84 bpm, SpO2 99%, Temp 98.6°F',
      ai_assessment: 'Maternal Care Priority Protocol: Monitor maternal hemodynamic response.',
      medical_history: {
        surgeries: 'None',
        chronic: 'Mild Gestational Anemia (Hb 10.2)',
        social: 'Non-smoker, Vegetarian diet',
        family: 'No known hereditary cardiovascular disease'
      }
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('smartcare_staff');
    if (saved) {
      try {
        setStaffInfo(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const currentPatient = patientsQueue[queueIndex % patientsQueue.length];

  const handleNext = () => {
    setQueueIndex(prev => prev + 1);
    setDoctorNotes('');
    setReferralSent(false);
    setConsultCompleted(false);
  };

  const handleComplete = () => {
    setConsultCompleted(true);
    setTimeout(() => {
      handleNext();
    }, 1200);
  };

  const toggleLab = (lab: string) => {
    setSelectedLabs(prev =>
      prev.includes(lab) ? prev.filter(l => l !== lab) : [...prev, lab]
    );
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen pb-32">
      {/* Top Clinical Header */}
      <header className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              {staffInfo.roleTitle}
            </span>
            <span className="text-xs text-slate-500 font-medium">{staffInfo.dept}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">{staffInfo.name} • Live Consultation Console</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Call Next Patient</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
            <span>Skip / No-Show</span>
          </button>
        </div>
      </header>

      {consultCompleted && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Consultation Completed! Prescription and Lab orders dispatched to Hospital Pharmacy & Patient Portal.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Patient Detail */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Currently Consulting</span>
                <h3 className="text-4xl font-black text-blue-700 mt-0.5">{currentPatient.token}</h3>
              </div>
              <div className="text-left sm:text-right">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${
                  currentPatient.triage_level === 1
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : currentPatient.triage_level === 2
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {currentPatient.priority_tag}
                </span>
                <span className="text-xs text-slate-500 block mt-1">Chamber: <strong>Room 204</strong></span>
              </div>
            </div>

            {/* Patient Demographics & Medical History Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Patient Name</span>
                  <strong className="text-slate-900 text-sm">{currentPatient.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Age & Gender</span>
                  <strong className="text-slate-900">{currentPatient.age} Yrs • {currentPatient.gender}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <strong className="text-slate-900">{currentPatient.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Aadhaar KYC</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  <strong>Known Chronic:</strong> {currentPatient.medical_history.chronic}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Full Medical History</span>
                </button>
              </div>
            </div>

            {/* AI Triage & Chief Complaint */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Patient Self-Reported Complaint (Free-Text Narrative)
                </label>
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs text-slate-900 font-medium">
                  "{currentPatient.chief_complaint}"
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  AI Intake Assessment & Vitals
                </label>
                <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-xs font-mono space-y-1">
                  <div><strong>Observed Symptoms:</strong> {currentPatient.observed_symptoms.join(', ')}</div>
                  <div><strong>Nurse Vitals:</strong> {currentPatient.vitals}</div>
                  <div className="text-amber-300 pt-1 border-t border-slate-800">
                    <strong>AI Clinical Summary:</strong> {currentPatient.ai_assessment}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Prescription & Clinical Orders */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Doctor Diagnosis, Notes & Prescription
                </label>
                <button
                  type="button"
                  onClick={() => setShowLabModal(true)}
                  className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Order Lab Tests ({selectedLabs.length})</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Type clinical assessment, medications (e.g. Tab Sorbitrate 5mg SL SOS, Tab Atorvastatin 40mg HS), and lifestyle advice..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReferralSent(!referralSent)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{referralSent ? '✓ Referred to Safdarjung' : 'Refer Patient'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Rx</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Consultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Chamber Queue */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Chamber 204 Queue</h3>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-md">
                {patientsQueue.length - 1} Waiting
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs space-y-1">
              {patientsQueue.map((p, idx) => {
                const isCurrent = idx === (queueIndex % patientsQueue.length);
                return (
                  <div
                    key={p.token}
                    className={`py-3 px-3 rounded-2xl transition flex items-center justify-between ${
                      isCurrent ? 'bg-blue-50 font-semibold border border-blue-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{p.token}</strong>
                        {isCurrent && <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded">NOW</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.name} ({p.age}y, {p.gender})</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        p.triage_level === 1
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : p.triage_level === 2
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {p.priority_tag.split(' - ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Medical History Inspector Modal */}
      {showHistoryModal && (
        <div 
          onClick={() => setShowHistoryModal(false)}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Complete Patient Medical History</h3>
                <span className="text-xs text-slate-500">{currentPatient.name} ({currentPatient.age}y)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-bold uppercase">1. Past Surgeries / Hospitalizations</span>
                <strong className="text-slate-800">{currentPatient.medical_history.surgeries}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-bold uppercase">2. Current Active Chronic Conditions</span>
                <strong className="text-slate-800">{currentPatient.medical_history.chronic}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-bold uppercase">3. Social & Lifestyle History</span>
                <strong className="text-slate-800">{currentPatient.medical_history.social}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-bold uppercase">4. Family Genetic History</span>
                <strong className="text-slate-800">{currentPatient.medical_history.family}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-xs"
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
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Order Diagnostic Tests</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLabModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {labOptions.map((lab) => {
                const isChecked = selectedLabs.includes(lab);
                return (
                  <button
                    key={lab}
                    type="button"
                    onClick={() => toggleLab(lab)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                      isChecked ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{lab}</span>
                    {isChecked && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowLabModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
            >
              Confirm {selectedLabs.length} Diagnostic Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
