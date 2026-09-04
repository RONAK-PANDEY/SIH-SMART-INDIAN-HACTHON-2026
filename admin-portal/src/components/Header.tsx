import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        <input
          type="text"
          placeholder="Search doctor, token, or patient ABHA..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-pulse"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="text-left text-xs">
            <p className="font-bold text-slate-800">Admin Control</p>
            <span className="text-[10px] text-slate-400">AIIMS Medical Supt.</span>
          </div>
        </div>
      </div>
    </header>
  );
};
