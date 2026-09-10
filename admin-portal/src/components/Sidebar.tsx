import React from 'react';
import { 
  Stethoscope, 
  Layers, 
  LogIn, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  UserCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const savedEmployee = localStorage.getItem('smartcare_admin_employee');
  let role = 'doctor';
  if (savedEmployee) {
    try {
      role = JSON.parse(savedEmployee).role || role;
    } catch {
      localStorage.removeItem('smartcare_admin_employee');
    }
  }
  const roleItem = role === 'counter'
    ? { label: 'Reception Desk', icon: UserCheck, path: '/counter-desk' }
    : role === 'ambulance'
      ? { label: '108 Fleet Control', icon: Activity, path: '/ambulance-fleet' }
      : { label: 'Doctor Consultation', icon: Stethoscope, path: '/doctor-panel' };
  const menuItems = [
    roleItem,
    { label: 'Live Turn Calling', icon: Layers, path: '/live-queues' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col p-4 border-r border-slate-800 shrink-0">
      
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-3 py-4 mb-4 border-b border-slate-800 text-white font-bold text-base">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
          🩺
        </div>
        <div>
          <span className="block leading-tight">SmartCare Clinical</span>
          <span className="text-[10px] text-slate-400 font-normal">Doctor Consultation Suite</span>
        </div>
      </div>

      {/* Duty Status Badge */}
      <div className="p-3 mb-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>ON CLINICAL DUTY</span>
        </div>
        <p className="text-[11px] text-slate-400">Dr. Rajesh Sharma (Cardiology)</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 text-xs">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/doctor-panel' && location.pathname === '/');
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Oversight Console Promotion Link */}
      <div className="pt-4 mt-auto border-t border-slate-800 space-y-2">
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>National Oversight Console</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-tight">
            Counter Desk, 108 Fleet, Analytics, Heatmap & Bonus Engine shifted to Port 5175.
          </p>
          <a
            href={`${window.location.protocol}//${window.location.hostname}:5175`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold text-[11px] transition shadow-xs"
          >
            <span>Open Govt Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
};
