import React, { useState } from 'react';
import { Activity, Radio, CheckCircle2, ShieldCheck, Terminal, Server } from 'lucide-react';

interface SystemLog {
  id: string;
  timestamp: string;
  type: string;
  service: string;
  message: string;
}

export const LiveScanFeed: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([
    { id: '1', timestamp: '10:08:32 AM', type: 'RECEIVED', service: 'Queue Service', message: 'Queue update received for AIIMS Delhi Cardiology' },
    { id: '2', timestamp: '10:08:21 AM', type: 'SUBSCRIBED', service: 'QR Verification', message: 'Token CARD-048 verified at Turnstile Gate 1' },
    { id: '3', timestamp: '10:08:10 AM', type: 'CONNECTED', service: 'WebSocket Gateway', message: 'Observer channel subscriber connected' },
    { id: '4', timestamp: '10:07:45 AM', type: 'SYNC', service: 'Doctor Recognition', message: 'Doctor feedback synchronized (184 surveys processed)' },
    { id: '5', timestamp: '10:05:12 AM', type: 'HEALTH_CHECK', service: 'Token Service', message: 'Health check OK — active tokens in memory: 4' },
  ]);

  return (
    <div className="p-8 bg-slate-50 text-slate-900 min-h-screen font-sans space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Status & Technical Event Diagnostics</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Statutory service health diagnostics, WebSocket streams, and API event logs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-700 text-xs font-bold font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          WEBSOCKET CONNECTED
        </div>
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-slate-500 text-xs font-bold block mb-1">API Engine</span>
          <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
            ● Online
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-slate-500 text-xs font-bold block mb-1">Queue Service</span>
          <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
            ● Online
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-slate-500 text-xs font-bold block mb-1">Token Service</span>
          <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
            ● Online
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-slate-500 text-xs font-bold block mb-1">QR Verification</span>
          <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
            ● Online
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl col-span-2 md:col-span-1 shadow-xs">
          <span className="text-slate-500 text-xs font-bold block mb-1">WebSocket Gateway</span>
          <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
            ● Connected
          </span>
        </div>
      </div>

      {/* Technical Event Stream */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-600" />
            Technical Events Log
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Channel: observer:all</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {logs.map((log) => (
            <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 w-24 shrink-0 font-medium">{log.timestamp}</span>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                  {log.type}
                </span>
                <span className="text-slate-700 font-semibold">{log.service}:</span>
                <span className="text-slate-900 font-medium">{log.message}</span>
              </div>
              <span className="text-emerald-600 font-bold text-[10px]">OK 200</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
