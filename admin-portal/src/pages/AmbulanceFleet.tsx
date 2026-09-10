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
      type: 'ALS (Advanced Life Support)',
      driver: 'Manoj Kumar (+91 98110 44321)',
      status: 'ON_DISPATCH',
      location: 'Sector 62, Noida -> AIIMS Trauma',
      eta: '6 mins',
      patient: 'Aarav Sharma (Cardiac Emergency)'
    },
    {
      id: 'AMB-108-02',
      vehicleNo: 'DL-01-EB-4412',
      type: 'BLS (Basic Life Support)',
      driver: 'Rajendra Singh (+91 98711 00291)',
      status: 'AVAILABLE',
      location: 'AIIMS Main Ambulance Bay',
      eta: 'Standby',
      patient: 'None'
    },
    {
      id: 'AMB-108-03',
      vehicleNo: 'DL-01-EC-7729',
      type: 'Neonatal & Maternal ICU',
      driver: 'Vikram Rawat (+91 99104 22891)',
      status: 'ON_DISPATCH',
      location: 'Safdarjung Enclave -> Safdarjung Maternity',
      eta: '8 mins',
      patient: 'Pooja Verma (Pre-term labor)'
    },
    {
      id: 'AMB-108-04',
      vehicleNo: 'DL-01-ED-1184',
      type: 'ALS (Advanced Life Support)',
      driver: 'Sunil Yadav (+91 98201 55940)',
      status: 'AVAILABLE',
      location: 'RML Trauma Bay Gate 2',
      eta: 'Standby',
      patient: 'None'
    }
  ]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" /> National 108 Command Center
            </span>
            <span className="text-xs text-slate-500 font-mono">Live GPS Telematics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Emergency Ambulance Fleet & Trauma Dispatch</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time fleet monitoring, GPS route tracking, and trauma bed reservation across city hospitals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800 font-bold">
            Active Dispatches: <span className="text-base font-black">2</span> / 4 Ready
          </div>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fleet.map((amb) => (
          <div
            key={amb.id}
            className={`bg-white rounded-3xl p-5 border shadow-sm space-y-4 ${
              amb.status === 'ON_DISPATCH' ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  amb.status === 'ON_DISPATCH' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-sm font-black text-slate-900 block">{amb.id}</strong>
                  <span className="text-[11px] font-mono text-slate-500">{amb.vehicleNo}</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                amb.status === 'ON_DISPATCH'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {amb.status === 'ON_DISPATCH' ? '🚨 ON DISPATCH (ETA ' + amb.eta + ')' : '✓ STANDBY AVAILABLE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Configuration</span>
                <strong className="text-slate-800">{amb.type}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Driver</span>
                <strong className="text-slate-800">{amb.driver}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Live Route / GPS</span>
                <strong className="text-slate-800">{amb.location}</strong>
              </div>
              {amb.status === 'ON_DISPATCH' && (
                <div className="col-span-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                  <strong>Patient In Transit:</strong> {amb.patient}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${amb.driver.split('+91')[1]?.trim()}`}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Driver</span>
              </a>
              <button
                type="button"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(amb.location.split('->')[0].trim())}`, '_blank', 'noopener,noreferrer')}
                aria-label={`Open live map for ${amb.id}`}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
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
