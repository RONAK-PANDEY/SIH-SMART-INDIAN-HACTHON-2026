import React from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Coins, 
  ShieldAlert, 
  Building2, 
  Radio, 
  FileCheck, 
  Scale, 
  Flame,
  Users,
  Layers,
  BarChart3,
  AlertCircle,
  Map
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const oversightItems = [
    { label: 'Hospital Sentinel Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Doctor Behavioral DPI', icon: Stethoscope, path: '/doctor-performance' },
    { label: 'Salary Bonus Engine', icon: Coins, path: '/salary-bonus' },
    { label: 'Citizen Grievances', icon: Scale, path: '/grievances' },
    { label: 'Quality Accreditation', icon: Building2, path: '/compliance' },
  ];

  const operationsItems = [
    { label: 'Counter Helpdesk', icon: Users, path: '/counter-desk' },
    { label: '108 Ambulance Fleet', icon: Flame, path: '/ambulance-fleet' },
    { label: 'Live OPD Queues', icon: Layers, path: '/live-queues' },
    { label: 'Hospital Network', icon: Building2, path: '/hospitals' },
  ];

  const analyticsItems = [
    { label: 'Flow Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Alerts & Incidents', icon: AlertCircle, path: '/alerts' },
    { label: 'Load Heatmap', icon: Map, path: '/heatmap' },
  ];

  return (
    <aside className="w-68 bg-slate-950 text-slate-300 min-h-screen flex flex-col p-4 border-r border-slate-800 shrink-0 overflow-y-auto">
      
      {/* Oversight Authority Badge */}
      <div className="p-3 mb-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>NATIONAL OVERSIGHT SENTINEL</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Neutral statutory ombudsman between Citizen patients and Hospital clinical administration.
        </p>
      </div>

      {/* Group 1: Vigilance & Oversight */}
      <div className="space-y-1 mb-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
          Vigilance & Oversight
        </span>
        {oversightItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.label}
              href={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
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

      {/* Group 2: Hospital Operations & Queues */}
      <div className="space-y-1 mb-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
          Hospital Operations
        </span>
        {operationsItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.label}
              href={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
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

      {/* Group 3: Analytics & Congestion Heatmap */}
      <div className="space-y-1 mb-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
          Analytics & Heatmap
        </span>
        {analyticsItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.label}
              href={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
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
