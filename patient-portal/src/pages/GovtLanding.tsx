import React, { useEffect, useState } from 'react';
import { Activity, Ambulance, ArrowRight, CheckCircle2, ChevronRight, Clock3, FileText, HeartPulse, Hospital, LogIn, MapPin, QrCode, ShieldCheck, Sparkles, Stethoscope, UserCheck, Users } from 'lucide-react';
import { LanguageSwitcherPill } from '../i18n';
import { FeedbackModal } from '../components/FeedbackModal';

const steps = [
  { number: '01', icon: Activity, title: 'Share your symptoms', text: 'A short guided check helps point you to the right department.' },
  { number: '02', icon: Hospital, title: 'Choose a hospital', text: 'Compare nearby hospitals and available OPD services.' },
  { number: '03', icon: QrCode, title: 'Arrive with your pass', text: 'Follow your live queue and show a simple QR pass when you arrive.' },
];

const benefits = [
  { icon: Clock3, title: 'Less waiting', text: 'See your place in the line before you leave home.' },
  { icon: ShieldCheck, title: 'Designed for trust', text: 'ABHA-ready healthcare access with clear patient controls.' },
  { icon: Users, title: 'Care that prioritises', text: 'Emergency and vulnerable patients are recognised earlier.' },
];

export const GovtLanding: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ full_name?: string; name?: string } | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartcare_user');
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch { localStorage.removeItem('smartcare_user'); }
  }, []);

  const firstName = currentUser?.full_name?.split(' ')[0] || currentUser?.name?.split(' ')[0] || 'Citizen';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f9fc] pb-24 text-slate-900 selection:bg-teal-200">
      
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-3" aria-label="SmartCare home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-700 text-white shadow-lg shadow-blue-900/15"><HeartPulse className="h-5 w-5" /></span>
            <span><strong className="block text-sm tracking-tight">SmartCare</strong><small className="hidden text-[10px] font-medium text-slate-500 sm:block">Digital public healthcare access</small></span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/ambulance" className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 sm:flex"><Ambulance className="h-4 w-4" /> Emergency 108</a>
            <LanguageSwitcherPill />
            {currentUser ? <a href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 sm:px-4"><UserCheck className="h-4 w-4" /><span className="hidden sm:inline">Hi, {firstName}</span><span className="sm:hidden">Dashboard</span></a> : <a href="/login" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 sm:px-4"><LogIn className="h-4 w-4 text-blue-700" /> Sign in</a>}
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-14 text-white sm:px-6 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_22%,rgba(45,212,191,.20),transparent_26%),radial-gradient(circle_at_12%_95%,rgba(59,130,246,.23),transparent_34%)]" />
          <div className="absolute inset-0 -z-10 opacity-[.1] [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="mx-auto grid max-w-3xl items-center gap-10 grid-cols-1">
            <div>
              
              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Healthcare that respects <span className="text-teal-300">your time.</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">Book an OPD visit, understand where to go, and follow your queue in one calm, simple place.</p>
              <div className="mt-8 flex flex-wrap gap-3"><a href="/book-appointment" className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 hover:bg-teal-300">Book an OPD token <ArrowRight className="h-4 w-4" /></a><a href="/triage" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"><Activity className="h-4 w-4 text-rose-300" /> Check symptoms</a></div>
              
            </div>
            
          </div>
        </section>

        

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
<div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Your next step</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Get care, with less waiting.</h2></div>
              <div className="mt-10 grid sm:grid-cols-3 gap-4">
                <a href="/hospital-select" className="group flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><MapPin className="h-5 w-5" /></span><span className="flex-1"><strong className="block text-sm">Find a hospital</strong><small className="text-xs text-slate-500">See departments and availability</small></span><ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" /></a>
                <a href="/my-token" className="group flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white"><QrCode className="h-5 w-5" /></span><span className="flex-1"><strong className="block text-sm">View my OPD pass</strong><small className="text-xs text-slate-500">Track your live queue position</small></span><ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600" /></a>
                <a href="/ambulance" className="group flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-900/5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-600 text-white"><Ambulance className="h-5 w-5" /></span><span className="flex-1"><strong className="block text-sm text-rose-950">Emergency ambulance</strong><small className="text-xs text-rose-700">Get urgent help via 108</small></span><ChevronRight className="h-4 w-4 text-rose-400 transition group-hover:translate-x-1" /></a>
              </div>
              {!currentUser && <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-xs text-slate-300">New here? <a className="font-bold text-teal-300 hover:text-teal-200" href="/register">Create your patient account →</a></div>}
</section>
<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-7 text-white shadow-xl sm:p-10 md:flex-row md:items-center"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100"><Stethoscope className="h-3.5 w-3.5" /> Digital healthcare access</div><h2 className="text-2xl font-black sm:text-3xl">Ready when you are.</h2><p className="mt-2 max-w-lg text-sm text-blue-100">Register once to manage OPD tokens, records, and care updates from one place.</p></div><a href="/register" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-800 transition hover:bg-blue-50">Register as a patient <ArrowRight className="h-4 w-4" /></a></div></section>
<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">A better visit flow</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">From symptoms to consultation in three simple steps.</h2></div><div className="mt-10 grid gap-4 md:grid-cols-3">{steps.map(({ icon: Icon, number, title, text }) => <div key={number} className="rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon className="h-6 w-6" /></span><span className="font-mono text-xs font-bold text-slate-300">{number}</span></div><h3 className="mt-7 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p></div>)}</div></section>

        <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">Built for confidence</p><h2 className="mt-2 text-3xl font-black tracking-tight">Care information that stays clear.</h2><p className="mt-4 text-sm leading-relaxed text-slate-600">Whether you are booking for yourself or family, SmartCare keeps each next action visible and easy to understand.</p><button onClick={() => setIsFeedbackOpen(true)} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900">Share your experience <ArrowRight className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-3">{benefits.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl bg-slate-50 p-4"><Icon className="h-5 w-5 text-blue-700" /><h3 className="mt-4 text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p></div>)}</div></div></section>

        
      <section className="relative z-10 mx-auto mt-16 mb-12 grid max-w-6xl grid-cols-1 gap-3 px-4 sm:grid-cols-3 sm:px-6"><div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-lg shadow-slate-200/50"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Average wait saved</p><p className="mt-1 text-2xl font-black text-teal-700">42 min</p></div><div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-lg shadow-slate-200/50"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Hospitals connected</p><p className="mt-1 text-2xl font-black text-blue-700">3,850<span className="text-base">+</span></p></div><div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-lg shadow-slate-200/50"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Service availability</p><p className="mt-1 text-2xl font-black text-slate-900">24 / 7</p></div></section>
        </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pb-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>© 2026 SmartCare · A digital health access initiative</span><div className="flex gap-4"><a className="hover:text-blue-700" href="/health-records"><FileText className="mr-1 inline h-3.5 w-3.5" />Health records</a><a className="hover:text-rose-700" href="/ambulance">Emergency 108</a></div></footer>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} doctorId="doc-001" doctorName="Dr. Rajesh Sharma" department="Cardiology" hospitalName="AIIMS New Delhi - Main Campus" tokenNumber="CARD-042" patientName={firstName} />
    </div>
  );
};







