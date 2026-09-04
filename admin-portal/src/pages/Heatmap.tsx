import React from 'react';
import { MapPin, Navigation, Activity } from 'lucide-react';
import { CongestionHeatmap } from '../charts/CongestionHeatmap';

export const Heatmap: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Regional Healthcare Load Balancing Heatmap</h1>
        <p className="text-xs text-slate-500">Live geospatial congestion view and inter-hospital load distribution</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Realtime Hospital Cluster Load (Delhi NCR)</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Normal (&lt;60%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Moderate (60-80%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Overloaded (&gt;80%)</span>
          </div>
        </div>
        <CongestionHeatmap />
      </div>
    </div>
  );
};
