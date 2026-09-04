import React from 'react';
import { Clock, MapPin, QrCode } from 'lucide-react';

interface TokenProps {
  tokenNumber: string;
  department: string;
  room: string;
  estimatedWaitMins: number;
  positionAhead: number;
  status: 'WAITING' | 'NEXT' | 'IN_CONSULTATION' | 'COMPLETED';
}

export const TokenCard: React.FC<TokenProps> = ({
  tokenNumber,
  department,
  room,
  estimatedWaitMins,
  positionAhead,
  status,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{department}</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{tokenNumber}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Room {room}</span>
          </p>
        </div>
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700">
          <QrCode className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Wait: <strong>~{estimatedWaitMins}m</strong></span>
        </div>
        <div className="font-semibold text-slate-700">
          Ahead: <span className="text-blue-600">{positionAhead} Patients</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          status === 'IN_CONSULTATION'
            ? 'bg-emerald-100 text-emerald-700'
            : status === 'NEXT'
            ? 'bg-amber-100 text-amber-700 animate-pulse'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
};
