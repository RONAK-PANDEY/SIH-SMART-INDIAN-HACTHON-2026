import React from 'react';
import { Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HOSPITALS_NETWORK = [
  { id: 'hosp-001', name: 'AIIMS New Delhi', connected: true, activeDepts: 8, activeQueues: 12, compliance: '98%' },
  { id: 'hosp-002', name: 'Safdarjung Hospital', connected: true, activeDepts: 6, activeQueues: 10, compliance: '96%' },
  { id: 'hosp-003', name: 'RML Hospital', connected: true, activeDepts: 5, activeQueues: 6, compliance: '94%' },
];

export const HospitalList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-slate-50 text-slate-900 min-h-screen font-sans space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Network Compliance</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Central monitoring of connected central hospitals, active OPD departments, and network compliance.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HOSPITALS_NETWORK.map((h) => (
          <div key={h.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-900 text-xl">{h.name}</h3>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Connected
              </span>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Active Departments</span>
                <strong className="text-slate-900 font-mono">{h.activeDepts}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Queues</span>
                <strong className="text-amber-700 font-mono">{h.activeQueues}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Network Compliance</span>
                <strong className="text-emerald-700 font-mono">{h.compliance}</strong>
              </div>
            </div>

            <button
              onClick={() => navigate(`/hospital/${h.id}`)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-2xl transition text-xs border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
            >
              View Hospital <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
