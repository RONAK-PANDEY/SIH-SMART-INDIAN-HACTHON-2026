import React, { useState, useEffect } from 'react';
import { API_V1_URL } from '../lib/api';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  HelpCircle,
  FileCheck,
  Medal,
  Star
} from 'lucide-react';

export const SalaryBonus: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simDoctorId, setSimDoctorId] = useState('doc-001');
  const [simRating, setSimRating] = useState(5);
  const [simFeedback, setSimFeedback] = useState('Outstanding consultation and clear medication guidance.');
  const [simulating, setSimulating] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState('');

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_V1_URL}/observer/doctors/performance`);
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (e) {
      console.warn('Failed to fetch doctor performance', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleSimulateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    const targetDoc = doctors.find((d) => d.id === simDoctorId);
    if (!targetDoc) return;

    const payload = {
      doctor_id: targetDoc.id,
      doctor_name: targetDoc.name,
      department: targetDoc.department,
      hospital_name: targetDoc.hospital,
      token_number: 'SIM-' + Math.floor(100 + Math.random() * 900),
      patient_name: 'Simulated Citizen',
      politeness_rating: simRating,
      communication_rating: simRating,
      diagnosis_quality_rating: simRating,
      wait_time_satisfaction: simRating,
      feedback_text: simFeedback,
      is_grievance: simRating <= 2
    };

    try {
      const res = await fetch(`${API_V1_URL}/observer/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSimSuccessMsg(`Survey recorded! New Doctor Rating: ${data.calculated_overall}★. DRI Score updated.`);
      await fetchPayroll();
      setTimeout(() => setSimSuccessMsg(''), 6000);
    } catch (err) {
      console.warn('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const totalDoctors = doctors.length;
  const gradeADoctors = doctors.filter(d => (d.bonus_percentage || 0) > 0).length;
  const underReviewDoctors = doctors.filter(d => (d.bonus_percentage || 0) < 0).length;

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Medal className="w-4 h-4" />
            <span>Ministry of Health & Family Welfare • Evaluation Framework</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Doctor Recognition Index (DRI) & Quality Audit Framework
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            National Clinical Performance & Public Service Evaluation. Evaluates practitioner empathy, patient satisfaction, and queue management efficiency to advise national awards, research grants, and MoHFW honorary citations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export DRI Dossier</span>
          </button>
          <button
            onClick={fetchPayroll}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Total DRI Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Monitored Practitioners</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-200">
            {totalDoctors || 4} Doctors
          </p>
          <p className="text-[11px] text-slate-500">Registered across AIIMS & Central Hospitals</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Distinguished Excellence (Grade A+)
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            {gradeADoctors} Nominated
          </p>
          <p className="text-[11px] text-slate-500">Eligible for National Healthcare Honors</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Quality Audits & Review Pipeline
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            {underReviewDoctors} Under Review
          </p>
          <p className="text-[11px] text-slate-500">Scheduled for clinical protocol alignment</p>
        </div>
      </div>

      {/* Interactive Simulator Card: Test Survey Effect on DRI */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-extrabold text-sm text-white">Interactive Live Survey & DRI Index Simulator</h3>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            SIMULATION SANDBOX
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Simulate a new citizen submitting a 5-star review (granting DRI distinction points) or a 1-star grievance (triggering review audit) to test the live evaluation algorithm!
        </p>

        {simSuccessMsg && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{simSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSimulateReview} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 font-bold block mb-1">Target Doctor</label>
            <select
              value={simDoctorId}
              onChange={(e) => setSimDoctorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">Citizen Feedback Rating</label>
            <select
              value={simRating}
              onChange={(e) => {
                const r = parseInt(e.target.value);
                setSimRating(r);
                if (r >= 4) setSimFeedback('Outstanding consultation and clear medication guidance.');
                else setSimFeedback('Doctor was late and spoke rudely to patient.');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (National Excellence Tier)</option>
              <option value={4}>⭐⭐⭐⭐ 4 Stars (Proficient Clinical Service)</option>
              <option value={3}>⭐⭐⭐ 3 Stars (Standard Baseline)</option>
              <option value={1}>⭐ 1 Star (Grievance Review & Flash Audit)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end gap-2">
            <input
              type="text"
              value={simFeedback}
              onChange={(e) => setSimFeedback(e.target.value)}
              placeholder="Enter citizen survey remarks..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={simulating}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md whitespace-nowrap cursor-pointer"
            >
              {simulating ? 'Processing...' : 'Apply Live Review'}
            </button>
          </div>
        </form>
      </div>

      {/* Doctor Performance & DRI Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white">Doctor Recognition Index & Merit Dossier</h3>
          <span className="text-xs text-slate-400 font-mono">MoHFW QUALITY METRICS #2026-Q3</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Doctor Name & Hospital</th>
                <th className="p-4">Citizen Rating</th>
                <th className="p-4">Performance Grade</th>
                <th className="p-4">DRI Recognition Tier</th>
                <th className="p-4">Citizen Survey Count</th>
                <th className="p-4">Government Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {doctors.map((doc) => {
                const isBonus = (doc.bonus_percentage || 0) > 0;
                const isPenalty = (doc.bonus_percentage || 0) < 0;

                return (
                  <tr key={doc.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <strong className="text-white block font-bold">{doc.name}</strong>
                      <span className="text-[11px] text-slate-500">{doc.department} • {doc.hospital}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 inline-flex items-center gap-1">
                        ★ {doc.avg_score} / 5.0
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`text-[11px] font-semibold ${
                        isBonus ? 'text-emerald-400' : isPenalty ? 'text-rose-400' : 'text-slate-300'
                      }`}>
                        {doc.performance_grade}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`font-bold px-2.5 py-1 rounded-md text-[11px] inline-flex items-center gap-1 ${
                        isBonus
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isPenalty
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {isBonus ? <Award className="w-3 h-3" /> : isPenalty ? <AlertCircle className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                        {isBonus ? 'Distinguished Honor Tier' : isPenalty ? 'Standard Review Required' : 'Satisfactory Standing'}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-slate-300">
                      {doc.review_count} Verified Surveys
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPenalty 
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800' 
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      }`}>
                        {isPenalty ? 'Grievance Review Active' : 'Cleared & Compliant'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
