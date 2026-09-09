import React from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Coins, 
  ShieldAlert, 
  Building2, 
  Radio, 
  Scale, 
  Users, 
  Layers, 
  BarChart3, 
  QrCode 
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const vigilanceItems = [
    { label: 'Live Hospital Overview', icon: LayoutDashboard, path: '/' },
    { label: 'National Turnstile QR Feed', icon: QrCode, path: '/live-scan-feed' },
    { label: 'Live Department Queues', icon: Layers, path: '/live-queues' },
  ];

  const oversightItems = [
    { label: 'Doctor Performance & Ratings', icon: Stethoscope, path: '/doctor-performance' },
    { label: 'Doctor Recognition Index (DRI)', icon: Coins, path: '/salary-bonus' },
    { label: 'Citizen Grievances', icon: Scale, path: '/grievances' },
    { label: 'Hospital Network', icon: Building2, path: '/hospitals' },
  ];

  return (
    <aside className="w-68 bg-slate-950 text-slate-300 min-h-screen flex flex-col p-4 border-r border-slate-800 shrink-0 overflow-y-auto">
      
      {/* Oversight Authority Badge */}
      <div className="p-3 mb-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-855 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>GOVERNMENT OBSERVER CONSOLE</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Central statutory vigilance overseeing patient queue flow, token turnstiles, and doctor recognition metrics.
        </p>
      </div>

      {/* Group 1: Live Queues & Turnstiles */}
      <div className="space-y-1 mb-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
          Live Queues & Vigilance
        </span>
        {vigilanceItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.label}
              href={item.path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>

      {/* Group 2: Doctor Oversight & Ethics */}
      <div className="space-y-1 mb-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
          Doctor Oversight & Ethics
        </span>
        {oversightItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.label}
              href={item.path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>

      {/* Footer Authority Declaration */}
      <div className="pt-3 mt-auto border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-slate-400 font-mono">
          <span>Authority: MoHFW</span>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>
        <p>
          Governed under the National Digital Health Ethics & Patient Rights Charter 2026.
        </p>
      </div>

    </aside>
  );
};
