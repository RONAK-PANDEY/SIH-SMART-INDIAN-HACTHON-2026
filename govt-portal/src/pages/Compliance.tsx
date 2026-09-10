import React from 'react';
import { 
  Building2, 
  Award, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  Flame
} from 'lucide-react';

export const Compliance: React.FC = () => {
  const hospitalRankings = [
    {
      id: 'hosp-1',
      name: 'AIIMS New Delhi - Main Campus',
      category: 'Apex National Institute',
      location: 'Ansari Nagar, New Delhi',
      complianceScore: '98.4%',
      avgWaitTime: '24 mins',
      citizenRating: '4.85 ★',
      activeDoctors: 42,
      bonusPoolEligible: '92.8%',
      grade: 'Grade A+ (Distinguished)',
      bedUtilization: '88%'
    },
    {
      id: 'hosp-2',
      name: 'Safdarjung Hospital',
      category: 'Central Government Hospital',
      location: 'Ring Road, New Delhi',
      complianceScore: '95.2%',
      avgWaitTime: '32 mins',
      citizenRating: '4.60 ★',
      activeDoctors: 36,
      bonusPoolEligible: '86.1%',
      grade: 'Grade A (Exemplary)',
      bedUtilization: '94%'
    },
    {
      id: 'hosp-3',
      name: 'Dr. Ram Manohar Lohia (RML) Hospital',
      category: 'Central Government Hospital',
      location: 'Baba Kharak Singh Marg, New Delhi',
      complianceScore: '92.7%',
      avgWaitTime: '38 mins',
      citizenRating: '4.35 ★',
      activeDoctors: 28,
      bonusPoolEligible: '78.5%',
      grade: 'Grade A- (Compliant)',
      bedUtilization: '89%'
    }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>National Health Authority • Quality Accreditation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Apex Hospital Quality & Queue Compliance Leaderboard
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Compare hospital wait times, emergency response, patient feedback, and staff performance.
          </p>
        </div>

        <span className="text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full font-bold">
          2026 CENTRAL AUDIT BENCHMARK
        </span>
      </div>

      {/* Hospital Ranking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hospitalRankings.map((hosp, idx) => (
          <div
            key={hosp.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                #{idx + 1}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                {hosp.complianceScore} Score
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">{hosp.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{hosp.category}</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                {hosp.location}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Avg OPD Wait:</span>
                <strong className="text-emerald-400 font-bold">{hosp.avgWaitTime}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Citizen Satisfaction:</span>
                <strong className="text-amber-400 font-bold">{hosp.citizenRating}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bonus Pool Qualification:</span>
                <strong className="text-blue-400 font-bold">{hosp.bonusPoolEligible}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bed Occupancy:</span>
                <strong className="text-slate-200 font-bold">{hosp.bedUtilization}</strong>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-amber-400 block bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                {hosp.grade}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
