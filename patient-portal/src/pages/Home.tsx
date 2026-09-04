import React from 'react';
import { Activity, Clock, ShieldCheck, HeartPulse, QrCode, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-12 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="w-8 h-8 text-blue-300 animate-pulse" />
            <span className="font-bold text-xl tracking-wide">SmartCare OPD</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl leading-tight">
            {t('hero_title') || 'Smart OPD Queue & Instant Emergency Triage'}
          </h1>
          <p className="mt-3 text-blue-100 text-sm sm:text-base max-w-xl">
            {t('hero_subtitle') || 'Skip long waiting lines at government & private hospitals. Get real-time queue tokens with AI-powered triage.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/triage"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-3 rounded-xl shadow hover:bg-blue-50 transition"
            >
              <Activity className="w-5 h-5 text-red-500" />
              <span>{t('check_symptoms') || 'Check Symptoms & Triage'}</span>
            </a>
            <a
              href="/hospital-select"
              className="inline-flex items-center gap-2 bg-blue-600 border border-blue-400 text-white font-semibold px-5 py-3 rounded-xl hover:bg-blue-500 transition"
            >
              <span>{t('book_token') || 'Book OPD Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Quick Status / Live Token Card */}
      <main className="max-w-4xl mx-auto px-6 -mt-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Have a Booking?</p>
              <h3 className="text-lg font-bold text-slate-800">Track Live Queue Position</h3>
            </div>
          </div>
          <a
            href="/my-token"
            className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
          >
            View My Token
          </a>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <Clock className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="font-bold text-slate-800">Live AI Wait Predictor</h4>
            <p className="text-xs text-slate-500 mt-1">Get high-accuracy estimated time of consultation powered by machine learning models.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <Activity className="w-8 h-8 text-rose-500 mb-3" />
            <h4 className="font-bold text-slate-800">Dynamic Emergency Triage</h4>
            <p className="text-xs text-slate-500 mt-1">Critical & elderly cases get prioritized automatically in the doctor queue line.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-3" />
            <h4 className="font-bold text-slate-800">ABHA & ABDM Ready</h4>
            <p className="text-xs text-slate-500 mt-1">Seamless integration with Ayushman Bharat Digital Mission healthcare IDs.</p>
          </div>
        </section>
      </main>
    </div>
  );
};
