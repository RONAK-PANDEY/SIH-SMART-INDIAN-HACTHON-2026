import React, { useEffect, useState } from 'react';
import { Bell, CalendarDays, ChevronRight, Clock3, FileText, HeartPulse, Home, Hospital, MapPin, Pill, QrCode, Stethoscope, TriangleAlert, UserRound, Users, Sun, Moon, X, CheckCircle2, Download, Maximize2, Globe, ExternalLink, ArrowLeft, ArrowRight, PhoneCall } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation, LanguageSwitcherPill } from '../i18n';
import { HospitalContactsModal } from '../components/HospitalContactsModal';

type Patient = { full_name?: string; name?: string };

const actionCards = [
  { title: 'Book OPD', subtitle: 'Find a hospital', icon: CalendarDays, tone: 'blue', to: '/book-appointment' },
  { title: 'AI Triage', subtitle: 'Check symptoms', icon: Stethoscope, tone: 'teal', to: '/triage' },
  { title: 'Records', subtitle: 'Your health files', icon: FileText, tone: 'violet', to: '/health-records' },
  { title: 'Prescriptions', subtitle: 'View medicines', icon: Pill, tone: 'amber', to: '/health-records' },
];

const demoHospitals = [
  {
    name: 'AIIMS Delhi (Apex Center)',
    area: 'Ansari Nagar, New Delhi',
    phone: '011-26588500',
    altPhone: '+91 98110 44321',
    badge: '24x7 Trauma & OPD'
  },
  {
    name: 'Safdarjung Hospital',
    area: 'Ring Road, New Delhi',
    phone: '011-26707444',
    altPhone: '1800-11-3000',
    badge: 'General & Emergency'
  },
  {
    name: 'Dr. RML Hospital',
    area: 'Baba Kharak Singh Marg, Connaught Place',
    phone: '011-23365555',
    altPhone: '011-23404000',
    badge: 'Central OPD & Emergency'
  },
  {
    name: 'Apollo / Fortis Emergency Desk',
    area: 'NCR Network',
    phone: '1066',
    altPhone: '+91 99100 12345',
    badge: 'Super Speciality Helpline'
  }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [user, setUser] = useState<Patient>({ full_name: 'Alok' });
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [tokenList, setTokenList] = useState<any[]>([
    { token_id: 'tok_01', department: 'General Medicine', token_number: 'A-024', doctor_name: 'Dr. Vikas Gupta (18 Yrs Exp)', estimated_wait: '28 min', ahead_of_you: 6, hospital_name: 'AIIMS Delhi (Apex Center)', hash: '7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e' },
    { token_id: 'tok_02', department: 'Cardiology', token_number: 'C-108', doctor_name: 'Dr. Rajesh Sharma (24 Yrs Exp)', estimated_wait: '14 min', ahead_of_you: 2, hospital_name: 'AIIMS Delhi (Apex Center)', hash: '8e1b2f38c494d05f9816e98319185c5c5920377295620076495777g8e0fg903f' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHospitalContacts, setShowHospitalContacts] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isCancelled, setIsCancelled] = useState(() => localStorage.getItem('smartcare_cancelled') === 'true');

  const notifications = [
    { id: 1, title: 'Queue Update', message: 'Turnstile scan verified at Gate #02. You are 6th in line.', time: '2 mins ago', unread: true },
    { id: 2, title: 'Appointment Confirmed', message: 'Token registered for General Medicine at AIIMS New Delhi.', time: '1 hour ago', unread: false },
  ];

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('smartcare_user');
      const savedAll = localStorage.getItem('smartcare_all_tokens');
      const savedActive = localStorage.getItem('smartcare_active_token');
      
      if (savedUser) setUser(JSON.parse(savedUser));
      
      let list: any[] = [];
      if (savedAll) {
        list = JSON.parse(savedAll);
      } else if (savedActive) {
        list = [JSON.parse(savedActive)];
      }

      if (list.length > 0) {
        setTokenList(list);
      }
    } catch {}
  }, []);

  const name = user.full_name?.split(' ')[0] || user.name?.split(' ')[0] || 'Alok';
  const currentTokenObj = tokenList[activeSlotIndex] || tokenList[0] || {};
  const tokenNum = currentTokenObj.token_number || 'A-024';
  const docName = currentTokenObj.doctor_name || currentTokenObj.doctor || 'Dr. Sharma';
  const deptName = currentTokenObj.department || 'General Medicine';
  const wait = currentTokenObj.estimated_wait || (currentTokenObj.estimated_wait_minutes ? `${currentTokenObj.estimated_wait_minutes} min` : '28 min');
  const patientsAhead = currentTokenObj.ahead_of_you ?? 6;

  const qrPayload = JSON.stringify({
    token_id: currentTokenObj.token_id || 'tok_01',
    token_number: tokenNum,
    patient_id: 'P-10024',
    dept: (deptName || '').toLowerCase().includes('cardio') ? 'dept-cardio' : 'dept-genmed',
    hospital_id: 'hosp-001',
    hash: currentTokenObj.hash || '7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e',
    timestamp: new Date().toISOString()
  });

  const handleNextSlot = () => {
    setActiveSlotIndex(prev => (prev + 1) % tokenList.length);
  };

  const handlePrevSlot = () => {
    setActiveSlotIndex(prev => (prev - 1 + tokenList.length) % tokenList.length);
  };

  const handleCancelCurrentSlot = () => {
    if (tokenList.length > 1) {
      const updatedList = tokenList.filter((_, idx) => idx !== activeSlotIndex);
      setTokenList(updatedList);
      localStorage.setItem('smartcare_all_tokens', JSON.stringify(updatedList));
      localStorage.setItem('smartcare_active_token', JSON.stringify(updatedList[0]));
      setActiveSlotIndex(0);
    } else {
      localStorage.removeItem('smartcare_all_tokens');
      localStorage.removeItem('smartcare_active_token');
      localStorage.setItem('smartcare_cancelled', 'true');
      setIsCancelled(true);
    }
  };

  const handleDownloadQR = () => {
    try {
      const svgElement = (document.getElementById(`dash-qr-svg-${tokenNum}`) as unknown) as SVGElement | null;
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `SmartCare_QR_${tokenNum}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        const element = document.createElement("a");
        const file = new Blob([
          `SMARTCARE OPD TOKEN PASS\nToken: ${tokenNum}\nDoctor: ${docName}\nDepartment: ${deptName}\nWait: ${wait}\nHash: ${currentTokenObj.hash || ''}`
        ], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `SmartCare_Token_${tokenNum}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-lg bg-[#f8fafc] dark:bg-slate-900 shadow-[0_0_45px_rgba(15,23,42,.08)] border-x border-slate-200/60 dark:border-slate-800">
        
        {/* Clean Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Back & Next Navigation Arrows */}
              <div className="flex items-center gap-1 mr-1">
                <button
                  onClick={() => window.history.back()}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Go Back"
                  aria-label="Go Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => window.history.forward()}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Go Forward"
                  aria-label="Go Forward"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <Link to="/dashboard" className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-900/20">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <strong className="block text-base font-extrabold tracking-tight text-slate-900 dark:text-white">SmartCare</strong>
              </Link>
            </div>

            <div className="flex items-center gap-1.5">
              <LanguageSwitcherPill />

              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications" 
                className="relative grid h-9 w-9 place-items-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white dark:border-slate-900 bg-rose-500" />
              </button>

              <button
                onClick={toggleTheme}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
              </button>

              <button 
                onClick={() => navigate('/profile')} 
                aria-label="Open profile" 
                className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 dark:bg-blue-950 text-sm font-extrabold text-blue-700 dark:text-blue-300 ring-2 ring-white dark:ring-slate-800 shadow-sm transition hover:ring-blue-200 cursor-pointer shrink-0"
              >
                {name.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        {/* Notifications Popover Modal */}
        {showNotifications && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-start justify-center pt-16 px-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">OPD Notifications</h3>
                </div>
                <button onClick={() => setShowNotifications(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 dark:text-white font-bold">{n.title}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <main className="px-5 pb-5 pt-7">
          <section className="mb-7">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Hello, {name} <span aria-hidden="true">👋</span></p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{t('opd_status')}</h1>
          </section>

          {/* Active OPD Pass Card with Real QR */}
          {!isCancelled && (
            <section className="relative overflow-hidden rounded-[1.65rem] bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-800 p-5 text-white shadow-xl shadow-blue-900/20">
              <div className="absolute -right-10 -top-8 h-36 w-36 rounded-full bg-teal-300/15 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[.13em] text-blue-100">
                    {t('slot')} {activeSlotIndex + 1} OF {tokenList.length}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {tokenList.length > 1 && (
                      <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/20">
                        <button
                          onClick={handlePrevSlot}
                          className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xs font-black transition cursor-pointer active:scale-95"
                          title="Previous Appointment Slot"
                        >
                          ←
                        </button>
                        <span className="text-[10px] font-bold text-blue-100 px-1 font-mono">
                          {activeSlotIndex + 1}/{tokenList.length}
                        </span>
                        <button
                          onClick={handleNextSlot}
                          className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xs font-black transition cursor-pointer active:scale-95"
                          title="Next Appointment Slot"
                        >
                          →
                        </button>
                      </div>
                    )}
                    <span className="text-xs font-mono bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Scanned
                    </span>
                  </div>
                </div>
                
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="bg-amber-400 text-slate-950 font-black font-mono text-xs px-2 py-0.5 rounded">
                        {tokenNum}
                      </span>
                      <p className="text-lg font-extrabold">{deptName}</p>
                    </div>
                    <p className="text-sm text-blue-100">{docName}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-blue-200">
                      <MapPin className="h-3.5 w-3.5" /> {currentTokenObj.hospital_name || currentTokenObj.hospital || 'AIIMS New Delhi'}
                    </p>
                  </div>
                  
                  {/* Real QR Vector Thumbnail with Tap to Enlarge & Download */}
                  <div 
                    onClick={() => setShowQrModal(true)}
                    className="bg-white p-2 rounded-2xl shadow-inner border border-white/20 shrink-0 cursor-pointer hover:scale-105 transition-transform relative group"
                    title="Tap to enlarge & download QR"
                  >
                    <QRCodeSVG id={`dash-qr-svg-${tokenNum}`} value={qrPayload} size={64} />
                    <div className="absolute inset-0 bg-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-center backdrop-blur-sm">
                  <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-blue-100"><Clock3 className="h-3.5 w-3.5" /> {t('estimated_turn')}</p>
                  <p className="mt-1 text-3xl font-black tracking-tight text-white">~{wait.replace('~', '')}</p>
                  <p className="mt-1 text-xs font-medium text-blue-100">{patientsAhead} {t('patients_ahead')}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-teal-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,.18)] animate-pulse" /> Queue moving normally
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button onClick={() => navigate('/live-queue')} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-3 text-xs font-extrabold text-blue-800 transition hover:bg-blue-50 cursor-pointer">
                    {t('view_live_queue')} <ChevronRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => setShowQrModal(true)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-3 text-xs font-extrabold text-white transition hover:bg-white/20 cursor-pointer">
                    <QrCode className="h-4 w-4" /> {t('show_qr_pass')}
                  </button>
                </div>

                <button 
                  onClick={handleCancelCurrentSlot}
                  className="mt-2.5 w-full rounded-xl border border-rose-300/30 bg-rose-500/20 px-3 py-2.5 text-xs font-bold text-rose-100 transition hover:bg-rose-500/30 cursor-pointer text-center"
                >
                  {tokenList.length > 1 ? `${t('cancel_slot')} (${tokenNum})` : t('cancel_appointment')}
                </button>
              </div>
            </section>
          )}

          {/* Quick Action Cards */}
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t('quick_actions')}</h2>
              <span className="text-xs font-semibold text-slate-400">Choose a service</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {actionCards.map(({ title, subtitle, icon: Icon, tone, to }) => (
                <Link 
                  key={title} 
                  to={to} 
                  className={`group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md ${
                    tone === 'blue' ? 'hover:border-blue-200' : tone === 'teal' ? 'hover:border-teal-200' : tone === 'violet' ? 'hover:border-violet-200' : 'hover:border-amber-200'
                  }`}
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${
                    tone === 'blue' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : tone === 'teal' ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300' : tone === 'violet' ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <strong className="mt-3 block text-sm text-slate-900 dark:text-white">{t(title)}</strong>
                  <small className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</small>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-4">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">{t('need_help')}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setShowHospitalContacts(true)} 
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Hospital className="h-4 w-4 text-blue-700 dark:text-blue-400" /> {t('contact_hospital')}
              </button>
              <Link to="/ambulance" className="rounded-xl bg-rose-50 dark:bg-rose-950/60 px-3 py-2.5 text-center text-xs font-bold text-rose-700 dark:text-rose-300 transition hover:bg-rose-100 flex items-center justify-center gap-1.5">
                <TriangleAlert className="h-4 w-4" /> {t('emergency_108')}
              </Link>
            </div>
          </section>
        </main>

        {/* Demo Hospital Contact Numbers Modal */}
        <HospitalContactsModal
          isOpen={showHospitalContacts}
          onClose={() => setShowHospitalContacts(false)}
        />

        {/* Dedicated Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-md items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
          <Link to="/dashboard" className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-blue-700 dark:text-blue-400"><Home className="h-5 w-5 fill-blue-100 dark:fill-blue-950" /><span className="text-[10px] font-bold">{t('home')}</span></Link>
          <Link to="/live-queue" className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50"><Users className="h-5 w-5" /><span className="text-[10px] font-semibold">{t('queue')}</span></Link>
          <Link to="/my-token" className="-mt-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-700 text-white shadow-lg shadow-blue-900/25 ring-4 ring-[#f5f8fb] dark:ring-slate-950 transition hover:scale-105" aria-label="Scan or show QR pass"><QrCode className="h-6 w-6" /></Link>
          <Link to="/health-records" className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50"><FileText className="h-5 w-5" /><span className="text-[10px] font-semibold">{t('records')}</span></Link>
          <Link to="/profile" className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50"><UserRound className="h-5 w-5" /><span className="text-[10px] font-semibold">{t('profile')}</span></Link>
        </nav>

        {/* Interactive Enlarged QR Code Modal with Download and Close */}
        {showQrModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200 relative">
              
              {/* Top Bar with Close Button */}
              <div className="w-full flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Scannable QR Pass</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">{tokenNum}</h3>
                </div>
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="w-9 h-9 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full flex items-center justify-center font-bold transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enlarged Vector QR Code */}
              <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-inner">
                <QRCodeSVG id={`modal-qr-svg-${tokenNum}`} value={qrPayload} size={230} level="H" />
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                <p className="font-bold text-slate-900 dark:text-white">{docName} • {deptName}</p>
                <p>Present at hospital barrier or scanner turnstile</p>
              </div>

              {downloadSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl w-full flex items-center justify-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> QR Pass Downloaded!
                </div>
              )}

              {/* Action Buttons: Download & Close */}
              <div className="w-full grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadQR}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-2xl transition text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download QR
                </button>

                <button
                  onClick={() => setShowQrModal(false)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3.5 px-4 rounded-2xl transition text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
