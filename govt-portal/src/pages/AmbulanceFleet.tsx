import React, { useState } from 'react';
import { 
  Flame, 
  PhoneCall, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Building2, 
  Activity, 
  Plus, 
  ShieldCheck, 
  Send 
} from 'lucide-react';

export const AmbulanceFleet: React.FC = () => {
  const [fleet] = useState([
    {
      id: 'AMB-108-01',
      vehicleNo: 'DL-01-EA-9821',
      type: 'ALS (Advanced Life Support - Ventilator Equipped)',
      driver: 'Manoj Kumar (+91 98110 44321)',
      status: 'ON_DISPATCH',
      location: 'Sector 62, Noida -> AIIMS Trauma Center',
      eta: '6 mins',
      patient: 'Aarav Sharma (Cardiac Emergency)'
    },
    {
      id: 'AMB-108-02',
      vehicleNo: 'DL-01-EB-4412',
      type: 'BLS (Basic Life Support - Oxygen Concentrator)',
      driver: 'Rajendra Singh (+91 98711 00291)',
      status: 'AVAILABLE',
      location: 'AIIMS Main Ambulance Bay',
      eta: 'Standby',
      patient: 'None'
    },
    {
      id: 'AMB-108-03',
      vehicleNo: 'DL-01-EC-7729',
      type: 'Neonatal & Maternal ICU Mobile Bay',
      driver: 'Vikram Rawat (+91 99104 22891)',
      status: 'ON_DISPATCH',
      location: 'Safdarjung Enclave -> Safdarjung Maternity Wing',
      eta: '8 mins',
      patient: 'Pooja Verma (Pre-term labor)'
    },
    {
      id: 'AMB-108-04',
      vehicleNo: 'DL-01-ED-1184',
      type: 'ALS (Advanced Life Support - Defibrillator)',
      driver: 'Sunil Yadav (+91 98201 55940)',
      status: 'AVAILABLE',
      location: 'RML Trauma Bay Gate 2',
      eta: 'Standby',
      patient: 'None'
    }
  ]);

  return (
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> National 108 Emergency Command
            </span>
            <span className="text-xs text-slate-400 font-mono">Live GPS Telematics & Telemedicine</span>
          </div>
          <h1 className="text-2xl font-black text-white">Emergency 108 Ambulance Fleet & Trauma Dispatch</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time fleet monitoring, GPS route tracking, and trauma bed reservation across central hospitals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-2xl text-xs text-emerald-300 font-bold">
            Active Dispatches: <span className="text-base font-black text-emerald-400">2</span> / 4 Ready
          </div>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fleet.map((amb) => (
          <div
            key={amb.id}
            className={`bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-4 ${
              amb.status === 'ON_DISPATCH' ? 'border-rose-500/50 ring-1 ring-rose-500/30' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  amb.status === 'ON_DISPATCH' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                }`}>
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-sm font-black text-white block">{amb.id}</strong>
                  <span className="text-[11px] font-mono text-slate-400">{amb.vehicleNo}</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                amb.status === 'ON_DISPATCH'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {amb.status === 'ON_DISPATCH' ? '🚨 ON DISPATCH (ETA ' + amb.eta + ')' : '✓ STANDBY AVAILABLE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Configuration</span>
                <strong className="text-white">{amb.type}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Assigned Driver</span>
                <strong className="text-white">{amb.driver}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[11px]">Live Route / GPS</span>
                <strong className="text-amber-400">{amb.location}</strong>
              </div>
              {amb.status === 'ON_DISPATCH' && (
                <div className="col-span-2 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200">
                  <strong className="text-white">Patient In Transit:</strong> {amb.patient}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${amb.driver.split('+91')[1]?.trim()}`}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Driver</span>
              </a>
              <button
                type="button"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(amb.location.split('->')[0].trim())}`, '_blank', 'noopener,noreferrer')}
                aria-label={`Open live map for ${amb.id}`}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Live GPS Map</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
