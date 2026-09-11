import React, { useState } from 'react';
import { ShieldAlert, Clock, CheckCircle2, AlertTriangle, Send, Filter, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface AlertItem {
  id: string;
  hospital: string;
  department: string;
  token: string;
  type: string;
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  waitTime: string;
  threshold: string;
  patientsWaiting: number;
  status: 'New' | 'Investigating' | 'Resolved';
  timeline: { time: string; event: string }[];
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'CARD-048',
    hospital: 'AIIMS New Delhi',
    department: 'Cardiology',
    token: 'CARD-048',
    type: 'WAIT_TIME_EXCEEDED',
    severity: 'Critical',
    message: 'Token CARD-048 waiting threshold exceeded (48 min / 40 min limit)',
    waitTime: '48 min',
    threshold: '40 min',
    patientsWaiting: 18,
    status: 'New',
    timeline: [
      { time: '10:00 AM', event: 'Token issued at registration desk' },
      { time: '10:15 AM', event: 'Patient checked in at turnstile gate 1' },
      { time: '10:40 AM', event: 'Expected consultation start time' },
      { time: '10:48 AM', event: 'Waiting threshold exceeded (>40 min)' },
    ]
  },
  {
    id: 'PED-031',
    hospital: 'Safdarjung Hospital',
    department: 'Pediatrics',
    token: 'PED-031',
    type: 'QUEUE_SURGE',
    severity: 'Warning',
    message: 'Sudden OPD queue surge detected; 15 patients waiting',
    waitTime: '32 min',
    threshold: '30 min',
    patientsWaiting: 15,
    status: 'Investigating',
    timeline: [
      { time: '10:10 AM', event: 'Token issued' },
      { time: '10:25 AM', event: 'Check-in verified' },
      { time: '10:42 AM', event: 'Queue delay flagged' },
    ]
  },
  {
    id: 'ORTHO-104',
    hospital: 'RML Hospital',
    department: 'Orthopedics',
    token: 'ORTHO-104',
    type: 'DOCTOR_PAUSE',
    severity: 'Info',
    message: 'Consultation room paused for emergency trauma round',
    waitTime: '20 min',
    threshold: '25 min',
    patientsWaiting: 8,
    status: 'Resolved',
    timeline: [
      { time: '09:30 AM', event: 'Emergency pause logged' },
      { time: '09:50 AM', event: 'Consultation resumed' },
    ]
  }
];

export const Alerts: React.FC = () => {
  const { alertId } = useParams<{ alertId?: string }>();
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(() => {
    if (alertId) {
      return INITIAL_ALERTS.find(a => a.id === alertId) || INITIAL_ALERTS[0];
    }
    return null;
  });
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const updateAlertStatus = (id: string, newStatus: 'New' | 'Investigating' | 'Resolved') => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'All') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="p-8 bg-slate-50 text-slate-900 min-h-screen font-sans space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Alerts & Anomaly Investigations</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Real-time queue threshold violations, token delays, and statutory vigilance actions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">Filter Severity:</span>
          {['All', 'Critical', 'Warning', 'Info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                severityFilter === sev
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toast}
        </div>
      )}

      {/* Main Grid: Alerts List + Investigation Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Alert List */}
        <div className={selectedAlert ? 'lg:col-span-6 space-y-4' : 'lg:col-span-12 space-y-4'}>
          {filteredAlerts.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedAlert(item)}
              className={`p-6 rounded-3xl border transition cursor-pointer shadow-xs relative overflow-hidden ${
                selectedAlert?.id === item.id
                  ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/40'
                  : item.severity === 'Critical'
                  ? 'bg-white border-rose-300 hover:border-rose-400'
                  : item.severity === 'Warning'
                  ? 'bg-white border-amber-300 hover:border-amber-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    item.severity === 'Critical'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : item.severity === 'Warning'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    ⚠ {item.severity}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">{item.hospital} • {item.department}</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                  item.status === 'New' ? 'bg-rose-600 text-white' : item.status === 'Investigating' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {item.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">{item.message}</h3>
              <p className="text-xs text-slate-500 font-mono">
                Token: <strong className="text-amber-800">{item.token}</strong> | Wait: <strong className="text-rose-600">{item.waitTime}</strong> / limit {item.threshold}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Click to open investigation evidence</span>
                <span className="text-amber-700 font-extrabold hover:underline">Investigate →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Alert Investigation Panel */}
        {selectedAlert && (
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-7 space-y-6 shadow-xl relative animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold">
                  Queue Anomaly Investigation
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedAlert.hospital}</h2>
                <p className="text-slate-500 text-xs font-semibold">{selectedAlert.department} • Token {selectedAlert.token}</p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-600 hover:text-slate-900 font-bold text-xs bg-slate-100 px-3 py-1 rounded-xl cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            {/* Evidence Block */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Evidence & Operational Metrics</h4>
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">Waiting Time</span>
                  <span className="text-lg font-bold text-rose-600 font-mono">{selectedAlert.waitTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Threshold</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">{selectedAlert.threshold}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Patients Waiting</span>
                  <span className="text-lg font-bold text-amber-700 font-mono">{selectedAlert.patientsWaiting}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Incident Timeline</h4>
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono">
                {selectedAlert.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-700">
                    <span className="text-amber-700 font-bold w-16">{step.time}</span>
                    <span className="text-slate-300">───</span>
                    <span className="text-slate-900 font-medium">{step.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Officer Actions (3 Action Hierarchy) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Officer Actions</h4>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    updateAlertStatus(selectedAlert.id, 'Investigating');
                    showToast(`Dispatched statutory inspector team to ${selectedAlert.hospital}`);
                  }}
                  className="w-full bg-amber-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl hover:bg-amber-300 transition text-sm shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Dispatch Inspection
                </button>

                <button
                  onClick={() => {
                    updateAlertStatus(selectedAlert.id, 'Investigating');
                    showToast(`Alert marked as Under Active Review`);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-2xl transition text-xs border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-slate-500" />
                  Mark as Reviewed
                </button>

                <button
                  onClick={() => {
                    updateAlertStatus(selectedAlert.id, 'Resolved');
                    showToast(`Alert ${selectedAlert.id} resolved & marked clean`);
                  }}
                  className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-3 px-4 rounded-2xl hover:bg-emerald-100 transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Resolve Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
