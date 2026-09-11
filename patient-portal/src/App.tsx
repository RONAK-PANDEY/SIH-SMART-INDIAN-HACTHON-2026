import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GovtLanding } from './pages/GovtLanding';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { HospitalSelect } from './pages/HospitalSelect';
import { Triage } from './pages/Triage';
import { BookAppointment } from './pages/BookAppointment';
import { MyToken } from './pages/MyToken';
import { LiveQueue } from './pages/LiveQueue';
import { HealthRecords } from './pages/HealthRecords';
import { Ambulance } from './pages/Ambulance';
import { Referral } from './pages/Referral';
import { Profile } from './pages/Profile';
import { AppointmentManagement } from './pages/AppointmentManagement';
import { Feedback } from './pages/Feedback';
import { Navbar } from './components/Navbar';
import { ChatbotWidget } from './components/ChatbotWidget';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './context/ThemeContext';

const PortalRoutes: React.FC = () => {
  const { pathname } = useLocation();
  const usesDedicatedNavigation = pathname === '/dashboard';

  return (
    <div className="font-sans antialiased min-h-screen bg-slate-50">
      <Routes>
            <Route path="/" element={<GovtLanding />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hospital-select" element={<HospitalSelect />} />
            <Route path="/triage" element={<Triage />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/my-token" element={<MyToken />} />
            <Route path="/live-queue" element={<LiveQueue />} />
            <Route path="/health-records" element={<HealthRecords />} />
            <Route path="/ambulance" element={<Ambulance />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/appointment-management" element={<AppointmentManagement />} />
            <Route path="/feedback" element={<Feedback />} />
      </Routes>
      {!usesDedicatedNavigation && <Navbar />}
      <ChatbotWidget />
    </div>
  );
};

export const App: React.FC = () => (
  <I18nProvider>
    <ThemeProvider>
      <Router>
        <PortalRoutes />
      </Router>
    </ThemeProvider>
  </I18nProvider>
);

export default App;
