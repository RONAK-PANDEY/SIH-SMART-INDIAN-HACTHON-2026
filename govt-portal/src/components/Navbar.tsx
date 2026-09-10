import React from 'react';
import { ShieldCheck, Bell, Activity, RefreshCw, Award, Lock, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, loading }) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      {/* National Tri-Color Top Accent */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Official Government Ombudsman Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-serif font-black text-base flex items-center justify-center shadow-md border border-amber-300">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">SmartCare</span>
            </div>
            <h1 className="text-base font-extrabold text-white tracking-tight">
              Network operations
            </h1>
          </div>
        </div>

        {/* Right: Status, Refresh & Portal Links */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300 font-mono text-[11px]">Realtime Queue Sentinel Active</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Refresh Live Audit Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}

          {/* Direct Link to Patient and Admin Portals */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
            <a
              href={`${window.location.protocol}//${window.location.hostname}:5173`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition text-[11px]"
            >
              <span>Patient Portal (:5173)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">|</span>
            <a
              href={`${window.location.protocol}//${window.location.hostname}:5174`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition text-[11px]"
            >
              <span>Doctor Console (:5174)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-[11px]">Operator</span>
          </div>
        </div>

      </div>
    </header>
  );
};
