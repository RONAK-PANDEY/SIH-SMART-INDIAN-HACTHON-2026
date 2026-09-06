import React from 'react';
import { Layers, UserCheck, Play, SkipForward, ArrowRight, Eye, Clock, Activity } from 'lucide-react';

export const LiveQueues: React.FC = () => {
  const rooms = [
    { room: '101', doc: 'Dr. Harpreet Singh', dept: 'General Medicine', hospital: 'AIIMS Main', token: 'MED-112', next: 'MED-113', queueCount: 14, waitMins: '18m' },
    { room: '104', doc: 'Dr. Rajesh Sharma', dept: 'Cardiology', hospital: 'AIIMS Main', token: 'CARD-042', next: 'CARD-043', queueCount: 8, waitMins: '12m' },
    { room: '108', doc: 'Dr. Priya Patel', dept: 'Pediatrics', hospital: 'Safdarjung', token: 'PED-022', next: 'PED-023', queueCount: 4, waitMins: '6m' },
    { room: '202', doc: 'Dr. Vikram Sethi', dept: 'Orthopedics', hospital: 'AIIMS Main', token: 'ORTH-045', next: 'ORTH-046', queueCount: 11, waitMins: '22m' },
    { room: '205', doc: 'Dr. Sneha Roy', dept: 'Dermatology', hospital: 'Safdarjung', token: 'DERM-009', next: 'DERM-010', queueCount: 15, waitMins: '35m' },
    { room: '301', doc: 'Dr. Ananya Mishra', dept: 'Ophthalmology', hospital: 'RML Hospital', token: 'EYE-031', next: 'EYE-032', queueCount: 6, waitMins: '10m' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>National Queue Sentinel</span>
          </div>
          <h1 className="text-2xl font-black text-white">Live Doctor OPD Consoles & Turn-by-Turn Matrix</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-hospital OPD room turn tracking, pacing metrics, and active consultation auditing.
          </p>
        </div>

        <span className="text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full font-bold">
          6 ACTIVE CHAMBERS MONITORED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((r) => (
          <div key={r.room} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4 hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase">Room {r.room} • {r.dept}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{r.doc}</h3>
                <p className="text-[11px] text-slate-400">{r.hospital}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                In Consultation
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Now Inside</span>
                <div className="text-2xl font-black text-blue-400 mt-1">{r.token}</div>
              </div>
              <div className="border-l border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Up Next</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{r.next}</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>In Queue: <strong className="text-white">{r.queueCount} Patients</strong></span>
              <span className="font-mono text-emerald-400">Pacing ~{r.waitMins}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
