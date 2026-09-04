import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, CheckCircle, ArrowRight } from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const [department, setDepartment] = useState('Cardiology');
  const [slot, setSlot] = useState('Morning (09:00 AM - 12:00 PM)');
  const [doctor, setDoctor] = useState('Any Available Specialist');
  const [confirmed, setConfirmed] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-xl mx-auto pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Generate OPD Token</h1>
        <p className="text-xs text-slate-500 mt-1">AIIMS New Delhi • Cardiology OPD (Room 104)</p>
      </header>

      {!confirmed ? (
        <form onSubmit={handleBook} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cardiology">Cardiology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Consulting Doctor</label>
            <select
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Any Available Specialist">⚡ Auto-Assign (Fastest Queue)</option>
              <option value="Dr. A. K. Verma (Sr. Cardiologist)">Dr. A. K. Verma (Sr. Cardiologist)</option>
              <option value="Dr. Priya Sharma (Consultant)">Dr. Priya Sharma (Consultant)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slot Window</label>
            <div className="grid grid-cols-2 gap-2">
              {['Morning (09:00 - 12:00)', 'Afternoon (12:30 - 04:00)'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`p-3 rounded-xl border text-xs font-medium transition ${
                    slot === s ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition text-sm"
          >
            Issue Instant Token
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-md text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Token Confirmed!</h2>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Live Token</span>
            <div className="text-3xl font-extrabold text-blue-700 my-1">CARD-042</div>
            <p className="text-xs text-slate-600">Est. Wait: <strong>~25 minutes</strong> • 4 patients ahead</p>
          </div>
          <a
            href="/my-token"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-medium py-3 rounded-xl text-xs hover:bg-slate-800 transition"
          >
            <span>Open Digital OPD Pass</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
