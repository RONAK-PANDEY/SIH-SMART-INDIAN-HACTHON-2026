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
  MapPin
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeToken, setActiveToken] = useState<any>({
    token_number: 'CARD-204',
    department: 'Cardiology & Heart Care',
    doctor: 'Dr. Rajesh Sharma',
    room: 'Room 204 (1st Floor)',
    position: 2,
    estimated_wait_mins: 8,
    status: 'WAITING_CALLED',
    priority_level: 'P2 - Senior Citizen Accelerated'
  });

  useEffect(() => {
    const saved = localStorage.getItem('smartcare_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default demo profile
      setUser({
        full_name: 'Aarav Sharma',
        aadhaar_id: '982144321109',
        abha_id: 'ABHA-9821-4432-1109',
        age: 68,
        gender: 'Male',
        phone: '+91 98765 43210',
        address: 'Sector 62, Noida, UP - 201309',
        blood_group: 'B+',
        is_senior: true,
        is_pregnant: false,
        is_pwd: false
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('smartcare_user');
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
              <ShieldCheck className="w-3.5 h-3.5" /> Aadhaar Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Namaste, {user?.full_name || 'Patient'}!
          </h1>
          <p className="text-xs text-slate-500">ABHA Health ID: <strong className="text-slate-700">{user?.abha_id || 'ABHA-9821-4432-1109'}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/triage"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Smart AI Triage</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs px-3 py-2.5 rounded-xl transition"
          >
            Switch Account
          </button>
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
                <span className="text-xs text-slate-500 block font-mono">Blood: {user?.blood_group || 'O+'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800">{user?.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Aadhaar (UIDAI):</span>
                <span className="font-mono font-semibold text-slate-800">
                  XXXX-XXXX-{user?.aadhaar_id ? user.aadhaar_id.slice(-4) : '1109'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Address:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate">{user?.address}</span>
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

        {/* Right Column (2 spans): Active Token & OPD Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Live Token Banner */}
          {activeToken && (
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs bg-white/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> Live Active OPD Pass
                </span>
                <span className="text-xs bg-amber-400 text-amber-950 font-black px-2.5 py-0.5 rounded-md">
                  {activeToken.priority_level}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center relative z-10">
                <div>
                  <span className="text-xs text-blue-200 uppercase font-semibold">Your Token Number</span>
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-0.5">
                    {activeToken.token_number}
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
                    <strong className="text-white">{activeToken.room}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Queue Ahead:</span>
                    <strong className="text-emerald-300 font-bold">{activeToken.position} Patients</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-blue-200">Estimated Turn:</span>
                    <strong className="text-amber-300 font-black text-sm">{activeToken.estimated_wait_mins} Mins</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 relative z-10">
                <span className="text-xs text-blue-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Please proceed towards 1st Floor Wing B when position is 1.
                </span>
                <a
                  href="/live-queue"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1"
                >
                  <span>Open Full Queue Display</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Quick OPD Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/triage"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">Smart AI Triage Assessment</h4>
              <p className="text-xs text-slate-500 mt-1">
                Describe symptoms in your own words, check 100+ conditions, and get routed to the right specialist.
              </p>
            </a>

            <a
              href="/hospital-select"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">City Hospital Network</h4>
              <p className="text-xs text-slate-500 mt-1">
                Check real-time congestion and queue wait times across all connected city hospitals.
              </p>
            </a>

            <a
              href="/book-appointment"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition">Book Direct Doctor Slot</h4>
              <p className="text-xs text-slate-500 mt-1">
                Reserve dedicated time slots for specialist consultation and follow-up visits.
              </p>
            </a>

            <a
              href="/referral"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">Inter-Hospital Fast-Track Referral</h4>
              <p className="text-xs text-slate-500 mt-1">
                Transfer queue passes to nearby less-congested hospitals to save up to 60+ minutes.
              </p>
            </a>
          </div>

          {/* Past Health Records / OPD Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Recent OPD Visits & Prescriptions</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Cardiology Follow-Up (ECG & Vitals Checked)</span>
                  <span className="text-[11px] text-slate-500">AIIMS New Delhi • Dr. Rajesh Sharma • 28 Aug 2026</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                  Completed
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">General Medicine Seasonal Flu Checkup</span>
                  <span className="text-[11px] text-slate-500">Safdarjung Hospital • Dr. Priya Patel • 15 Jul 2026</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
