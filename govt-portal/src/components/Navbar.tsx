import React from 'react';
import { User, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 text-slate-900 shadow-xs font-sans">
      {/* National Tri-Color Top Accent Line */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-slate-200"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Government Title & Navigation */}
        <div className="flex items-center gap-3">
          {/* Back & Next Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => window.history.back()}
              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
              title="Go Forward"
              aria-label="Go Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-serif font-black text-lg flex items-center justify-center shadow-xs">
            🏛
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              National Healthcare Sentinel
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Healthcare Queue & Doctor Recognition Monitoring
            </p>
          </div>
        </div>

        {/* Right: Live Status & Officer Role */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-700 font-bold text-xs tracking-wide">SYSTEM ACTIVE</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 text-xs border-l border-slate-200 pl-4">
            <span>Last audit: <strong className="text-slate-800 font-mono">10:08 AM</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-semibold cursor-pointer hover:bg-slate-100 transition shadow-xs">
            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px]">
              <User className="w-3 h-3" />
            </div>
            <span>Officer</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
