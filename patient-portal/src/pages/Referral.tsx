import React, { useState } from 'react';
import { Share2, Building2, MapPin, CheckCircle, ArrowRight, AlertOctagon } from 'lucide-react';

export const Referral: React.FC = () => {
  const [targetHospital, setTargetHospital] = useState('hosp-002');
  const [reason, setReason] = useState('Overburdened OPD / Direct Admission Required');
  const [referred, setReferred] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-xl mx-auto pb-24">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <Share2 className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-wider">Inter-Hospital Fast-Track</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Smart Hospital Transfer Pass</h1>
        <p className="text-xs text-slate-500 mt-1">
          When primary hospital OPD capacity is exceeded (&gt;90%), transfer your queue priority to nearby tier-2/3 network facilities.
        </p>
      </header>

      {!referred ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-tight">
              AIIMS OPD is currently at <strong>92% capacity (estimated wait &gt;120m)</strong>. Safdarjung Facility is accepting priority transfers with <strong>15m wait time</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Destination Hospital</label>
            <select
              value={targetHospital}
              onChange={(e) => setTargetHospital(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hosp-002">Safdarjung District Hospital (3.8 km • 15m Wait)</option>
              <option value="hosp-003">Apollo Super Speciality Facility (5.1 km • 10m Wait)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Transfer Justification</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setReferred(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition text-xs"
          >
            Initiate Fast-Track Referral
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-md text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Referral Slip Generated</h2>
          <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400">Referral ID:</span>
              <strong className="text-slate-800">REF-2026-9901</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Destination:</span>
              <strong className="text-slate-800">Safdarjung District Hospital</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fast-Track Pass:</span>
              <strong className="text-emerald-600">VIP Queue Priority Valid for 3 Hours</strong>
            </div>
          </div>
          <a
            href="/my-token"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-medium py-3 rounded-xl text-xs hover:bg-slate-800 transition"
          >
            <span>View Transfer Token</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
