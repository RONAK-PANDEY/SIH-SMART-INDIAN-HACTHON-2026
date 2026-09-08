import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  UserCheck, 
  Play, 
  SkipForward, 
  ArrowRight, 
  Search, 
  Clock, 
  Users, 
  Activity, 
  Stethoscope, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  X
} from 'lucide-react';
import { BackButton } from '../components/BackButton';

interface RoomQueue {
  room: string;
  doc: string;
  specialty: string;
  dept: string;
  token: string;
  next: string;
  queueCount: number;
  completedToday: number;
  avgWaitMins: number;
  status: 'active' | 'break' | 'accelerated';
  lastScannedToken?: string;
}

export const LiveQueues: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [lastScanNotice, setLastScanNotice] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const initialRooms: RoomQueue[] = [
    { 
      room: '101', 
      doc: 'Dr. S. K. Gupta', 
      specialty: 'Senior Consultant', 
      dept: 'General Medicine', 
      token: 'MED-112', 
      next: 'MED-113', 
      queueCount: 14,
      completedToday: 28,
      avgWaitMins: 12,
      status: 'active'
    },
    { 
      room: '204', 
      doc: 'Dr. Rajesh Sharma', 
      specialty: 'HOD & Interventional Cardiologist', 
      dept: 'Cardiology', 
      token: 'CARD-204', 
      next: 'CARD-205', 
      queueCount: 8,
      completedToday: 23,
      avgWaitMins: 8,
      status: 'accelerated'
    },
    { 
      room: '108', 
      doc: 'Dr. Neha Kapoor', 
      specialty: 'Chief Pediatrician', 
      dept: 'Pediatrics', 
      token: 'PED-022', 
      next: 'PED-023', 
      queueCount: 5,
      completedToday: 19,
      avgWaitMins: 10,
      status: 'active'
    },
    { 
      room: '202', 
      doc: 'Dr. Rajesh Rao', 
      specialty: 'Senior Orthopedic Surgeon', 
      dept: 'Orthopedics', 
      token: 'ORTHO-045', 
      next: 'ORTHO-046', 
      queueCount: 11,
      completedToday: 21,
      avgWaitMins: 16,
      status: 'active'
    },
    { 
      room: '305', 
      doc: 'Dr. Sunita Deshmukh', 
      specialty: 'Gynecologist & Obstetrician', 
      dept: 'Obstetrics & Gynae', 
      token: 'OBG-088', 
      next: 'OBG-089', 
      queueCount: 9,
      completedToday: 17,
      avgWaitMins: 14,
      status: 'active'
    },
    { 
      room: '112', 
      doc: 'Dr. Arvind Mehra', 
      specialty: 'Ophthalmologist', 
      dept: 'Ophthalmology', 
      token: 'EYE-034', 
      next: 'EYE-035', 
      queueCount: 6,
      completedToday: 25,
      avgWaitMins: 9,
      status: 'active'
    }
  ];

  const [rooms, setRooms] = useState<RoomQueue[]>(initialRooms);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let hospitalId = searchParams.get('hospital_id') || 'hosp-001';
    
    try {
      const savedStaff = localStorage.getItem('smartcare_staff');
      if (savedStaff) {
        const staffObj = JSON.parse(savedStaff);
        if (staffObj.hospital_id) hospitalId = staffObj.hospital_id;
      }
    } catch (e) {
      console.error(e);
    }

    let deptId = 'dept-cardio';
    if (selectedDept === 'General Medicine') deptId = 'dept-genmed';
    else if (selectedDept === 'Pediatrics') deptId = 'dept-peds';
    else if (selectedDept === 'Orthopedics') deptId = 'dept-ortho';
    else if (selectedDept === 'Obstetrics & Gynae') deptId = 'dept-gynae';
    else if (selectedDept === 'Ophthalmology') deptId = 'dept-eye';
    else if (selectedDept === 'Cardiology' || selectedDept === 'ALL') deptId = 'dept-cardio';

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/api/v1/ws/queue/${hospitalId}/${deptId}`;
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'token_scanned') {
              setLastScanNotice(data);
              setRooms(prev => prev.map(r => {
                if (r.room === '204' || r.dept.toLowerCase().includes('cardio') || (data.dept && r.dept.toLowerCase().includes(data.dept.replace('dept-', '')))) {
                  return {
                    ...r,
                    next: data.token_number,
                    lastScannedToken: data.token_number,
                    status: 'accelerated'
                  };
                }
                return r;
              }));
            }
          } catch (e) {
            console.error('[LiveQueues] WS parse error', e);
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
        console.error('[LiveQueues] WS setup error', err);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [selectedDept]);

  const departments = ['ALL', 'Cardiology', 'General Medicine', 'Pediatrics', 'Orthopedics', 'Obstetrics & Gynae', 'Ophthalmology'];

  const filteredRooms = rooms.filter(r => {
    const matchesDept = selectedDept === 'ALL' || r.dept.toLowerCase() === selectedDept.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      r.doc.toLowerCase().includes(q) ||
      r.room.toLowerCase().includes(q) ||
      r.dept.toLowerCase().includes(q) ||
      r.token.toLowerCase().includes(q) ||
      r.next.toLowerCase().includes(q)
    );
    return matchesDept && matchesSearch;
  });

  const totalWaiting = rooms.reduce((acc, r) => acc + r.queueCount, 0);
  const totalCompleted = rooms.reduce((acc, r) => acc + r.completedToday, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#061224] text-[#F8FAFC] min-h-screen pb-32">
      
      {/* Top Header with Back Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <BackButton />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-blue-900/60 text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-700/50">
                MoHFW Sentinel Live Matrix
              </span>
              <span className="text-xs text-slate-400 font-mono">OPD Chamber Vigilance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Live OPD Doctor Consoles & Queue Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time synchronization across all consultation chambers, queue pacing, and token turnovers
            </p>
          </div>
        </div>

        {/* Live sync heartbeat */}
        <div className="flex items-center gap-2 bg-[#0D1B34] border border-[#1E2E4A] px-3.5 py-2 rounded-xl text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
          <span className={wsConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {wsConnected ? 'WebSocket Synchronized' : 'Connecting Gateway...'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">FastAPI :8000</span>
        </div>
      </div>

      {/* Live Turnstile Scan Alert Banner */}
      {lastScanNotice && (
        <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-blue-950/70 to-[#0D1B34] border border-emerald-500/60 rounded-2xl flex items-center justify-between text-xs text-emerald-200 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[11px] border border-emerald-500/40">
                  {lastScanNotice.token_number}
                </span>
                <span className="font-semibold text-white">
                  {lastScanNotice.patient_name || 'Citizen'}
                </span>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/50">
                  Turnstile Scanned
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                {lastScanNotice.message || `Turnstile QR verified by ${lastScanNotice.scanned_by}. Chamber 204 OPD Queue paced automatically.`}
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

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D1B34] p-4 rounded-2xl border border-[#1E2E4A] shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Active Chambers</span>
            <div className="text-2xl font-black text-white">{rooms.length} / {rooms.length} Rooms</div>
            <span className="text-[10px] text-emerald-400 font-medium">100% Doctor Attendance</span>
          </div>
        </div>

        <div className="bg-[#0D1B34] p-4 rounded-2xl border border-[#1E2E4A] shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Waiting in Queue</span>
            <div className="text-2xl font-black text-amber-300">{totalWaiting} Citizens</div>
            <span className="text-[10px] text-slate-400 font-medium">{totalCompleted} Consulted Today</span>
          </div>
        </div>

        <div className="bg-[#0D1B34] p-4 rounded-2xl border border-[#1E2E4A] shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Average Wait Time</span>
            <div className="text-2xl font-black text-emerald-300">11.4 Mins</div>
            <span className="text-[10px] text-emerald-400 font-medium">↓ 68% vs baseline (35m)</span>
          </div>
        </div>

        <div className="bg-[#0D1B34] p-4 rounded-2xl border border-[#1E2E4A] shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Total Throughput</span>
            <div className="text-2xl font-black text-purple-300">{totalCompleted} Patients</div>
            <span className="text-[10px] text-slate-400 font-medium">Today's Total OPD Load</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D1B34] p-4 rounded-2xl border border-[#1E2E4A] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor, room, or token..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#061224] border border-[#1E2E4A] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Department Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#061224] text-slate-400 hover:text-white border border-[#1E2E4A]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Room Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((r) => {
          const totalAssigned = r.completedToday + r.queueCount;
          const progressPercent = Math.round((r.completedToday / totalAssigned) * 100);

          return (
            <div 
              key={r.room} 
              className="bg-[#0D1B34] rounded-2xl p-5 border border-[#1E2E4A] hover:border-blue-500/50 shadow-md space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Room Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      Room {r.room} • {r.dept}
                    </span>
                    <h3 className="text-base font-black text-white mt-0.5">{r.doc}</h3>
                    <span className="text-[11px] text-slate-400 block">{r.specialty}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                    r.status === 'accelerated'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>In Session</span>
                  </span>
                </div>

                {/* Tokens Now vs Next */}
                <div className="grid grid-cols-2 gap-3 bg-[#061224] p-3.5 rounded-xl text-center border border-[#1E2E4A]">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Now Inside</span>
                    <div className="text-2xl font-black text-blue-400 font-mono mt-0.5">{r.token}</div>
                    <span className="text-[10px] text-slate-400 font-mono">In Chamber</span>
                  </div>
                  <div className="border-l border-[#1E2E4A]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Up Next</span>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{r.next}</div>
                    <span className="text-[10px] text-emerald-400 font-mono">~{r.avgWaitMins}m wait</span>
                  </div>
                </div>

                {/* Real-time turnstile scan indicator */}
                {r.lastScannedToken && (
                  <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-[11px] text-emerald-300 font-mono animate-pulse">
                    <span className="flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      Turnstile Scan: <strong>{r.lastScannedToken}</strong>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-sans font-bold">
                      At Chamber Door
                    </span>
                  </div>
                )}

                {/* Progress Bar & Pace */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>OPD Daily Roster Progress</span>
                    <strong className="text-white font-mono">{r.completedToday} / {totalAssigned} ({progressPercent}%)</strong>
                  </div>
                  <div className="w-full bg-[#061224] h-2 rounded-full overflow-hidden border border-[#1E2E4A]">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-[#1E2E4A]">
                <span className="text-slate-300">
                  Waiting: <strong className="text-amber-400 font-mono">{r.queueCount} Patients</strong>
                </span>
                <a 
                  href="/doctor-panel" 
                  className="bg-[#132647] hover:bg-[#1E2E4A] text-blue-400 hover:text-blue-300 font-bold px-3 py-1.5 rounded-xl border border-[#1E2E4A] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Open Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
