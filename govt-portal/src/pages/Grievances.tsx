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
  const [actionNotes, setActionNotes] = useState('A notice was sent requesting a written response within 48 hours.');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchGrievances = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_V1_URL}/observer/grievances`);
      const data = await res.json();
      setGrievances(data.grievances || []);
      if (data.grievances?.length > 0 && !selectedGrievance) {
        setSelectedGrievance(data.grievances[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch grievances', e);
      setError('Complaints could not be loaded. Please try again.');
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
            <span>Patient support</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Complaints and resolutions
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Review patient complaints, record follow-up actions, and track each case to resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All complaints ({grievances.length})</option>
            <option value="OPEN">Open / Pending</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="SHOW_CAUSE_ISSUED">Show Cause Issued</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-sm text-rose-200 flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={fetchGrievances} className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white">Try again</button>
        </div>
      )}

      {loading && <p role="status" className="text-sm text-slate-300">Loading complaints…</p>}

      {/* Main Grid: Grievance List & Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Complaints List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Complaints ({filtered.length})
          </h3>

          <div className="space-y-2.5">
            {!loading && !error && filtered.length === 0 && (
              <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">No complaints match this filter.</p>
            )}
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
                    <span>Staff: <strong className="text-slate-400">{grv.doctor_name}</strong></span>
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
                    Priority: {selectedGrievance.severity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Patient</span>
                    <strong className="text-white">{selectedGrievance.patient_name} (Token: {selectedGrievance.token_number})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Staff member</span>
                    <strong className="text-amber-400">{selectedGrievance.doctor_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hospital</span>
                    <strong className="text-white">{selectedGrievance.hospital_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department</span>
                    <strong className="text-white">{selectedGrievance.department}</strong>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-400">Complaint</span>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 italic">
                    "{selectedGrievance.description}"
                  </div>
                </div>

                {/* Action History / Investigation Timeline */}
                <div className="space-y-2 pt-2 text-xs">
                  <span className="font-bold text-slate-400">Case history</span>
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
                  <h4 className="font-bold text-sm text-white">Resolve grievance</h4>
                </div>

                <form onSubmit={handleTakeAction} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Action</label>
                    <select
                      value={actionType}
                      onChange={(e) => {
                        setActionType(e.target.value);
                        if (e.target.value === 'ISSUE_NOTICE') setActionNotes('A notice was sent requesting a written response within 48 hours.');
                        else if (e.target.value === 'DEDUCT_BONUS') setActionNotes('A 10% bonus adjustment was applied after the complaint was confirmed.');
                        else if (e.target.value === 'RESOLVE') setActionNotes('The complaint was resolved after speaking with the patient and staff member.');
                        else if (e.target.value === 'INITIATE_INQUIRY') setActionNotes('A formal review has started.');
                      }}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                    >
                      <option value="ISSUE_NOTICE">Request a written response</option>
                      <option value="DEDUCT_BONUS">Apply a 10% bonus adjustment</option>
                      <option value="INITIATE_INQUIRY">Start formal review</option>
                      <option value="RESOLVE">Mark as resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Resolution notes</label>
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
                    className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Saving…' : 'Save resolution'}</span>
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
