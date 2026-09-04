import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react';

export const LiveQueue: React.FC = () => {
  const [tokens, setTokens] = useState([
    { token: 'CARD-038', status: 'IN_CONSULTATION', room: '104 (Dr. Verma)', wait: '0m', priority: 'High' },
    { token: 'CARD-039', status: 'NEXT', room: '104', wait: '3m', priority: 'Emergency' },
    { token: 'CARD-040', status: 'WAITING', room: '104', wait: '10m', priority: 'Normal' },
    { token: 'CARD-041', status: 'WAITING', room: '104', wait: '16m', priority: 'Normal' },
    { token: 'CARD-042', status: 'WAITING (YOU)', room: '104', wait: '22m', priority: 'Urgent' },
    { token: 'CARD-043', status: 'WAITING', room: '104', wait: '30m', priority: 'Normal' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-2xl mx-auto pb-24">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 animate-pulse" /> Live Realtime WebSocket Feed
          </span>
          <h1 className="text-2xl font-bold text-slate-800">Cardiology OPD Queue</h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Active Doctors</span>
          <p className="text-sm font-bold text-emerald-600">3 Available</p>
        </div>
      </header>

      {/* Current Serving Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Now Inside Consultation</span>
            <div className="text-3xl font-extrabold mt-1">CARD-038</div>
            <p className="text-xs text-blue-100 mt-1">Room 104 • Dr. A. K. Verma</p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
              Calling Next
            </span>
            <div className="text-lg font-bold mt-2">Next: CARD-039</div>
          </div>
        </div>
      </div>

      {/* Queue List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-100/70 border-b border-slate-200 flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
          <span>Token & Status</span>
          <span>Est. Wait</span>
        </div>

        <div className="divide-y divide-slate-100">
          {tokens.map((item) => {
            const isUser = item.token.includes('YOU');
            return (
              <div
                key={item.token}
                className={`p-4 flex items-center justify-between transition ${
                  isUser ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    item.status === 'IN_CONSULTATION'
                      ? 'bg-emerald-100 text-emerald-700'
                      : isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.token.split('-')[1]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <span>{item.token}</span>
                      {item.priority === 'Emergency' && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">EMERGENCY</span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500">{item.status} • Room {item.room}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">~{item.wait}</span>
                  <p className="text-[11px] text-slate-400">Wait Time</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
