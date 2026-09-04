import React from 'react';
import { Layers, UserCheck, Play, SkipForward, ArrowRight } from 'lucide-react';

export const LiveQueues: React.FC = () => {
  const rooms = [
    { room: '101', doc: 'Dr. S. K. Gupta', dept: 'General Medicine', token: 'MED-112', next: 'MED-113', queueCount: 14 },
    { room: '104', doc: 'Dr. A. K. Verma', dept: 'Cardiology', token: 'CARD-038', next: 'CARD-039', queueCount: 8 },
    { room: '108', doc: 'Dr. Neha Kapoor', dept: 'Pediatrics', token: 'PED-022', next: 'PED-023', queueCount: 4 },
    { room: '202', doc: 'Dr. Rajesh Rao', dept: 'Orthopedics', token: 'ORTHO-045', next: 'ORTHO-046', queueCount: 11 },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Live Doctor OPD Consoles & Queue Matrix</h1>
        <p className="text-xs text-slate-500">Live view of ongoing consultations across all hospital consultation rooms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((r) => (
          <div key={r.room} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase">Room {r.room} • {r.dept}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-0.5">{r.doc}</h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                In Session
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-center">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase">Now Inside</span>
                <div className="text-2xl font-extrabold text-blue-700">{r.token}</div>
              </div>
              <div className="border-l border-slate-200">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Up Next</span>
                <div className="text-2xl font-extrabold text-amber-600">{r.next}</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 pt-2">
              <span>Remaining in Queue: <strong>{r.queueCount} Patients</strong></span>
              <a href="/doctor-panel" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                <span>Manage Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
