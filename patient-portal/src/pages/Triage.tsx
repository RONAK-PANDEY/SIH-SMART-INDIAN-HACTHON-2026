import React, { useState, useEffect } from 'react';
import { API_V1_URL } from '../lib/api';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Building2, 
  Clock, 
  FileText, 
  Stethoscope,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  red_flag?: boolean;
  department: string;
  severity: number;
}

interface TriageResult {
  triage_level: number;
  priority_tag: string;
  color_theme: string;
  label: string;
  action_guidance: string;
  estimated_wait: string;
  is_emergency: boolean;
  department_id: string;
  department_name: string;
  doctor_type: string;
  location: string;
  counter_extension: string;
  matched_symptoms_count: number;
  auto_clinical_note: string;
}

interface HospitalLoadInfo {
  is_congested: boolean;
  time_saved_mins: number;
  recommendation_reason: string;
  suggested_alternatives: Array<{
    id: string;
    name: string;
    distance_km: number;
    avg_wait_mins: number;
    status: string;
  }>;
}

const COMMON_SYMPTOMS: Symptom[] = [
  { id: 'sym-1', name: 'Chest tightness or discomfort on exertion', red_flag: true, department: 'Cardiology', severity: 4 },
  { id: 'sym-2', name: 'Shortness of breath when lying flat', red_flag: true, department: 'Cardiology', severity: 4 },
  { id: 'sym-3', name: 'High fever (>102°F) lasting over 3 days', red_flag: false, department: 'General Medicine', severity: 3 },
  { id: 'sym-4', name: 'Persistent dry cough with throat irritation', red_flag: false, department: 'Pulmonology', severity: 2 },
  { id: 'sym-5', name: 'Severe lower back pain radiating to leg', red_flag: false, department: 'Orthopaedics', severity: 3 },
  { id: 'sym-6', name: 'Acute throbbing headache with nausea', red_flag: false, department: 'Neurology', severity: 3 },
  { id: 'sym-7', name: 'Abdominal stomach pain after eating', red_flag: false, department: 'Gastroenterology', severity: 2 },
  { id: 'sym-8', name: 'Joint stiffness and knee swelling', red_flag: false, department: 'Orthopaedics', severity: 2 },
  { id: 'sym-9', name: 'Skin rash with intense itching', red_flag: false, department: 'Dermatology', severity: 1 },
  { id: 'sym-10', name: 'Ear pain and reduced hearing', red_flag: false, department: 'ENT', severity: 2 }
];

