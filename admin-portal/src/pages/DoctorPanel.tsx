import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import React, { useState } from 'react';
import { ShieldAlert, Pill, UserCheck, Stethoscope, UserPlus, CheckCircle, Activity } from 'lucide-react';

interface PatientItem {
  id: string;
  name: string;
  age: string;
  gender: string;
  priority: string;
  symptoms: string;
  scanned: boolean;
  color?: string;
  vitals: { bp: string; temp: string; hr?: string };
}

const INITIAL_QUEUE: PatientItem[] = [
  { 
    id: 'A-019', 
    name: 'Sita Devi', 
    age: '45', 
    gender: 'Female', 
    priority: 'Routine', 
    symptoms: 'General checkup and annual routine health screening.', 
    scanned: true, 
    vitals: { bp: '120/80', temp: '98.4°F', hr: '72 bpm' } 
  },
  { 
    id: 'A-020', 
    name: 'Rahul M.', 
    age: '28', 
    gender: 'Male', 
    priority: 'Routine', 
    symptoms: 'Persistent mild dry cough for 3 days.', 
    scanned: false, 
    vitals: { bp: '118/75', temp: '98.6°F', hr: '76 bpm' } 
  },
  { 
    id: 'A-021', 
    name: 'Amit Singh', 
    age: '52', 
    gender: 'Male', 
    priority: 'Routine', 
    symptoms: 'Mild tension headache and digital eye fatigue.', 
    scanned: false, 
    vitals: { bp: '130/85', temp: '98.6°F', hr: '80 bpm' } 
  },
  { 
    id: 'A-024', 
    name: 'Alok', 
    age: '32', 
    gender: 'Male', 
    priority: 'Moderate Priority', 
    color: 'text-orange-600 bg-orange-50 border-orange-200', 
    symptoms: 'Fever for 2 days with slight chest discomfort.', 
    scanned: true, 
    vitals: { bp: '125/82', temp: '99.8°F', hr: '88 bpm' } 
  },
  { 
    id: 'A-025', 
    name: 'Priya Sharma', 
    age: '24', 
    gender: 'Female', 
    priority: 'High Priority', 
    color: 'text-red-600 bg-red-50 border-red-200', 
    symptoms: 'Sudden onset high fever (102°F) and acute body pain.', 
    scanned: true, 
    vitals: { bp: '110/70', temp: '102.1°F', hr: '104 bpm' } 
  },
];

