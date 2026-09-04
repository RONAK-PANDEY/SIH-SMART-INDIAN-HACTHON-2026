import React from 'react';
import { QrCode, Clock, MapPin, AlertCircle, Volume2, Share2 } from 'lucide-react';

export const MyToken: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 max-w-md mx-auto pb-24 flex flex-col justify-between">
      <div>
        <header className="flex items-center justify-between mb-6 pt-2">
          <div>
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Digital OPD Pass</span>
            <h1 className="text-xl font-bold">AIIMS New Delhi</h1>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-semibold animate-pulse">
            Active in Queue
          </span>
        </header>

        {/* Token Card */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-850 rounded-3xl p-6 border border-slate-750 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-start border-b border-slate-700 pb-4">
            <div>
              <span className="text-xs text-slate-400 font-medium">Department</span>
              <h3 className="text-lg font-bold text-slate-100">Cardiology OPD</h3>
              <p className="text-xs text-slate-400 mt-0.5">Room 104 • Ground Floor</p>
            </div>
            <div className="w-12 h-12 bg-white p-1 rounded-xl shadow">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
          </div>

          <div className="my-8 text-center">
            <span className="text-xs text-blue-300 font-bold tracking-widest uppercase">Token Number</span>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 tracking-tight my-2">
              CARD-042
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Est. Consultation: <strong>11:45 AM (~20 mins)</strong></span>
            </div>
          </div>

          {/* Queue Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Now Serving: <strong>CARD-038</strong></span>
              <span>Ahead: <strong>3 Patients</strong></span>
            </div>
            <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full w-3/4 rounded-full transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Audio / Push Notification Alert Callout */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
          <Volume2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Audio announcements and phone vibration will trigger when your token is <strong>2 positions away</strong>. Please remain within the waiting lounge.
          </p>
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <a
          href="/live-queue"
          className="flex-1 text-center py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition"
        >
          View Live Ticker
        </a>
        <a
          href="/referral"
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition flex items-center justify-center gap-1"
        >
          <Share2 className="w-4 h-4" />
          <span>Referral</span>
        </a>
      </div>
    </div>
  );
};
