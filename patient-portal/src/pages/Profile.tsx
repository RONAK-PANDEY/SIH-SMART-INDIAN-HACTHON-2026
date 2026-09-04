import React from 'react';
import { User, Phone, ShieldCheck, Heart, FileText, Globe, LogOut } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Profile: React.FC = () => {
  const { lang, setLang } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Patient Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage ABHA credentials, language preference and medical records</p>
      </header>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 mb-5">
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
          RS
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">Rohan Sharma</h3>
          <p className="text-xs text-slate-500">+91 98765 43210 • 28 Yrs (Male)</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ABHA ID: 12-3456-7890-1234 (Verified)</span>
          </div>
        </div>
      </div>

      {/* Language Switcher (Ajay's i18n assist) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-blue-600" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">App Language (भाषा / ਭਾਸ਼ਾ)</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'हिंदी (Hindi)' },
            { id: 'pb', label: 'ਪੰਜਾਬੀ (Punjabi)' },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id as any)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                lang === l.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Menu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden text-xs">
        <a href="/my-token" className="p-4 flex items-center justify-between hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-slate-700">Recent OPD Passes & Prescriptions</span>
          </div>
          <span className="text-slate-400">3 Records</span>
        </a>
        <a href="/triage" className="p-4 flex items-center justify-between hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="font-medium text-slate-700">Saved Health & Triage Assessments</span>
          </div>
          <span className="text-slate-400">Active</span>
        </a>
      </div>
    </div>
  );
};
