import React from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { WaitTimeChart } from '../charts/WaitTimeChart';

export const Analytics: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">OPD Queue & Flow Analytics</h1>
        <p className="text-xs text-slate-500">Historical performance metrics, doctor consultation speeds, and AI prediction accuracy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Avg Consultation Duration</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">6.8 mins</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Optimal clinical throughput</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Queue Drop-off Rate</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">2.1%</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">-18% vs unmanaged queues</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">AI Wait-Time Model R² Score</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">0.942</div>
          <p className="text-xs text-slate-500 mt-1">Trained on 45,000+ OPD visits</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Hourly Inflow & Wait Times</h3>
        <WaitTimeChart />
      </div>
    </div>
  );
};
