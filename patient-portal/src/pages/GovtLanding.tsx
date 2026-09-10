import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Activity, QrCode, PhoneCall, ShieldCheck, 
  ArrowRight, Users, Clock, Building2, Stethoscope, 
  FileText, Ambulance, ChevronRight, UserCheck, LogIn, 
  CheckCircle2, Info, MessageSquareHeart
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] pb-24 font-sans selection:bg-teal-700 selection:text-white">
      
      {/* 1. Official National Tri-Color Accent Line */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      {/* 2. Official MoHFW Authority Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-sm font-semibold border border-slate-800">
              🏛️
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-xs tracking-tight">
                स्वास्थ्य एवं परिवार कल्याण मंत्रालय
              </p>
              <p className="text-[11px] text-slate-500">
                Ministry of Health and Family Welfare • Government of India
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded-md text-[10px] border border-teal-200/60">
                ABDM Compliant
              </span>
              <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[10px] border border-slate-200">
                PM-JAY Cashless ₹0
              </span>
            </div>
          </div>

          {/* Right Side: Helplines, Language Switcher & Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-700">
                <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                Helpline: <strong className="text-slate-900">1075</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5 text-red-700">
                <Ambulance className="w-3.5 h-3.5 text-red-600" />
                Emergency: <strong className="text-red-700">108</strong>
              </span>
            </div>

            <LanguageSwitcherPill />

            {currentUser ? (
              <a
                href="/dashboard"
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle min-h-[36px]"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{currentUser.full_name || 'My Dashboard'}</span>
              </a>
            ) : (
              <a
                href="/login"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Citizen Sign In</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section - Asymmetrical, Breathing, 8pt Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Clear Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>National OPD Token & Digital Turnstile System</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
              No more standing in hospital queues. Walk in on time.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Generate a digital OPD pass from home, verify your arrival at the hospital turnstile via QR scan, and track live queue movements in real time directly on your mobile device.
            </p>

            {/* Strict 48px touch target action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/triage"
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2 shadow-subtle min-h-[48px]"
              >
                <span>Book OPD Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="/my-token"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold text-sm px-5 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2 shadow-subtle min-h-[48px]"
              >
                <QrCode className="w-4 h-4 text-teal-700" />
                <span>View My Digital Pass</span>
              </a>

              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-4 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5 min-h-[48px]"
              >
                <MessageSquareHeart className="w-4 h-4 text-slate-500" />
                <span>Patient Feedback</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Zero registration fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>ABHA linked records</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>SMS queue reminders</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Asymmetrical Turnstile Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Live Turnstile Status</span>
                  <h2 className="text-lg font-semibold text-slate-900">AIIMS New Delhi • Main OPD</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Active Flow
                </span>
              </div>

              {/* Strict 8pt spacing metric tiles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Average Wait</span>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">18 min</p>
                  <p className="text-[11px] text-teal-800 font-semibold mt-0.5">↓ 42 min vs standard</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Users className="w-3.5 h-3.5 text-teal-700" />
                    <span>Checked In Today</span>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">14,820</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Across 42 counters</p>
                </div>
              </div>

              {/* Step indicator preview */}
              <div className="bg-teal-50/60 rounded-lg p-4 border border-teal-100/80 space-y-2">
                <p className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-teal-700" />
                  <span>How turnstile scanning works at the hospital:</span>
                </p>
                <ol className="text-xs text-slate-600 space-y-1 pl-4 list-decimal">
                  <li>Show the QR pass on your phone to the scanner at Gate B.</li>
                  <li>The turnstile unlocks and updates your doctor's screen to "AT DOOR".</li>
                  <li>Walk directly to your designated consultation room.</li>
                </ol>
              </div>

              <div className="pt-1">
                <a
                  href="/live-queue"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <span>Check Live Counter Congestion</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. Three Pillars Section - Generous negative space */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Designed for patients, doctors, and hospital administrators.
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-normal">
              Every step is engineered to reduce physical queue crowding and guarantee prioritized medical attention for those in urgent need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">1. Instant QR Gate Check-in</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Avoid the morning 6:00 AM queue rush. Scan your digital token at the physical turnstile reader to instantly confirm attendance.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">2. Clinical Triage Routing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emergency and acute cases are automatically flagged and prioritized, while regular follow-ups receive clear time slots.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center">
                <Activity className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">3. Live Transparent Queue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                See exactly how many patients are ahead of you and the expected call time. Rest comfortably in the waiting hall until your turn.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Clean MoHFW Footer */}
      <footer className="mt-16 border-t border-slate-200 pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto text-xs text-slate-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SmartCare National OPD Portal</span>
            <span>•</span>
            <span>National Health Authority (NHA) & MoHFW</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/login" className="hover:text-slate-900 transition-colors">Doctor Portal</a>
            <a href="/login" className="hover:text-slate-900 transition-colors">Admin Console</a>
            <button onClick={() => setIsFeedbackOpen(true)} className="hover:text-slate-900 transition-colors">
              Submit Grievance
            </button>
          </div>
        </div>
      </footer>

      {/* Patient Feedback Modal */}
      {isFeedbackOpen && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          doctorName="OPD General Medical Officer"
        />
      )}

    </div>
  );
};
