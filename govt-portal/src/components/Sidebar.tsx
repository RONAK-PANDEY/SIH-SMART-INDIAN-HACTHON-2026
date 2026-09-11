import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  ShieldAlert, 
  Award, 
  MessageSquare, 
  Building2, 
  Activity,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const mainItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/' },
    { label: 'Hospital Queues', icon: Layers, path: '/queues' },
    { label: 'Alerts', icon: ShieldAlert, path: '/alerts' },
    { label: 'National Analytics', icon: BarChart3, path: '/analytics' },
  ];

  const recognitionItems = [
    { label: 'Doctor Recognition', icon: Award, path: '/doctors' },
    { label: 'Citizen Feedback', icon: MessageSquare, path: '/feedback' },
  ];

  const systemItems = [
    { label: 'Hospital Network', icon: Building2, path: '/hospitals' },
    { label: 'System Status', icon: Activity, path: '/system' },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 min-h-screen flex flex-col p-4 border-r border-slate-200/80 shrink-0 overflow-y-auto font-sans shadow-xs">
      
      {/* Oversight Authority Badge */}
      <div className="p-3.5 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span className="tracking-wider">NATIONAL SENTINEL</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Statutory vigilance & doctor recognition monitoring console.
        </p>
      </div>

      {/* Group 1: MAIN */}
      <div className="space-y-1 mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">
          MAIN
        </span>
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                  : 'text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Group 2: RECOGNITION */}
      <div className="space-y-1 mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">
          RECOGNITION
        </span>
        {recognitionItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                  : 'text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Group 3: SYSTEM */}
      <div className="space-y-1 mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">
          SYSTEM
        </span>
        {systemItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                  : 'text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Authority Declaration */}
      <div className="pt-4 mt-auto border-t border-slate-200 text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-600 font-mono">
          <span>Authority: MoHFW</span>
          <span className="text-emerald-600 font-bold">● Live</span>
        </div>
        <p className="text-[9px] text-slate-400">SIH 2026 National Healthcare Sentinel</p>
      </div>

    </aside>
  );
};
