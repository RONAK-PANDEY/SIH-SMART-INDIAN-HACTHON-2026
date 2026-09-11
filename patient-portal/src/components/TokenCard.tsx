import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  const qrPayload = JSON.stringify({
    token_id: `tok_${Math.floor(Math.random()*1000)}`,
    token_number: tokenNumber,
    patient_id: 'P-10024',
    dept: department,
    hospital_id: 'hosp-001',
    hash: '7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e',
    timestamp: new Date().toISOString()
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{department}</span>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{tokenNumber}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Room {room}</span>
          </p>
        </div>
        
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs shrink-0">
          <QRCodeSVG value={qrPayload} size={42} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Wait: <strong>~{estimatedWaitMins}m</strong></span>
        </div>
        <div className="font-semibold text-slate-700 dark:text-slate-300">
          Ahead: <span className="text-blue-600 dark:text-blue-400">{positionAhead} Patients</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          status === 'IN_CONSULTATION'
            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            : status === 'NEXT'
            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse'
            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
};

