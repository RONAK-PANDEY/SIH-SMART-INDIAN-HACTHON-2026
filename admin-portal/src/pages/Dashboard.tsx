import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Building2, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  Share2,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { WaitTimeChart } from '../charts/WaitTimeChart';
import { TriageDistribution } from '../charts/TriageDistribution';

export const Dashboard: React.FC = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/triage/hospitals-network')
      .then(res => res.json())
      .then(data => {
        if (data.hospitals) setHospitals(data.hospitals);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              Central Command Console
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> AIIMS Delhi & Regional Network
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Hospital OPD Command Center</h1>
          <p className="text-xs text-slate-500">Live operational overview, automated AI triage, and inter-hospital load balancing</p>
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
            <Stethoscope className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">38 Doctors</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 12 OPD Specialities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase">Emergency Red Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">6 Cases</div>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">P1 emergency fast-tracked</p>
        </div>
      </div>

      {/* Inter-Hospital Network Congestion & AI Referral Map */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">AI Load Balancing Cluster</span>
            <h3 className="text-base font-bold text-slate-900">City Hospital Queue Load & Inter-Hospital Referral Status</h3>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full">
            Auto-Rerouting: <strong>Active</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                <th className="py-2.5 px-3">Hospital Center</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Waiting Queue</th>
                <th className="py-2.5 px-3">Avg Wait Time</th>
                <th className="py-2.5 px-3">Capacity Load</th>
                <th className="py-2.5 px-3">Emergency Beds</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3">
                    <strong className="text-slate-800 block text-xs">{h.name}</strong>
                    <span className="text-[11px] text-slate-400">{h.address}</span>
                  </td>
                  <td className="py-3 px-3 font-mono">{h.distance_km === 0 ? 'Anchor' : `${h.distance_km} km`}</td>
                  <td className="py-3 px-3 font-bold text-slate-700">{h.active_queue_count} Patients</td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${h.avg_wait_mins > 45 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {h.avg_wait_mins} mins
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">{h.capacity_utilization}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{h.emergency_beds_free} Free</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      h.status === 'CONGESTED'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : h.status === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
