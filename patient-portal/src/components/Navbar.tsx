import React from 'react';
import { Home, Activity, QrCode, Layers, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-6 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <a href="/" className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </a>
        <a href="/triage" className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition">
          <Activity className="w-5 h-5 text-rose-500" />
          <span className="text-[10px] font-semibold">Triage</span>
        </a>
        <a
          href="/my-token"
          className="flex flex-col items-center gap-1 -mt-5 bg-blue-600 text-white p-3 rounded-2xl shadow-lg hover:bg-blue-700 transition"
        >
          <QrCode className="w-6 h-6" />
        </a>
        <a href="/live-queue" className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition">
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Queue</span>
        </a>
        <a href="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Profile</span>
        </a>
      </div>
    </nav>
  );
};
