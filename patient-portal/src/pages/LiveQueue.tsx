import React from 'react';
import { ArrowLeft, RefreshCw, Calendar, Clock, Users, ChevronRight, Activity, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveQueue: React.FC = () => {
  if (localStorage.getItem('smartcare_cancelled') === 'true') { 
    return (
      <div className='p-8 text-center mt-20'>
        <p className='text-slate-500 font-bold'>No Active Queue. Please book an appointment.</p>
        <button onClick={() => window.location.href='/dashboard'} className='mt-4 text-blue-500 underline font-bold'>Go Home</button>
      </div>
    ); 
  }
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-[0_0_40px_rgba(0,0,0,0.05)] relative font-sans">
      <header className="flex items-center p-6 bg-white/85 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100/50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-4 hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">Live Queue</h1>
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto pb-36 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Doctor Info Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Dr. Sharma</h2>
              <p className="text-slate-500 text-sm font-medium">General Medicine</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/appointment-management')}
            className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors shadow-sm"
            title="Manage Appointment"
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Serving */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Currently Serving</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 shadow-lg shadow-blue-500/20 text-white relative overflow-hidden flex items-center gap-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div className="w-20 h-20 bg-white text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl font-mono shadow-inner relative z-10">
              A-018
            </div>
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold tracking-wider uppercase mb-2">
                <Activity className="w-3.5 h-3.5" /> In Progress
              </div>
              <p className="text-blue-100 text-sm font-medium leading-snug">Patient consultation is currently ongoing.</p>
            </div>
          </div>
        </div>

        {/* Your Token Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Your Token</p>
            <p className="font-mono text-4xl font-black text-slate-900 tracking-tighter">A-024</p>
          </div>
          
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-center gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Wait Time</p>
              <p className="font-bold text-xl text-emerald-500">~28 mins</p>
            </div>
            <div className="h-px w-full bg-slate-100"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1.5"><Users className="w-3 h-3"/> Ahead</p>
              <p className="font-bold text-lg text-slate-800">6 patients</p>
            </div>
          </div>
        </div>

        {/* The Queue Stack */}
        <div>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">Queue Stack</p>
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200/60 font-mono text-sm">
            
            <div className="flex items-center p-3 rounded-2xl mb-1 opacity-50">
              <div className="w-8 flex justify-center text-slate-400 mr-3">✓</div>
              <span className="text-slate-500 font-bold text-base flex-1">A-019</span>
            </div>
            
            <div className="flex items-center p-3 rounded-2xl mb-1 opacity-50">
              <div className="w-8 flex justify-center text-slate-400 mr-3">✓</div>
              <span className="text-slate-500 font-bold text-base flex-1">A-020</span>
            </div>
            
            <div className="flex items-center p-3 rounded-2xl mb-1 bg-slate-50 border border-slate-100">
              <div className="w-8 flex justify-center text-blue-500 mr-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <span className="text-slate-800 font-bold text-base flex-1">A-021</span>
              <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">Next up</span>
            </div>
            
            <div className="flex items-center p-3 rounded-2xl mb-1">
              <div className="w-8 flex justify-center text-slate-300 mr-3">-</div>
              <span className="text-slate-600 font-bold text-base flex-1">A-022</span>
            </div>
            
            <div className="flex items-center p-3 rounded-2xl mb-1">
              <div className="w-8 flex justify-center text-slate-300 mr-3">-</div>
              <span className="text-slate-600 font-bold text-base flex-1">A-023</span>
            </div>
            
            <div className="flex items-center p-4 rounded-2xl bg-blue-50 border border-blue-200/50 mt-2 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <div className="w-8 flex justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              </div>
              <span className="text-blue-700 font-black text-lg flex-1">A-024</span>
              <span className="text-xs font-sans font-black bg-blue-600 text-white px-2 py-1 rounded text-center shadow-sm">YOU</span>
            </div>
            
          </div>
        </div>

      </main>
      
      {/* Simulation Helper - just for demo */}
      <div className="fixed bottom-3 left-0 right-0 p-4 bg-white/95 backdrop-blur-md max-w-lg mx-auto pointer-events-none flex justify-center z-40 border-t border-slate-200/60 shadow-[0_-10px_25px_rgba(0,0,0,0.08)] rounded-b-3xl">
        <button 
          onClick={() => navigate('/feedback')}
          className="bg-slate-900 text-white font-extrabold py-3.5 px-6 rounded-2xl hover:bg-slate-800 transition-all text-xs shadow-lg shadow-slate-900/20 pointer-events-auto flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" /> Skip to Feedback (Demo)
        </button>
      </div>
    </div>
  );
};
