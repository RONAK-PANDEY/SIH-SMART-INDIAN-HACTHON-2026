import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Building2, 
  Layers, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Activity, 
  Check, 
  Star,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);

  const handleRunAudit = () => {
    setAuditRunning(true);
    setAuditComplete(false);
    setTimeout(() => {
      setAuditRunning(false);
      setAuditComplete(true);
      setTimeout(() => setAuditComplete(false), 5000);
    }, 1200);
  };

  return (
    <div className="p-8 bg-slate-50 text-slate-900 min-h-screen font-sans space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Hero Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold px-2.5 py-1 bg-emerald-500/10 border border-emerald-400/20 rounded-md">
            National Oversight System
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight mt-2 mb-1">
            National Healthcare Sentinel
          </h2>
          <p className="text-slate-300 text-sm font-medium">
            Real-time monitoring of hospital queues, patient flow and doctor recognition.
          </p>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-end md:items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/analytics')}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold px-5 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 border border-indigo-400/30 flex items-center gap-2 cursor-pointer text-sm hover:scale-[1.02] active:scale-95"
          >
            <BarChart3 className="w-4 h-4 text-blue-200" />
            <span>National Analytics</span>
          </button>

          <button
            onClick={handleRunAudit}
            disabled={auditRunning}
            className="bg-amber-400 text-slate-950 font-bold px-6 py-3.5 rounded-2xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm hover:-translate-y-0.5 active:translate-y-0"
          >
            <RefreshCw className={`w-4 h-4 ${auditRunning ? 'animate-spin' : ''}`} />
            {auditRunning ? 'Auditing Network...' : 'Run Audit'}
          </button>

          {auditComplete && (
            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center gap-2 animate-in fade-in duration-300 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div className="text-left font-medium">
                <div>Audit completed</div>
                <div className="text-[10px] text-emerald-200/90 font-mono">
                  ✓ Queue integrity checked • ✓ Token flow verified • ✓ Doctor feedback synchronized
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Four KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hospitals</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-black text-slate-900 font-mono">12</span>
          </div>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            ● Connected
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Queues</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-black text-slate-900 font-mono">28</span>
          </div>
          <p className="text-xs text-blue-600 font-bold flex items-center gap-1">
            ● Under monitoring
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-6 rounded-2xl shadow-xs hover:border-amber-300 transition">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Alerts</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-black text-amber-600 font-mono">2</span>
          </div>
          <p className="text-xs text-amber-700 font-bold flex items-center gap-1">
            ● Require review
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Compliance</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-black text-emerald-600 font-mono">96.4%</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            Network-wide
          </p>
        </div>
      </div>

      {/* 3. Priority Alert Visual Centerpiece */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          Priority Alert
        </h3>

        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-7 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  ⚠ QUEUE ALERT
                </span>
                <span className="text-slate-500 text-xs font-mono">ID: ALR-2048</span>
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-slate-900 mb-0.5">AIIMS New Delhi · Cardiology</h4>
                <p className="text-slate-700 text-sm font-medium">
                  Token: <strong className="text-amber-800 font-mono">CARD-048</strong> • Waiting: <strong className="text-rose-600 font-mono">48 min</strong> • Threshold: <span className="text-slate-600 font-mono">40 min</span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-900 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Priority Investigation Required</span>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => navigate('/alerts/CARD-048')}
                className="bg-amber-400 text-slate-950 font-extrabold px-7 py-3.5 rounded-2xl hover:bg-amber-300 transition-all text-sm shadow-md shadow-amber-400/20 flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
              >
                Investigate Alert <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Queue Monitoring Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Live Queue Monitoring
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Queue Card 1 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-slate-300 transition space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 text-lg">AIIMS New Delhi</h4>
                <p className="text-slate-500 text-xs font-semibold">Cardiology OPD</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                ● Normal
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Patients waiting</span>
                <span className="text-lg font-bold text-slate-900 font-mono">18</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Current token</span>
                <span className="text-lg font-bold text-amber-700 font-mono">CARD-047</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Estimated wait</span>
                <span className="text-lg font-bold text-blue-600 font-mono">22 min</span>
              </div>
            </div>

            {/* Load bar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                <span>Queue Capacity</span>
                <span>82%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[82%]"></div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button 
                onClick={() => navigate('/queues')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-200 text-center cursor-pointer"
              >
                View Queue
              </button>
              <button 
                onClick={() => navigate('/queues')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-200 text-center cursor-pointer"
              >
                View Tokens
              </button>
            </div>
          </div>

          {/* Queue Card 2 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-slate-300 transition space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Safdarjung Hospital</h4>
                <p className="text-slate-500 text-xs font-semibold">Pediatrics OPD</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                ● Normal
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Patients waiting</span>
                <span className="text-lg font-bold text-slate-900 font-mono">11</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Current token</span>
                <span className="text-lg font-bold text-amber-700 font-mono">PED-031</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Estimated wait</span>
                <span className="text-lg font-bold text-blue-600 font-mono">14 min</span>
              </div>
            </div>

            {/* Load bar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                <span>Queue Capacity</span>
                <span>61%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[61%]"></div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button 
                onClick={() => navigate('/queues')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-200 text-center cursor-pointer"
              >
                View Queue
              </button>
              <button 
                onClick={() => navigate('/queues')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-200 text-center cursor-pointer"
              >
                View Tokens
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Doctor Recognition Preview Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            Doctor Recognition
          </h3>
          <button 
            onClick={() => navigate('/doctors')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
          >
            View All Doctors →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-xl">
                🏆
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Dr. Rajesh Sharma</h4>
                <p className="text-slate-500 text-xs">Cardiology • AIIMS New Delhi</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-amber-700 font-extrabold text-lg flex items-center gap-1 justify-end font-mono">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.83 / 5.0
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Gold Recognition Tier
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-xl">
                🏆
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Dr. Priya Patel</h4>
                <p className="text-slate-500 text-xs">Pediatrics • Safdarjung Hospital</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-amber-700 font-extrabold text-lg flex items-center gap-1 justify-end font-mono">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.67 / 5.0
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Gold Recognition Tier
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
