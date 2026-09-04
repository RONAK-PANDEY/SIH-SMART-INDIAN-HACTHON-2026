import React from 'react';
import { Building2, MapPin, Users, Activity, ExternalLink } from 'lucide-react';

const hospitals = [
  { id: 'hosp-001', name: 'AIIMS New Delhi', city: 'New Delhi', beds: 2478, load: 88, doctors: 52, status: 'Overcrowded' },
  { id: 'hosp-002', name: 'Safdarjung Hospital', city: 'New Delhi', beds: 1530, load: 54, doctors: 34, status: 'Optimal' },
  { id: 'hosp-003', name: 'Apollo Super Speciality', city: 'New Delhi', beds: 850, load: 35, doctors: 28, status: 'Available' },
];

export const HospitalList: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Regional Healthcare Facilities</h1>
          <p className="text-xs text-slate-500">Monitor bed occupancy, OPD queue length, and inter-hospital load balancing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hospitals.map((h) => (
          <div key={h.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{h.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> {h.city}
                </p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                h.load > 80 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {h.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Facility Load</span>
                <strong>{h.load}% Capacity</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${h.load > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${h.load}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
              <div>Total Beds: <strong>{h.beds}</strong></div>
              <div>Active Doctors: <strong>{h.doctors}</strong></div>
            </div>

            <a
              href={`/hospital/${h.id}`}
              className="flex items-center justify-center gap-1.5 w-full bg-slate-900 text-white font-medium py-2.5 rounded-xl text-xs hover:bg-slate-800 transition"
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
