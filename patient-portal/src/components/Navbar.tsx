import React from 'react';
import { LayoutDashboard, QrCode, Layers, User, FileText, Flame } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 z-50 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <a href="/dashboard" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 transition">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t('dashboard')}</span>
        </a>

        <a href="/live-queue" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 transition">
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold">Live Queue</span>
        </a>

        {/* Center QR Token Button */}
        <a
          href="/my-token"
          className="flex flex-col items-center gap-1 -mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-xl hover:from-blue-700 hover:to-indigo-700 transition hover:scale-105"
        >
          <QrCode className="w-6 h-6" />
        </a>

        {/* Prescriptions & Billing Vault */}
        <a href="/health-records" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 transition">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-bold">Rx & Bills</span>
        </a>

        {/* Profile */}
        <a href="/profile" className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 transition">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t('profile')}</span>
        </a>
      </div>
    </nav>
  );
};
