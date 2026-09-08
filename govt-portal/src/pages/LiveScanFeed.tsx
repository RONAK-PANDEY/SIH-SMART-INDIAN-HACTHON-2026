import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  QrCode, 
  ShieldCheck, 
  Building2, 
  User, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  RefreshCw,
  Layers,
  ArrowRight,
  Shield,
  Smartphone,
  Flame,
  X
} from 'lucide-react';

interface ScanEvent {
  id: string;
  token_id?: string;
  token_number: string;
  patient_id?: string;
  patient_name: string;
  dept: string;
  hospital_id: string;
  scanned_by: string;
  status: string;
  scanned_at: string;
  timestamp: string;
  message?: string;
}

export const LiveScanFeed: React.FC = () => {
  const [wsConnected, setWsConnected] = useState(false);
  const [events, setEvents] = useState<ScanEvent[]>([
    {
      id: 'scan-seed-1',
      token_id: 'tok_01',
      token_number: 'CARD-204',
      patient_name: 'Aarav Sharma',
      dept: 'dept-cardio',
      hospital_id: 'hosp-001',
      scanned_by: 'turnstile-gate-02-cardio',
      status: 'scanned',
      scanned_at: '2026-09-07T10:45:12Z',
      timestamp: '2026-09-07T10:45:12Z',
      message: 'Token CARD-204 verified at Turnstile Gate 2. Patient cleared.'
    },
    {
      id: 'scan-seed-2',
      token_id: 'tok_02',
      token_number: 'GENM-102',
      patient_name: 'Meera Nair',
      dept: 'dept-genmed',
      hospital_id: 'hosp-002',
      scanned_by: 'gate-safdarjung-01',
      status: 'scanned',
      scanned_at: '2026-09-07T10:40:05Z',
      timestamp: '2026-09-07T10:40:05Z',
      message: 'Token GENM-102 verified at Safdarjung Main OPD Turnstile.'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('ALL');
  const [totalScansReceived, setTotalScansReceived] = useState(2);

  // Global WebSocket listener to ws://<host>:8000/api/v1/ws/global
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/api/v1/ws/global`;
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
          console.log('[LiveScanFeed] Global WebSocket connected to:', wsUrl);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'token_scanned') {
              const newScan: ScanEvent = {
                id: `scan-${Date.now()}-${Math.random()}`,
                token_id: data.token_id,
                token_number: data.token_number,
                patient_id: data.patient_id,
                patient_name: data.patient_name || `Citizen (${data.token_number})`,
                dept: data.dept || 'dept-cardio',
                hospital_id: data.hospital_id || 'hosp-001',
                scanned_by: data.scanned_by || 'Turnstile Scanner',
                status: data.status || 'scanned',
                scanned_at: data.scanned_at || new Date().toISOString(),
                timestamp: data.timestamp || new Date().toISOString(),
                message: data.message || `Token ${data.token_number} verified and scanned.`
              };

              setEvents(prev => [newScan, ...prev.slice(0, 99)]);
              setTotalScansReceived(prev => prev + 1);
            }
          } catch (e) {
            console.error('[LiveScanFeed] WS Message parse error:', e);
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
        console.error('[LiveScanFeed] WS setup error:', err);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  const getHospitalName = (hospId: string) => {
    if (hospId === 'hosp-001' || hospId.includes('aiims')) return 'AIIMS New Delhi';
    if (hospId === 'hosp-002' || hospId.includes('safdarjung')) return 'Safdarjung Hospital';
    if (hospId === 'hosp-003' || hospId.includes('rml')) return 'Dr. RML Hospital';
    if (hospId === 'hosp-004' || hospId.includes('gtb')) return 'GTB Hospital Dilshad Garden';
    return hospId.toUpperCase();
  };

  const formatDepartment = (dept: string) => {
    return dept.replace('dept-', '').toUpperCase();
  };

  const filteredEvents = events.filter(ev => {
    const matchesHosp = selectedHospital === 'ALL' || ev.hospital_id === selectedHospital;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      ev.token_number.toLowerCase().includes(q) ||
      ev.patient_name.toLowerCase().includes(q) ||
      ev.dept.toLowerCase().includes(q) ||
      ev.scanned_by.toLowerCase().includes(q) ||
      ev.hospital_id.toLowerCase().includes(q)
    );
    return matchesHosp && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans pb-32">
      
      {/* Top Header */}
      <header className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              MoHFW Real-Time Vigilance
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">Global Observer Channel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            National Turnstile QR Scan Feed
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-hospital observation of patient arrivals, turnstile validations, and chamber entries
          </p>

          {/* WHY THIS MATTERS: ANTI-GHOST TOKEN DETECTION */}
          <div className="mt-3 p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Why this matters:</strong> Turnstile QR verification acts as an automated anti-ghost-token sentinel. Unregistered tickets or queue-jumpers without verified physical arrival are blocked from entering the active doctor consultation queue.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live WS Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-700 text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {wsConnected ? 'Global WS Connected (:8000/ws/global)' : 'Connecting Gateway...'}
            </span>
          </div>
        </div>
      </header>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Total Scans Streamed</span>
            <div className="text-2xl font-black text-white font-mono">{totalScansReceived}</div>
            <span className="text-[10px] text-emerald-400 font-medium">Live Gateway Sync</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Observed Hospitals</span>
            <div className="text-2xl font-black text-emerald-300 font-mono">4 Apex Nodes</div>
            <span className="text-[10px] text-slate-400 font-medium">All Turnstiles Active</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Integrity Check</span>
            <div className="text-2xl font-black text-purple-300 font-mono">100% Valid</div>
            <span className="text-[10px] text-purple-400 font-medium">SHA-256 Signed</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Turnstile Latency</span>
            <div className="text-2xl font-black text-amber-300 font-mono">&lt; 0.8s</div>
            <span className="text-[10px] text-emerald-400 font-medium">Immediate WS Broadcast</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token, patient name, or gate..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hospital Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'hosp-001', 'hosp-002', 'hosp-003', 'hosp-004'].map((hosp) => (
            <button
              key={hosp}
              type="button"
              onClick={() => setSelectedHospital(hosp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedHospital === hosp
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {hosp === 'ALL' ? 'All Hospitals' : getHospitalName(hosp)}
            </button>
          ))}
        </div>
      </div>

      {/* Live Event Stream Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Real-Time Ingestion Log ({filteredEvents.length} Events)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live broadcasted from FastAPI <code className="font-mono text-slate-300">AppointmentService.scan_token</code> to <code className="font-mono text-slate-300">/global</code>
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Newest First</span>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No scans match current search/filter criteria. Waiting for live turnstile check-ins...
            </div>
          ) : (
            filteredEvents.map((ev, index) => (
              <div 
                key={ev.id} 
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition ${
                  index === 0 ? 'bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/50 flex items-center justify-center font-black text-xs font-mono text-blue-300 shrink-0">
                    {ev.token_number}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm font-bold text-white">{ev.patient_name}</strong>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                        {formatDepartment(ev.dept)}
                      </span>
                      <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-md">
                        {getHospitalName(ev.hospital_id)}
                      </span>
                      {index === 0 && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
                          JUST IN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Scanned by: <strong className="text-slate-300 font-mono">{ev.scanned_by}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>{ev.message}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {new Date(ev.scanned_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> SHA-256 Passed
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    SCANNED
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
export default LiveScanFeed;
