import React, { useState } from 'react';
import { Shield, Lock, Stethoscope, UserCheck, ArrowRight, Building2, User, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [role, setRole] = useState<'doctor' | 'counter' | 'admin'>('doctor');
  const [username, setUsername] = useState('dr.rajesh.sharma');
  const [password, setPassword] = useState('demo123');

  const demoAccounts = [
    {
      id: 'dr_rajesh',
      name: 'Dr. Rajesh Sharma',
      role: 'doctor',
      roleTitle: 'Senior Cardiologist & HOD',
      dept: 'Cardiology (Chamber 204)',
      badge: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    {
      id: 'dr_priya',
      name: 'Dr. Priya Patel',
      role: 'doctor',
      roleTitle: 'General Physician & Triage Lead',
      dept: 'General Medicine (Chamber 105)',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      id: 'staff_counter',
      name: 'Sunita Mehra (Counter #01)',
      role: 'counter',
      roleTitle: 'OPD Desk & Walk-in Triage Officer',
      dept: 'Central Registration Desk',
      badge: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      id: 'admin_cmo',
      name: 'Dr. V. K. Paul (CMO)',
      role: 'admin',
      roleTitle: 'Hospital Administrator & Network Lead',
      dept: 'Executive Admin Wing',
      badge: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setUsername(acc.id);
    setRole(acc.role as any);
    localStorage.setItem('smartcare_staff', JSON.stringify(acc));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = demoAccounts.find(a => a.id === username) || demoAccounts[0];
    localStorage.setItem('smartcare_staff', JSON.stringify(acc));
    
    if (acc.role === 'doctor') {
      window.location.href = '/doctor-panel';
    } else if (acc.role === 'counter') {
      window.location.href = '/counter-desk';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 max-w-md w-full rounded-2xl shadow-2xl border border-slate-700 p-6 sm:p-8 text-white">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-[11px] bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-full border border-blue-500/30 mb-2 inline-block">
            Hospital Staff & Clinical Access
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">SmartCare Medical Console</h2>
          <p className="text-xs text-slate-400 mt-1">
            Doctor consultation panel, emergency triage, and counter desk system
          </p>
        </div>

        {/* 1-Click Fast Switch Demo Personas */}
        <div className="mb-6 bg-slate-900/80 border border-slate-700 rounded-xl p-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Staff Role (1-Click Demo Login):</span>
          </span>
          <div className="space-y-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectDemo(acc)}
                className={`w-full p-2.5 rounded-lg border text-left text-xs transition flex items-center justify-between ${
                  username === acc.id
                    ? 'border-blue-500 bg-blue-600/20 font-semibold'
                    : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700/60'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-200 block">{acc.name}</span>
                  <span className="text-[10px] text-slate-400">{acc.dept}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${acc.badge}`}>
                  {acc.roleTitle}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Staff ID / Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-600 bg-slate-900 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-600 bg-slate-900 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Clinical Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
