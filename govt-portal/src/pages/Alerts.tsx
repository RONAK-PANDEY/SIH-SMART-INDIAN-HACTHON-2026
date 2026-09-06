import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock, BellRing, Filter } from 'lucide-react';

export const Alerts: React.FC = () => {
  const alertList = [
    {
      id: 1,
      type: 'CRITICAL',
      title: 'Emergency Triage Level 1 Injected',
      desc: 'Patient with Acute Cardiac Arrest routed immediately to Resuscitation Bay 2 at AIIMS Trauma Center.',
      time: '2 mins ago',
      hospital: 'AIIMS New Delhi'
    },
    {
      id: 2,
      type: 'WARNING',
      title: 'General Medicine Queue Congestion Surge',
      desc: 'Wait time exceeded 45 mins threshold at AIIMS. Automated load shedding recommended to Safdarjung Hospital.',
      time: '14 mins ago',
      hospital: 'AIIMS New Delhi'
    },
    {
      id: 3,
      type: 'INFO',
      title: 'Doctor Shift Handover Completed',
      desc: 'Dr. Priya Sharma took over Cardiology OPD Room 104 with 8 pending tokens.',
      time: '32 mins ago',
      hospital: 'Safdarjung Hospital'
    },
    {
      id: 4,
      type: 'WARNING',
      title: 'Pediatrics Oxygen Concentrator Standby Call',
      desc: 'OPD Ward 304 pediatric patient stabilized; oxygen support standby cleared.',
      time: '1 hour ago',
      hospital: 'RML Hospital'
    }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BellRing className="w-4 h-4" />
            <span>National Incident Sentinel</span>
          </div>
          <h1 className="text-2xl font-black text-white">Operational Alerts & Triage Incidents</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live stream of emergency escalations, queue bottlenecks, and automated hospital load balance triggers.
          </p>
        </div>

        <span className="text-xs font-mono bg-rose-500/15 border border-rose-500/30 text-rose-400 px-3.5 py-1.5 rounded-full font-bold">
          LIVE SENTINEL POLLING ACTIVE
        </span>
      </div>

      <div className="space-y-4">
        {alertList.map((a) => (
          <div
            key={a.id}
            className={`p-6 rounded-3xl border shadow-sm flex items-start gap-4 transition ${
              a.type === 'CRITICAL'
                ? 'bg-rose-950/20 border-rose-500/50'
                : a.type === 'WARNING'
                ? 'bg-amber-950/20 border-amber-500/50'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className={`p-3 rounded-2xl shrink-0 ${
              a.type === 'CRITICAL'
                ? 'bg-rose-600 text-white'
                : a.type === 'WARNING'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-sm text-white">{a.title}</h3>
                  <span className="text-xs text-slate-400">{a.hospital}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {a.time}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
