import React, { useState, useEffect } from 'react';
import { Layers, UserCheck, Play, SkipForward, ArrowRight, Eye, Clock, Activity, Radio, Sparkles } from 'lucide-react';

interface ChamberRoom {
  room: string;
  doc: string;
  dept: string;
  deptId: string;
  hospital: string;
  hospitalId: string;
  token: string;
  next: string;
  queueCount: number;
  waitMins: string;
  status: string;
}

export const LiveQueues: React.FC = () => {
  const [wsConnected, setWsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<any>(null);
  const [rooms, setRooms] = useState<ChamberRoom[]>([
    { room: '204', doc: 'Dr. Rajesh Sharma', dept: 'Cardiology', deptId: 'dept-cardio', hospital: 'AIIMS New Delhi', hospitalId: 'hosp-001', token: 'CARD-204', next: 'CARD-205', queueCount: 4, waitMins: '8m', status: 'In Consultation' },
    { room: '102', doc: 'Dr. Harpreet Singh', dept: 'General Medicine', deptId: 'dept-genmed', hospital: 'AIIMS New Delhi', hospitalId: 'hosp-001', token: 'GENM-102', next: 'GENM-103', queueCount: 6, waitMins: '12m', status: 'In Consultation' },
    { room: '108', doc: 'Dr. Vikram Sethi', dept: 'Orthopedics', deptId: 'dept-ortho', hospital: 'Safdarjung Hospital', hospitalId: 'hosp-002', token: 'ORTH-045', next: 'ORTH-046', queueCount: 5, waitMins: '15m', status: 'In Consultation' },
    { room: '301', doc: 'Dr. Priya Patel', dept: 'Pediatrics', deptId: 'dept-peds', hospital: 'AIIMS New Delhi', hospitalId: 'hosp-001', token: 'PEDS-022', next: 'PEDS-023', queueCount: 3, waitMins: '6m', status: 'Waiting' },
    { room: '402', doc: 'Dr. Arjun Nambiar', dept: 'Neurology', deptId: 'dept-neuro-sjh', hospital: 'Safdarjung Super Speciality', hospitalId: 'hosp-002', token: 'NEUR-011', next: 'NEUR-012', queueCount: 2, waitMins: '10m', status: 'In Consultation' },
  ]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/api/v1/ws/connect/observer:global`;
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
          console.log('[LiveQueues] Observer WebSocket connected to:', wsUrl);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const eventType = data.event || data.type;
            setLatestEvent(data);

            if (eventType === 'token_scanned' || eventType === 'token_created' || eventType === 'token_completed') {
              setRooms(prev => {
                const updated = [...prev];
                const deptMatch = updated.findIndex(r => 
                  (data.department && r.deptId.includes(data.department.replace('dept-', ''))) ||
                  (data.dept && r.deptId.includes(data.dept.replace('dept-', '')))
                );

                if (deptMatch !== -1) {
                  if (eventType === 'token_scanned') {
                    updated[deptMatch].next = data.token_number;
                    updated[deptMatch].status = 'Patient at Door';
                  } else if (eventType === 'token_completed') {
                    updated[deptMatch].token = updated[deptMatch].next || data.token_number;
                    updated[deptMatch].status = 'Consultation Finalized';
                    updated[deptMatch].queueCount = Math.max(0, updated[deptMatch].queueCount - 1);
                  } else if (eventType === 'token_created') {
                    updated[deptMatch].queueCount += 1;
                  }
                }
                return updated;
              });
            }
          } catch (e) {
            console.error('[LiveQueues] WS Parse error:', e);
          }
        };
        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };
        ws.onerror = () => {
          ws?.close();
        };
      } catch (err) {
        console.error('[LiveQueues] WS Setup error:', err);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans pb-32">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Queue status</span>
          </div>
          <h1 className="text-2xl font-black text-white">Department queues</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Current waiting and consultation status across hospitals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-full border ${
            wsConnected ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
          }`}>
            <Radio className={`w-3 h-3 ${wsConnected ? 'animate-pulse' : ''}`} />
            <span>{wsConnected ? 'Live updates on' : 'Reconnecting…'}</span>
          </span>
        </div>
      </div>

      {latestEvent && (
        <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-2xl text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 text-blue-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Latest Global Event: <strong>{latestEvent.event || 'Update'}</strong> — Token: <strong className="font-mono text-white">{latestEvent.token_number}</strong> ({latestEvent.department || latestEvent.dept || 'OPD'})</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">{new Date().toLocaleTimeString()}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((r) => (
          <div key={r.room} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4 hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase">Room {r.room} • {r.dept}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{r.doc}</h3>
                <p className="text-[11px] text-slate-400">{r.hospital}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                r.status === 'Patient at Door' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                r.status === 'Consultation Finalized' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {r.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Now Inside</span>
                <div className="text-2xl font-black text-blue-400 mt-1 font-mono">{r.token}</div>
              </div>
              <div className="border-l border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Up Next</span>
                <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{r.next}</div>
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
export default LiveQueues;
