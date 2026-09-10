import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GovtAdminLanding } from './pages/GovtAdminLanding';
import { DoctorPanel } from './pages/DoctorPanel';
import { LiveQueues } from './pages/LiveQueues';
import { CounterDesk } from './pages/CounterDesk';
import { AmbulanceFleet } from './pages/AmbulanceFleet';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Auth guard component — redirects to /login if not authenticated
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('smartcare_staff') || localStorage.getItem('smartcare_auth');

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Full screen Government Staff Gateway / Login */}
        <Route path="/gateway" element={<GovtAdminLanding />} />
        <Route path="/login" element={<GovtAdminLanding />} />

        {/* Doctor Consultation Console Layout — Protected */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <Header />
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<DoctorPanel />} />
                      <Route path="/doctor-panel" element={<DoctorPanel />} />
                      <Route path="/live-queues" element={<LiveQueues />} />
                      <Route path="/counter-desk" element={<CounterDesk />} />
                      <Route path="/ambulance-fleet" element={<AmbulanceFleet />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
