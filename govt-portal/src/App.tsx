import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const DoctorPerformance = lazy(() => import('./pages/DoctorPerformance').then((module) => ({ default: module.DoctorPerformance })));
const SalaryBonus = lazy(() => import('./pages/SalaryBonus').then((module) => ({ default: module.SalaryBonus })));
const Grievances = lazy(() => import('./pages/Grievances').then((module) => ({ default: module.Grievances })));
const Compliance = lazy(() => import('./pages/Compliance').then((module) => ({ default: module.Compliance })));
const CounterDesk = lazy(() => import('./pages/CounterDesk').then((module) => ({ default: module.CounterDesk })));
const AmbulanceFleet = lazy(() => import('./pages/AmbulanceFleet').then((module) => ({ default: module.AmbulanceFleet })));
const LiveQueues = lazy(() => import('./pages/LiveQueues').then((module) => ({ default: module.LiveQueues })));
const HospitalList = lazy(() => import('./pages/HospitalList').then((module) => ({ default: module.HospitalList })));
const HospitalDetail = lazy(() => import('./pages/HospitalDetail').then((module) => ({ default: module.HospitalDetail })));
const LiveScanFeed = lazy(() => import('./pages/LiveScanFeed').then((module) => ({ default: module.LiveScanFeed })));
const Analytics = lazy(() => import('./pages/Analytics').then((module) => ({ default: module.Analytics })));
const Alerts = lazy(() => import('./pages/Alerts').then((module) => ({ default: module.Alerts })));
const Heatmap = lazy(() => import('./pages/Heatmap').then((module) => ({ default: module.Heatmap })));

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex min-w-0">
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-w-0">
            <Suspense fallback={<div className="p-8 text-sm text-slate-500" role="status">Loading workspace…</div>}>
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
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
