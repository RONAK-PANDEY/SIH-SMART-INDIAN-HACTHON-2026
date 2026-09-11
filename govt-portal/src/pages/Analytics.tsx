import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Sparkles } from 'lucide-react';
import { WaitTimeChart } from '../charts/WaitTimeChart';
import { TriageDistribution } from '../charts/TriageDistribution';

export const Analytics: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-900 max-w-7xl mx-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>National AI Queue Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">OPD Flow Rate & Predictive Wait Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Machine learning wait-time regression models, clinical throughput velocity, and emergency triage dispersion.
          </p>
        </div>

        <span className="text-xs font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-full font-bold">
          AI MODEL ACCURACY 98.4%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg Consultation Duration</span>
          <div className="text-3xl font-black text-slate-900">6.8 mins</div>
          <p className="text-xs text-emerald-600 font-medium">Optimal clinical throughput standard</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Queue Drop-off Rate</span>
          <div className="text-3xl font-black text-emerald-600">2.1%</div>
          <p className="text-xs text-slate-500">-18% vs unmanaged physical counters</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Wait-Time Model R² Score</span>
          <div className="text-3xl font-black text-amber-600">0.942</div>
          <p className="text-xs text-slate-500">Trained on 45,000+ verified OPD episodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Hourly Inflow & Wait Times</h3>
          <WaitTimeChart />
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Acuity Triage Breakdown</h3>
          <TriageDistribution />
        </div>
      </div>
    </div>
  );
};
