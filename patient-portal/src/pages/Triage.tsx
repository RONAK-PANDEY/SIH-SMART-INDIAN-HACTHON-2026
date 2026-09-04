import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export const Triage: React.FC = () => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [vulnerability, setVulnerability] = useState({
    senior: false,
    pregnant: false,
    differentlyAbled: false,
  });
  const [result, setResult] = useState<{ level: number; label: string; color: string } | null>(null);

  const symptomList = [
    'Severe Chest Pain',
    'Shortness of Breath',
    'High Fever (>102°F)',
    'Sudden Dizziness / Fainting',
    'Severe Abdominal Pain',
    'Mild Cold / Cough',
    'Joint Pain / Minor Injury',
    'Routine Prescription Refill',
  ];

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleEvaluate = () => {
    if (symptoms.includes('Severe Chest Pain') || symptoms.includes('Shortness of Breath')) {
      setResult({ level: 2, label: 'Emergent (ESI Level 2) - Priority OPD Allocation', color: 'bg-orange-100 text-orange-800 border-orange-300' });
    } else if (symptoms.includes('High Fever (>102°F)') || symptoms.includes('Severe Abdominal Pain')) {
      setResult({ level: 3, label: 'Urgent (ESI Level 3) - Standard Expedited Queue', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' });
    } else {
      setResult({ level: 4, label: 'Routine (ESI Level 4/5) - Regular OPD Token', color: 'bg-blue-100 text-blue-800 border-blue-300' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-2xl mx-auto pb-24">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-rose-600 mb-1">
          <Activity className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-wider">AI Symptom Assessment</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Smart OPD Triage Check</h1>
        <p className="text-xs text-slate-500 mt-1">Select your symptoms to evaluate clinical urgency and route directly to the optimal queue.</p>
      </header>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-3">Select Observed Symptoms</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {symptomList.map((item) => {
              const selected = symptoms.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleSymptom(item)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{item}</span>
                  {selected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Priority Criteria</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={vulnerability.senior}
                onChange={(e) => setVulnerability({ ...vulnerability, senior: e.target.checked })}
                className="rounded text-blue-600"
              />
              Senior Citizen (Age 65+)
            </label>
            <label className="flex items-center gap-2.5 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={vulnerability.pregnant}
                onChange={(e) => setVulnerability({ ...vulnerability, pregnant: e.target.checked })}
                className="rounded text-blue-600"
              />
              Pregnant Patient
            </label>
            <label className="flex items-center gap-2.5 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={vulnerability.differentlyAbled}
                onChange={(e) => setVulnerability({ ...vulnerability, differentlyAbled: e.target.checked })}
                className="rounded text-blue-600"
              />
              Person with Disability (PwD)
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Additional Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe pain duration, history of allergies, or specific doctor instructions..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={handleEvaluate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-sm transition text-xs"
        >
          Evaluate Triage Level
        </button>

        {result && (
          <div className={`p-4 rounded-xl border ${result.color} space-y-3`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-bold text-sm">Assessment Result</h4>
            </div>
            <p className="text-xs">{result.label}</p>
            <a
              href="/book-appointment"
              className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              <span>Generate Prioritized Token</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
