import React, { useState, useEffect } from 'react';
import { 
  Building2, Stethoscope, Users, Ambulance, ShieldCheck, 
  LogIn, ArrowRight, Activity, Lock, CheckCircle2, ChevronRight, 
  Sparkles, KeyRound, AlertCircle, FileSpreadsheet
} from 'lucide-react';

export const GovtAdminLanding: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'counter' | 'admin' | 'ambulance'>('doctor');
  const [employeeId, setEmployeeId] = useState('DOC-AIIMS-409');
  const [password, setPassword] = useState('••••••••');
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('smartcare_admin_employee');
    if (saved) {
      try {
        setCurrentEmployee(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleRoleSelect = (role: 'doctor' | 'counter' | 'admin' | 'ambulance') => {
    setSelectedRole(role);
    if (role === 'doctor') {
      setEmployeeId('DOC-AIIMS-409');
    } else if (role === 'counter') {
      setEmployeeId('DESK-SAF-102');
    } else if (role === 'admin') {
      setEmployeeId('SUPT-RML-001');
    } else if (role === 'ambulance') {
      setEmployeeId('DISPATCH-108-DL');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let empData: any = {};
    if (selectedRole === 'doctor') {
      empData = {
        name: 'Dr. Rajesh Sharma',
        role: 'doctor',
        designation: 'Senior Consultant - Cardiology',
        hospital: 'AIIMS New Delhi - Main Campus',
        redirect: '/doctor-panel'
      };
    } else if (selectedRole === 'counter') {
      empData = {
        name: 'Suresh Verma',
        role: 'counter',
        designation: 'OPD Registration & Token Operator',
        hospital: 'Safdarjung Hospital',
        redirect: '/counter-desk'
      };
    } else if (selectedRole === 'admin') {
      empData = {
        name: 'Dr. V. K. Paul',
        role: 'admin',
        designation: 'Medical Superintendent & Administrator',
        hospital: 'National Hospital Network',
        redirect: `${window.location.protocol}//${window.location.hostname}:5175`
      };
    } else if (selectedRole === 'ambulance') {
      empData = {
        name: 'Emergency Fleet Officer',
        role: 'ambulance',
        designation: '108 Central Dispatch Controller',
        hospital: 'Delhi Emergency EMS Command',
        redirect: '/ambulance-fleet'
      };
    }

    localStorage.setItem('smartcare_admin_employee', JSON.stringify(empData));
    localStorage.setItem('smartcare_staff', JSON.stringify(empData));
    localStorage.setItem('smartcare_auth', 'true');
    window.location.href = empData.redirect;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. National Tri-Color Top Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      {/* 2. Official Government Hospital Header */}
      <header className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-serif font-black text-lg shadow-md border border-blue-400/30">
              🏛️
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">
                Government of India • Ministry of Health & Family Welfare
              </p>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                National Hospital Administration & Clinical Staff Gateway
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Secure Staff Network Active
            </span>
          </div>
        </div>
      </header>

      {/* 3. Main Login & Role Selection Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Role Explanation & Authority Charter */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Hospital staff sign-in</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Choose your workspace
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Sign in to the tools you use during your shift. Activity is recorded in the hospital audit log.
            </p>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('doctor')}
                className={`p-4 rounded-2xl border text-left transition relative ${
                  selectedRole === 'doctor'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">OPD Doctor Console</h4>
                    <p className="text-[11px] text-slate-400">Call queue, Rx & Lab Orders</p>
                  </div>
                </div>
                {selectedRole === 'doctor' && (
                  <span className="absolute top-3 right-3 text-blue-400 font-bold text-xs">✓ Selected</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('counter')}
                className={`p-4 rounded-2xl border text-left transition relative ${
                  selectedRole === 'counter'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Reception Desk</h4>
                    <p className="text-[11px] text-slate-400">Walk-in triage & token print</p>
                  </div>
                </div>
                {selectedRole === 'counter' && (
                  <span className="absolute top-3 right-3 text-emerald-400 font-bold text-xs">✓ Selected</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`p-4 rounded-2xl border text-left transition relative ${
                  selectedRole === 'admin'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-900/30 ring-1 ring-purple-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Superintendent</h4>
                    <p className="text-[11px] text-slate-400">Load balance & city heatmap</p>
                  </div>
                </div>
                {selectedRole === 'admin' && (
                  <span className="absolute top-3 right-3 text-purple-400 font-bold text-xs">✓ Selected</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ambulance')}
                className={`p-4 rounded-2xl border text-left transition relative ${
                  selectedRole === 'ambulance'
                    ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-900/30 ring-1 ring-rose-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                    <Ambulance className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">108 Fleet Control</h4>
                    <p className="text-[11px] text-slate-400">GPS telematics & dispatch</p>
                  </div>
                </div>
                {selectedRole === 'ambulance' && (
                  <span className="absolute top-3 right-3 text-rose-400 font-bold text-xs">✓ Selected</span>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Employee Authentication Card */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <span>Employee Duty Sign-In</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Signing in as: <strong className="text-blue-400 capitalize">{selectedRole}</strong>
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                  Secure session
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Government Health ID / Employee Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Biometric / Portal Access PIN
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                  </div>
                </div>

                {/* Duty Security Declaration */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Duty Protocol Adherence Notice</span>
                  </div>
                  <p>
                    Queue calls and clinical actions in this session are included in the hospital audit log.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Continue to workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

        </div>

      </main>

      {/* 4. Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>© 2026 SmartCare Hospital Administration Network • National Health Authority</p>
          <p className="font-mono">Security Clearance: MoHFW-LEVEL-4</p>
        </div>
      </footer>
    </div>
  );
};
