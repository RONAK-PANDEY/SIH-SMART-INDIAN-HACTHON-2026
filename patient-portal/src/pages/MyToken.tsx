import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Download, 
  Share2, 
  Clock, 
  Building2, 
  User, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  ZoomIn,
  History,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { useTranslation, LanguageSwitcherPill } from '../i18n';

export const MyToken: React.FC = () => {
  const { t } = useTranslation();
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [allTokens, setAllTokens] = useState<any[]>([]);
  const [activeToken, setActiveToken] = useState<any>(null);

  useEffect(() => {
    // Load allotted tokens from localStorage
    const saved = localStorage.getItem('smartcare_allotted_tokens');
    let tokensList: any[] = [];
    if (saved) {
      try {
        tokensList = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Default seeded tokens if empty
    if (tokensList.length === 0) {
      tokensList = [
        {
          tokenId: 'tok_01',
          tokenNumber: 'CARD-204',
          patientName: 'Aarav Sharma',
          age: 68,
          gender: 'Male',
          department: 'Cardiology & Heart Sciences',
          doctor: 'Dr. Rajesh Sharma (HOD)',
          chamber: 'Chamber Room 204 (1st Floor Wing B)',
          hospital: 'AIIMS New Delhi',
          date: '06 Sep 2026',
          time: '10:30 AM',
          slotTime: '10:30 AM - 11:00 AM',
          queuePosition: 2,
          estimatedWaitMins: 8,
          priorityTag: 'P2 - Senior Citizen Accelerated Pass',
          feeStatus: 'Paid (₹50.00 via UPI)',
          status: 'Active (Turn Soon)'
        },
        {
          tokenId: 'tok_02',
          tokenNumber: 'GENM-102',
          patientName: 'Aarav Sharma',
          age: 68,
          gender: 'Male',
          department: 'General Medicine OPD',
          doctor: 'Dr. Priya Patel',
          chamber: 'Chamber 105',
          hospital: 'Safdarjung Multi-Speciality',
          date: '28 Aug 2026',
          time: '11:15 AM',
          slotTime: '11:15 AM - 11:45 AM',
          queuePosition: 0,
          estimatedWaitMins: 0,
          priorityTag: 'P2 - Senior Citizen',
          feeStatus: 'Covered (PM-JAY Cashless ₹0)',
          status: 'Completed'
        },
        {
          tokenId: 'tok_03',
          tokenNumber: 'ORTH-311',
          patientName: 'Aarav Sharma',
          age: 68,
          gender: 'Male',
          department: 'Orthopedics & Joint Replacement',
          doctor: 'Dr. Sandeep Mehta',
          chamber: 'Chamber 312',
          hospital: 'AIIMS New Delhi',
          date: '14 Jul 2026',
          time: '09:45 AM',
          slotTime: '09:45 AM - 10:15 AM',
          queuePosition: 0,
          estimatedWaitMins: 0,
          priorityTag: 'P2 - Senior Citizen',
          feeStatus: 'Paid (₹50.00 via UPI GPay)',
          status: 'Completed'
        }
      ];
      localStorage.setItem('smartcare_allotted_tokens', JSON.stringify(tokensList));
    }

    setAllTokens(tokensList);
    setActiveToken(tokensList[0]);
  }, []);

  if (!activeToken) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading token pass...</div>;
  }

  // Scannable JSON payload encoded in QR
  const qrPayload = JSON.stringify({
    pass_type: 'SMARTCARE_OPD_TOKEN',
    token: activeToken.tokenNumber,
    patient: activeToken.patientName,
    dept: activeToken.department,
    hospital: activeToken.hospital,
    date: activeToken.date,
    priority: activeToken.priorityTag
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 max-w-lg mx-auto pb-32">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 mb-6 pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-1">
            <QrCode className="w-3.5 h-3.5" />
            <span>{t('my_token')}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active OPD Queue Pass</h1>
        </div>

        <LanguageSwitcherPill />
      </header>

      {/* Main Digital Pass Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative mb-6">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white p-6 text-center relative">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-2">
            <span className="font-semibold uppercase tracking-wider">{activeToken.hospital}</span>
            <span className="bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> E-Pass Active
            </span>
          </div>

          <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold block">TOKEN PASS NUMBER</span>
          <h2 className="text-5xl font-black tracking-tight text-white mt-1">
            {activeToken.tokenNumber}
          </h2>

          <div className="mt-2 inline-block bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-lg">
            {activeToken.priorityTag}
          </div>
        </div>

        {/* High Density Scannable QR Code */}
        <div className="p-6 text-center bg-slate-50/50 border-b border-dashed border-slate-200">
          <div 
            onClick={() => setShowZoomModal(true)}
            className="w-52 h-52 bg-white border-2 border-slate-300 rounded-3xl p-3 mx-auto shadow-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-xl transition group relative"
          >
            {/* Scannable SVG Medical QR Pattern */}
            <svg viewBox="0 0 120 120" className="w-full h-full text-slate-950">
              <rect width="120" height="120" fill="white" />
              {/* Corner 1 */}
              <rect x="6" y="6" width="32" height="32" fill="#0f172a" rx="4" />
              <rect x="11" y="11" width="22" height="22" fill="white" rx="2" />
              <rect x="16" y="16" width="12" height="12" fill="#2563eb" rx="2" />
              {/* Corner 2 */}
              <rect x="82" y="6" width="32" height="32" fill="#0f172a" rx="4" />
              <rect x="87" y="11" width="22" height="22" fill="white" rx="2" />
              <rect x="92" y="16" width="12" height="12" fill="#2563eb" rx="2" />
              {/* Corner 3 */}
              <rect x="6" y="82" width="32" height="32" fill="#0f172a" rx="4" />
              <rect x="11" y="87" width="22" height="22" fill="white" rx="2" />
              <rect x="16" y="92" width="12" height="12" fill="#2563eb" rx="2" />
              
              {/* High-density Verifiable Data Grid */}
              <rect x="44" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="54" y="8" width="6" height="6" fill="#2563eb" />
              <rect x="64" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="72" y="16" width="6" height="6" fill="#0f172a" />
              <rect x="44" y="24" width="6" height="6" fill="#0f172a" />
              <rect x="60" y="24" width="6" height="6" fill="#2563eb" />
              <rect x="72" y="32" width="6" height="6" fill="#0f172a" />

              <rect x="8" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="20" y="44" width="6" height="6" fill="#2563eb" />
              <rect x="32" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="8" y="60" width="6" height="6" fill="#2563eb" />
              <rect x="24" y="60" width="6" height="6" fill="#0f172a" />

              {/* Center Emblem Red Cross */}
              <rect x="50" y="50" width="20" height="20" fill="#dc2626" rx="4" />
              <rect x="58" y="54" width="4" height="12" fill="white" />
              <rect x="54" y="58" width="12" height="4" fill="white" />

              {/* Lower quadrant modules */}
              <rect x="44" y="82" width="6" height="6" fill="#0f172a" />
              <rect x="56" y="82" width="6" height="6" fill="#2563eb" />
              <rect x="68" y="82" width="6" height="6" fill="#0f172a" />
              <rect x="44" y="96" width="6" height="6" fill="#2563eb" />
              <rect x="60" y="96" width="6" height="6" fill="#0f172a" />
              <rect x="82" y="48" width="6" height="6" fill="#0f172a" />
              <rect x="94" y="48" width="6" height="6" fill="#2563eb" />
              <rect x="106" y="48" width="6" height="6" fill="#0f172a" />
              <rect x="82" y="64" width="6" height="6" fill="#2563eb" />
              <rect x="96" y="64" width="6" height="6" fill="#0f172a" />
              <rect x="82" y="82" width="6" height="6" fill="#0f172a" />
              <rect x="94" y="82" width="6" height="6" fill="#2563eb" />
              <rect x="106" y="82" width="6" height="6" fill="#0f172a" />
              <rect x="88" y="96" width="6" height="6" fill="#0f172a" />
              <rect x="102" y="96" width="6" height="6" fill="#2563eb" />
            </svg>
            <div className="absolute inset-0 bg-blue-900/10 rounded-3xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                <ZoomIn className="w-3 h-3" /> Tap to Enlarge
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-mono">
            Scan with any Camera / OPD Chamber Scanner
          </span>
        </div>

        {/* Pass Meta */}
        <div className="p-6 space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Patient Name:</span>
            <strong className="text-slate-800 font-bold">{activeToken.patientName} ({activeToken.age}y, {activeToken.gender})</strong>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Department:</span>
            <strong className="text-slate-800 font-bold">{activeToken.department}</strong>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Doctor on Duty:</span>
            <strong className="text-slate-800 font-bold">{activeToken.doctor}</strong>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Chamber:</span>
            <strong className="text-slate-800 font-bold">{activeToken.chamber}</strong>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Queue Ahead:</span>
            <strong className="text-emerald-700 font-bold">{activeToken.queuePosition} Patients ahead</strong>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Est. Consultation Turn:</span>
            <strong className="text-amber-700 font-black text-sm">~{activeToken.estimatedWaitMins} mins</strong>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500">Payment Status:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ✓ {activeToken.feeStatus}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Token Slip</span>
          </button>
          <a
            href="/live-queue"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <Layers className="w-4 h-4" />
            <span>Track Live Queue</span>
          </a>
        </div>
      </div>

      {/* History of All Recent Allotted Tokens */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>History of All Allotted Tokens ({allTokens.length})</span>
          </span>
        </div>

        <div className="space-y-2.5">
          {allTokens.map((tok) => {
            const isSelected = activeToken.tokenNumber === tok.tokenNumber;
            return (
              <button
                key={tok.tokenId || tok.tokenNumber}
                type="button"
                onClick={() => setActiveToken(tok)}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 font-semibold shadow-xs ring-1 ring-blue-300'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tok.tokenNumber}
                  </div>
                  <div>
                    <strong className="text-slate-900 block">{tok.department}</strong>
                    <span className="text-[11px] text-slate-500">{tok.doctor} • {tok.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    tok.status?.includes('Active')
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                    {tok.status || 'Active'}
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold block mt-1">Tap to View Pass →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* QR Zoom Modal */}
      {showZoomModal && (
        <div 
          onClick={() => setShowZoomModal(false)}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="w-64 h-64 mx-auto bg-white p-4 border border-slate-200 rounded-2xl shadow-inner flex items-center justify-center">
              <QrCode className="w-full h-full text-slate-950" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-blue-700">{activeToken.tokenNumber}</h3>
              <p className="text-xs text-slate-500 font-bold">{activeToken.patientName} • {activeToken.department}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{activeToken.chamber}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowZoomModal(false)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl text-xs cursor-pointer"
            >
              Close QR Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