export const DoctorPanel: React.FC = () => {
  const [view, setView] = useState<'queue' | 'consultation'>('queue');
  const [currentlyServing, setCurrentlyServing] = useState<PatientItem | null>({
    id: 'A-018',
    name: 'Ramesh Kumar',
    age: '58',
    gender: 'Male',
    priority: 'High Priority',
    color: 'text-red-600 bg-red-50 border-red-200',
    symptoms: 'Severe acute breathlessness and chest tightness on exertion.',
    scanned: true,
    vitals: { bp: '145/95', temp: '98.8°F', hr: '96 bpm' }
  });
  const [queue, setQueue] = useState<PatientItem[]>(INITIAL_QUEUE);
  const [prescription, setPrescription] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCallNext = (targetId?: string) => {
    let nextPatient: PatientItem | undefined;

    if (targetId) {
      nextPatient = queue.find(p => p.id === targetId);
    } else {
      nextPatient = queue[0];
    }

    if (!nextPatient) {
      triggerToast('No more patients waiting in queue.');
      return;
    }

    // Call backend endpoint async (with fallback)
    fetch('http://localhost:8000/api/v1/tokens/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_id: nextPatient.id, scanned_by: 'Doctor-Opd-01' })
    }).catch(() => {});

    setCurrentlyServing(nextPatient);
    setQueue(prev => prev.filter(p => p.id !== nextPatient!.id));
    setPrescription('');
    setView('consultation');
    triggerToast(`Called Token ${nextPatient.id} (${nextPatient.name}) into Room 102`);
  };

  const handleCompleteConsultation = () => {
    if (currentlyServing) {
      fetch(`http://localhost:8000/api/v1/tokens/${currentlyServing.id}/complete`, { method: 'POST' }).catch(() => {});
      triggerToast(`Completed consultation for Token ${currentlyServing.id} (${currentlyServing.name})`);
    }

    setCurrentlyServing(null);
    setView('queue');
  };

  if (view === 'consultation' && currentlyServing) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <AdminSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />

          {notification && (
            <div className="bg-emerald-600 text-white px-6 py-2.5 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
              <CheckCircle className="w-4 h-4" />
              {notification}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 flex gap-8">
            {/* Patient Info Column */}
            <div className="w-1/3 flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{currentlyServing.name} ({currentlyServing.id})</h3>
                    <p className="text-slate-500 font-medium">Age {currentlyServing.age} • {currentlyServing.gender}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg flex items-center gap-1.5 text-sm font-bold shadow-sm border ${currentlyServing.color || 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    <ShieldAlert className="w-4 h-4" /> {currentlyServing.priority}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Reported Symptoms</h4>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-slate-800 font-medium leading-relaxed">
                  "{currentlyServing.symptoms}"
                </div>

                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Patient Vitals
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm">
                    <span className="text-slate-500 font-medium">Blood Pressure</span>
                    <span className="font-bold text-slate-800">{currentlyServing.vitals.bp}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm">
                    <span className="text-slate-500 font-medium">Temperature</span>
                    <span className="font-bold text-orange-600">{currentlyServing.vitals.temp}</span>
                  </div>
                  {currentlyServing.vitals.hr && (
                    <div className="flex justify-between items-center bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm">
                      <span className="text-slate-500 font-medium">Heart Rate</span>
                      <span className="font-bold text-blue-600">{currentlyServing.vitals.hr}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Column */}
            <div className="w-2/3 flex flex-col gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" /> Clinical Diagnosis & Prescription
                </h3>
                
                <textarea 
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className="flex-1 w-full border-2 border-slate-200/60 rounded-2xl p-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none font-medium text-slate-800 placeholder:text-slate-400 transition-all mb-6 bg-slate-50 min-h-[160px]"
                  placeholder="Enter medical notes, diagnosis, and prescribed medicines here..."
                ></textarea>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={() => triggerToast('Lab test order added to EHR')}
                    className="bg-white border-2 border-slate-200/60 text-slate-700 font-bold py-3.5 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm text-center"
                  >
                    + Order Lab Tests
                  </button>
                  <button 
                    onClick={() => triggerToast('Follow-up scheduled in 7 days')}
                    className="bg-white border-2 border-slate-200/60 text-slate-700 font-bold py-3.5 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm text-center"
                  >
                    + Schedule Follow-up
                  </button>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setView('queue')}
                    className="w-1/3 bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all text-base"
                  >
                    Back to Queue
                  </button>
                  <button 
                    onClick={handleCompleteConsultation}
                    className="w-2/3 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all text-base shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    Complete Consultation & Free Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        {notification && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
            <CheckCircle className="w-4 h-4" />
            {notification}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Currently Serving Section */}
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Currently Serving in OPD Room 102</span>
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                Active Consultation
              </span>
            </h3>
            
            {currentlyServing ? (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white flex items-center justify-between mb-10 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-24 h-24 bg-white text-blue-600 rounded-2xl flex items-center justify-center font-black text-3xl font-mono shadow-inner border border-blue-100/50">
                    {currentlyServing.id}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-1">{currentlyServing.name}</h4>
                    <p className="text-blue-100 font-medium flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-orange-300" /> {currentlyServing.priority}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex gap-3">
                  <button 
                    onClick={() => setView('consultation')}
                    className="bg-white text-slate-900 font-bold py-3 px-7 rounded-xl hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    Open Consultation
                  </button>
                  <button 
                    onClick={handleCompleteConsultation}
                    className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Complete
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center mb-10 shadow-sm">
                <p className="text-slate-500 font-bold mb-3">No active patient currently in consultation room.</p>
                <button 
                  onClick={() => handleCallNext()}
                  disabled={queue.length === 0}
                  className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Call Top Waiting Patient
                </button>
              </div>
            )}

            {/* Waiting Queue Header */}
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex justify-between items-center">
              <span>Next in Queue</span>
              <span className="bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-xs">
                {queue.length} Patients Waiting
              </span>
            </h3>
            
            {/* Queue List */}
            {queue.length === 0 ? (
              <div className="bg-white border border-slate-200/60 p-8 rounded-2xl text-center text-slate-500 font-bold">
                🎉 Queue is clear! All patients have been served.
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((patient) => (
                  <div key={patient.id} className="bg-white border border-slate-200/60 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                      <span className="w-16 text-slate-400 font-bold font-mono group-hover:text-blue-600 transition-colors">{patient.id}</span>
                      <span className="font-bold text-slate-800 text-lg">{patient.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md border ${patient.color || 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                        {patient.priority}
                      </span>
                      {patient.scanned && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          At Door (Scanned)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleCallNext(patient.id)}
                        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <UserPlus className="w-4 h-4" />
                        Call Next
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};


