import React from 'react';
import { LayoutDashboard, Building2, Layers, BarChart3, AlertCircle, Map, Stethoscope } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Hospital Network', icon: Building2, path: '/hospitals' },
    { label: 'Live Queues', icon: Layers, path: '/live-queues' },
    { label: 'Doctor Panel', icon: Stethoscope, path: '/doctor-panel' },
    { label: 'Flow Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Alerts & Incidents', icon: AlertCircle, path: '/alerts' },
    { label: 'Load Heatmap', icon: Map, path: '/heatmap' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col p-4 border-r border-slate-800">
      <div className="flex items-center gap-2.5 px-3 py-4 mb-4 border-b border-slate-800 text-white font-bold text-lg">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">SC</div>
        <span>SmartCare Admin</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.path}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-slate-800 hover:text-white transition"
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
};
