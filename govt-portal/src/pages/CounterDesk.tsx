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
  ShieldCheck,
  CreditCard
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
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Hospital Reception Desk
            </span>
            <span className="text-xs text-slate-400 font-mono">Terminal #01 (Central OPD Helpdesk)</span>
          </div>
          <h1 className="text-2xl font-black text-white">Walk-in Triage & Rapid Token Issuance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Find a patient, note their symptoms and issue a queue token.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-2xl text-xs text-emerald-300 font-bold">
            Tokens Issued Today: <span className="text-lg font-black text-emerald-400">284</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 columns: Patient Details & AI Triage Input */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Citizen Lookup */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-400" />
                <span>1. Scan / Search Citizen (Aadhaar / ABHA / Phone)</span>
              </span>
              <span className="text-[11px] text-blue-400 font-semibold">UIDAI e-KYC Enabled</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Enter 12-digit Aadhaar (e.g. 982144321109) or Mobile Number..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleQuickAadhaarLookup}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Lookup</span>
              </button>
            </div>

            {/* Verified Patient Demographics Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Full Name</span>
                <strong className="text-white text-sm">{patientData.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Age & Gender</span>
                <strong className="text-slate-200">{patientData.age} yrs • {patientData.gender}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Aadhaar Verified</span>
                <span className="font-mono text-emerald-400 font-bold">✓ XXXX-{patientData.aadhaar_id.slice(-4)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Priority Tag</span>
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded-md border inline-block mt-0.5 ${
                  patientData.is_senior ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {patientData.is_senior ? 'Senior Citizen' : patientData.is_pregnant ? 'Pregnant' : patientData.is_pwd ? 'PwD' : 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Patient Chief Complaint & AI Specialty Router */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>2. Reason for visit</span>
              </span>
              <button
                type="button"
                disabled={evaluating}
                onClick={handleAIAnalyze}
                className="text-[11px] bg-amber-500/10 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
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
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {/* Department Selection Radios */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Department / Specialty:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDept(dept.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                      selectedDept === dept.id
                        ? 'border-blue-500 bg-blue-500/20 text-white font-bold shadow-md ring-1 ring-blue-400'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <span className="block leading-tight text-white">{dept.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">{dept.floor}</span>
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

        {/* Right 4 columns: Generated Token Preview Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Thermal Token Slip Preview</span>
            </h3>

            {issuedToken ? (
              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-5 bg-slate-950 text-white space-y-3 font-mono">
                <div className="text-center border-b border-slate-800 pb-2">
                  <h4 className="font-black text-sm uppercase text-amber-400">AIIMS NEW DELHI</h4>
                  <span className="text-[10px] text-slate-400">SmartCare Digital OPD Slip</span>
                </div>

                <div className="text-center py-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">TOKEN NUMBER</span>
                  <strong className="text-3xl font-black tracking-tight text-blue-400 block">
                    {issuedToken.token_number}
                  </strong>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded mt-1 inline-block border border-amber-500/30">
                    {issuedToken.priority}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <strong className="text-white">{issuedToken.patient_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <strong className="text-white">{issuedToken.department_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chamber:</span>
                    <strong className="text-white">{issuedToken.location}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Wait:</span>
                    <strong className="text-emerald-400">~{issuedToken.wait_time_mins} mins</strong>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800 font-mono">
                    <span>Issued: {issuedToken.timestamp}</span>
                    <span>Counter: #01</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2 font-sans">
                  <button 
                    type="button" 
                    onClick={() => window.print()}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Print Slip
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSmsSent(true)}
                    disabled={smsSent}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{smsSent ? 'SMS sent' : 'Send by SMS'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 space-y-2">
                <Printer className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Find a patient and issue a token to see it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
