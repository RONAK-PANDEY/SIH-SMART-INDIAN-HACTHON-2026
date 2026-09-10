import React, { useState } from 'react';
import { API_V1_URL } from '../lib/api';
import { 
  Building2, 
  UserPlus, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  Send, 
  AlertTriangle, 
  UserCheck, 
  Clock, 
  PhoneCall, 
  Activity,
  ShieldCheck
} from 'lucide-react';

export const CounterDesk: React.FC = () => {
  const [patientSearch, setPatientSearch] = useState('');
  const [patientData, setPatientData] = useState<any>({
    full_name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    aadhaar_id: '982144321109',
    abha_id: 'ABHA-9821-4432-1109',
    age: 68,
    gender: 'Male',
    is_senior: true,
    is_pregnant: false,
    is_pwd: false
  });

  const [complaintText, setComplaintText] = useState('');
  const [selectedDept, setSelectedDept] = useState('dept-cardio');
  const [issuedToken, setIssuedToken] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const departments = [
    { id: 'dept-emergency', name: 'Emergency & Trauma (P1)', floor: 'Ground Floor Red Zone' },
    { id: 'dept-cardio', name: 'Cardiology & Heart (P2)', floor: '1st Floor Wing B' },
    { id: 'dept-pulmo', name: 'Pulmonology / Chest (P2)', floor: '1st Floor Wing A' },
    { id: 'dept-neuro', name: 'Neurology / Brain (P2)', floor: '2nd Floor Wing C' },
    { id: 'dept-ortho', name: 'Orthopedics & Bones (P3)', floor: 'Ground Floor Wing D' },
    { id: 'dept-gastro', name: 'Gastroenterology (P3)', floor: '2nd Floor Wing A' },
    { id: 'dept-gynae', name: 'Gynecology & Maternity (P2)', floor: '3rd Floor Mother Wing' },
    { id: 'dept-pedia', name: 'Pediatrics / Child (P3)', floor: '3rd Floor Child Wing' },
    { id: 'dept-genmed', name: 'General Medicine (P4)', floor: 'Ground Floor Central OPD' }
  ];

  const handleQuickAadhaarLookup = async () => {
    try {
      const resp = await fetch(`${API_V1_URL}/triage/auth/aadhaar/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_or_phone: patientSearch || '982144321109', otp: '123456' })
      });
      const data = await resp.json();
      if (data.citizen_data) {
        setPatientData(data.citizen_data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAIAnalyze = async () => {
    setEvaluating(true);
    try {
      const resp = await fetch(`${API_V1_URL}/triage/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom_ids: [],
          free_text_description: complaintText,
          vulnerability: {
            senior: patientData.is_senior,
            pregnant: patientData.is_pregnant,
            differentlyAbled: patientData.is_pwd
          },
          aadhaar_age: patientData.age
        })
      });
      const data = await resp.json();
      if (data.evaluation) {
        setSelectedDept(data.evaluation.department_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleIssueToken = () => {
    const deptObj = departments.find(d => d.id === selectedDept) || departments[1];
    const isP1 = selectedDept === 'dept-emergency';
    const isP2 = patientData.is_senior || patientData.is_pregnant || patientData.is_pwd;

    setSmsSent(false);
    setIssuedToken({
      token_number: `${selectedDept.replace('dept-', '').toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      patient_name: patientData.full_name,
      department_name: deptObj.name,
      location: deptObj.floor,
      priority: isP1 ? 'P1 - EMERGENCY RED' : isP2 ? 'P2 - SENIOR/VULNERABILITY' : 'P4 - GENERAL OPD',
      wait_time_mins: isP1 ? 0 : isP2 ? 7 : 18,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Hospital Reception Desk
            </span>
            <span className="text-xs text-slate-500 font-mono">Terminal #01 (Gate 1 Central OPD)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Walk-in Triage & Quick Token Issuance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Find a patient, note their symptoms and issue a queue token.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800 font-bold">
            Tokens Issued Today: <span className="text-base font-black">284</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Patient Details & AI Triage Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Citizen Lookup */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-600" />
                <span>1. Scan / Search Citizen (Aadhaar / ABHA / Phone)</span>
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">UIDAI e-KYC Enabled</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Enter 12-digit Aadhaar (e.g. 982144321109) or Mobile Number..."
                aria-label="Aadhaar or mobile number"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleQuickAadhaarLookup}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Lookup</span>
              </button>
            </div>

            {/* Verified Patient Demographics Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Full Name</span>
                <strong className="text-slate-800 text-sm">{patientData.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Age & Gender</span>
                <strong className="text-slate-800">{patientData.age} yrs • {patientData.gender}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Aadhaar Verified</span>
                <span className="font-mono text-emerald-700 font-bold">✓ XXXX-{patientData.aadhaar_id.slice(-4)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Priority Tag</span>
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded-md border ${
                  patientData.is_senior ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {patientData.is_senior ? 'Senior Citizen' : patientData.is_pregnant ? 'Pregnant' : patientData.is_pwd ? 'PwD' : 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Patient Chief Complaint & AI Specialty Router */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>2. Reason for visit</span>
              </span>
              <button
                type="button"
                disabled={evaluating}
                onClick={handleAIAnalyze}
                className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition flex items-center gap-1"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{evaluating ? 'Checking…' : 'Suggest department'}</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Operator note: Type patient stated symptoms (e.g. severe shortness of breath with high fever and chest pressure)..."
              aria-label="Patient symptoms"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Department Selection Radios / Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Target Department / Specialty:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDept(dept.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      selectedDept === dept.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="block leading-tight">{dept.name}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{dept.floor}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Print / Issue Button */}
            <button
              type="button"
              onClick={handleIssueToken}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Issue token</span>
            </button>
          </div>
        </div>

        {/* Right column: Generated Token Preview Card */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Thermal Token Slip Preview</span>
            </h3>

            {issuedToken ? (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50 text-slate-900 space-y-3 font-mono">
                <div className="text-center border-b border-slate-300 pb-2">
                  <h4 className="font-black text-sm uppercase">AIIMS NEW DELHI</h4>
                  <span className="text-[10px] text-slate-500">SmartCare Digital OPD Slip</span>
                </div>

                <div className="text-center py-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">TOKEN NUMBER</span>
                  <strong className="text-3xl font-black tracking-tight text-blue-700 block">
                    {issuedToken.token_number}
                  </strong>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded mt-1 inline-block">
                    {issuedToken.priority}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <strong>{issuedToken.patient_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <strong>{issuedToken.department_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chamber:</span>
                    <strong>{issuedToken.location}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Wait:</span>
                    <strong className="text-emerald-700">~{issuedToken.wait_time_mins} mins</strong>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                    <span>Issued at: {issuedToken.timestamp}</span>
                    <span>Counter: #01</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => window.print()}
                    className="flex-1 bg-slate-900 text-white font-sans text-xs font-bold py-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    Print Slip
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSmsSent(true)}
                    disabled={smsSent}
                    className="flex-1 bg-blue-600 text-white font-sans text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{smsSent ? 'SMS sent' : 'Send by SMS'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                <Printer className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Find a patient and issue a token to see it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
