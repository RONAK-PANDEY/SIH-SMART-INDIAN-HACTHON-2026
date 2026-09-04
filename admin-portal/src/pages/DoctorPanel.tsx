import React, { useState } from 'react';
import { User, Phone, CheckCircle2, Play, SkipForward, Share2, Stethoscope } from 'lucide-react';

export const DoctorPanel: React.FC = () => {
  const [currentToken, setCurrentToken] = useState('CARD-038');
  const [patientName, setPatientName] = useState('Ananya Sen (45 Yrs, F)');
  const [history, setHistory] = useState('Hypertension, Chest Palpitations');
  const [notes, setNotes] = useState('');

  const handleNext = () => {
    setCurrentToken('CARD-039');
    setPatientName('Vikram Malhotra (62 Yrs, M)');
    setHistory('Prior Angioplasty (2021), shortness of breath');
    setNotes('');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <header className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Dr. A. K. Verma • Sr. Cardiologist</span>
          <h1 className="text-2xl font-bold text-slate-800">OPD Room 104 - Live Consultation Console</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Call Next Patient</span>
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl text-xs transition"
          >
            <SkipForward className="w-4 h-4" />
            <span>Skip / No-Show</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Patient Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Currently Inside</span>
              <h3 className="text-3xl font-extrabold text-blue-600">{currentToken}</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
              In Consultation
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Patient Name</span>
              <p className="font-bold text-slate-800 text-sm">{patientName}</p>
            </div>
            <div>
              <span className="text-slate-400">Clinical History / Complaint</span>
              <p className="font-bold text-slate-800 text-sm">{history}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Doctor Clinical Notes & Prescription</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter diagnosis, prescribed tests (ECG, Lipid Profile), and medications..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Consultation</span>
            </button>
          </div>
        </div>

        {/* Upcoming Queue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Upcoming Queue (Next 5)</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {[
              { token: 'CARD-039', name: 'Vikram Malhotra', wait: '3m', tag: 'EMERGENCY' },
              { token: 'CARD-040', name: 'Sunita Devi', wait: '10m', tag: 'SENIOR' },
              { token: 'CARD-041', name: 'Mohit Kumar', wait: '16m', tag: 'ROUTINE' },
              { token: 'CARD-042', name: 'Rohan Sharma', wait: '22m', tag: 'TRIAGE-L2' },
            ].map((p) => (
              <div key={p.token} className="py-2.5 flex justify-between items-center">
                <div>
                  <strong className="text-slate-800">{p.token}</strong>
                  <p className="text-[11px] text-slate-400">{p.name}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    p.tag === 'EMERGENCY' ? 'bg-rose-100 text-rose-700' : p.tag === 'SENIOR' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.tag}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">~{p.wait}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
