import React, { useState } from 'react';
import { MessageSquare, ShieldAlert, CheckCircle2, Clock, Check, Search } from 'lucide-react';

interface GrievanceItem {
  id: string;
  hospital: string;
  department: string;
  issue: string;
  description: string;
  status: 'Under Investigation' | 'Resolved' | 'Pending Review';
  patient: string;
  date: string;
  verified: boolean;
}

const INITIAL_GRIEVANCES: GrievanceItem[] = [
  {
    id: 'GRV-2041',
    hospital: 'AIIMS New Delhi',
    department: 'Cardiology',
    issue: 'Excessive waiting time reported',
    description: 'Patient waited 48 minutes past scheduled OPD consultation window without status updates.',
    status: 'Under Investigation',
    patient: 'Suresh Patel',
    date: 'Today, 10:15 AM',
    verified: true
  },
  {
    id: 'GRV-2042',
    hospital: 'Safdarjung Hospital',
    department: 'Pediatrics',
    issue: 'Turnstile check-in delay',
    description: 'Scanning gate #02 experienced a temporary hardware queue backup.',
    status: 'Pending Review',
    patient: 'Ananya Deshmukh',
    date: 'Today, 09:30 AM',
    verified: true
  },
  {
    id: 'GRV-2038',
    hospital: 'RML Hospital',
    department: 'Orthopedics',
    issue: 'Consultation room delay',
    description: 'Doctor was delayed by emergency ward call. Notice was broadcasted.',
    status: 'Resolved',
    patient: 'Rahul Sharma',
    date: 'Yesterday',
    verified: true
  }
];

export const Grievances: React.FC = () => {
  const [grievances, setGrievances] = useState<GrievanceItem[]>(INITIAL_GRIEVANCES);
  const [selectedCase, setSelectedCase] = useState<GrievanceItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const updateCaseStatus = (id: string, newStatus: 'Under Investigation' | 'Resolved' | 'Pending Review') => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="p-8 bg-slate-50 text-slate-900 min-h-screen font-sans space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Citizen Feedback & Grievances</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Verified patient feedback and grievance investigation workflow.
          </p>
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toast}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Case List */}
        <div className={selectedCase ? 'lg:col-span-6 space-y-4' : 'lg:col-span-12 space-y-4'}>
          {grievances.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedCase(item)}
              className={`p-6 rounded-3xl border transition cursor-pointer shadow-xs relative overflow-hidden ${
                selectedCase?.id === item.id
                  ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/40'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-bold text-amber-700 font-mono">{item.id}</span>
                  <h3 className="font-bold text-slate-900 text-base mt-0.5">{item.hospital} • {item.department}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  item.status === 'Under Investigation'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : item.status === 'Resolved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {item.status}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800 mb-2">"{item.issue}"</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Patient: <strong className="text-slate-800">{item.patient}</strong> ({item.date})</span>
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-xl transition text-xs border border-slate-200 cursor-pointer">
                  Review Case →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Case Investigation Drawer */}
        {selectedCase && (
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-7 space-y-6 shadow-xl relative animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold">
                  Grievance Review Case
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedCase.id}</h2>
                <p className="text-slate-500 text-xs font-semibold">{selectedCase.hospital} • {selectedCase.department}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-500 hover:text-slate-900 font-bold text-xs bg-slate-100 px-3 py-1 rounded-xl cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500 block font-medium">Issue Description</span>
              <p className="text-slate-900 font-bold text-sm">"{selectedCase.issue}"</p>
              <p className="text-slate-600 leading-relaxed mt-1">{selectedCase.description}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Case Workflow Action</h4>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    updateCaseStatus(selectedCase.id, 'Under Investigation');
                    showToast(`Case ${selectedCase.id} marked Under Statutory Investigation`);
                  }}
                  className="w-full bg-amber-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl hover:bg-amber-300 transition text-sm cursor-pointer shadow-xs"
                >
                  Initiate Formal Investigation
                </button>

                <button
                  onClick={() => {
                    updateCaseStatus(selectedCase.id, 'Resolved');
                    showToast(`Case ${selectedCase.id} resolved and recorded in DRI logs`);
                  }}
                  className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-3 px-4 rounded-2xl hover:bg-emerald-100 transition text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mark Case Resolved
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
