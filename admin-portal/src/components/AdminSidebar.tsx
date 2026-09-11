import React from 'react';
import { Shield, Building2, Stethoscope, Users, Activity, BarChart3, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: Activity },
    { name: 'Hospitals', path: '/hospitals', icon: Building2 },
    { name: 'Doctors', path: '/doctor-panel', icon: Stethoscope },
    { name: 'Patients', path: '/patients', icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#D9FFD9] border-r border-slate-200 flex flex-col transition-all shrink-0">
      <div className="p-6 border-b border-blue-100 bg-blue-50">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          SmartCare Admin
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = currentPath === link.path || (currentPath === '/' && link.path === '/admin-dashboard');
          const Icon = link.icon;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50/50' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} /> 
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};


