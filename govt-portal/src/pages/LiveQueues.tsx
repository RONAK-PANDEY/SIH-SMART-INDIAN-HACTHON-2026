import React, { useState } from 'react';
import { Layers, Filter, Search, Clock, Users, Building2 } from 'lucide-react';

interface QueueData {
  id: string;
  hospital: string;
  department: string;
  patientsWaiting: number;
  currentToken: string;
  estimatedWait: string;
  status: 'Normal' | 'Surge Warning' | 'Delayed';
  loadPercent: number;
}

const QUEUES_LIST: QueueData[] = [
  { id: 'q-1', hospital: 'AIIMS New Delhi', department: 'Cardiology', patientsWaiting: 18, currentToken: 'CARD-047', estimatedWait: '22 min', status: 'Normal', loadPercent: 82 },
  { id: 'q-2', hospital: 'Safdarjung Hospital', department: 'Pediatrics', patientsWaiting: 11, currentToken: 'PED-031', estimatedWait: '14 min', status: 'Normal', loadPercent: 61 },
  { id: 'q-3', hospital: 'RML Hospital', department: 'Orthopedics', patientsWaiting: 15, currentToken: 'ORTH-088', estimatedWait: '28 min', status: 'Surge Warning', loadPercent: 89 },
  { id: 'q-4', hospital: 'AIIMS New Delhi', department: 'General Medicine', patientsWaiting: 24, currentToken: 'GENM-112', estimatedWait: '35 min', status: 'Normal', loadPercent: 75 },
  { id: 'q-5', hospital: 'Safdarjung Hospital', department: 'Neurology', patientsWaiting: 6, currentToken: 'NEUR-019', estimatedWait: '10 min', status: 'Normal', loadPercent: 40 },
];

export const LiveQueues: React.FC = () => {
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [selectedQueue, setSelectedQueue] = useState<QueueData | null>(null);

  const filteredQueues = QUEUES_LIST.filter(q => hospitalFilter === 'All' || q.hospital === hospitalFilter);

  return (
    <div className="p-8 bg-slate-50 text-slate-900 min-h-screen font-sans space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Queues Monitor</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Operational OPD queue loads, current active tokens, and estimated wait times.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-2xl focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="All">All Hospitals</option>
            <option value="AIIMS New Delhi">AIIMS New Delhi</option>
            <option value="Safdarjung Hospital">Safdarjung Hospital</option>
            <option value="RML Hospital">RML Hospital</option>
          </select>
        </div>
      </div>

      {/* Grid of Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQueues.map((q) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{q.hospital}</h4>
                <p className="text-slate-500 text-xs font-semibold">{q.department}</p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                q.status === 'Normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                ● {q.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Waiting</span>
                <span className="text-base font-bold text-slate-900 font-mono">{q.patientsWaiting}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Token</span>
                <span className="text-base font-bold text-amber-700 font-mono">{q.currentToken}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Est. Wait</span>
                <span className="text-base font-bold text-blue-600 font-mono">{q.estimatedWait}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>Queue Capacity</span>
                <span>{q.loadPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${q.loadPercent > 80 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${q.loadPercent}%` }}></div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button 
                onClick={() => setSelectedQueue(q)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-200 text-center cursor-pointer"
              >
                View Queue
              </button>
              <button 
                onClick={() => setSelectedQueue(q)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-200 text-center cursor-pointer"
              >
                View Tokens
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Queue Modal */}
      {selectedQueue && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedQueue.hospital}</h3>
                <p className="text-slate-500 text-xs font-semibold">{selectedQueue.department} • Active Tokens</p>
              </div>
              <button onClick={() => setSelectedQueue(null)} className="text-slate-500 hover:text-slate-900 font-bold text-xs bg-slate-100 px-3 py-1 rounded-xl cursor-pointer">
                Close ✕
              </button>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono">
              <div className="flex justify-between text-slate-700 py-1 border-b border-slate-200">
                <span>Active Token: <strong className="text-amber-800">{selectedQueue.currentToken}</strong></span>
                <span className="text-emerald-700 font-bold">In Consultation</span>
              </div>
              <div className="flex justify-between text-slate-700 py-1 border-b border-slate-200">
                <span>Next Token: <strong className="text-slate-900">CARD-048</strong></span>
                <span className="text-amber-700 font-bold">At Door (Scanned)</span>
              </div>
              <div className="flex justify-between text-slate-700 py-1">
                <span>Waiting Token: <strong className="text-slate-900">CARD-049</strong></span>
                <span className="text-slate-500">Waiting (12m)</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
