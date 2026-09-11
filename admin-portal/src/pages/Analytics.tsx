import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import React, { useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Calendar,
  Building2,
  Filter,
  ArrowUpRight
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('today');

  const triageMetrics = [
    { label: 'Avg Triage Latency', value: '1.4s', change: '-18%', isPositive: true },
    { label: 'Critical Escalate Rate', value: '3.8%', change: '-0.5%', isPositive: true },
    { label: 'Queue Clearance Rate', value: '94.2%', change: '+4.1%', isPositive: true },
    { label: 'Diverted Ambulances', value: '14', change: '+2', isPositive: false },
  ];

  const hospitalStats = [
    { name: 'AIIMS Delhi', critical: 12, moderate: 28, routine: 142, avgWait: '24m', load: 88, status: 'High Load' },
    { name: 'Safdarjung Hospital', critical: 8, moderate: 19, routine: 110, avgWait: '18m', load: 64, status: 'Moderate' },
    { name: 'RML Hospital', critical: 2, moderate: 11, routine: 85, avgWait: '12m', load: 38, status: 'Optimal' },
    { name: 'Lok Nayak Hospital', critical: 3, moderate: 9, routine: 74, avgWait: '14m', load: 42, status: 'Optimal' },
    { name: 'GTB Hospital', critical: 5, moderate: 14, routine: 62, avgWait: '16m', load: 51, status: 'Moderate' },
  ];

  const hourlyFlow = [
    { hour: '08:00', arrivals: 45, cleared: 38 },
    { hour: '09:00', arrivals: 120, cleared: 95 },
    { hour: '10:00', arrivals: 190, cleared: 160 },
    { hour: '11:00', arrivals: 220, cleared: 205 },
    { hour: '12:00', arrivals: 175, cleared: 180 },
    { hour: '13:00', arrivals: 90, cleared: 110 },
    { hour: '14:00', arrivals: 130, cleared: 125 },
  ];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Hospital,Critical,Moderate,Routine,AvgWait,Load\n"
      + hospitalStats.map(e => `${e.name},${e.critical},${e.moderate},${e.routine},${e.avgWait},${e.load}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `triage_detailed_report_${selectedRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <div className="flex-1 overflow-y-auto p-8">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Triage & Queue Analytics</h2>
              <p className="text-sm text-slate-500 mt-1">Detailed real-time diagnostic performance metrics across regional hospitals</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm text-xs font-medium">
                <button 
                  onClick={() => setSelectedRange('today')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${selectedRange === 'today' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setSelectedRange('week')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${selectedRange === 'week' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Last 7 Days
                </button>
                <button 
                  onClick={() => setSelectedRange('month')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${selectedRange === 'month' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  This Month
                </button>
              </div>

              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {triageMetrics.map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Hospital Performance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Table Column */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Hospital Real-Time Triage Load
                </h3>
                <span className="text-xs text-slate-400">Auto-refreshed via WebSocket</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="pb-3">Hospital</th>
                      <th className="pb-3 text-rose-600">Critical</th>
                      <th className="pb-3 text-orange-500">Moderate</th>
                      <th className="pb-3 text-slate-600">Routine</th>
                      <th className="pb-3">Avg Wait</th>
                      <th className="pb-3">Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {hospitalStats.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-semibold text-slate-800">{h.name}</td>
                        <td className="py-3.5 font-bold text-rose-600">{h.critical}</td>
                        <td className="py-3.5 font-medium text-orange-600">{h.moderate}</td>
                        <td className="py-3.5 text-slate-600">{h.routine}</td>
                        <td className="py-3.5 font-mono text-slate-700">{h.avgWait}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${h.load > 75 ? 'bg-rose-500' : h.load > 50 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                style={{ width: `${h.load}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-500">{h.load}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hourly Flow Chart Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Peak Intake Volume
                </h3>
                <p className="text-xs text-slate-500 mb-6">Patient check-ins vs triage resolution per hour</p>

                <div className="space-y-4">
                  {hourlyFlow.map((slot, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-600">{slot.hour}</span>
                        <span className="text-slate-500">
                          <span className="text-blue-600 font-bold">{slot.arrivals} in</span> / <span className="text-emerald-600 font-bold">{slot.cleared} out</span>
                        </span>
                      </div>
                      <div className="flex gap-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-l-full" 
                          style={{ width: `${(slot.arrivals / 250) * 100}%` }}
                        />
                        <div 
                          className="bg-emerald-400 h-full rounded-r-full" 
                          style={{ width: `${(slot.cleared / 250) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-6">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block"></span> Check-ins
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block"></span> Completed
                </span>
                <span className="font-semibold text-slate-700">Peak at 11:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
