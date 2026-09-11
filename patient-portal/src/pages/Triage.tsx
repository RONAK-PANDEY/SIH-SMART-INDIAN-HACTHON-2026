import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  BrainCircuit, 
  Sparkles, 
  HeartPulse, 
  Flame, 
  CheckCircle2, 
  Zap, 
  Stethoscope, 
  AlertTriangle, 
  ArrowRight,
  Thermometer,
  FileText,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TriageResult {
  esiLevel: number;
  esiLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
  priorityTitle: string;
  summary: string;
  recommendedDept: string;
  recommendedDoctor: string;
  estimatedWait: number;
  tokenPrefix: string;
  isEmergency: boolean;
  clinicalFactors: string[];
}

export const Triage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [symptoms, setSymptoms] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');
  const [duration, setDuration] = useState('1-2 days');
  const [ageGroup, setAgeGroup] = useState<'Pediatric' | 'Adult' | 'Senior'>('Adult');
  const [painLevel, setPainLevel] = useState<number>(5);
  const [spo2, setSpo2] = useState<number>(98);
  const [comorbidities, setComorbidities] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Common quick symptom tags
  const symptomQuickTags = [
    { label: 'Chest Discomfort / Pressure', category: 'cardiac', danger: true },
    { label: 'Shortness of Breath', category: 'respiratory', danger: true },
    { label: 'High Fever (>102°F)', category: 'fever', danger: false },
    { label: 'Severe Headache', category: 'neurological', danger: false },
    { label: 'Abdominal / Stomach Pain', category: 'gastro', danger: false },
    { label: 'Fainting / Dizziness', category: 'cardiac', danger: true },
    { label: 'Fracture / Sudden Trauma', category: 'trauma', danger: true },
    { label: 'Persistent Cough / Cold', category: 'respiratory', danger: false },
    { label: 'Eye Discomfort / Redness', category: 'general', danger: false },
    { label: 'Routine OPD Checkup', category: 'general', danger: false }
  ];

  const comorbidityOptions = ['Diabetes', 'Hypertension (High BP)', 'Asthma / COPD', 'Heart Condition', 'Pregnancy'];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleComorbidity = (item: string) => {
    setComorbidities((prev) =>
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    );
  };

  // Dynamic AI Clinical Evaluation Engine (ESI Algorithm)
  const assessment: TriageResult = useMemo(() => {
    const combinedText = (symptoms + ' ' + selectedTags.join(' ')).toLowerCase();
    const factors: string[] = [];

    let isRedAlert = false;
    let isOrangeAlert = false;

    // Red flag detection
    if (
      combinedText.includes('chest') ||
      combinedText.includes('pressure') ||
      combinedText.includes('heart') ||
      combinedText.includes('fainting') ||
      combinedText.includes('unconscious') ||
      combinedText.includes('fracture') ||
      combinedText.includes('trauma') ||
      combinedText.includes('breath') ||
      spo2 < 92 ||
      severity === 'Critical' ||
      painLevel >= 9
    ) {
      isRedAlert = true;
    } else if (
      combinedText.includes('fever') ||
      combinedText.includes('headache') ||
      combinedText.includes('stomach') ||
      combinedText.includes('abdominal') ||
      severity === 'Severe' ||
      painLevel >= 7 ||
      (ageGroup === 'Pediatric' && combinedText.includes('fever')) ||
      (ageGroup === 'Senior' && comorbidities.length > 0)
    ) {
      isOrangeAlert = true;
    }

    if (isRedAlert) {
      if (spo2 < 92) factors.push(`Low SpO2 Blood Oxygen (${spo2}%)`);
      if (combinedText.includes('chest')) factors.push('Acute Chest Discomfort / Potential Cardiac Marker');
      if (combinedText.includes('breath')) factors.push('Severe Respiratory Distress');
      if (severity === 'Critical') factors.push('Patient Self-Reported Critical Symptoms');
      if (painLevel >= 9) factors.push(`Extreme Pain Score (${painLevel}/10)`);
      if (factors.length === 0) factors.push('Acute high-risk symptom combination detected');

      let dept = 'Emergency & Trauma';
      if (combinedText.includes('chest') || combinedText.includes('heart')) dept = 'Cardiology (Emergency)';
      else if (combinedText.includes('breath')) dept = 'Pulmonology / Critical Care';

      return {
        esiLevel: 1,
        esiLabel: 'ESI Level 1 — Immediate Critical Emergency (Red)',
        badgeBg: 'bg-rose-600 text-white',
        badgeText: 'text-rose-600',
        badgeBorder: 'border-rose-300',
        accentColor: 'rose',
        priorityTitle: 'CRITICAL EMERGENCY PRIORITY',
        summary: 'AI Clinical engine detected emergency markers requiring immediate trauma triage bed allocation.',
        recommendedDept: dept,
        recommendedDoctor: 'Dr. A. K. Sharma (Trauma Lead)',
        estimatedWait: 0,
        tokenPrefix: 'EMG',
        isEmergency: true,
        clinicalFactors: factors
      };
    }

    if (isOrangeAlert) {
      if (severity === 'Severe') factors.push('High Severity Index');
      if (painLevel >= 7) factors.push(`Elevated Pain Score (${painLevel}/10)`);
      if (comorbidities.length > 0) factors.push(`Co-morbidities: ${comorbidities.join(', ')}`);
      if (ageGroup !== 'Adult') factors.push(`Vulnerable Age Group (${ageGroup})`);
      if (factors.length === 0) factors.push('Acute symptoms requiring priority consultation');

      let dept = 'General Medicine';
      if (combinedText.includes('stomach') || combinedText.includes('abdominal')) dept = 'Gastroenterology';
      else if (combinedText.includes('headache')) dept = 'Neurology / General Medicine';
      else if (ageGroup === 'Pediatric') dept = 'Pediatrics';

      return {
        esiLevel: 2,
        esiLabel: 'ESI Level 2 — High Priority Urgent (Orange)',
        badgeBg: 'bg-amber-500 text-white',
        badgeText: 'text-amber-600',
        badgeBorder: 'border-amber-300',
        accentColor: 'amber',
        priorityTitle: 'HIGH PRIORITY URGENT QUEUE',
        summary: 'Priority fast-track assigned. Fast-tracked in OPD queue ahead of standard routine consultations.',
        recommendedDept: dept,
        recommendedDoctor: 'Dr. Priya Mehta',
        estimatedWait: 10,
        tokenPrefix: 'PR',
        isEmergency: false,
        clinicalFactors: factors
      };
    }

    // Default ESI Level 3 - Standard OPD
    factors.push('Routine non-critical symptoms');
    if (duration) factors.push(`Symptom Duration: ${duration}`);
    if (comorbidities.length > 0) factors.push(`History: ${comorbidities.join(', ')}`);

    let dept = 'General Medicine';
    if (combinedText.includes('eye')) dept = 'Ophthalmology';
    else if (combinedText.includes('cough') || combinedText.includes('cold')) dept = 'ENT / General Medicine';

    return {
      esiLevel: 3,
      esiLabel: 'ESI Level 3 — Standard OPD (Green)',
      badgeBg: 'bg-emerald-600 text-white',
      badgeText: 'text-emerald-600',
      badgeBorder: 'border-emerald-300',
      accentColor: 'emerald',
      priorityTitle: 'STANDARD OPD ROUTINE QUEUE',
      summary: 'Stable condition classified for standard OPD consultation. Token generated with live turnstile access.',
      recommendedDept: dept,
      recommendedDoctor: 'Dr. Rajesh Verma',
      estimatedWait: 25,
      tokenPrefix: 'A',
      isEmergency: false,
      clinicalFactors: factors
    };
  }, [symptoms, selectedTags, severity, painLevel, spo2, ageGroup, comorbidities, duration]);

  const handleStartAssess = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setShowResult(true);
    }, 1000);
  };

  const handleGenerateToken = () => {
    const num = Math.floor(Math.random() * 80) + 10;
    const tokenNum = `${assessment.tokenPrefix}-${num < 10 ? '0' + num : num}`;
    const newToken = {
      token_id: `tok_${Date.now()}`,
      token_number: tokenNum,
      patient_id: 'P-10024',
      department: assessment.recommendedDept,
      doctor: assessment.recommendedDoctor,
      hash: '7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e',
      estimated_wait_minutes: assessment.estimatedWait,
      triage_level: assessment.esiLevel,
      triage_label: assessment.esiLabel,
      symptoms_summary: symptoms || selectedTags.join(', ') || 'General OPD Assessment'
    };

    localStorage.removeItem('smartcare_cancelled');
    const existingRaw = localStorage.getItem('smartcare_all_tokens');
    let list = [];
    if (existingRaw) {
      try { list = JSON.parse(existingRaw); } catch {}
    }
    list.unshift(newToken);
    localStorage.setItem('smartcare_all_tokens', JSON.stringify(list));
    localStorage.setItem('smartcare_active_token', JSON.stringify(newToken));
    navigate('/my-token');
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-2xl relative font-sans pb-28">
        <header className="flex items-center p-5 bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200">
          <button onClick={() => setShowResult(false)} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center mr-3 hover:bg-slate-200 transition">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 leading-tight">AI Clinical Assessment</h1>
            <p className="text-xs text-slate-500">Emergency Severity Index (ESI) Evaluation</p>
          </div>
        </header>

        <main className="flex-1 p-5 space-y-5 animate-in zoom-in-95 duration-300">
          {/* Top Priority Badge */}
          <div className="text-center bg-white rounded-3xl p-6 shadow-md border border-slate-200 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 ${
              assessment.esiLevel === 1 ? 'bg-rose-600' : assessment.esiLevel === 2 ? 'bg-amber-500' : 'bg-emerald-600'
            }`}></div>
            
            <div className="relative mb-4 mt-2 inline-block">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner ${
                assessment.esiLevel === 1 ? 'bg-rose-100 text-rose-600' : assessment.esiLevel === 2 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {assessment.esiLevel === 1 ? (
                  <Flame className="w-10 h-10 animate-bounce" />
                ) : assessment.esiLevel === 2 ? (
                  <AlertTriangle className="w-10 h-10" />
                ) : (
                  <CheckCircle2 className="w-10 h-10" />
                )}
              </div>
            </div>

            <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block mb-2 ${
              assessment.esiLevel === 1 ? 'bg-rose-50 text-rose-700 border-rose-200' : assessment.esiLevel === 2 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {assessment.esiLabel}
            </span>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{assessment.priorityTitle}</h2>
            <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed max-w-xs mx-auto">
              {assessment.summary}
            </p>
          </div>

          {/* Clinical Rationale Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-blue-600" />
              <span>Clinical AI Reasoning & Risk Factors</span>
            </span>

            <ul className="space-y-2 text-xs">
              {assessment.clinicalFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Routing & Allocation Details */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-xl space-y-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block border-b border-slate-700/60 pb-2 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Recommended Medical Department</span>
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Department</span>
                <strong className="text-sm font-bold text-white block truncate">{assessment.recommendedDept}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Doctor</span>
                <strong className="text-sm font-bold text-teal-300 block truncate">{assessment.recommendedDoctor}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimated Wait Time</span>
                <strong className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {assessment.estimatedWait === 0 ? 'Immediate / Priority Bed' : `~${assessment.estimatedWait} mins`}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Turnstile Pass</span>
                <strong className="text-sm font-bold text-blue-300 mt-0.5 block">SHA-256 E-Pass Ready</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {assessment.isEmergency && (
              <button
                onClick={() => navigate('/ambulance')}
                className="w-full bg-gradient-to-r from-rose-600 to-red-700 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm hover:from-rose-700 hover:to-red-800 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Call Emergency Ambulance (108)</span>
              </button>
            )}

            <button
              onClick={handleGenerateToken}
              className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-2xl hover:bg-blue-700 transition-all text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Generate AI Priority Token & E-Pass</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-2xl relative font-sans pb-32">
      {/* Top Header */}
      <header className="flex items-center justify-between p-5 bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>AI Health Triage</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </h1>
            <p className="text-[11px] text-slate-500">Real-time Emergency Severity Index Assessment</p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
          SIH26133 Protocol
        </span>
      </header>

      <main className="flex-1 p-5 space-y-6 overflow-y-auto">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <BrainCircuit className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Smart Clinical Queue Prioritization</h2>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                Describe your health status below. Our AI evaluates clinical urgency (ESI Level 1-4) to assign queue priority and prevent ghost tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Symptom Selector Tags */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>Select Common Symptoms (Tap to add)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {symptomQuickTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.label);
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl transition border text-left flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : tag.danger
                      ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Freeform Symptom Notes */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Detailed Symptoms Description</span>
          </label>
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe how you feel in detail (e.g. Sharp pain in chest, high fever since yesterday, feeling dizzy when standing up...)"
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs min-h-[100px] resize-none font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Clinical Vitals & Inputs */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Clinical Indicators & Age Group</span>
          </span>

          {/* Age Group */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Patient Vulnerability / Age Group</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Pediatric', 'Adult', 'Senior'] as const).map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setAgeGroup(grp)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                    ageGroup === grp
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Level */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Self-Reported Symptom Severity</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Mild', 'Moderate', 'Severe', 'Critical'] as const).map((lvl) => (
                <button 
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                    severity === lvl 
                      ? lvl === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : lvl === 'Severe'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Pain Scale Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600">Pain Intensity Score (1 - 10)</label>
              <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                painLevel >= 8 ? 'bg-rose-100 text-rose-700' : painLevel >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {painLevel} / 10
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={painLevel} 
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Blood Oxygen SpO2 Level */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                <span>Estimated SpO2 Blood Oxygen (%)</span>
              </label>
              <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                spo2 < 92 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {spo2}%
              </span>
            </div>
            <input 
              type="range" 
              min="80" 
              max="100" 
              value={spo2} 
              onChange={(e) => setSpo2(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Pre-existing Conditions */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Pre-existing Health Conditions</label>
            <div className="flex flex-wrap gap-1.5">
              {comorbidityOptions.map((item) => {
                const isSelected = comorbidities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleComorbidity(item)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Assess Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl max-w-lg mx-auto z-40 border-t border-slate-200 shadow-2xl">
        <button 
          onClick={handleStartAssess}
          disabled={isEvaluating}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-xl shadow-blue-500/25 cursor-pointer disabled:opacity-50"
        >
          {isEvaluating ? (
            <>
              <BrainCircuit className="w-5 h-5 animate-spin" />
              <span>Analyzing Clinical Risk & ESI Level...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-current text-blue-200" />
              <span>Analyze Symptoms with AI Triage Engine</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
