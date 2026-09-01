import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { HospitalSelect } from './pages/HospitalSelect';
import { Triage } from './pages/Triage';
import { BookAppointment } from './pages/BookAppointment';
import { MyToken } from './pages/MyToken';
import { LiveQueue } from './pages/LiveQueue';
import { Referral } from './pages/Referral';
import { Profile } from './pages/Profile';
import { Navbar } from './components/Navbar';
import { I18nProvider } from './i18n';

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <Router>
        <div className="font-sans antialiased min-h-screen bg-slate-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hospital-select" element={<HospitalSelect />} />
            <Route path="/triage" element={<Triage />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/my-token" element={<MyToken />} />
            <Route path="/live-queue" element={<LiveQueue />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Navbar />
        </div>
      </Router>
    </I18nProvider>
  );
};

export default App;
