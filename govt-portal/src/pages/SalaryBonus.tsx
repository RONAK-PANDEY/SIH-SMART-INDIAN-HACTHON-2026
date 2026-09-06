import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  RefreshCw,
  PlusCircle,
  HelpCircle
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
      const res = await fetch('http://localhost:8000/api/v1/observer/doctors/performance');
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
      const res = await fetch('http://localhost:8000/api/v1/observer/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSimSuccessMsg(`Survey recorded! New Doctor Rating: ${data.calculated_overall}★. Bonus Multiplier recalculated.`);
      await fetchPayroll();
      setTimeout(() => setSimSuccessMsg(''), 6000);
    } catch (err) {
      console.warn('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const totalBasePayroll = doctors.reduce((acc, d) => acc + (d.base_salary || 0), 0);
  const totalIncentiveDisbursed = doctors.reduce((acc, d) => acc + (d.bonus_amount || 0), 0);
  const netDisbursement = totalBasePayroll + totalIncentiveDisbursed;

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            <span>National Health Mission • Performance-Linked Payroll</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Govt Doctor Salary Bonus & Performance Incentive Engine
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Incentivizing clinical empathy and punctuality. Doctors with high citizen survey ratings receive up to <strong>+15% monthly bonus</strong>, while behavioral misconduct triggers <strong>-10% disciplinary deductions</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Payroll Audit</span>
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

      {/* KPI Cards: Total Payroll Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Base Salary (Monthly)</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-200">
            ₹{totalBasePayroll.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">Fixed Government Pay Scale</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <span className="text-xs font-bold text-slate-400">Citizen-Linked Incentive Pool</span>
          <p className={`text-2xl sm:text-3xl font-black ${totalIncentiveDisbursed >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalIncentiveDisbursed >= 0 ? `+₹${totalIncentiveDisbursed.toLocaleString('en-IN')}` : `-₹${Math.abs(totalIncentiveDisbursed).toLocaleString('en-IN')}`}
          </p>
          <p className="text-[11px] text-slate-500">Directly calculated from citizen feedback</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <span className="text-xs font-bold text-slate-400">Net Audited Payroll Disbursement</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            ₹{netDisbursement.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">Authorized for MoHFW Treasury Release</p>
        </div>
      </div>

      {/* Interactive Simulator Card: Test Survey Effect on Salary */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-extrabold text-sm text-white">Interactive Live Survey & Salary Multiplier Simulator</h3>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            DEMO SANDBOX
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Simulate a new patient submitting a 5-star review (rewarding bonus) or a 1-star grievance (triggering penalty deduction) to test the live incentive math!
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
            <label className="text-slate-400 font-bold block mb-1">Patient Rating Score</label>
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
              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (+15% Grade A+ Bonus)</option>
              <option value={4}>⭐⭐⭐⭐ 4 Stars (+8% Grade A Bonus)</option>
              <option value={3}>⭐⭐⭐ 3 Stars (0% Base Salary)</option>
              <option value={1}>⭐ 1 Star (-10% Penalty Deduction & Audit)</option>
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

      {/* Doctor Performance & Salary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white">Doctor Payroll & Incentive Disbursement Table</h3>
          <span className="text-xs text-slate-400 font-mono">MoHFW PAYROLL AUDIT #2026-Q3</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Doctor Name & Hospital</th>
                <th className="p-4">Citizen Rating</th>
                <th className="p-4">Performance Grade</th>
                <th className="p-4">Base Salary</th>
                <th className="p-4">Incentive %</th>
                <th className="p-4">Bonus / Penalty</th>
                <th className="p-4">Total Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {doctors.map((doc) => {
                const isBonus = doc.bonus_percentage > 0;
                const isPenalty = doc.bonus_percentage < 0;

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
                      <span className="text-[10px] text-slate-500 block mt-0.5">({doc.review_count} surveys)</span>
                    </td>

                    <td className="p-4">
                      <span className={`text-[11px] font-semibold ${
                        isBonus ? 'text-emerald-400' : isPenalty ? 'text-rose-400' : 'text-slate-300'
                      }`}>
                        {doc.performance_grade}
                      </span>
                    </td>

                    <td className="p-4 font-mono">
                      ₹{doc.base_salary?.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      <span className={`font-black px-2 py-0.5 rounded-md ${
                        isBonus
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isPenalty
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isBonus ? `+${doc.bonus_percentage}%` : `${doc.bonus_percentage}%`}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold">
                      <span className={isBonus ? 'text-emerald-400' : isPenalty ? 'text-rose-400' : 'text-slate-400'}>
                        {isBonus ? `+₹${doc.bonus_amount?.toLocaleString('en-IN')}` : isPenalty ? `-₹${Math.abs(doc.bonus_amount || 0).toLocaleString('en-IN')}` : '₹0'}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-black text-sm text-white">
                      ₹{doc.total_effective_payroll?.toLocaleString('en-IN')}
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
