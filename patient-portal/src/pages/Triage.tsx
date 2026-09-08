import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  Search, 
  PhoneCall, 
  Sparkles, 
  Building2, 
  Clock, 
  UserCheck, 
  FileText, 
  HelpCircle,
  ExternalLink,
  Flame,
  ShieldCheck,
  Stethoscope
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

export const Triage: React.FC = () => {
  const [taxonomy, setTaxonomy] = useState<Record<string, Symptom[]>>({});
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [freeText, setFreeText] = useState<string>('');
  const [editableNotes, setEditableNotes] = useState<string>('');
  const [vulnerability, setVulnerability] = useState({
    senior: false,
    pregnant: false,
    differentlyAbled: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loadInfo, setLoadInfo] = useState<HospitalLoadInfo | null>(null);
  const [contacts, setContacts] = useState<Record<string, { title: string; number: string; type: string }>>({});

  // Auto-detect if user logged in with demo Aadhaar
  useEffect(() => {
    const savedUser = localStorage.getItem('smartcare_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.age && u.age >= 60) {
          setVulnerability(prev => ({ ...prev, senior: true }));
        }
        if (u.is_pregnant) {
          setVulnerability(prev => ({ ...prev, pregnant: true }));
        }
        if (u.is_pwd) {
          setVulnerability(prev => ({ ...prev, differentlyAbled: true }));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch symptoms taxonomy and helpdesk contacts from backend
    fetch('http://127.0.0.1:8000/api/v1/triage/symptoms-taxonomy')
      .then(res => res.json())
      .then(data => {
        if (data.taxonomy) setTaxonomy(data.taxonomy);
      })
      .catch(err => console.error('Taxonomy fetch error:', err));

    fetch('http://127.0.0.1:8000/api/v1/triage/helpdesk-contacts')
      .then(res => res.json())
      .then(data => {
        if (data.contacts) setContacts(data.contacts);
      })
      .catch(err => console.error('Contacts fetch error:', err));
  }, []);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/triage/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom_ids: selectedSymptoms,
          free_text_description: freeText,
          vulnerability: vulnerability,
          hospital_id: 'hosp-aiims-delhi'
        })
      });
      const data = await resp.json();
      if (data.status === 'success') {
        setResult(data.evaluation);
        setLoadInfo(data.hospital_load_analysis);
      }
    } catch (err) {
      console.error('Triage eval error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter symptoms by category and search query
  const allSymptomsList: Array<Symptom & { category: string }> = [];
  Object.entries(taxonomy).forEach(([cat, items]) => {
    items.forEach(item => {
      allSymptomsList.push({ ...item, category: cat });
    });
  });

  const filteredSymptoms = allSymptomsList.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesQuery = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const categories = ['All', ...Object.keys(taxonomy)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 max-w-4xl mx-auto pb-32">
      {/* Top Header */}
      <header className="mb-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-2 border border-blue-200">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">AI Symptom & Urgency Triage</span>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> ESI & NHM Standard
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Smart OPD Triage & AI Doctor Recommender</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Describe your condition or pick from 100+ symptoms. Our medical AI will identify the right specialty, assess clinical urgency, and fast-track your token.
        </p>

        {/* WHY THIS MATTERS: AI TRIAGE INNOVATION MICROCOPY */}
        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Why this matters:</strong> AI Department Triage evaluates clinical severity before hospital arrival, automatically directing citizens to the exact specialty chamber and eliminating misrouted OPD tokens and emergency room crowding.
          </span>
        </div>
      </header>

      {/* Hospital Helpdesk & Emergency Quick Call Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 text-white shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Need Direct Medical Assistance?</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Contact hospital triage counter, on-duty CMO, or emergency tele-desk</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a 
              href="tel:108" 
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Ambulance: 108</span>
            </a>
            <a 
              href="tel:+911126588500" 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Counter Helpdesk: +91 11 2658 8500</span>
            </a>
            <a 
              href="tel:+919811054321" 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              <span>Duty Doctor: +91 98110 54321</span>
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Free Text Problem Description (Custom problem input) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>1. Describe Your Problem In Your Own Words</span>
            </label>
            <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
              Optional / No need to pick checkboxes
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            If your problem is not in the options or you prefer typing in plain words (English/Hinglish), describe what you are feeling below:
          </p>
          <textarea
            rows={3}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="e.g., Since yesterday evening I have severe throbbing headache with nausea and light sensitivity, also feeling chest heaviness when walking fast..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 placeholder-slate-400 shadow-inner"
          />
        </div>

        {/* Section 2: 100+ Categorized Medical Symptoms Taxonomy */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>2. Select Observed Symptoms (100+ Conditions)</span>
              </label>
              <p className="text-xs text-slate-500 mt-0.5">Select one or more matching symptoms or filter using categories</p>
            </div>
            {selectedSymptoms.length > 0 && (
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full self-start">
                {selectedSymptoms.length} Selected
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms (e.g., fever, chest, fracture, breathing, rash, pregnancy, eye)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Symptoms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {filteredSymptoms.map((item) => {
              const isSelected = selectedSymptoms.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleSymptom(item.id)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition ${
                    isSelected
                      ? item.red_flag
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-semibold shadow-sm'
                        : 'border-blue-500 bg-blue-50 text-blue-900 font-semibold shadow-sm'
                      : item.red_flag
                      ? 'border-rose-200 bg-rose-50/40 text-rose-800 hover:bg-rose-50'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 pr-2">
                    {item.red_flag && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    <span className="leading-tight">{item.name}</span>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.red_flag ? 'text-rose-600' : 'text-blue-600'}`} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Demographic Priority Criteria (Aadhaar & Vulnerability) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>3. Government Priority & Vulnerability Pass</span>
            </label>
            <span className="text-[11px] text-slate-500">Auto-Verified or Self-Declared</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            National Health Mission priority allocations (Senior Citizens, Pregnant Ladies, and Differently-Abled) receive accelerated queueing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
              vulnerability.senior ? 'border-amber-400 bg-amber-50/80 text-amber-900 font-semibold' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={vulnerability.senior}
                onChange={(e) => setVulnerability({ ...vulnerability, senior: e.target.checked })}
                className="mt-0.5 rounded text-amber-600"
              />
              <div>
                <span className="text-xs font-bold block">Senior Citizen (Age 60+)</span>
                <span className="text-[11px] text-slate-500">Aadhaar verified DOB</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
              vulnerability.pregnant ? 'border-pink-400 bg-pink-50/80 text-pink-900 font-semibold' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={vulnerability.pregnant}
                onChange={(e) => setVulnerability({ ...vulnerability, pregnant: e.target.checked })}
                className="mt-0.5 rounded text-pink-600"
              />
              <div>
                <span className="text-xs font-bold block">Pregnant Lady</span>
                <span className="text-[11px] text-slate-500">Maternal health protocol</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
              vulnerability.differentlyAbled ? 'border-purple-400 bg-purple-50/80 text-purple-900 font-semibold' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={vulnerability.differentlyAbled}
                onChange={(e) => setVulnerability({ ...vulnerability, differentlyAbled: e.target.checked })}
                className="mt-0.5 rounded text-purple-600"
              />
              <div>
                <span className="text-xs font-bold block">Person with Disability (PwD)</span>
                <span className="text-[11px] text-slate-500">UDID / Special access</span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleEvaluate}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Clinical Symptoms & Hospital Queues...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>Evaluate Triage Level & Match Doctor</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Result & Evaluation Box */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Priority Assessment Card */}
            <div className={`p-6 rounded-2xl border shadow-md ${
              result.triage_level === 1 
                ? 'bg-rose-50 border-rose-300 text-rose-950' 
                : result.triage_level === 2 
                ? 'bg-orange-50 border-orange-300 text-orange-950' 
                : result.triage_level === 3 
                ? 'bg-amber-50 border-amber-300 text-amber-950' 
                : 'bg-blue-50 border-blue-300 text-blue-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/40 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
                    result.triage_level === 1 ? 'bg-rose-600 animate-pulse' : result.triage_level === 2 ? 'bg-orange-600' : result.triage_level === 3 ? 'bg-amber-600' : 'bg-blue-600'
                  }`}>
                    P{result.triage_level}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider opacity-75">{result.priority_tag}</span>
                    <h3 className="text-lg font-bold leading-tight">{result.label}</h3>
                  </div>
                </div>
                <div className="text-left sm:text-right bg-white/70 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Estimated Triage Wait</span>
                  <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {result.estimated_wait}
                  </span>
                </div>
              </div>

              {/* Matched Specialist & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Recommended Department</span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">{result.department_name}</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> {result.location}
                  </span>
                </div>
                <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Doctor Specialization</span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">{result.doctor_type}</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> Counter Desk Ext: #{result.counter_extension}
                  </span>
                </div>
              </div>

              <div className="bg-white/60 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 mb-4">
                <strong>Action Guidance:</strong> {result.action_guidance}
              </div>

              {/* Automatic Clinical Summary */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono space-y-1 mb-4">
                <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-1 mb-2">
                  <span className="font-bold uppercase tracking-wider">Automated Clinical Notes (Auto-Generated)</span>
                  <span>Ready for Doctor Intake</span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200">{result.auto_clinical_note}</pre>
              </div>

              {/* Additional editable remarks by patient */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Add Your Own Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  placeholder="e.g., Blood pressure medication taken this morning, diabetic since 5 years..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Next Step Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`/book-appointment?dept=${result.department_id}&level=${result.triage_level}`}
                  className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2"
                >
                  <span>Book Prioritized Token for {result.department_name}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Hospital Load Balancer & Referral Suggestion */}
            {loadInfo && loadInfo.is_congested && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm text-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-amber-950">AI Smart Referral: High Congestion Detected!</h4>
                      <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                        Save ~{loadInfo.time_saved_mins} mins
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      {loadInfo.recommendation_reason}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                      {loadInfo.suggested_alternatives.map((alt) => (
                        <div key={alt.id} className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-xs text-slate-800 block leading-tight">{alt.name}</span>
                            <span className="text-[11px] text-slate-500 mt-1 block">{alt.distance_km} km away • Wait: <strong>{alt.avg_wait_mins} mins</strong></span>
                          </div>
                          <a
                            href={`/book-appointment?hospital=${alt.id}&dept=${result.department_id}&level=${result.triage_level}`}
                            className="mt-2 text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-2 rounded-lg text-center transition block"
                          >
                            Transfer Token Here
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
