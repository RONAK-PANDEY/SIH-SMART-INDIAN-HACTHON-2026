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
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const vigilanceItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/' },
    { label: 'Arrival scans', icon: QrCode, path: '/live-scan-feed' },
    { label: 'Department queues', icon: Layers, path: '/live-queues' },
  ];

  const oversightItems = [
    { label: 'Service quality', icon: Stethoscope, path: '/doctor-performance' },
    { label: 'Recognition', icon: Coins, path: '/salary-bonus' },
    { label: 'Grievances', icon: Scale, path: '/grievances' },
    { label: 'Hospitals', icon: Building2, path: '/hospitals' },
  ];

  return (
    <aside className="app-sidebar w-16 sm:w-60 bg-slate-950 text-slate-300 min-h-screen flex flex-col p-2 sm:p-4 border-r border-slate-800 shrink-0 overflow-y-auto">
      
      {/* Oversight Authority Badge */}
      <div className="px-3 py-2 mb-5 text-xs">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Network operations</span>
        </div>
      </div>

      {/* Group 1: Live Queues & Turnstiles */}
      <div className="space-y-1 mb-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
          Operations
        </span>
        {vigilanceItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Group 2: Doctor Oversight & Ethics */}
      <div className="space-y-1 mb-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
          Quality
        </span>
        {oversightItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
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
          Hospital network online
        </p>
      </div>

    </aside>
  );
};
