import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import React, { useState } from 'react';
import { Users, Search, QrCode, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const Patients: React.FC = () => {
  const [filter, setFilter] = useState('');

  const patients = [
    { name: 'Aarav Sharma', abha: '91-2041-8831-1234', dept: 'Cardiology', hospital: 'AIIMS Delhi', token: 'CARD-042', status: 'In Consultation', priority: 'Moderate Priority', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    { name: 'Priya Patel', abha: '91-8842-1092-8921', dept: 'General Medicine', hospital: 'Safdarjung Hospital', token: 'GEN-115', status: 'Waiting in Queue', priority: 'Routine', color: 'text-slate-700 bg-slate-50 border-slate-200' },
    { name: 'Ramesh Kumar', abha: '91-4412-9011-3312', dept: 'Emergency & Trauma', hospital: 'AIIMS Delhi', token: 'EMG-018', status: 'Triaged Critical', priority: 'High Priority', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { name: 'Sita Devi', abha: '91-7721-3419-5509', dept: 'Orthopedics', hospital: 'RML Hospital', token: 'ORTHO-088', status: 'Completed', priority: 'Routine', color: 'text-slate-700 bg-slate-50 border-slate-200' },
    { name: 'Mohit Verma', abha: '91-1123-9984-6012', dept: 'Pediatrics', hospital: 'Lok Nayak Hospital', token: 'PED-054', status: 'Waiting in Queue', priority: 'Routine', color: 'text-slate-700 bg-slate-50 border-slate-200' },
  ];

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.abha.includes(filter) ||
    p.dept.toLowerCase().includes(filter.toLowerCase())
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
              <h3 className="text-2xl font-bold text-slate-800">Patient Registry & Queues</h3>
              <p className="text-sm text-slate-500 mt-1">ABHA linked patient records, active queue tokens, and triage priority</p>
            </div>

            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search patient or ABHA ID..."
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
                    <th className="py-3 px-6">Patient Name</th>
                    <th className="py-3 px-4">ABHA Health ID</th>
                    <th className="py-3 px-4">OPD Token</th>
                    <th className="py-3 px-4">Hospital / Dept</th>
                    <th className="py-3 px-4">Priority Class</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {p.name}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600 text-xs">{p.abha}</td>
                      <td className="py-4 px-4 font-mono font-bold text-blue-600">{p.token}</td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800">{p.dept}</p>
                        <p className="text-xs text-slate-400">{p.hospital}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${p.color}`}>
                          {p.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                          p.status === 'Triaged Critical' ? 'bg-rose-100 text-rose-700' :
                          p.status === 'In Consultation' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Triaged Critical' ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'}`}></span>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
