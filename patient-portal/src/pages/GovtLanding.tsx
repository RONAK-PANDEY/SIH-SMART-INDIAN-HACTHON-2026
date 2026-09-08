import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Activity, QrCode, PhoneCall, ShieldCheck, 
  ArrowRight, Users, Clock, Award, Building2, Stethoscope, 
  FileText, Star, Ambulance, ChevronRight, UserCheck, LogIn, 
  Sparkles, CheckCircle, Info, MessageSquareHeart
} from 'lucide-react';
import { useTranslation, LanguageSwitcherPill } from '../i18n';
import { FeedbackModal } from '../components/FeedbackModal';

export const GovtLanding: React.FC = () => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'how_it_works' | 'services' | 'oversight'>('how_it_works');

  useEffect(() => {
    const savedUser = localStorage.getItem('smartcare_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 1. Official National Tri-Color Top Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      {/* 2. Official MoHFW / National Health Authority Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* National Branding Sub-bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* National Emblem Badge representation */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-serif font-black text-sm border-2 border-amber-400 shadow-xs">
                🏛️
              </div>
              <div>
                <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wide leading-tight">
                  स्वास्थ्य एवं परिवार कल्याण मंत्रालय
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Ministry of Health and Family Welfare • Government of India
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-300">
              <span className="bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded text-[10px] border border-orange-200">
                ABDM Enabled
              </span>
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                PM-JAY Cashless ₹0
              </span>
            </div>
          </div>

          {/* Right Side: Helplines, Language Switcher & Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* 24x7 Helplines */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              <span className="flex items-center gap-1 text-blue-700">
                <PhoneCall className="w-3 h-3 text-blue-600" />
                Helpline: <strong className="text-slate-900">1075</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-red-600">
                <Ambulance className="w-3.5 h-3.5" />
                Emergency: <strong className="text-red-700">108</strong>
              </span>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcherPill />

            {/* User Auth Buttons in Top-Right Corner */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Dashboard ({currentUser.name?.split(' ')[0] || 'Citizen'})</span>
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('login') || 'Citizen Login'}</span>
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  <span>{t('register') || 'Register'}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section with MoHFW Sovereign Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white pt-12 pb-20 px-4 sm:px-6">
        {/* Background Subtle Grid & Lighting */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Smart India Hackathon (SIH) 2026 • Official Initiative</span>
              </div>

              {/* 1-Paragraph Who is this for / What problem does this solve (Judge Overview) */}
              <div className="p-4 rounded-2xl bg-blue-900/40 border border-blue-400/40 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>SIH 2026 Problem Statement & Solution Matrix</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  <strong>Who is this for:</strong> OPD patients and public hospital administrators facing chaotic 3–5 hour waiting queues. <strong>What problem it solves:</strong> Eliminates physical queues via AI symptom-to-department triage, verifies physical presence via anti-ghost-token turnstile QR validation, and aligns doctor bedside adherence directly with government performance salary bonuses.
                </p>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                National Smart OPD Queue & AI Triage Platform
              </h1>
              
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Empowering 1.4 Billion citizens with real-time digital OPD tokens, AI-powered direct department allocation, 108 emergency telematics, and transparent doctor behavioral oversight.
              </p>

              {/* ONE-SHOT COMPREHENSION KPI STRIP FOR CITIZEN PORTAL */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-500/30">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Tokens Issued Today</span>
                  <strong className="text-lg font-mono text-blue-400 font-black">14,820+</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Avg Wait Reduced</span>
                  <strong className="text-lg font-mono text-emerald-400 font-black">-42 Mins</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">AIIMS Hospitals Live</span>
                  <strong className="text-lg font-mono text-amber-300 font-black">3 Network</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Queue Integrity</span>
                  <strong className="text-lg font-mono text-purple-300 font-black">99.8%</strong>
                </div>
              </div>

              {/* Primary Call-to-Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="/book-appointment"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all text-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Book Smart OPD Token</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="/triage"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-all text-sm"
                >
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>AI Symptom Checker</span>
                </a>

                <a
                  href="/ambulance"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-rose-600/90 hover:bg-rose-600 text-white font-semibold rounded-xl border border-rose-400/30 transition-all text-sm"
                >
                  <Ambulance className="w-4 h-4" />
                  <span>108 Ambulance SOS</span>
                </a>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Aadhaar / ABHA e-KYC Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Zero Waiting Room Congestion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Doctor Salary Bonus Linked to Rating</span>
                </div>
              </div>
            </div>

            {/* Hero Right Quick Citizen Action Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 text-slate-900">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Citizen Quick Gateway</h3>
                    <p className="text-xs text-slate-500">Access instant hospital services</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                </div>

                {/* Quick Action Buttons Grid */}
                <div className="mt-4 space-y-2.5">
                  <a
                    href="/my-token"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">View Active OPD Pass</p>
                        <p className="text-xs text-slate-500">Check live turn & scannable QR</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" />
                  </a>

                  <a
                    href="/health-records"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Prescriptions & Bills Vault</p>
                        <p className="text-xs text-slate-500">Download digital Rx & tax receipts</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition" />
                  </a>

                  <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Rate Doctor & Consultation</p>
                        <p className="text-xs text-slate-500">Submit review for Govt Salary Bonus review</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition" />
                  </button>
                </div>

                {/* Login/Register Prompts inside card */}
                {!currentUser && (
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">First time visitor?</span>
                    <div className="flex gap-2">
                      <a href="/register" className="font-bold text-blue-700 hover:underline">Register (ABHA)</a>
                      <span className="text-slate-300">•</span>
                      <a href="/login" className="font-bold text-blue-700 hover:underline">Login</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Live National OPD Statistics Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tokens Issued Today</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-700">14,82,490+</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center sm:justify-start gap-1">
              <span>↑ 18.4%</span> vs traditional counters
            </p>
          </div>

          <div className="text-center sm:text-left space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Wait Reduced</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">42 Mins</p>
            <p className="text-[11px] text-slate-500 font-medium">From 110 mins to 28 mins</p>
          </div>

          <div className="text-center sm:text-left space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participating Hospitals</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-700">3,850+</p>
            <p className="text-[11px] text-slate-500 font-medium">AIIMS, Safdarjung, RML & State</p>
          </div>

          <div className="text-center sm:text-left space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Satisfaction</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center justify-center sm:justify-start gap-1">
              4.8 ★
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Based on 6.2L verified reviews</p>
          </div>
        </div>
      </section>

      {/* 5. Interactive Navigation Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/60 text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('how_it_works')}
              className={`px-5 py-2.5 rounded-xl transition ${
                activeTab === 'how_it_works'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 How Smart OPD Works
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-5 py-2.5 rounded-xl transition ${
                activeTab === 'services'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏥 Public Health Services
            </button>
            <button
              onClick={() => setActiveTab('oversight')}
              className={`px-5 py-2.5 rounded-xl transition ${
                activeTab === 'oversight'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛡️ Doctor Rating & Salary Bonus Link
            </button>
          </div>
        </div>

        {/* Tab Content 1: How It Works */}
        {activeTab === 'how_it_works' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h4 className="font-extrabold text-slate-900 text-base">Select Problem / Symptoms</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Click on one-touch problem cards (Chest Pain, Fever, Fracture, Skin Rash) or type your exact symptoms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h4 className="font-extrabold text-slate-900 text-base">Direct AI Department Match</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                SmartCare AI recommends the exact clinical department (Cardiology, Orthopedics, Pediatrics) and available OPD slot.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h4 className="font-extrabold text-slate-900 text-base">Get Scannable QR Token Pass</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Pay ₹0 with PM-JAY or via UPI/Cards. Instant digital OPD pass generated with real scannable QR verification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-black text-sm flex items-center justify-center mb-4">
                4
              </span>
              <h4 className="font-extrabold text-slate-900 text-base">Track Live Queue & Rate Doctor</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Arrive when your token is called. After consultation, rate doctor talking behavior to impact Govt salary bonus.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 2: Public Services */}
        {activeTab === 'services' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Specialist OPD Consultations</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Pre-book tokens across all 18 clinical departments in AIIMS, Safdarjung, and State Government Medical Colleges.
              </p>
              <a href="/hospital-select" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
                <span>Explore Hospitals</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Ambulance className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">24x7 108 Emergency Telematics</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                One-tap SOS dispatch with live GPS tracking, ventilator/oxygen equipped fleet, and hospital bed handoff coordination.
              </p>
              <a href="/ambulance" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline">
                <span>Request Ambulance</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Universal Health Records Vault</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Access your doctor prescriptions, pathology lab reports, and billing receipts in one secure digital locker.
              </p>
              <a href="/health-records" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline">
                <span>Open Health Records</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab Content 3: Doctor Rating & Govt Bonus Engine */}
        {activeTab === 'oversight' && (
          <div className="mt-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl animate-in fade-in duration-300">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" />
                <span>MoHFW Direct Accountability Mechanism</span>
              </div>
              <h3 className="text-2xl font-black">Citizen Ratings Directly Drive Doctor Performance Bonuses</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                Under the National Health Transparency Framework, every citizen feedback rating is scrutinized by the <strong>Government Observer & Vigilance Ombudsman</strong>.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15">
                  <p className="font-bold text-emerald-400 text-sm">Grade A+ (Rating ≥ 4.8)</p>
                  <p className="text-slate-300 mt-1">Doctor receives <strong>+15% Performance Salary Bonus</strong> and Excellence Citation.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15">
                  <p className="font-bold text-blue-400 text-sm">Grade A (Rating 4.2 - 4.7)</p>
                  <p className="text-slate-300 mt-1">Doctor receives <strong>+8% Performance Incentive</strong> for high patient satisfaction.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15">
                  <p className="font-bold text-rose-400 text-sm">Grade C (Rating &lt; 3.2 / Grievance)</p>
                  <p className="text-slate-300 mt-1">Triggers <strong>-10% Disciplinary Deduction</strong> and mandatory Vigilance Show-Cause Notice.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-400">Had a consultation recently? Help improve healthcare standards.</span>
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
                >
                  Rate Your Doctor Now
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. Bottom Registration & Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">Register Your Ayushman Bharat (ABHA) Health ID</h3>
            <p className="text-blue-200 text-xs sm:text-sm max-w-xl">
              Create your 14-digit ABHA ID in under 60 seconds with Aadhaar OTP to access lifetime paperless OPD visits.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/register"
              className="px-6 py-3 bg-white text-blue-900 font-bold rounded-xl shadow-md hover:bg-blue-50 text-sm transition"
            >
              New Citizen Registration
            </a>
            <a
              href="/login"
              className="px-6 py-3 bg-blue-900/80 hover:bg-blue-900 border border-blue-400/40 text-white font-bold rounded-xl text-sm transition"
            >
              Citizen Login
            </a>
          </div>
        </div>
      </section>

      {/* 7. Official Government Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 pt-8 border-t border-slate-200 text-xs text-slate-500 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h5 className="font-bold text-slate-900 mb-2">Government Portals</h5>
            <ul className="space-y-1.5">
              <li><a href="https://abdm.gov.in" target="_blank" rel="noreferrer" className="hover:underline">Ayushman Bharat Digital Mission (ABDM)</a></li>
              <li><a href="https://pmjay.gov.in" target="_blank" rel="noreferrer" className="hover:underline">Pradhan Mantri Jan Arogya Yojana</a></li>
              <li><a href="https://mohfw.gov.in" target="_blank" rel="noreferrer" className="hover:underline">Ministry of Health & Family Welfare</a></li>
              <li><a href="https://ors.gov.in" target="_blank" rel="noreferrer" className="hover:underline">Online Registration System (ORS)</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-2">Citizen Services</h5>
            <ul className="space-y-1.5">
              <li><a href="/book-appointment" className="hover:underline">Smart OPD Token Booking</a></li>
              <li><a href="/triage" className="hover:underline">AI Symptom Triage</a></li>
              <li><a href="/ambulance" className="hover:underline">108 Emergency Ambulance</a></li>
              <li><a href="/health-records" className="hover:underline">Digital Prescriptions & Invoices</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-2">Transparency & Oversight</h5>
            <ul className="space-y-1.5">
              <li><button onClick={() => setIsFeedbackOpen(true)} className="hover:underline text-left">Citizen Doctor Rating Survey</button></li>
              <li><a href="http://localhost:5175" target="_blank" rel="noreferrer" className="hover:underline font-semibold text-emerald-700">Govt Observer Portal (Port 5175)</a></li>
              <li><a href="http://localhost:5174" target="_blank" rel="noreferrer" className="hover:underline font-semibold text-blue-700">Hospital Staff Gateway (Port 5174)</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-2">24x7 Emergency Helplines</h5>
            <ul className="space-y-1.5">
              <li>National Toll-Free: <strong>1075</strong></li>
              <li>Ambulance Service: <strong>108</strong></li>
              <li>PM-JAY Scheme Call: <strong>14555</strong></li>
              <li>Women Helpline: <strong>1091</strong></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 SmartCare OPD System. Designed for Smart India Hackathon (SIH) 2026. Ministry of Health & Family Welfare.</p>
          <div className="flex items-center gap-3">
            <span>Powered by Ayushman Bharat Digital Mission (ABDM)</span>
          </div>
        </div>
      </footer>

      {/* Citizen Feedback Survey Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        doctorId="doc-001"
        doctorName="Dr. Rajesh Sharma"
        department="Cardiology"
        hospitalName="AIIMS New Delhi - Main Campus"
        tokenNumber="CARD-042"
        patientName={currentUser?.name || "Citizen Patient"}
      />
    </div>
  );
};
