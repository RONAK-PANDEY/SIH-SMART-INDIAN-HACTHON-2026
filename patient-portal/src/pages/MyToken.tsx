import React, { useState, useEffect, useRef } from 'react';
import { API_V1_URL, websocketUrl } from '../lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Building2, 
  Stethoscope, 
  User,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../i18n';

export const MyToken: React.FC = () => {
  const { t } = useTranslation();
  const [allTokens, setAllTokens] = useState<any[]>([]);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [liveStatus, setLiveStatus] = useState<string>('waiting');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
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
          department: 'Cardiology',
          deptId: 'dept-cardio',
          department_id: 'dept-cardio',
          doctor: 'Dr. Rajesh Sharma',
          chamber: 'Chamber 204, Gate B',
          hospital: 'AIIMS New Delhi',
          hospitalId: 'hosp-001',
          hospital_id: 'hosp-001',
          date: new Date().toISOString().split('T')[0],
          time: '10:30 AM',
          queuePosition: 1,
          estimatedWaitMins: 7,
          priorityTag: 'Priority 2 • Senior Citizen',
          fee: 'Free (PM-JAY Cashless)'
        }
      ];
      localStorage.setItem('smartcare_allotted_tokens', JSON.stringify(tokensList));
    }

    setAllTokens(tokensList);
    setActiveToken(tokensList[0]);
  }, []);

  // WebSocket live sync
  useEffect(() => {
    if (!activeToken) return;

    const tokenNum = activeToken.tokenNumber || activeToken.token_number;
    const wsUrl = websocketUrl(`/api/v1/ws/queue/${activeToken.hospitalId || 'hosp-001'}/${activeToken.deptId || 'dept-cardio'}`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.token === tokenNum || data.token_id === tokenNum) {
            if (data.status === 'at_door' || data.event === 'scanned_turnstile') {
              setLiveStatus('scanned_by_staff');
              setScanMessage('Turnstile Gate B Verified: Walk inside to Chamber 204!');
            } else if (data.status === 'in_consultation') {
              setLiveStatus('in_consultation');
              setScanMessage('Consultation with doctor in progress.');
            } else if (data.status === 'completed') {
              setLiveStatus('completed');
              setScanMessage('Consultation finished. Medicine pass saved.');
            }
          }
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };
    } catch (e) {
      console.warn('WS offline fallback');
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [activeToken]);

  // Simulate scanning QR at Turnstile Gate B
  const handleSimulateScan = async () => {
    if (!activeToken) return;
    const tokenNum = activeToken.tokenNumber || activeToken.token_number || 'CARD-204';
    
    try {
      const response = await fetch(`${API_V1_URL}/tokens/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: activeToken.tokenId || activeToken.token_id,
          token_number: tokenNum,
          qr_hash: activeToken.qr_hash || activeToken.hash,
          scanner_id: 'patient-demo-gate-b',
          scanned_by: 'patient-demo-gate-b',
          hospital_id: activeToken.hospitalId || 'hosp-001',
          department_id: activeToken.deptId || activeToken.department_id
        })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'The gate could not verify this pass.');
      }
    } catch (err) {
      setScanMessage(err instanceof Error ? err.message : 'The gate could not verify this pass.');
      return;
    }
    setLiveStatus('scanned_by_staff');
    setScanMessage('Turnstile Gate B Unlocked: Walk to Chamber 204!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 pb-28 font-sans max-w-2xl mx-auto flex flex-col justify-center">
      
      {/* 1. Header with Hospital Identity & Print Button */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold border-2 border-blue-300">
            🏥
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {activeToken?.hospital || 'AIIMS New Delhi'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Cardiology Outpatient Clinic
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="btn-tactile-slate px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 min-h-[44px]"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print</span>
        </button>
      </div>

      {/* 2. Flat, Single-Screen Giant Boarding Pass */}
      {activeToken && (
        <div className="bg-white rounded-3xl border-3 border-slate-300 shadow-sm p-6 sm:p-8 space-y-6 text-center">
          
          {/* Gigantic Token Badge */}
          <div className="inline-block bg-blue-50 border-2 border-blue-600 px-6 py-2 rounded-2xl">
            <span className="text-xs text-blue-700 uppercase font-semibold block tracking-wider">Your Token Number</span>
            <span className="text-4xl sm:text-5xl font-semibold font-mono tracking-wider text-blue-700 block mt-0.5">
              {activeToken.tokenNumber || 'CARD-204'}
            </span>
          </div>

          {/* Gigantic Unmissable High-Contrast QR Code */}
          <div className="flex justify-center my-2">
            <div className="p-5 bg-white border-4 border-slate-900 rounded-3xl shadow-sm inline-block">
              <QRCodeSVG
                value={activeToken.qr_hash || activeToken.hash || activeToken.tokenNumber || 'CARD-204'}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Simple Visual 3-Stage Progress Lights (Universal Accessibility) */}
          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3 space-y-1">
              <span className="text-xl block">🎫</span>
              <span className="text-xs font-semibold text-emerald-800 block">Pass Ready</span>
            </div>

            <div className={`rounded-2xl p-3 border-2 space-y-1 ${
              liveStatus !== 'waiting'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-blue-50 border-blue-500 text-blue-800'
            }`}>
              <span className="text-xl block">🚪</span>
              <span className="text-xs font-semibold block">Gate B Turnstile</span>
            </div>

            <div className={`rounded-2xl p-3 border-2 space-y-1 ${
              liveStatus === 'completed'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <span className="text-xl block">🩺</span>
              <span className="text-xs font-semibold block">Doctor Room</span>
            </div>
          </div>

          {/* Scan Notification Message */}
          {scanMessage && (
            <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-900 font-semibold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{scanMessage}</span>
            </div>
          )}

          {/* Doctor & Room Information */}
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-between text-left text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block font-medium">Assigned Specialist</span>
              <span className="font-semibold text-slate-900 text-sm sm:text-base">{activeToken.doctor || 'Dr. Rajesh Sharma'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block font-medium">Location</span>
              <span className="font-semibold text-blue-700 text-sm sm:text-base">{activeToken.chamber || 'Chamber 204'}</span>
            </div>
          </div>

          {/* Gigantic 64px Tactile 2.5D Action Button: Simulate Gate Scan */}
          <div>
            <button
              type="button"
              onClick={handleSimulateScan}
              className="w-full btn-tactile-green font-semibold text-base py-4 px-6 rounded-2xl flex items-center justify-center gap-3 min-h-[64px] cursor-pointer shadow-sm"
            >
              <QrCode className="w-6 h-6" />
              <span>Tap Here To Scan Turnstile Gate B</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
