import React, { useState } from 'react';
import { Activity, Clock, ShieldCheck, HeartPulse, QrCode, ArrowRight, Sun, Moon, Bell, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useTheme } from '../context/ThemeContext';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white px-6 py-12 rounded-b-3xl shadow-lg relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-8 h-8 text-blue-300 animate-pulse" />
              <span className="font-extrabold text-xl tracking-wide">SmartCare</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition relative text-white cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-200" />}
              </button>
            </div>
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
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-3 rounded-xl shadow-md hover:bg-blue-50 transition text-sm"
            >
              <Activity className="w-5 h-5 text-red-500" />
              <span>{t('check_symptoms') || 'Check Symptoms & Triage'}</span>
            </a>
            <a
              href="/hospital-select"
              className="inline-flex items-center gap-2 bg-blue-600 border border-blue-400 text-white font-semibold px-5 py-3 rounded-xl hover:bg-blue-500 transition text-sm"
            >
              <span>{t('book_token') || 'Book OPD Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Notifications Popover */}
      {showNotifications && (
        <div className="max-w-4xl mx-auto px-6 -mt-3 relative z-30">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <strong className="text-slate-900 dark:text-white font-extrabold">Recent Alerts</strong>
              <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-slate-600 dark:text-slate-300">🔔 Turnstile gate #02 verification is online.</p>
          </div>
        </div>
      )}

      {/* Quick Status / Live Token Card */}
      <main className="max-w-4xl mx-auto px-6 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Have a Booking?</p>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Track Live Queue Position</h3>
            </div>
          </div>
          <a
            href="/my-token"
            className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition"
          >
            View My Token
          </a>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-white">Live AI Wait Predictor</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get high-accuracy estimated time of consultation powered by machine learning models.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <Activity className="w-8 h-8 text-rose-500 dark:text-rose-400 mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-white">Dynamic Emergency Triage</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Critical & elderly cases get prioritized automatically in the doctor queue line.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-white">ABHA & ABDM Ready</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Seamless integration with Ayushman Bharat Digital Mission healthcare IDs.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

