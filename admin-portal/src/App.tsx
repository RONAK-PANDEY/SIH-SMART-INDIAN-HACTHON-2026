import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GovtAdminLanding } from './pages/GovtAdminLanding';
import { DoctorPanel } from './pages/DoctorPanel';
import { Dashboard } from './pages/Dashboard';
import { Hospitals } from './pages/Hospitals';
import { Patients } from './pages/Patients';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<GovtAdminLanding />} />
        <Route path="/gateway" element={<GovtAdminLanding />} />
        
        {/* Full-screen admin views (Sidebar built-in) */}
        <Route path="/doctor-panel" element={<DoctorPanel />} />
        <Route path="/admin-dashboard" element={<Dashboard />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/patients" element={<Patients />} />
        
        <Route path="/" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

