import React from 'react';
import { ArrowLeft, Info, Calendar, Clock, Edit3, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AppointmentManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleCancelCurrentSlot = () => {
    const allTokensRaw = localStorage.getItem('smartcare_all_tokens');
    let list: any[] = [];
    if (allTokensRaw) {
      try { list = JSON.parse(allTokensRaw); } catch {}
    }
    if (list.length > 1) {
      const updatedList = list.slice(1);
      localStorage.setItem('smartcare_all_tokens', JSON.stringify(updatedList));
      localStorage.setItem('smartcare_active_token', JSON.stringify(updatedList[0]));
      navigate('/dashboard');
    } else {
      localStorage.removeItem('smartcare_all_tokens');
      localStorage.removeItem('smartcare_active_token');
      localStorage.setItem('smartcare_cancelled', 'true');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-[0_0_40px_rgba(0,0,0,0.05)] relative font-sans">
      <header className="flex items-center p-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100/50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-4 hover:bg-slate-200 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="font-bold text-xl text-slate-900 tracking-tight">Manage Appointment</h1>
      </header>

      <main className="flex-1 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Appt</p>
              <h2 className="text-lg font-bold text-slate-900">General Medicine</h2>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="font-semibold text-slate-700">Date & Time</span>
              </div>
              <span className="font-bold text-slate-900">12 Sept, 10:30 AM</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="font-mono text-slate-400 font-bold ml-1">#</div>
                <span className="font-semibold text-slate-700">Token No.</span>
              </div>
              <span className="font-bold font-mono text-blue-600">A-024</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={() => navigate('/book-appointment')} className="bg-white border-2 border-slate-200/80 text-slate-700 font-bold py-4 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-colors flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer">
              <Edit3 className="w-5 h-5" />
              Reschedule
            </button>
            <button onClick={handleCancelCurrentSlot} className="bg-rose-50 border-2 border-rose-100 text-rose-600 font-bold py-4 rounded-2xl hover:bg-rose-100 transition-colors flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer">
              <XCircle className="w-5 h-5" />
              Cancel Appt
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-sm text-blue-800 font-medium">
              <p>You can modify this appointment up to 2 hours before the scheduled time.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
