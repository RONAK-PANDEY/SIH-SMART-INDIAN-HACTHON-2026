import React from 'react';
import { Users, Clock, AlertTriangle, Building2, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import { WaitTimeChart } from '../charts/WaitTimeChart';
import { TriageDistribution } from '../charts/TriageDistribution';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hospital OPD Command Center</h1>
          <p className="text-xs text-slate-500">Live operational overview across AIIMS New Delhi & Regional Health Cluster</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-600">WebSocket Live Sync Active</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Total OPD Patients Today</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">1,482</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14% vs yesterday
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Average Wait Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">18.4 mins</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            42% reduction from baseline
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Active Doctors on Duty</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">38 Doctors</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 12 OPD Specialities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Emergency Triage Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">6 Cases</div>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">Priority auto-injected in queue</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">OPD Inflow vs Wait Time Prediction (AI Forecast)</h3>
          <WaitTimeChart />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Live Patient Triage Severity Distribution</h3>
          <TriageDistribution />
        </div>
      </div>
    </div>
  );
};
