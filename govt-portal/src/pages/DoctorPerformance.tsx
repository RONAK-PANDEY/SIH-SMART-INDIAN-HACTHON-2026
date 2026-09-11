import React, { useState } from 'react';
import { Award, Star, Search, Filter, CheckCircle2, ChevronRight, MessageSquare, Stethoscope } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface DoctorReport {
  id: string;
  name: string;
  department: string;
  hospital: string;
  rating: number;
  tier: 'Gold' | 'Silver' | 'Bronze' | 'Under Review';
  verifiedConsultations: number;
  positiveFeedback: number;
  driScore: number;
  trend: string;
  feedbackEvidence: { patient: string; comment: string; rating: number; date: string }[];
}

const DOCTORS_DATA: DoctorReport[] = [
  {
    id: 'doc-001',
    name: 'Dr. Rajesh Sharma',
    department: 'Cardiology',
    hospital: 'AIIMS New Delhi',
    rating: 4.83,
    tier: 'Gold',
    verifiedConsultations: 184,
    positiveFeedback: 92,
    driScore: 94.5,
    trend: '+4.2% this month',
    feedbackEvidence: [
      { patient: 'Suresh P.', comment: 'Extremely thorough ECG explanation and patient care.', rating: 5, date: '10:22 AM Today' },
      { patient: 'Meena K.', comment: 'Prompt consultation, very professional explanation.', rating: 5, date: 'Yesterday' }
    ]
  },
  {
    id: 'doc-002',
    name: 'Dr. Priya Patel',
    department: 'Pediatrics',
    hospital: 'Safdarjung Hospital',
    rating: 4.67,
    tier: 'Gold',
    verifiedConsultations: 162,
    positiveFeedback: 89,
    driScore: 91.2,
    trend: '+2.8% this month',
    feedbackEvidence: [
      { patient: 'Ananya D.', comment: 'Gentle with pediatric patient, clear instructions.', rating: 5, date: '09:50 AM Today' }
    ]
  },
  {
    id: 'doc-003',
    name: 'Dr. Harpreet Singh',
    department: 'General Medicine',
    hospital: 'AIIMS New Delhi',
    rating: 4.45,
    tier: 'Silver',
    verifiedConsultations: 210,
    positiveFeedback: 85,
    driScore: 86.8,
    trend: '+1.5% this month',
    feedbackEvidence: [
      { patient: 'Vikram S.', comment: 'Good OPD consultation, clear prescription.', rating: 4, date: 'Yesterday' }
    ]
  },
  {
    id: 'doc-004',
    name: 'Dr. Sneha Roy',
    department: 'Dermatology',
    hospital: 'RML Hospital',
    rating: 3.20,
    tier: 'Under Review',
    verifiedConsultations: 94,
    positiveFeedback: 58,
    driScore: 62.0,
    trend: '-5.1% this month',
    feedbackEvidence: [
      { patient: 'Rahul M.', comment: 'Delayed start of OPD room session.', rating: 2, date: '2 days ago' }
    ]
  }
];

export const DoctorPerformance: React.FC = () => {
  const { doctorId } = useParams<{ doctorId?: string }>();
  const [search, setSearch] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorReport | null>(() => {
    if (doctorId) {
      return DOCTORS_DATA.find(d => d.id === doctorId) || DOCTORS_DATA[0];
    }
    return null;
  });

  const filteredDoctors = DOCTORS_DATA.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.department.toLowerCase().includes(search.toLowerCase());
    const matchesHospital = hospitalFilter === 'All' || doc.hospital === hospitalFilter;
    return matchesSearch && matchesHospital;
  });

  return (
    <div className="p-8 bg-slate-50 text-slate-900 min-h-screen font-sans space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctor Recognition & DRI Index</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Verified patient feedback, statutory performance scores, and national recognition tiers.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search doctor or dept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3.5 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-2xl focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="All">All Hospitals</option>
            <option value="AIIMS New Delhi">AIIMS New Delhi</option>
            <option value="Safdarjung Hospital">Safdarjung Hospital</option>
            <option value="RML Hospital">RML Hospital</option>
          </select>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Doctor List */}
        <div className={selectedDoctor ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0'}>
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoctor(doc)}
              className={`p-6 rounded-3xl border transition cursor-pointer shadow-xs relative overflow-hidden ${
                selectedDoctor?.id === doc.id
                  ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/40'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{doc.name}</h3>
                  <p className="text-slate-500 text-xs font-semibold">{doc.department} • {doc.hospital}</p>
                </div>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border ${
                  doc.tier === 'Gold'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : doc.tier === 'Silver'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  🏆 {doc.tier}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs mb-4">
                <div>
                  <span className="text-slate-500 block font-medium">Rating</span>
                  <span className="text-amber-700 font-extrabold text-base flex items-center gap-1 font-mono">
                    ⭐ {doc.rating}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Consultations</span>
                  <span className="text-slate-900 font-extrabold text-base font-mono">{doc.verifiedConsultations}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Positive Feedback</span>
                  <span className="text-emerald-700 font-extrabold text-base font-mono">{doc.positiveFeedback}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-medium">Statutory DRI Score: <strong className="text-slate-900 font-mono">{doc.driScore}</strong></span>
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-xl transition text-xs border border-slate-200 flex items-center gap-1 cursor-pointer">
                  View Report <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Doctor Detailed Report Drawer */}
        {selectedDoctor && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-7 space-y-6 shadow-xl relative animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold">
                  Doctor Recognition Report
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedDoctor.name}</h2>
                <p className="text-slate-500 text-xs font-semibold">{selectedDoctor.department} • {selectedDoctor.hospital}</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-slate-500 hover:text-slate-900 font-bold text-xs bg-slate-100 px-3 py-1 rounded-xl cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Performance Metrics</h4>
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recognition Score (DRI)</span>
                  <span className="text-amber-800 font-bold font-mono">{selectedDoctor.driScore} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly DRI Trend</span>
                  <span className="text-emerald-700 font-bold font-mono">{selectedDoctor.trend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified Consultations</span>
                  <span className="text-slate-900 font-bold font-mono">{selectedDoctor.verifiedConsultations}</span>
                </div>
              </div>
            </div>

            {/* Verified Patient Feedback */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verified Patient Feedback Evidence</h4>
              <div className="space-y-2">
                {selectedDoctor.feedbackEvidence.map((fb, i) => (
                  <div key={i} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>{fb.patient}</span>
                      <span className="text-amber-700 font-mono font-bold">⭐ {fb.rating}/5</span>
                    </div>
                    <p className="text-slate-900 font-semibold">"{fb.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
