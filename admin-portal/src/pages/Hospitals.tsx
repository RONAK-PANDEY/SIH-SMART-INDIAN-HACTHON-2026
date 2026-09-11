import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import React, { useState } from 'react';
import { Building2, Search, MapPin, Phone, CheckCircle2, Bed, Users } from 'lucide-react';

export const Hospitals: React.FC = () => {
  const [filter, setFilter] = useState('');

  const hospitals = [
    { name: 'AIIMS Delhi - Main Campus', region: 'Delhi NCR', beds: 1200, occupied: 1056, status: 'Active', contact: '1800-11-3000', depts: 32 },
    { name: 'Safdarjung Hospital', region: 'Delhi NCR', beds: 850, occupied: 680, status: 'Active', contact: '011-26165060', depts: 24 },
    { name: 'Dr. Ram Manohar Lohia (RML) Hospital', region: 'Delhi NCR', beds: 920, occupied: 512, status: 'Active', contact: '011-23365525', depts: 26 },
    { name: 'Lok Nayak Jai Prakash (LNJP) Hospital', region: 'Delhi NCR', beds: 750, occupied: 490, status: 'Active', contact: '011-23233000', depts: 20 },
    { name: 'Guru Teg Bahadur (GTB) Hospital', region: 'Delhi NCR', beds: 650, occupied: 410, status: 'Active', contact: '011-22586262', depts: 18 },
  ];

  const filtered = hospitals.filter(h => 
    h.name.toLowerCase().includes(filter.toLowerCase()) || 
    h.region.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Connected Hospital Directory</h3>
              <p className="text-sm text-slate-500 mt-1">Live status, emergency contacts, and bed capacities across network nodes</p>
            </div>

            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Filter hospital or region..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">Hospital Name</th>
                    <th className="py-3 px-4">Region</th>
                    <th className="py-3 px-4">Departments</th>
                    <th className="py-3 px-4">Bed Occupancy</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6">Emergency Helpline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((h, idx) => {
                    const pct = Math.round((h.occupied / h.beds) * 100);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          {h.name}
                        </td>
                        <td className="py-4 px-4 text-slate-600">{h.region}</td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{h.depts} Depts</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${pct > 80 ? 'bg-rose-500' : pct > 60 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-500">{h.occupied}/{h.beds} ({pct}%)</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {h.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-blue-600 font-mono font-semibold">{h.contact}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
