import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { time: '08:00', actualWait: 10, aiPredicted: 12, inflow: 45 },
  { time: '09:00', actualWait: 22, aiPredicted: 20, inflow: 110 },
  { time: '10:00', actualWait: 38, aiPredicted: 35, inflow: 180 },
  { time: '11:00', actualWait: 45, aiPredicted: 44, inflow: 220 },
  { time: '12:00', actualWait: 30, aiPredicted: 32, inflow: 140 },
  { time: '13:00', actualWait: 15, aiPredicted: 16, inflow: 80 },
  { time: '14:00', actualWait: 20, aiPredicted: 19, inflow: 95 },
  { time: '15:00', actualWait: 18, aiPredicted: 18, inflow: 70 },
];

export const WaitTimeChart: React.FC = () => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} unit="m" />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
          <Area type="monotone" dataKey="actualWait" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorWait)" name="Actual Wait (mins)" />
          <Area type="monotone" dataKey="aiPredicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPred)" name="AI Predicted" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
