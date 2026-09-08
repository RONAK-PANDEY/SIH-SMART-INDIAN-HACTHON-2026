import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DoctorPerformance } from './pages/DoctorPerformance';
import { SalaryBonus } from './pages/SalaryBonus';
import { Grievances } from './pages/Grievances';
import { Compliance } from './pages/Compliance';
import { CounterDesk } from './pages/CounterDesk';
import { AmbulanceFleet } from './pages/AmbulanceFleet';
import { LiveQueues } from './pages/LiveQueues';
import { HospitalList } from './pages/HospitalList';
import { HospitalDetail } from './pages/HospitalDetail';
import { LiveScanFeed } from './pages/LiveScanFeed';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { Heatmap } from './pages/Heatmap';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex min-w-0">
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-w-0">
            <Routes>
              {/* Vigilance & Oversight */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/doctor-performance" element={<DoctorPerformance />} />
              <Route path="/salary-bonus" element={<SalaryBonus />} />
              <Route path="/grievances" element={<Grievances />} />
              <Route path="/compliance" element={<Compliance />} />

              {/* Hospital Operations & Queues */}
              <Route path="/counter-desk" element={<CounterDesk />} />
              <Route path="/ambulance-fleet" element={<AmbulanceFleet />} />
              <Route path="/live-queues" element={<LiveQueues />} />
              <Route path="/live-scan-feed" element={<LiveScanFeed />} />
              <Route path="/hospitals" element={<HospitalList />} />
              <Route path="/hospital/:id" element={<HospitalDetail />} />

              {/* Analytics & Congestion Heatmap */}
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
