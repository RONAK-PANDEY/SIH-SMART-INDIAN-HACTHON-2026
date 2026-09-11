import React from 'react';
import { Home, LayoutDashboard, QrCode, Layers, User, FileText } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2.5 px-4 z-50 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <a href="/" className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
          <Home className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] font-extrabold text-blue-600">Home</span>
        </a>

        <a href="/dashboard" className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t('dashboard')}</span>
        </a>

        {/* Center QR Token Button */}
        <a
          href="/my-token"
          className="flex flex-col items-center gap-1 -mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-xl hover:from-blue-700 hover:to-indigo-700 transition hover:scale-105"
        >
          <QrCode className="w-6 h-6" />
        </a>

        {/* Prescriptions & Billing Vault */}
        <a href="/health-records" className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-bold">Rx & Bills</span>
        </a>

        {/* Profile */}
        <a href="/profile" className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t('profile')}</span>
        </a>
      </div>
    </nav>
  );
};
