import React from 'react';
import { Building2, Users, Clock, Activity, ShieldCheck, ArrowLeft } from 'lucide-react';

export const HospitalDetail: React.FC = () => {
  const departments = [
    { name: 'Cardiology OPD', waiting: 42, avgWait: '24m', doctors: 6, status: 'High' },
    { name: 'General Medicine', waiting: 88, avgWait: '35m', doctors: 10, status: 'Critical' },
    { name: 'Pediatrics OPD', waiting: 18, avgWait: '12m', doctors: 4, status: 'Normal' },
    { name: 'Orthopedics OPD', waiting: 25, avgWait: '18m', doctors: 5, status: 'Normal' },
    { name: 'Neurology OPD', waiting: 14, avgWait: '15m', doctors: 3, status: 'Normal' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      <header className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <a href="/hospitals" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Hospital Network
            </a>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">Facility ID: HOSP-001</span>
          </div>
          <h1 className="text-2xl font-black text-white">AIIMS New Delhi - Department Telemetry</h1>
          <p className="text-xs text-slate-400 mt-0.5">Ansari Nagar, New Delhi • Apex Super-Speciality Hospital</p>
        </div>
        <div>
          <span className="px-3.5 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold">
            Load: 88% (Overburdened)
          </span>
        </div>
      </header>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-extrabold text-white text-sm">OPD Department Capacities & Real-time Telemetry</h3>
          <span className="text-xs text-slate-400 font-mono">Auto-refreshed via WebSocket Sentinel</span>
        </div>

        <div className="divide-y divide-slate-800">
          {departments.map((d) => (
            <div key={d.name} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-850/50 transition">
              <div>
                <h4 className="font-bold text-sm text-white">{d.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{d.doctors} Active Doctors In Consultations</p>
              </div>
              <div className="flex items-center gap-6 text-xs text-right">
                <div>
                  <span className="text-slate-400 block text-[11px]">Patients in Queue</span>
                  <p className="font-black text-white text-sm">{d.waiting}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Avg Wait</span>
                  <p className="font-bold text-amber-400">{d.avgWait}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  d.status === 'Critical'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : d.status === 'High'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {d.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
