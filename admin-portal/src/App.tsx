import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GovtAdminLanding } from './pages/GovtAdminLanding';
import { DoctorPanel } from './pages/DoctorPanel';
import { LiveQueues } from './pages/LiveQueues';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Full screen Government Staff Gateway */}
        <Route path="/gateway" element={<GovtAdminLanding />} />
        <Route path="/login" element={<GovtAdminLanding />} />

        {/* Doctor Consultation Console Layout */}
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<DoctorPanel />} />
                    <Route path="/doctor-panel" element={<DoctorPanel />} />
                    <Route path="/live-queues" element={<LiveQueues />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