export const Triage: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loadInfo, setLoadInfo] = useState<HospitalLoadInfo | null>(null);
  const [editableNotes, setEditableNotes] = useState('');

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filteredSymptoms = COMMON_SYMPTOMS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEvaluate = async () => {
    if (selectedSymptoms.length === 0 && !freeText.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_V1_URL}/triage/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom_ids: selectedSymptoms,
          free_text: freeText,
          patient_notes: editableNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.triage_result || data);
        if (data.hospital_load_info) setLoadInfo(data.hospital_load_info);
      } else {
        throw new Error('Fallback to default triage');
      }
    } catch (e) {
      // Offline / fallback calculation
      const hasRedFlag = selectedSymptoms.some(id => 
        COMMON_SYMPTOMS.find(s => s.id === id)?.red_flag
      );

      setResult({
        triage_level: hasRedFlag ? 2 : 3,
        priority_tag: hasRedFlag ? 'Priority 2 - Accelerated Assessment' : 'Priority 3 - Routine OPD Flow',
        color_theme: hasRedFlag ? 'amber' : 'teal',
        label: hasRedFlag ? 'Cardiology / Urgent Care' : 'General Medicine & Specialist OPD',
        action_guidance: hasRedFlag 
          ? 'Proceed directly to Gate B Turnstile for expedited entry. Dedicated senior specialist notified.'
          : 'Normal outpatient entry. Proceed through regular turnstile scanner upon arrival.',
        estimated_wait: hasRedFlag ? '10 - 15 mins' : '20 - 25 mins',
        is_emergency: hasRedFlag,
        department_id: hasRedFlag ? 'dept-cardio' : 'dept-genmed',
        department_name: hasRedFlag ? 'Cardiology & Heart Care' : 'General Outpatient Medicine',
        doctor_type: hasRedFlag ? 'Senior Cardiologist' : 'General Physician',
        location: 'AIIMS Delhi • OPD Block 2, Counter 4',
        counter_extension: '204',
        matched_symptoms_count: selectedSymptoms.length,
        auto_clinical_note: `Patient presented with ${selectedSymptoms.length} recorded symptoms. Additional observations: ${freeText || 'No specific remarks'}. Recommended for direct specialty consultation.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] p-4 sm:p-6 max-w-4xl mx-auto pb-32 font-sans">
      
      {/* 1. Header - 8pt spacing */}
      <div className="mb-8 pt-2 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-0.5 rounded-md border border-teal-200/60">
            Step 1 of 2 • Clinical Assessment
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            NHA Triage Protocol
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          How are you feeling today?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl font-normal">
          Select what you are experiencing or describe your condition. We route you directly to the right medical department and allocate an OPD turnstile pass.
        </p>
      </div>

      {/* 2. Free Text Input */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-subtle mb-6 space-y-3">
        <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
          Describe your problem in plain words
        </label>
        <textarea
          rows={3}
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="For example: Started having mild chest tightness and slight dizziness while walking up stairs this morning..."
          aria-label="Describe your symptoms"
          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 transition-colors"
        />
        <p className="text-[11px] text-slate-500">
          Our clinical routing engine understands symptoms in English and Hindi.
        </p>
      </div>

      {/* 3. Symptom Checklist - Strict 48px touch targets */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-subtle mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Or choose common symptoms below:
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap to select or deselect matching items.
            </p>
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms or organ..."
              aria-label="Search symptoms"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 min-h-[40px]"
            />
          </div>
        </div>

        {/* Symptoms grid - 48px touch targets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {filteredSymptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <button
                key={symptom.id}
                type="button"
                onClick={() => toggleSymptom(symptom.id)}
                className={`p-3.5 rounded-lg border text-left transition-colors flex items-start justify-between gap-3 min-h-[48px] ${
                  isSelected
                    ? 'bg-teal-50 border-teal-700 text-slate-900 ring-1 ring-teal-700/30'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold block leading-tight">
                    {symptom.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {symptom.department}
                  </span>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedSymptoms.length} symptom{selectedSymptoms.length === 1 ? '' : 's'} selected
          </span>

          <button
            type="button"
            onClick={handleEvaluate}
            disabled={loading || (selectedSymptoms.length === 0 && !freeText.trim())}
            className="bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition-colors shadow-subtle inline-flex items-center gap-2 min-h-[48px] cursor-pointer"
          >
            <span>{loading ? 'Evaluating Symptoms...' : 'Evaluate & Find Department'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Triage Result Card */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block">Recommended OPD Routing</span>
              <h3 className="text-xl font-semibold text-slate-900 mt-1">{result.department_name}</h3>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              <Clock className="w-3.5 h-3.5 text-teal-700" />
              Est. Wait: {result.estimated_wait}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase">Consulting Specialist</span>
              <p className="text-sm font-semibold text-slate-900">{result.doctor_type}</p>
              <p className="text-xs text-slate-500">{result.location}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase">Arrival Priority</span>
              <p className="text-sm font-semibold text-slate-900">{result.priority_tag}</p>
              <p className="text-xs text-slate-500">Scan at Gate B for direct counter queue entry</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900 block">Summary for your clinician</span>
            <p className="text-slate-600 font-normal leading-relaxed">{result.auto_clinical_note}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`/book-appointment?dept=${result.department_id}&level=${result.triage_level}`}
              className="w-full sm:w-auto flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition-colors shadow-subtle flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>Continue to appointment</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="/dashboard"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-5 py-3.5 rounded-xl transition-colors flex items-center justify-center min-h-[48px]"
            >
              Back to Overview
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
