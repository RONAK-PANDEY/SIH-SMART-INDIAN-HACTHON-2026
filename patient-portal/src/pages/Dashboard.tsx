import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Activity, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  FileText, 
  QrCode,
  MapPin,
  ChevronRight,
  LogOut
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

    // Load active token
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] p-4 sm:p-6 max-w-6xl mx-auto pb-32 font-sans">
      
      {/* 1. Header Section - Asymmetrical & Breathing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-0.5 rounded-md border border-teal-200/60">
              Verified Citizen Account
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              ABHA Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'Patient'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ABHA Number: <span className="font-semibold text-slate-700">{user?.abha_id || 'ABHA-9821-4432-1109'}</span>
          </p>
        </div>

        {/* Action Buttons - 44px+ touch targets */}
        <div className="flex items-center gap-3">
          <a
            href="/triage"
            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-4 py-3 rounded-xl transition-colors shadow-subtle inline-flex items-center gap-2 min-h-[44px]"
          >
            <QrCode className="w-4 h-4" />
            <span>Book New OPD Pass</span>
          </a>
          
          <button
            type="button"
            onClick={handleLogout}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs px-3.5 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
            title="Log out of account"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch</span>
          </button>
        </div>
      </div>

      {/* 2. Today's OPD Overview Grid (8pt Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Today's OPD Hospital</span>
          <p className="text-base sm:text-lg font-semibold text-slate-900 truncate">AIIMS New Delhi</p>
          <p className="text-xs text-slate-500">Main Outpatient Wing</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Average Wait Time</span>
          <p className="text-base sm:text-lg font-semibold text-teal-800">18 minutes</p>
          <p className="text-xs text-slate-500">Normal queue pace</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Active Turnstiles</span>
          <p className="text-base sm:text-lg font-semibold text-slate-900">Gate A & Gate B</p>
          <p className="text-xs text-slate-500">QR reader online</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Your Pass Status</span>
          <p className="text-base sm:text-lg font-semibold text-slate-900">
            {activeToken ? 'Token Confirmed' : 'No Active Pass'}
          </p>
          <p className="text-xs text-teal-700 font-semibold">
            {activeToken ? 'Ready for scan' : 'Tap to book'}
          </p>
        </div>
      </div>

      {/* 3. Main Content Columns - Asymmetrical 8:4 split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Active Pass Boarding Card & Steps */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeToken ? (
            /* Active Boarding Pass Card */
            <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                    <span className="text-xs font-semibold text-slate-700">Digital OPD Pass Confirmed</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    Token ID: {activeToken.tokenNumber || activeToken.token_number || 'CARD-204'}
                  </span>
                </div>

                {/* Token Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block mb-1">Assigned Department</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {activeToken.department || 'Cardiology & Heart Care'}
                    </p>
                    <span className="text-xs text-slate-500 mt-1 block">OPD Block 2, Floor 1</span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block mb-1">Consulting Doctor</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {activeToken.doctor || 'Dr. Rajesh Sharma, MD'}
                    </p>
                    <span className="text-xs text-slate-500 mt-1 block">Consultation Room 104</span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block mb-1">Arrival Window</span>
                    <p className="text-sm font-semibold text-teal-800">
                      10:30 AM - 11:00 AM
                    </p>
                    <span className="text-xs text-slate-500 mt-1 block">Gate B Turnstile</span>
                  </div>
                </div>

                {/* Turnstile Instructions */}
                <div className="bg-teal-50/60 rounded-lg p-4 border border-teal-100 text-xs text-slate-700 space-y-1.5">
                  <p className="font-semibold text-teal-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-teal-700" />
                    <span>Next step when you reach the hospital:</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Open your digital pass, hold the QR code 10cm in front of the scanner at Turnstile Gate B. Your doctor will immediately see your status as "AT DOOR".
                  </p>
                </div>

                {/* Call to action */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="/my-token"
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-colors shadow-subtle inline-flex items-center gap-2 min-h-[44px]"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Open QR Code Pass</span>
                  </a>

                  <a
                    href="/live-queue"
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs px-4 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Activity className="w-4 h-4 text-slate-500" />
                    <span>Track Queue Position</span>
                  </a>
                </div>

              </div>
            </div>
          ) : (
            /* No Active Token Card */
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-card text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
                <Calendar className="w-6 h-6 text-slate-500" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-slate-900">No OPD consultations booked for today</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You can schedule an outpatient appointment or check in directly using our clinical symptom checker.
                </p>
              </div>
              <div>
                <a
                  href="/triage"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-colors shadow-subtle inline-flex items-center gap-2 min-h-[44px]"
                >
                  <span>Book OPD Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Recent Records & History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Past Consultations & Prescriptions</h2>
              <a href="/health-records" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
                View All Records
              </a>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                    <FileText className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Cardiology Outpatient Follow-up</p>
                    <p className="text-slate-500">Dr. Rajesh Sharma • AIIMS Delhi</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-700">12 Aug 2026</span>
                  <p className="text-slate-500 text-[11px]">ECG & Rx Issued</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                    <FileText className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">General Medicine Routine Review</p>
                    <p className="text-slate-500">Dr. Priya Verma • Safdarjung Hospital</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-700">03 May 2026</span>
                  <p className="text-slate-500 text-[11px]">Lab Panel Done</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Patient Profile Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100">
              Patient Profile
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name</span>
                <p className="font-semibold text-slate-900 mt-0.5">{user?.full_name || 'Aarav Sharma'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500 block">Age</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{user?.age || '68'} Years</p>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{user?.gender || 'Male'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block">Registered Phone</span>
                <p className="font-semibold text-slate-900 mt-0.5">+91 {user?.phone || '9821443211'}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block">Address</span>
                <p className="font-normal text-slate-600 mt-0.5 leading-relaxed">
                  {user?.address || 'Sector 62, Noida, Uttar Pradesh - 201309'}
                </p>
              </div>

              {user?.is_senior && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-200">
                    Senior Citizen Priority Enabled
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <a
                href="/profile"
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2.5 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 min-h-[40px]"
              >
                <span>Edit Profile Information</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Hospital Helpdesk Card */}
          <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-xs space-y-2">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Need Assistance at the Hospital?</span>
            </p>
            <p className="text-slate-600 leading-relaxed font-normal">
              May I Help You desks are positioned near Turnstile Gate A and Gate B. Staff can assist senior citizens and verify paper slips.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
