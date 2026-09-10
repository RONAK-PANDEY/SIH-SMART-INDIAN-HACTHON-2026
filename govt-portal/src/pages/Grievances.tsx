import React, { useState, useEffect } from 'react';
import { API_V1_URL } from '../lib/api';
import { 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  UserX, 
  Send, 
  MessageSquare,
  Filter,
  Check
} from 'lucide-react';

export const Grievances: React.FC = () => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [actionType, setActionType] = useState('ISSUE_NOTICE');
  const [actionNotes, setActionNotes] = useState('Official show cause notice issued requiring doctor written response within 48 hours.');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_V1_URL}/observer/grievances`);
      const data = await res.json();
      setGrievances(data.grievances || []);
      if (data.grievances?.length > 0 && !selectedGrievance) {
        setSelectedGrievance(data.grievances[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch grievances', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleTakeAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_V1_URL}/observer/grievances/${selectedGrievance.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          notes: actionNotes,
          investigator_name: 'Central Vigilance Officer - MoHFW'
        })
      });
      const data = await res.json();
      setSelectedGrievance(data.updated_grievance);
      await fetchGrievances();
    } catch (err) {
      console.warn('Action error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = grievances.filter((g) => {
    if (statusFilter === 'ALL') return true;
    return g.status === statusFilter;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Statutory Grievance & Disciplinary Tribunal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Citizen Grievance Redressal & Investigation Unit
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Neutral mediation of patient complaints against doctor misconduct, queue bypassing, and unauthorized counter fees. Enforcing show-cause inquiries and salary adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All Grievances ({grievances.length})</option>
            <option value="OPEN">Open / Pending</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="SHOW_CAUSE_ISSUED">Show Cause Issued</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Grievance List & Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Complaints List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Complaints Docket ({filtered.length})
          </h3>

          <div className="space-y-2.5">
            {filtered.map((grv) => {
              const isSelected = selectedGrievance?.id === grv.id;
              return (
                <button
                  key={grv.id}
                  onClick={() => setSelectedGrievance(grv)}
                  className={`w-full p-4 rounded-2xl border text-left transition space-y-2 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/20 border-rose-500/80 shadow-lg shadow-rose-950/30 ring-1 ring-rose-400'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      {grv.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      grv.status === 'RESOLVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : grv.status === 'SHOW_CAUSE_ISSUED'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {grv.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    "{grv.description}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                    <span>Against: <strong className="text-slate-400">{grv.doctor_name}</strong></span>
                    <span>{new Date(grv.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Detailed Grievance Inspector & Action Suite */}
        <div className="lg:col-span-7 space-y-6">
          {selectedGrievance ? (
            <div className="space-y-6">
              
              {/* Grievance Details Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-widest">
                      CASE ID: {selectedGrievance.id}
                    </span>
                    <h3 className="text-lg font-black text-white">{selectedGrievance.category}</h3>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">
                    Severity: {selectedGrievance.severity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Reported By Citizen:</span>
                    <strong className="text-white">{selectedGrievance.patient_name} (Token: {selectedGrievance.token_number})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Respondent Doctor / Staff:</span>
                    <strong className="text-amber-400">{selectedGrievance.doctor_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hospital Facility:</span>
                    <strong className="text-white">{selectedGrievance.hospital_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Clinical Department:</span>
                    <strong className="text-white">{selectedGrievance.department}</strong>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-400">Citizen Testimonial:</span>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 italic">
                    "{selectedGrievance.description}"
                  </div>
                </div>

                {/* Action History / Investigation Timeline */}
                <div className="space-y-2 pt-2 text-xs">
                  <span className="font-bold text-slate-400">Investigation Timeline:</span>
                  <div className="space-y-2">
                    {selectedGrievance.action_history?.map((act: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white text-[11px]">{act.action} • <span className="text-slate-400 font-normal">{act.officer}</span></p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{act.note}</p>
                          <span className="text-[10px] text-slate-600 font-mono mt-1 block">{new Date(act.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ombudsman Disciplinary Action Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Scale className="w-4 h-4" />
                  <h4 className="font-bold text-sm text-white">Ombudsman Statutory Action Execution</h4>
                </div>

                <form onSubmit={handleTakeAction} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Select Disciplinary Ruling</label>
                    <select
                      value={actionType}
                      onChange={(e) => {
                        setActionType(e.target.value);
                        if (e.target.value === 'ISSUE_NOTICE') setActionNotes('Official show cause notice issued requiring doctor written response within 48 hours.');
                        else if (e.target.value === 'DEDUCT_BONUS') setActionNotes('-10% Salary deduction penalty applied to payroll due to substantiated citizen complaint.');
                        else if (e.target.value === 'RESOLVE') setActionNotes('Grievance resolved following amicable patient clarification and corrective staff counselling.');
                        else if (e.target.value === 'INITIATE_INQUIRY') setActionNotes('Formal three-member inquiry panel initiated under Civil Services Medical Rules.');
                      }}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                    >
                      <option value="ISSUE_NOTICE">📜 Issue Official Show-Cause Notice</option>
                      <option value="DEDUCT_BONUS">💰 Apply -10% Salary Bonus Penalty Deduction</option>
                      <option value="INITIATE_INQUIRY">⚖️ Initiate Formal Vigilance Inquiry</option>
                      <option value="RESOLVE">✅ Mark Grievance as Amicably Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Official Ombudsman Ruling Notes</label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Executing Ruling...' : 'Record & Execute Statutory Ruling'}</span>
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              Select a citizen complaint from the left to review details and execute an official ruling.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
