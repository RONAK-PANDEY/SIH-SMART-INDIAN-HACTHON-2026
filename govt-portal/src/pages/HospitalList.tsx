import React from 'react';
import { Building2, MapPin, Users, Activity, ExternalLink, ShieldCheck } from 'lucide-react';

const hospitals = [
  { id: 'hosp-001', name: 'AIIMS New Delhi - Main Campus', city: 'Ansari Nagar, New Delhi', beds: 2478, load: 88, doctors: 52, status: 'Overcrowded', waitAvg: '24m' },
  { id: 'hosp-002', name: 'Safdarjung Hospital', city: 'Ring Road, New Delhi', beds: 1530, load: 54, doctors: 34, status: 'Optimal', waitAvg: '18m' },
  { id: 'hosp-003', name: 'Dr. RML Hospital', city: 'Connaught Place, New Delhi', beds: 850, load: 68, doctors: 28, status: 'Moderate', waitAvg: '28m' },
];

export const HospitalList: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Hospital network</span>
          </div>
          <h1 className="text-2xl font-black text-white">Regional Healthcare Facilities & Bed Capacity</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time bed occupancy, OPD queue congestion, and inter-hospital load balancing.
          </p>
        </div>

        <span className="text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full font-bold">
          3 APEX CENTRAL HOSPITALS ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hospitals.map((h) => (
          <div key={h.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4 hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white text-base leading-tight">{h.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {h.city}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                h.load > 80
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : h.load > 60
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {h.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Facility Load</span>
                <strong className="text-white">{h.load}% Capacity</strong>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full ${h.load > 80 ? 'bg-rose-500' : h.load > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${h.load}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 text-slate-400">
              <div>Total Beds: <strong className="text-white">{h.beds}</strong></div>
              <div>Active Doctors: <strong className="text-white">{h.doctors}</strong></div>
              <div className="col-span-2 pt-1">Avg OPD Wait: <strong className="text-emerald-400">{h.waitAvg}</strong></div>
            </div>

            <a
              href={`/hospital/${h.id}`}
              className="flex items-center justify-center gap-1.5 w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              <span>View Department Telemetry</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
