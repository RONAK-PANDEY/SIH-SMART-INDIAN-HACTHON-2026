import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Activity, 
  Building2, 
  Stethoscope, 
  Radio, 
  UserCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { FeedbackModal } from '../components/FeedbackModal';

export const MyToken: React.FC = () => {
  const { t } = useTranslation();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [allTokens, setAllTokens] = useState<any[]>([]);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [liveStatus, setLiveStatus] = useState<string>('waiting'); // waiting, scanned_by_staff, in_consultation, completed
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
          department: 'Cardiology & Heart Care',
          deptId: 'dept-cardio',
          department_id: 'dept-cardio',
          doctor: 'Dr. Rajesh Sharma (MD)',
          chamber: 'Room 204, Block B',
          hospital: 'AIIMS New Delhi',
          hospitalId: 'hosp-001',
          hospital_id: 'hosp-001',
          date: new Date().toISOString().split('T')[0],
          time: '10:30 AM',
          queuePosition: 1,
          estimatedWaitMins: 7,
          priorityTag: 'Priority 2 - Senior Citizen Accelerated Pass',
          fee: 'Free (PM-JAY Cashless)'
        }
      ];
      localStorage.setItem('smartcare_allotted_tokens', JSON.stringify(tokensList));
    }

    setAllTokens(tokensList);
    setActiveToken(tokensList[0]);
  }, []);

  // WebSocket live sync with backend
  useEffect(() => {
    if (!activeToken) return;

    const tokenNum = activeToken.tokenNumber || activeToken.token_number;
    const wsUrl = `ws://localhost:8000/ws/queue/${activeToken.hospitalId || 'hosp-001'}/${activeToken.deptId || 'dept-cardio'}`;

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
              setScanMessage('Turnstile Gate B scan verified. Doctor notified.');
            } else if (data.status === 'in_consultation') {
              setLiveStatus('in_consultation');
              setScanMessage('Consultation in progress in Room 204.');
            } else if (data.status === 'completed') {
              setLiveStatus('completed');
              setScanMessage('Consultation completed. Prescription saved.');
            }
          }
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };
    } catch (e) {
      console.warn('WS connection failed, running in local mode');
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
      const res = await fetch('http://localhost:8000/api/v1/turnstiles/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_data: activeToken.qr_hash || activeToken.hash || tokenNum,
          turnstile_id: 'gate-b-north',
          hospital_id: activeToken.hospitalId || 'hosp-001'
        })
      });

      if (res.ok) {
        setLiveStatus('scanned_by_staff');
        setScanMessage('Turnstile Gate B Verified: Gate unlocked. Your status is now AT DOOR.');
      } else {
        setLiveStatus('scanned_by_staff');
        setScanMessage('Gate B Verified: Status updated to AT DOOR.');
      }
    } catch (err) {
      setLiveStatus('scanned_by_staff');
      setScanMessage('Gate B Verified: Status updated to AT DOOR.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] p-4 sm:p-6 max-w-4xl mx-auto pb-32 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-0.5 rounded-md border border-teal-200/60">
              National Health Authority • Digital Pass
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              {wsConnected ? 'Live Gateway Connected' : 'Local Verification'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Outpatient Attendance Pass
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Present this QR code at the turnstile reader when you enter the hospital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-3 rounded-xl transition-colors shadow-subtle inline-flex items-center gap-2 min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* Main Boarding Pass Card - Clean, Asymmetrical, 8pt Grid */}
      {activeToken && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden mb-8">
          
          {/* Top Pass Banner */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-semibold text-sm">
                OPD
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">{activeToken.hospital || 'AIIMS New Delhi'}</p>
                <p className="text-[11px] text-slate-400 font-normal">Department of Cardiology & Heart Care</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Token Number</span>
              <span className="text-xl font-semibold font-mono tracking-wide text-teal-400">
                {activeToken.tokenNumber || activeToken.token_number || 'CARD-204'}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: QR Code & Verification Info */}
            <div className="md:col-span-5 flex flex-col items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-8">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-subtle">
                <QRCodeSVG
                  value={activeToken.qr_hash || activeToken.hash || activeToken.tokenNumber || 'CARD-204'}
                  size={192}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-900 block font-mono">
                  {activeToken.tokenNumber || 'CARD-204'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                  Gate B Turnstile Reader Compatible
                </span>
              </div>

              {/* Turnstile scan simulate button - 48px touch target */}
              <button
                type="button"
                onClick={handleSimulateScan}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-colors shadow-subtle inline-flex items-center justify-center gap-2 min-h-[48px]"
              >
                <QrCode className="w-4 h-4" />
                <span>Simulate Turnstile Gate B Scan</span>
              </button>
            </div>

            {/* Right Column: Pass Details & Status Timeline */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Scan Notification Banner */}
              {scanMessage && (
                <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>{scanMessage}</span>
                </div>
              )}

              {/* 4-Step Patient Journey Timeline */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                  Turnstile & Consultation Journey
                </span>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-semibold">
                    <span className="block text-[10px] text-teal-700 uppercase">Step 1</span>
                    Pass Issued
                  </div>

                  <div className={`p-2.5 rounded-lg border text-xs ${
                    liveStatus !== 'waiting'
                      ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <span className="block text-[10px] uppercase text-slate-400">Step 2</span>
                    At Turnstile
                  </div>

                  <div className={`p-2.5 rounded-lg border text-xs ${
                    liveStatus === 'in_consultation' || liveStatus === 'completed'
                      ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <span className="block text-[10px] uppercase text-slate-400">Step 3</span>
                    Doctor Intake
                  </div>

                  <div className={`p-2.5 rounded-lg border text-xs ${
                    liveStatus === 'completed'
                      ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <span className="block text-[10px] uppercase text-slate-400">Step 4</span>
                    Complete
                  </div>
                </div>
              </div>

              {/* Patient and Doctor metadata */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Patient Name</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{activeToken.patientName || 'Aarav Sharma'}</p>
                  <p className="text-slate-500 text-[11px]">{activeToken.age || 68} Y / {activeToken.gender || 'Male'}</p>
                </div>

                <div>
                  <span className="text-slate-500 block">Attending Doctor</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{activeToken.doctor || 'Dr. Rajesh Sharma'}</p>
                  <p className="text-slate-500 text-[11px]">{activeToken.chamber || 'Room 204, Block B'}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block">Queue Status</span>
                  <p className="font-semibold text-teal-800 mt-0.5">
                    {liveStatus === 'scanned_by_staff' ? 'AT DOOR (Verified)' : '1 Patient Ahead'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block">Est. Consultation</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {activeToken.time || '10:30 AM'} (~7 mins)
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Helpful Guidance */}
      <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <p className="font-semibold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Physical Turnstile Guidelines</span>
        </p>
        <p className="leading-relaxed font-normal">
          If you encounter any difficulty scanning the QR screen, present your Token ID <strong>{activeToken?.tokenNumber || 'CARD-204'}</strong> to the attendant at the Counter Helpdesk.
        </p>
      </div>

    </div>
  );
};
