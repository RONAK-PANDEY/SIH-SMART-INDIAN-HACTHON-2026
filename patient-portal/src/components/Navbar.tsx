import React from 'react';
import { LayoutDashboard, QrCode, Layers, User, FileText } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const isActive = (path: string) => currentPath === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-subtle">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
        {/* Dashboard */}
        <a
          href="/dashboard"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors ${
            isActive('/dashboard') ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Dashboard Overview"
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-none">{t('dashboard') || 'Overview'}</span>
        </a>

        {/* Live Queue */}
        <a
          href="/live-queue"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors ${
            isActive('/live-queue') ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Live Queue"
        >
          <Layers className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-none">Live Queue</span>
        </a>

        {/* Center Key Action: My QR Token */}
        <div className="flex items-center justify-center min-w-[56px] min-h-[48px]">
          <a
            href="/my-token"
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors shadow-subtle ${
              isActive('/my-token')
                ? 'bg-teal-800 text-white ring-2 ring-teal-700/20'
                : 'bg-teal-700 text-white hover:bg-teal-800 active:scale-95'
            }`}
            aria-label="My Digital OPD Pass"
          >
            <QrCode className="w-6 h-6" />
          </a>
        </div>

        {/* Health Records */}
        <a
          href="/health-records"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors ${
            isActive('/health-records') ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Health Records"
        >
          <FileText className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-none">Records</span>
        </a>

        {/* Profile */}
        <a
          href="/profile"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors ${
            isActive('/profile') ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="User Profile"
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-none">{t('profile') || 'Profile'}</span>
        </a>
      </div>
    </nav>
  );
};
