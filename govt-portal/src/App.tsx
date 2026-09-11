import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DoctorPerformance } from './pages/DoctorPerformance';
import { Grievances } from './pages/Grievances';
import { LiveQueues } from './pages/LiveQueues';
import { HospitalList } from './pages/HospitalList';
import { HospitalDetail } from './pages/HospitalDetail';
import { LiveScanFeed } from './pages/LiveScanFeed';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex min-w-0 bg-slate-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-w-0 bg-slate-100">
            <Routes>
              {/* MAIN */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/queues" element={<LiveQueues />} />
              <Route path="/live-queues" element={<LiveQueues />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/alerts/:alertId" element={<Alerts />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* RECOGNITION */}
              <Route path="/doctors" element={<DoctorPerformance />} />
              <Route path="/doctors/:doctorId" element={<DoctorPerformance />} />
              <Route path="/doctor-performance" element={<DoctorPerformance />} />
              <Route path="/feedback" element={<Grievances />} />
              <Route path="/grievances" element={<Grievances />} />

              {/* SYSTEM */}
              <Route path="/hospitals" element={<HospitalList />} />
              <Route path="/hospital/:id" element={<HospitalDetail />} />
              <Route path="/system" element={<LiveScanFeed />} />
              <Route path="/live-scan-feed" element={<LiveScanFeed />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
