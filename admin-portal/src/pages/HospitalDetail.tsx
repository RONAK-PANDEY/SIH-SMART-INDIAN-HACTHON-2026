import React from 'react';
import { Building2, Users, Clock, Activity, ShieldCheck } from 'lucide-react';

export const HospitalDetail: React.FC = () => {
  const departments = [
    { name: 'Cardiology OPD', waiting: 42, avgWait: '24m', doctors: 6, status: 'High' },
    { name: 'General Medicine', waiting: 88, avgWait: '35m', doctors: 10, status: 'Critical' },
    { name: 'Pediatrics OPD', waiting: 18, avgWait: '12m', doctors: 4, status: 'Normal' },
    { name: 'Orthopedics OPD', waiting: 25, avgWait: '18m', doctors: 5, status: 'Normal' },
    { name: 'Neurology OPD', waiting: 14, avgWait: '15m', doctors: 3, status: 'Normal' },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <header className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Facility ID: HOSP-001</span>
          <h1 className="text-2xl font-bold text-slate-800">AIIMS New Delhi - Department Telemetry</h1>
          <p className="text-xs text-slate-500 mt-1">Ansari Nagar, New Delhi • Tertiary Super-Speciality Hospital</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
            Load: 88% (Overburdened)
          </span>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">OPD Department Capacities</h3>
          <span className="text-xs text-slate-400">Auto-refresh every 10s</span>
        </div>

        <div className="divide-y divide-slate-100">
          {departments.map((d) => (
            <div key={d.name} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-800">{d.name}</h4>
                <p className="text-xs text-slate-400">{d.doctors} Active Doctors Consultations</p>
              </div>
              <div className="flex items-center gap-6 text-xs text-right">
                <div>
                  <span className="text-slate-400">Patients in Queue</span>
                  <p className="font-bold text-slate-800">{d.waiting}</p>
                </div>
                <div>
                  <span className="text-slate-400">Avg Wait</span>
                  <p className="font-bold text-amber-600">{d.avgWait}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  d.status === 'Critical' ? 'bg-rose-100 text-rose-700' : d.status === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
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
