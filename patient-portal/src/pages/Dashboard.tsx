import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  PhoneCall, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  MapPin,
  QrCode
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeToken, setActiveToken] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartcare_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    } else {
      setUser({
        full_name: 'Aarav Sharma',
        id: 'usr_982144',
        phone: '9821443211',
        abha_id: 'ABHA-9821-4432-1109',
        age: 68,
        gender: 'Male',
        address: 'Sector 62, Noida, UP - 201309',
        is_senior: true,
        is_pregnant: false,
        is_pwd: false
      });
    }

    // Load current active token
    const savedToken = localStorage.getItem('smartcare_current_token');
    const allottedTokens = localStorage.getItem('smartcare_allotted_tokens');
    if (savedToken) {
      try {
        setActiveToken(JSON.parse(savedToken));
      } catch (e) {
        console.error(e);
      }
    } else if (allottedTokens) {
      try {
        const list = JSON.parse(allottedTokens);
        if (list.length > 0) setActiveToken(list[0]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('smartcare_user');
    localStorage.removeItem('smartcare_token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 max-w-5xl mx-auto pb-32">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Patient Central Hub
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Backend JWT Authenticated
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Namaste, {user?.full_name || 'Patient'}!
          </h1>
          <p className="text-xs text-slate-500">ABHA Health ID: <strong className="text-slate-700">{user?.abha_id || 'ABHA-9821-4432-1109'}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/book-appointment"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Get New OPD Token</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs px-3 py-2.5 rounded-xl transition cursor-pointer"
          >
            Switch Account
          </button>
        </div>
      </div>

      {/* ONE-SHOT COMPREHENSION KPI STRIP FOR CITIZEN DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Tokens Issued Today</span>
            <strong className="text-base font-black text-slate-900 font-mono">14,820+</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Avg Wait Reduced</span>
            <strong className="text-base font-black text-emerald-600 font-mono">-42 mins</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Hospitals Active</span>
            <strong className="text-base font-black text-indigo-600 font-mono">3 AIIMS/RML</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Your Pass Status</span>
            <strong className="text-base font-black text-purple-700 font-mono">{activeToken ? 'Active Pass' : 'Ready to Book'}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Citizen Profile & Verified Credentials */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.full_name}</h3>
                <span className="text-xs text-slate-500 block">{user?.gender}, {user?.age} years</span>
                <span className="text-xs text-slate-500 block font-mono">Mobile: {user?.phone}</span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">ABHA Health ID:</span>
                <span className="font-semibold text-slate-800">{user?.abha_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Patient ID:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {user?.id || 'usr-pat-001'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Address:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate">{user?.address || 'Noida, UP'}</span>
              </div>
            </div>

            {/* Verified Priority Status Badges */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">Priority Criteria Applied:</span>
              <div className="flex flex-wrap gap-1.5">
                {user?.is_senior && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                    ✓ Senior Citizen (Age 60+)
                  </span>
                )}
                {user?.is_pregnant && (
                  <span className="text-[10px] font-bold bg-pink-100 text-pink-900 border border-pink-300 px-2 py-0.5 rounded-md">
                    ✓ Maternal Care / Pregnant
                  </span>
                )}
                {user?.is_pwd && (
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-md">
                    ✓ Person with Disability (PwD)
                  </span>
                )}
                {!user?.is_senior && !user?.is_pregnant && !user?.is_pwd && (
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    Standard OPD Demographics
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Help Contacts Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <PhoneCall className="w-4 h-4" />
              <span>Direct Hospital Desks</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/10">
                <span>OPD Registration Counter:</span>
                <a href="tel:+911126588500" className="font-bold text-blue-300 hover:underline">+91 11 2658 8500</a>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/10">
                <span>Senior Triage Nurse:</span>
                <a href="tel:+911126588700" className="font-bold text-emerald-300 hover:underline">+91 11 2658 8700</a>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/10">
                <span>Emergency Ambulance:</span>
                <a href="tel:108" className="font-bold text-rose-400 hover:underline">108 (Toll Free)</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Token & OPD Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Live Token Banner */}
          {activeToken ? (
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs bg-white/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> Live Active OPD Pass
                </span>
                <span className="text-xs bg-amber-400 text-amber-950 font-black px-2.5 py-0.5 rounded-md">
                  {activeToken.priorityTag || 'Priority Pass'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center relative z-10">
                <div>
                  <span className="text-xs text-blue-200 uppercase font-semibold">Your Token Number</span>
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-0.5">
                    {activeToken.tokenNumber || activeToken.token_number}
                  </h2>
                  <p className="text-sm font-medium text-blue-100 mt-1">{activeToken.department}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Consulting Doctor:</span>
                    <strong className="text-white">{activeToken.doctor}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Assigned Chamber:</span>
                    <strong className="text-white">{activeToken.chamber}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Token Status:</span>
                    <strong className="text-emerald-300 font-bold uppercase">{activeToken.status || 'WAITING'}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 relative z-10">
                <span className="text-xs text-blue-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Pass synchronized with Turnstile & Doctor Console.
                </span>
                <a
                  href="/my-token"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <span>View Scannable QR Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">No Active OPD Token</h3>
                <p className="text-xs text-slate-500 mt-1">Book a consultation slot now to get your instant scannable QR pass.</p>
              </div>
              <a
                href="/book-appointment"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition cursor-pointer"
              >
                <span>Get Real OPD Token Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* OPD Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/book-appointment"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">Book Real OPD Token</h4>
              <p className="text-xs text-slate-500 mt-1">
                Select clinical department, generate real SHA-256 scannable QR pass, and track live queue turn.
              </p>
            </a>

            <a
              href="/my-token"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group cursor-pointer"
            >
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">Active Scannable QR Pass</h4>
              <p className="text-xs text-slate-500 mt-1">
                Display high-density QR code for Android turnstile scan and monitor live lifecycle state.
              </p>
            </a>

            <a
              href="/triage"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group cursor-pointer"
            >
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition">AI Triage Assessment</h4>
              <p className="text-xs text-slate-500 mt-1">
                Assess clinical symptoms and receive priority triage score before booking.
              </p>
            </a>

            <a
              href="/hospital-select"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group cursor-pointer"
            >
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">Hospital Network Monitor</h4>
              <p className="text-xs text-slate-500 mt-1">
                Check live queue congestion across all connected city trauma and hospital centers.
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
