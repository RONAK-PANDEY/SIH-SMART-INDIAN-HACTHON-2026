import React from 'react';

const facilities = [
  { name: 'AIIMS Main Campus', load: 88, bedsAvail: 42, wait: '45m', status: 'OVERLOAD' },
  { name: 'Safdarjung District', load: 54, bedsAvail: 180, wait: '20m', status: 'OPTIMAL' },
  { name: 'Apollo Super Speciality', load: 35, bedsAvail: 240, wait: '12m', status: 'AVAILABLE' },
  { name: 'RML Hospital', load: 76, bedsAvail: 65, wait: '35m', status: 'MODERATE' },
  { name: 'Max Healthcare Saket', load: 48, bedsAvail: 110, wait: '15m', status: 'OPTIMAL' },
];

export const CongestionHeatmap: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      {facilities.map((f) => (
        <div
          key={f.name}
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            f.status === 'OVERLOAD'
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : f.status === 'MODERATE'
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-xs">{f.name}</h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                f.status === 'OVERLOAD' ? 'bg-rose-200 text-rose-800' : f.status === 'MODERATE' ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'
              }`}>
                {f.load}% Load
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-1">Available Beds: <strong>{f.bedsAvail}</strong></p>
          </div>
          <div className="mt-4 pt-2 border-t border-black/5 flex justify-between items-center text-xs">
            <span>OPD Wait Time:</span>
            <strong className="text-sm font-black">{f.wait}</strong>
          </div>
        </div>
      ))}
    </div>
  );
};
