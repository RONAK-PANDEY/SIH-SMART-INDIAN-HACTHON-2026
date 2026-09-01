import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { HospitalList } from './pages/HospitalList';
import { HospitalDetail } from './pages/HospitalDetail';
import { LiveQueues } from './pages/LiveQueues';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { Heatmap } from './pages/Heatmap';
import { DoctorPanel } from './pages/DoctorPanel';

export const App: React.FC = () => (
  <Router>
    <div className="min-h-screen bg-slate-50 flex">
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hospitals" element={<HospitalList />} />
          <Route path="/hospital/:id" element={<HospitalDetail />} />
          <Route path="/live-queues" element={<LiveQueues />} />
          <Route path="/doctor-panel" element={<DoctorPanel />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/heatmap" element={<Heatmap />} />
        </Routes>
      </main>
    </div>
  </Router>
);
export default App;
