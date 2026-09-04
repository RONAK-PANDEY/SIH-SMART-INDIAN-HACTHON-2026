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
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto">
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
      </div>
    </Router>
  );
};

export default App;
