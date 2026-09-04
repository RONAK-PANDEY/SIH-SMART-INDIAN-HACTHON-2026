import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export const Alerts: React.FC = () => {
  const alertList = [
    {
      id: 1,
      type: 'CRITICAL',
      title: 'Emergency Triage Level 1 Injected',
      desc: 'Patient with Acute Cardiac Arrest routed immediately to Resuscitation Bay 2.',
      time: '2 mins ago',
    },
    {
      id: 2,
      type: 'WARNING',
      title: 'General Medicine Queue Congestion Surge',
      desc: 'Wait time exceeded 45 mins threshold at AIIMS. Automated load shedding recommended to Safdarjung.',
      time: '14 mins ago',
    },
    {
      id: 3,
      type: 'INFO',
      title: 'Doctor Shift Handover Completed',
      desc: 'Dr. Priya Sharma took over Cardiology OPD Room 104.',
      time: '32 mins ago',
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Operational Alerts & Triage Incidents</h1>
        <p className="text-xs text-slate-500">Live feed of emergency escalations, queue bottlenecks, and load balance triggers</p>
      </div>

      <div className="space-y-4">
        {alertList.map((a) => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl border bg-white shadow-sm flex items-start gap-4 ${
              a.type === 'CRITICAL' ? 'border-rose-300' : a.type === 'WARNING' ? 'border-amber-300' : 'border-slate-200'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${
              a.type === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : a.type === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm text-slate-800">{a.title}</h3>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {a.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
