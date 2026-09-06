import React from 'react';
import { MapPin, Navigation, Activity, Map, ArrowRight } from 'lucide-react';
import { CongestionHeatmap } from '../charts/CongestionHeatmap';

export const Heatmap: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Map className="w-4 h-4" />
            <span>Regional Geospatial Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-white">Healthcare Facility Load Balancing Heatmap</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            City-wide live hospital cluster congestion, bed availability, and automated patient redirection routes.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Normal (&lt;60%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Moderate (60-80%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Overloaded (&gt;80%)</span>
        </div>
      </div>

      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-white text-sm">Realtime Hospital Cluster Load (National Capital Region)</h3>
          <span className="text-xs text-slate-400 font-mono">Grid Latency: 42ms</span>
        </div>
        <CongestionHeatmap />
      </div>
    </div>
  );
};
