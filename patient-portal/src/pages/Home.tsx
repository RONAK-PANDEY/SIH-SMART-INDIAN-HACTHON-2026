import React from 'react';
import { Activity, Clock, ShieldCheck, HeartPulse, QrCode, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-12 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="w-8 h-8 text-blue-300 animate-pulse" />
            <span className="font-bold text-xl tracking-wide">SmartCare OPD</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl leading-tight">
            {t('hero_title') || 'Smart OPD Queue & Instant Emergency Triage'}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/triage" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-3 rounded-xl shadow">
              <Activity className="w-5 h-5 text-red-500" />
              <span>{t('check_symptoms') || 'Check Symptoms & Triage'}</span>
            </a>
            <a href="/hospital-select" className="inline-flex items-center gap-2 bg-blue-600 border border-blue-400 text-white font-semibold px-5 py-3 rounded-xl">
              <span>{t('book_token') || 'Book OPD Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>
    </div>
  );
};
