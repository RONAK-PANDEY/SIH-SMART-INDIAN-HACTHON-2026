import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Level 1 (Resuscitation)', value: 4, color: '#e11d48' },
  { name: 'Level 2 (Emergent)', value: 18, color: '#ea580c' },
  { name: 'Level 3 (Urgent)', value: 42, color: '#eab308' },
  { name: 'Level 4 (Less Urgent)', value: 78, color: '#3b82f6' },
  { name: 'Level 5 (Non-Urgent)', value: 120, color: '#10b981' },
];

export const TriageDistribution: React.FC = () => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '11px', border: '1px solid #334155' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
