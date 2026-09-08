import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  ShieldCheck, 
  ZoomIn, 
  History, 
  Activity,
  AlertCircle,
  Stethoscope,
  PartyPopper,
  Radio,
  DoorOpen,
  UserCheck
} from 'lucide-react';
import { useTranslation, LanguageSwitcherPill } from '../i18n';
import { FeedbackModal } from '../components/FeedbackModal';

export const MyToken: React.FC = () => {
  const { t } = useTranslation();
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [allTokens, setAllTokens] = useState<any[]>([]);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [liveStatus, setLiveStatus] = useState<string>('waiting'); // waiting, scanned_by_staff, in_consultation, completed
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

    if (tokensList.length === 0) {
      tokensList = [
        {
          tokenId: 'tok_01',
          token_id: 'tok_01',
          tokenNumber: 'CARD-204',
          token_number: 'CARD-204',
          qr_hash: '76f121bf67b798594852fb6d05dd6619367d40c8e580a5f4675bf74bb5b654fd',
          hash: '76f121bf67b798594852fb6d05dd6619367d40c8e580a5f4675bf74bb5b654fd',
          patientId: 'usr-pat-001',
          patient_id: 'usr-pat-001',
          patientName: 'Aarav Sharma',
          age: 68,
          gender: 'Male',
          department: 'Cardiology & Heart Care',
          deptId: 'dept-cardio',
          department_id: 'dept-cardio',
          doctor: 'Dr. Rajesh Sharma (Senior Cardiologist)',
          chamber: 'Room 204, Block B',
          hospital: 'AIIMS New Delhi',
          hospitalId: 'hosp-001',
          hospital_id: 'hosp-001',
          date: new Date().toISOString().split('T')[0],
          time: '10:30 AM',
          queuePosition: 1,
          estimatedWaitMins: 7,
          priorityTag: 'P2 - Senior Citizen Accelerated Pass',
          feeStatus: 'Paid (₹50.00 via UPI)',
          status: 'waiting'
        }
      ];
      localStorage.setItem('smartcare_allotted_tokens', JSON.stringify(tokensList));
    }

    setAllTokens(tokensList);
    const initialToken = tokensList[0];
    setActiveToken(initialToken);
    setLiveStatus(initialToken.status || 'waiting');
  }, []);

  // Real WebSocket connection to live backend token channel
  useEffect(() => {
    if (!activeToken) return;

    const tokenId = activeToken.tokenId || activeToken.token_id || activeToken.id;
    const patientId = activeToken.patientId || activeToken.patient_id || 'usr-pat-001';
    const apiHost = window.location.hostname || 'localhost';
    const wsUrl = `ws://${apiHost}:8000/api/v1/ws/connect/token:${tokenId}`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
        // Also subscribe to patient channel
        socket.send(JSON.stringify({
          action: 'subscribe',
          channel: `patient:${patientId}`
        }));
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const eventType = payload.event || payload.type;

          if (eventType === 'token_scanned' || payload.status === 'scanned_by_staff') {
            setLiveStatus('scanned_by_staff');
            setLiveNotification(`✅ Turnstile Scanned: Verified by ${payload.scanned_by || 'Gate Scanner'}. Please wait near chamber.`);
            updateLocalTokenStatus(tokenId, 'scanned_by_staff');
          } else if (eventType === 'token_called' || eventType === 'PATIENT_CALLED' || payload.status === 'in_consultation') {
            setLiveStatus('in_consultation');
            setLiveNotification(`🔔 Doctor Calling: Please enter ${payload.room || activeToken.chamber}!`);
            updateLocalTokenStatus(tokenId, 'in_consultation');
          } else if (eventType === 'token_completed' || payload.status === 'completed') {
            setLiveStatus('completed');
            setLiveNotification('🎉 Consultation Completed! Doctor notes submitted.');
            updateLocalTokenStatus(tokenId, 'completed');
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
      };

      socket.onerror = () => {
        setWsConnected(false);
      };

      return () => {
        socket.close();
      };
    } catch (e) {
      console.warn('WebSocket connection error:', e);
    }
  }, [activeToken]);

  const updateLocalTokenStatus = (tokenId: string, newStatus: string) => {
    setActiveToken((prev: any) => prev ? { ...prev, status: newStatus } : prev);
    setAllTokens((prev) => {
      const updated = prev.map((t) => (t.tokenId === tokenId || t.token_id === tokenId) ? { ...t, status: newStatus } : t);
      localStorage.setItem('smartcare_allotted_tokens', JSON.stringify(updated));
      return updated;
    });
  };

  if (!activeToken) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading token pass...</div>;
  }

  // Cryptographically encoded QR payload
  const qrPayload = JSON.stringify({
    token_id: activeToken.tokenId || activeToken.token_id || activeToken.id,
    token_number: activeToken.tokenNumber || activeToken.token_number,
    hash: activeToken.qr_hash || activeToken.hash || 'hash_secret',
    dept: activeToken.deptId || activeToken.department_id || activeToken.dept || 'dept-cardio',
    patient_id: activeToken.patientId || activeToken.patient_id || 'usr-pat-001',
    hospital_id: activeToken.hospitalId || activeToken.hospital_id || 'hosp-001'
  });

  const getStepActive = (stepName: string) => {
    const states = ['waiting', 'scanned_by_staff', 'in_consultation', 'completed'];
    const currentIdx = states.indexOf(liveStatus);
    const stepIdx = states.indexOf(stepName);
    return stepIdx <= currentIdx;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 max-w-lg mx-auto pb-32">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 mb-4 pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-1">
            <QrCode className="w-3.5 h-3.5" />
            <span>Real-Time Scannable Pass</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active OPD Pass</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            wsConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
          }`}>
            <Radio className={`w-3 h-3 ${wsConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
            <span>{wsConnected ? 'Live Sync' : 'Reconnecting'}</span>
          </span>
          <LanguageSwitcherPill />
        </div>
      </header>

      {/* Live Toast Banner */}
      {liveNotification && (
        <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{liveNotification}</span>
          </div>
          <button onClick={() => setLiveNotification(null)} className="text-white/80 hover:text-white text-sm font-bold">×</button>
        </div>
      )}

      {/* Real-time Consultation Completed Celebration Banner */}
      {liveStatus === 'completed' && (
        <div className="mb-5 p-5 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white rounded-3xl shadow-xl text-center space-y-3 animate-in zoom-in-95">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <PartyPopper className="w-6 h-6 text-yellow-300 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl font-black">✅ Consultation Completed</h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Doctor has finalized your checkup. Your digital prescription is saved to records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-black py-2.5 rounded-2xl text-xs transition shadow-md cursor-pointer"
          >
            ⭐ Submit Doctor Rating (Govt Vigilance Survey)
          </button>
        </div>
      )}

      {/* Main Digital Pass Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative mb-6">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white p-6 text-center relative">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-2">
            <span className="font-semibold uppercase tracking-wider">{activeToken.hospital || 'AIIMS New Delhi'}</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${
              liveStatus === 'completed' ? 'bg-emerald-500 text-white' :
              liveStatus === 'scanned_by_staff' ? 'bg-indigo-500 text-white' :
              liveStatus === 'in_consultation' ? 'bg-purple-500 text-white' :
              'bg-blue-500 text-white'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              {liveStatus === 'completed' ? 'Completed' :
               liveStatus === 'scanned_by_staff' ? 'At Door (Scanned)' :
               liveStatus === 'in_consultation' ? 'In Consultation' :
               'Waiting in Queue'}
            </span>
          </div>

          <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold block">TOKEN PASS NUMBER</span>
          <h2 className="text-5xl font-black tracking-tight text-white mt-1">
            {activeToken.tokenNumber || activeToken.token_number}
          </h2>

          <div className="mt-2 inline-block bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-lg">
            {activeToken.priorityTag || 'Priority OPD Pass'}
          </div>
        </div>

        {/* Live Stepper: waiting -> scanned_by_staff -> in_consultation -> completed */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
            Live Queue Lifecycle (Auto WebSocket Sync)
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className={`p-2 rounded-xl border text-[10px] font-bold ${
              getStepActive('waiting') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'
            }`}>
              <span>1. Waiting</span>
            </div>
            <div className={`p-2 rounded-xl border text-[10px] font-bold ${
              getStepActive('scanned_by_staff') ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'
            }`}>
              <span>2. Scanned</span>
            </div>
            <div className={`p-2 rounded-xl border text-[10px] font-bold ${
              getStepActive('in_consultation') ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-400 border-slate-200'
            }`}>
              <span>3. In Room</span>
            </div>
            <div className={`p-2 rounded-xl border text-[10px] font-bold ${
              getStepActive('completed') ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'
            }`}>
              <span>4. Done</span>
            </div>
          </div>
        </div>

        {/* Real Scannable QR Code */}
        <div className="p-6 text-center bg-white border-b border-dashed border-slate-200">
          <div 
            onClick={() => setShowZoomModal(true)}
            className="w-56 h-56 bg-white border-2 border-slate-300 rounded-3xl p-3 mx-auto shadow-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-xl transition group relative"
          >
            <QRCodeSVG 
              value={qrPayload} 
              size={200}
              level="H"
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-blue-900/10 rounded-3xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                <ZoomIn className="w-3 h-3" /> Enlarge
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-mono">
            Scan using SmartCare Android App / Turnstile Guard Camera
          </span>
        </div>

        {/* WHY THIS MATTERS: ANTI-GHOST TOKEN TURNSTILE VALIDATION */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl mx-6 mt-4 mb-1 flex items-center gap-2.5 text-xs text-blue-950">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Why this matters:</strong> Anti-Ghost Token Turnstile Verification prevents queue-jumping and proxy token hoarding. The doctor's queue will only summon your ticket once you physically pass the entrance turnstile.
          </span>
        </div>

        {/* Pass Details */}
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
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500">Token Status:</span>
            <span className={`font-bold px-2 py-0.5 rounded-md border text-[11px] ${
              liveStatus === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              liveStatus === 'scanned_by_staff' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
              'bg-blue-100 text-blue-800 border-blue-300'
            }`}>
              {liveStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>
            <a
              href="/book-appointment"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <QrCode className="w-4 h-4" />
              <span>Get Another Token</span>
            </a>
          </div>
        </div>
      </div>

      {/* History of All Recent Allotted Tokens */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>History of Allotted Tokens ({allTokens.length})</span>
          </span>
        </div>

        <div className="space-y-2.5">
          {allTokens.map((tok) => {
            const tokNum = tok.tokenNumber || tok.token_number;
            const isSelected = (activeToken.tokenNumber || activeToken.token_number) === tokNum;
            return (
              <button
                key={tok.tokenId || tok.token_id || tokNum}
                type="button"
                onClick={() => {
                  setActiveToken(tok);
                  setLiveStatus(tok.status || 'waiting');
                }}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 font-semibold shadow-xs ring-1 ring-blue-300'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tokNum}
                  </div>
                  <div>
                    <strong className="text-slate-900 block">{tok.department}</strong>
                    <span className="text-[11px] text-slate-500">{tok.doctor} • {tok.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    tok.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {tok.status || 'waiting'}
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
              <QRCodeSVG 
                value={qrPayload} 
                size={220}
                level="H"
                className="w-full h-full"
              />
            </div>
            <div>
              <h3 className="text-3xl font-black text-blue-700">{activeToken.tokenNumber || activeToken.token_number}</h3>
              <p className="text-xs text-slate-500 font-bold">{activeToken.patientName} • {activeToken.department}</p>
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

      {/* Citizen Feedback Rating Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        doctorId={activeToken?.doctorId || 'doc-001'}
        doctorName={activeToken?.doctor || 'Dr. Rajesh Sharma'}
        department={activeToken?.department || 'Cardiology'}
        hospitalName={activeToken?.hospital || 'AIIMS New Delhi - Main Campus'}
        tokenNumber={activeToken?.tokenNumber || activeToken?.token_number || 'CARD-204'}
        patientName={activeToken?.patientName || 'Citizen Patient'}
      />
    </div>
  );
};
