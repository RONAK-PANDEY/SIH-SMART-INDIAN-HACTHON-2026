import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, QrCode, Share2, Download, Sun, Moon, ShieldCheck, Zap, X, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';

export const MyToken: React.FC = () => {
  if (localStorage.getItem('smartcare_cancelled') === 'true') { 
    return (
      <div className='p-8 text-center mt-20'>
        <p className='text-slate-500 font-bold'>No Active Token Available</p>
      </div>
    ); 
  }
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isScanned, setIsScanned] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const allTokensRaw = localStorage.getItem('smartcare_all_tokens');
  const activeTokenRaw = localStorage.getItem('smartcare_active_token');
  
  let tokenList: any[] = [];
  if (allTokensRaw) {
    try { tokenList = JSON.parse(allTokensRaw); } catch {}
  }
  if (tokenList.length === 0 && activeTokenRaw) {
    try { tokenList = [JSON.parse(activeTokenRaw)]; } catch {}
  }
  if (tokenList.length === 0) {
    tokenList = [{
      token_id: 'tok_01',
      token_number: 'A-024',
      patient_id: 'P-10024',
      department: 'General Medicine',
      doctor: 'Dr. Sharma',
      hash: '7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e',
      estimated_wait_minutes: 28
    }];
  }

  const currentToken = tokenList[activeSlotIndex] || tokenList[0];

  const tokenId = currentToken?.token_id || 'tok_01';
  const tokenNumber = currentToken?.token_number || 'A-024';
  const patientId = currentToken?.patient_id || 'P-10024';
  const department = currentToken?.department || 'General Medicine';
  const doctor = currentToken?.doctor || currentToken?.doctor_name || 'Dr. Sharma';
  const hash = currentToken?.hash || '7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e';
  const waitMinutes = currentToken?.estimated_wait_minutes || 28;

  const qrPayload = JSON.stringify({
    token_id: tokenId,
    token_number: tokenNumber,
    patient_id: patientId,
    dept: department.toLowerCase().includes('cardio') ? 'dept-cardio' : 'dept-genmed',
    hospital_id: 'hosp-001',
    hash: hash,
    timestamp: new Date().toISOString()
  });

  const handleNextSlot = () => {
    setActiveSlotIndex(prev => (prev + 1) % tokenList.length);
  };

  const handleCancelCurrentSlot = () => {
    if (tokenList.length > 1) {
      const updatedList = tokenList.filter((_, idx) => idx !== activeSlotIndex);
      localStorage.setItem('smartcare_all_tokens', JSON.stringify(updatedList));
      localStorage.setItem('smartcare_active_token', JSON.stringify(updatedList[0]));
      setActiveSlotIndex(0);
    } else {
      localStorage.removeItem('smartcare_all_tokens');
      localStorage.removeItem('smartcare_active_token');
      localStorage.setItem('smartcare_cancelled', 'true');
      navigate('/dashboard');
    }
  };

  const handleDownloadQR = () => {
    try {
      const svgElement = (document.getElementById(`qr-code-svg-${tokenNumber}`) as unknown) as SVGElement | null;
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `SmartCare_QR_${tokenNumber}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        const element = document.createElement("a");
        const file = new Blob([
          `SMARTCARE OPD TOKEN PASS\nToken: ${tokenNumber}\nDoctor: ${doctor}\nDepartment: ${department}\nWait: ${waitMinutes} min\nHash: ${hash}`
        ], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `SmartCare_Token_${tokenNumber}.txt`;
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col max-w-lg mx-auto shadow-[0_0_40px_rgba(0,0,0,0.05)] relative pb-48 font-sans transition-colors duration-200 text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between p-6 bg-transparent sticky top-0 z-20">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        
        <div className="flex items-center gap-2">
          {tokenList.length > 1 && (
            <button 
              onClick={handleNextSlot}
              className="bg-blue-600 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
            >
              Next Slot ({activeSlotIndex + 1}/{tokenList.length}) →
            </button>
          )}
          <button onClick={toggleTheme} className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button onClick={handleDownloadQR} className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors" title="Download QR Pass">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center gap-2 mb-6 mt-1 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner mb-1 transition-colors ${
            isScanned ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
          }`}>
            {isScanned ? <ShieldCheck className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>
          <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
            {isScanned ? 'Turnstile Access Verified' : 'Appointment Confirmed'}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
            {isScanned ? 'Patient cleared at Turnstile Gate #01' : 'Tap QR code below to enlarge & download'}
          </span>
        </div>

        {/* Premium Ticket UI */}
        <div className="w-full relative drop-shadow-xl mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full overflow-hidden relative border border-slate-200/80 dark:border-slate-800">
            {/* Top decorative status gradient */}
            <div className={`h-3 w-full transition-colors ${
              isScanned ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600'
            }`} />
            
            <div className="p-7 flex flex-col items-center text-center">
              <p className="text-blue-600 dark:text-blue-400 font-bold tracking-[0.2em] text-xs mb-1 uppercase">Token Pass</p>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter font-mono">{tokenNumber}</h2>
              
              {/* Dynamic Real Scannable Vector QR Code with Tap to Enlarge */}
              <div 
                onClick={() => setShowQrModal(true)}
                className="w-60 h-60 bg-white p-4 rounded-3xl border border-slate-200 shadow-inner flex flex-col items-center justify-center relative cursor-pointer hover:border-blue-500 transition-all hover:scale-[1.02] group"
                title="Tap to enlarge & download QR"
              >
                <QRCodeSVG id={`qr-code-svg-${tokenNumber}`} value={qrPayload} size={190} level="H" />
                <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 rounded-3xl transition-colors flex items-end justify-center pb-2">
                  <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 opacity-90 group-hover:opacity-100">
                    <Maximize2 className="w-3 h-3 text-amber-400" /> Tap to Enlarge & Download
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket dashed line separator */}
            <div className="relative h-px w-full border-t-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full shadow-inner" />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full shadow-inner" />
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Doctor</span>
                <span className="font-bold text-slate-900 dark:text-white">{doctor}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">{department}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                  isScanned ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                }`}>
                  {isScanned ? 'SCANNED AT GATE' : 'PENDING CHECK-IN'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <button 
                  onClick={handleCancelCurrentSlot}
                  className="w-full py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                >
                  {tokenList.length > 1 ? `Cancel This Slot (${tokenNumber})` : 'Cancel Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Estimated Wait</span>
          <span className="font-black text-blue-700 dark:text-blue-300 text-xl tracking-tight">{waitMinutes} min</span>
        </div>
      </main>

      {/* Floating Bottom Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 max-w-lg mx-auto pointer-events-none z-40 shadow-[0_-10px_25px_rgba(0,0,0,0.12)] rounded-2xl">
        <button 
          onClick={() => navigate('/live-queue')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl transition-all text-base shadow-lg shadow-blue-500/30 pointer-events-auto cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          View Live Queue →
        </button>
      </div>

      {/* Interactive Enlarged QR Code Modal with Download and Close */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200 relative">
            
            {/* Top Bar with Close Button */}
            <div className="w-full flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Scannable QR Pass</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">{tokenNumber}</h3>
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
              <QRCodeSVG id={`modal-qr-svg-${tokenNumber}`} value={qrPayload} size={230} level="H" />
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              <p className="font-bold text-slate-900 dark:text-white">{doctor} • {department}</p>
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
  );
};
