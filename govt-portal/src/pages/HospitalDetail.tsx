import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Clock, 
  Activity, 
  ShieldCheck, 
  ArrowLeft, 
  QrCode, 
  X, 
  Radio, 
  RefreshCw,
  TrendingUp,
  Stethoscope
} from 'lucide-react';

interface DepartmentItem {
  id: string;
  name: string;
  waiting: number;
  avgWait: string;
  doctors: number;
  status: 'Critical' | 'High' | 'Normal';
  lastScanned?: string;
  scannedAt?: string;
}

export const HospitalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const hospitalId = id || 'hosp-001';

  const [wsConnected, setWsConnected] = useState(false);
  const [lastScanNotice, setLastScanNotice] = useState<any>(null);
  const [hospitalLoad, setHospitalLoad] = useState(88);

  const [departments, setDepartments] = useState<DepartmentItem[]>([
    { id: 'dept-cardio', name: 'Cardiology OPD', waiting: 42, avgWait: '24m', doctors: 6, status: 'High' },
    { id: 'dept-genmed', name: 'General Medicine', waiting: 88, avgWait: '35m', doctors: 10, status: 'Critical' },
    { id: 'dept-peds', name: 'Pediatrics OPD', waiting: 18, avgWait: '12m', doctors: 4, status: 'Normal' },
    { id: 'dept-ortho', name: 'Orthopedics OPD', waiting: 25, avgWait: '18m', doctors: 5, status: 'Normal' },
    { id: 'dept-neuro', name: 'Neurology OPD', waiting: 14, avgWait: '15m', doctors: 3, status: 'Normal' },
  ]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/api/v1/ws/queue/${hospitalId}/dept-cardio`;
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
          console.log('[HospitalDetail] WebSocket connected to:', wsUrl);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'token_scanned') {
              setLastScanNotice(data);
              setDepartments(prev => prev.map(d => {
                const isMatch = d.id === data.dept || (data.dept && d.name.toLowerCase().includes(data.dept.replace('dept-', '')));
                if (isMatch) {
                  return {
                    ...d,
                    waiting: d.waiting + 1,
                    lastScanned: data.token_number,
                    scannedAt: new Date().toLocaleTimeString(),
                    status: d.waiting + 1 > 40 ? 'Critical' : 'High'
                  };
                }
                return d;
              }));
              setHospitalLoad(prev => Math.min(99, prev + 1));
            }
          } catch (e) {
            console.error('[HospitalDetail] WS Message parse error:', e);
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
        console.error('[HospitalDetail] WS setup error:', err);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [hospitalId]);

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <a href="/hospitals" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Hospital Network
            </a>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">Facility ID: {hospitalId.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {hospitalId === 'hosp-002' ? 'Safdarjung Hospital' : 'AIIMS New Delhi'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ansari Nagar, New Delhi • Apex Super-Speciality Hospital & National Referral Node
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live WS Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-700 text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {wsConnected ? 'Sentinel Telemetry Active' : 'Connecting...'}
            </span>
          </div>

          <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
            hospitalLoad >= 85 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            Load: {hospitalLoad}% (Overburdened)
          </span>
        </div>
      </header>

      {/* Live Turnstile Scan Alert Banner */}
      {lastScanNotice && (
        <div className="p-4 bg-gradient-to-r from-emerald-950/90 via-blue-950/80 to-slate-900 border border-emerald-500/60 rounded-2xl flex items-center justify-between text-xs text-emerald-200 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[11px] border border-emerald-500/40">
                  {lastScanNotice.token_number}
                </span>
                <strong className="text-white text-sm">
                  {lastScanNotice.patient_name || 'Citizen'}
                </strong>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/50">
                  ✓ Verified Turnstile Scan
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                {lastScanNotice.message || `Scanned at Turnstile Gate (${lastScanNotice.scanned_by || 'Security Gate'}). Telemetry updated.`}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setLastScanNotice(null)} 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Department Capacities Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-400" />
              <span>OPD Department Capacities & Real-time Telemetry</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live consultation progress and queue size
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Updates automatically</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {departments.map((d) => (
            <div key={d.name} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-850/50 transition">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>{d.name}</span>
                  {d.lastScanned && (
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.2 rounded-full">
                      Last Scanned: {d.lastScanned} ({d.scannedAt})
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{d.doctors} Active Doctors In Consultations</p>
              </div>
              <div className="flex items-center gap-6 text-xs text-right">
                <div>
                  <span className="text-slate-400 block text-[11px]">Patients in Queue</span>
                  <p className="font-black text-white text-sm">{d.waiting}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Avg Wait</span>
                  <p className="font-bold text-amber-400">{d.avgWait}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  d.status === 'Critical'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : d.status === 'High'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {d.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default HospitalDetail;
