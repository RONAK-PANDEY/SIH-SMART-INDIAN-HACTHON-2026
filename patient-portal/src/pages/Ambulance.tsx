import React, { useState } from 'react';
import { 
  Flame, 
  PhoneCall, 
  MapPin, 
  Navigation, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Building2, 
  Activity,
  HeartPulse,
  UserCheck
} from 'lucide-react';

export const Ambulance: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'bls' | 'als' | 'maternal'>('als');
  const [pickupAddress, setPickupAddress] = useState('Sector 62, Noida (Near Royal Palms Apartments)');
  const [patientCondition, setPatientCondition] = useState('Acute chest pain with severe shortness of breath');
  const [dispatched, setDispatched] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const ambulanceTypes = [
    {
      id: 'als',
      name: 'Advanced Life Support (ALS)',
      desc: 'Equipped with Transport Ventilator, Defibrillator, Multipara Monitor, and Paramedic Doctor.',
      eta: '6 - 8 mins',
      badge: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    {
      id: 'bls',
      name: 'Basic Life Support (BLS)',
      desc: 'Equipped with Oxygen Cylinder, Stretcher, First Aid Kit, and Emergency EMT.',
      eta: '4 - 6 mins',
      badge: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      id: 'maternal',
      name: 'Neonatal & Maternal Care',
      desc: 'Equipped with Baby Incubator, Delivery Kit, and Specialized Obstetric Nurse.',
      eta: '8 - 10 mins',
      badge: 'bg-pink-100 text-pink-800 border-pink-300'
    }
  ];

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      setDispatched(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 max-w-2xl mx-auto pb-32">
      {/* Top Banner */}
      <header className="mb-6 pt-2">
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-full w-fit mb-2 border border-rose-200">
          <Flame className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider">24x7 Emergency Trauma Dispatch</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Call an ambulance</h1>
        <p className="text-xs text-slate-500 mt-1">
          GPS-tracked emergency ambulance with live paramedic monitoring and hospital trauma bed pre-alert.
        </p>
      </header>

      {/* Emergency Hotline Bar */}
      <div className="bg-gradient-to-r from-rose-700 via-red-700 to-rose-900 text-white rounded-3xl p-5 shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-rose-200 block">Emergency 108</span>
          <strong className="text-2xl font-black">Call 108 (Toll-Free)</strong>
        </div>
        <a
          href="tel:108"
          className="bg-white text-rose-700 hover:bg-rose-50 font-black text-xs px-5 py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2"
        >
          <PhoneCall className="w-4 h-4 fill-current" />
          <span>Direct Toll-Free Dial</span>
        </a>
      </div>

      {dispatched ? (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-6 animate-in zoom-in-95">
          <div className="text-center space-y-2 border-b border-slate-100 pb-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full inline-block">
              Ambulance En Route
            </span>
            <h2 className="text-2xl font-black text-slate-900">Vehicle #DL-01-EA-9821 Dispatched</h2>
            <p className="text-xs text-slate-500">Live Paramedic Team Assigned • Alert sent to AIIMS Trauma Gate 1</p>
          </div>

          {/* Live Dispatch Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Estimated Arrival (ETA):</span>
              <strong className="text-rose-600 font-black text-base flex items-center gap-1">
                <Clock className="w-4 h-4" /> ~6 mins (1.8 km away)
              </strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Lead Driver / EMT:</span>
              <strong className="text-slate-800">Manoj Kumar (+91 98110 44321)</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Vehicle Specification:</span>
              <strong className="text-slate-800">Advanced Life Support (ALS-Ventilator)</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Destination Hospital:</span>
              <strong className="text-blue-700">AIIMS New Delhi Emergency Trauma Room</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="tel:+919811044321"
              className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Driver</span>
            </a>
            <button
              type="button"
              onClick={() => setDispatched(false)}
              className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDispatch} className="space-y-6">
          {/* Step 1: Ambulance Type */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>1. Choose Emergency Vehicle Configuration</span>
            </span>

            <div className="space-y-2.5">
              {ambulanceTypes.map((amb) => (
                <button
                  key={amb.id}
                  type="button"
                  onClick={() => setSelectedType(amb.id as any)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs transition flex flex-col justify-between ${
                    selectedType === amb.id
                      ? 'border-rose-600 bg-rose-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <strong className="text-sm font-bold">{amb.name}</strong>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${amb.badge}`}>
                      ETA: {amb.eta}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{amb.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Location & Patient Symptoms */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>2. Emergency Pickup Location & Patient Status</span>
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup GPS Address</label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Critical Emergency Notes (for Paramedics)</label>
              <textarea
                rows={2}
                value={patientCondition}
                onChange={(e) => setPatientCondition(e.target.value)}
                placeholder="State symptoms e.g. severe chest pain, breathing difficulty, unconscious..."
                aria-label="Emergency symptoms"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-black py-4 rounded-3xl shadow-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {bookingLoading ? (
              <span>Connecting to Emergency 108 Dispatcher...</span>
            ) : (
              <>
                <Flame className="w-5 h-5 fill-current" />
                <span>Request ambulance</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
