import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Star, 
  MessageSquare, 
  Award, 
  ShieldAlert, 
  Search, 
  Filter, 
  TrendingUp, 
  HeartHandshake, 
  Clock, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const DoctorPerformance: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctorSurveys, setDoctorSurveys] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/observer/doctors/performance');
      const data = await res.json();
      setDoctors(data.doctors || []);
      if (data.doctors?.length > 0 && !selectedDoctor) {
        setSelectedDoctor(data.doctors[0]);
        fetchDoctorSurveys(data.doctors[0].id);
      }
    } catch (e) {
      console.warn('Failed to fetch doctors', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorSurveys = async (docId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/observer/surveys/doctor/${docId}`);
      const data = await res.json();
      setDoctorSurveys(data.surveys || []);
    } catch (e) {
      console.warn('Failed to fetch surveys', e);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSelectDoctor = (doc: any) => {
    setSelectedDoctor(doc);
    fetchDoctorSurveys(doc.id);
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Citizen Satisfaction & Behavioral Accountability</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Doctor Behavioral & Performance Index (DPI)
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Detailed breakdown of doctor talking courtesy, diagnosis explanation clarity, and punctuality collected from genuine patient OPD post-consultation surveys.
          </p>

          {/* WHY THIS MATTERS: DOCTOR PERFORMANCE -> SALARY BONUS LINK MICROCOPY */}
          <div className="mt-3 p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Why this matters:</strong> Linking citizen survey ratings directly to statutory DPI formulas eliminates doctor absenteeism and bedside neglect. High performers earn up to +15% monthly merit bonuses, while substandard adherence triggers automatic audit reviews.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctor or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 pl-8 w-60"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Doctor List & Selected Doctor Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Doctor List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Empanelled Doctors ({filteredDoctors.length})
          </h3>

          <div className="space-y-2.5">
            {filteredDoctors.map((doc) => {
              const isSelected = selectedDoctor?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDoctor(doc)}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 shadow-lg shadow-amber-950/20 ring-1 ring-amber-400'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">{doc.name}</h4>
                    <p className="text-xs text-slate-400">{doc.department} • {doc.hospital}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {doc.avg_score} / 5.0
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({doc.review_count || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl block ${
                        doc.bonus_percentage > 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : doc.bonus_percentage < 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {doc.bonus_percentage > 0 ? `+${doc.bonus_percentage}%` : `${doc.bonus_percentage}%`}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {doc.grievance_count > 0 ? '⚠️ Audit Flag' : 'Bonus'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Detailed Behavioral Breakdown & Survey Feed */}
        <div className="lg:col-span-7 space-y-6">
          {selectedDoctor ? (
            <div className="space-y-6">
              
              {/* Profile Card & Four Behavioral Pillars */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{selectedDoctor.name}</h3>
                      <p className="text-xs text-slate-400">{selectedDoctor.designation} • {selectedDoctor.department}</p>
                      <p className="text-[11px] text-slate-500">{selectedDoctor.hospital}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">
                      ★ {selectedDoctor.avg_score} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                    </span>
                    <p className="text-[11px] text-slate-400 font-semibold">{selectedDoctor.performance_grade}</p>
                  </div>
                </div>

                {/* 4 Pillars of Doctor Performance Evaluation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Politeness & Tone</span>
                    <p className="text-lg font-black text-emerald-400">{selectedDoctor.politeness_score || 4.5} ★</p>
                    <p className="text-[10px] text-slate-500">Courtesy & talking</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Communication</span>
                    <p className="text-lg font-black text-blue-400">{selectedDoctor.communication_score || 4.5} ★</p>
                    <p className="text-[10px] text-slate-500">Prescription clarity</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Clinical Exam</span>
                    <p className="text-lg font-black text-indigo-400">{selectedDoctor.diagnosis_score || 4.5} ★</p>
                    <p className="text-[10px] text-slate-500">Thoroughness</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Punctuality</span>
                    <p className="text-lg font-black text-amber-400">{selectedDoctor.punctuality_score || 4.5} ★</p>
                    <p className="text-[10px] text-slate-500">Queue turn pacing</p>
                  </div>
                </div>
              </div>

              {/* Citizen Written Reviews Stream */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">Citizen Survey Feedback Stream</h4>
                  </div>
                  <span className="text-xs text-slate-400">
                    {doctorSurveys.length} Registered Surveys
                  </span>
                </div>

                {doctorSurveys.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No individual survey records yet for this doctor. Baseline grade applied.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doctorSurveys.map((srv) => (
                      <div
                        key={srv.id}
                        className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          srv.overall_score < 3.0
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{srv.patient_name}</span>
                            <span className="text-[10px] font-mono text-slate-400">Token: {srv.token_number}</span>
                          </div>
                          <span className="font-bold text-amber-400">
                            ★ {srv.overall_score} / 5.0
                          </span>
                        </div>

                        <p className="text-slate-300 italic">"{srv.feedback_text}"</p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                          <span>Politeness: {srv.politeness_rating}★ • Explanation: {srv.communication_rating}★ • Exam: {srv.diagnosis_quality_rating}★</span>
                          <span>{new Date(srv.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              Select a doctor from the left to inspect their Behavioral & Performance Index.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
