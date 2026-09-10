import React, { useState, useEffect } from 'react';
import { downloadTextFile } from '../lib/download';
import { 
  User, 
  Shield, 
  FileText, 
  Activity, 
  Heart, 
  CreditCard, 
  Clock, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Share2, 
  Eye, 
  Accessibility, 
  Languages, 
  Stethoscope, 
  Receipt, 
  Plus, 
  Calendar,
  Building2,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'tokens' | 'billing' | 'triage'>('personal');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [communicationNeeds, setCommunicationNeeds] = useState<string[]>(['Wheelchair Assistance']);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User Demographic & Profile State
  const [userProfile, setUserProfile] = useState({
    fullName: 'Aarav Sharma',
    dob: '1958-04-12',
    age: 68,
    gender: 'Male',
    maritalStatus: 'Married',
    bloodGroup: 'B+',
    phone: '+91 98765 43210',
    email: 'aarav.sharma58@gmail.com',
    aadhaarId: '982144321109',
    abhaId: 'ABHA-9821-4432-1109',
    address: 'Flat 402, Royal Palms, Sector 62, Noida, Uttar Pradesh - 201309',
    emergencyContact: {
      name: 'Rohan Sharma',
      relation: 'Son',
      phone: '+91 98112 88472',
      address: 'Sector 62, Noida'
    }
  });

  // Medical History State
  const [medicalHistory, setMedicalHistory] = useState({
    pastSurgeries: [
      { id: '1', procedure: 'Appendectomy (Laparoscopic)', year: '2018', hospital: 'Safdarjung Hospital, New Delhi' },
      { id: '2', procedure: 'Right Knee Arthroscopy', year: '2021', hospital: 'AIIMS New Delhi' }
    ],
    activeConditions: [
      { id: '1', condition: 'Essential Hypertension (Stage 1)', since: '2019', status: 'Managed (Amlodipine 5mg OD)' },
      { id: '2', condition: 'Type 2 Diabetes Mellitus', since: '2020', status: 'Controlled (Metformin 500mg BD)' }
    ],
    socialHistory: {
      smoking: 'Non-Smoker (Never smoked)',
      alcohol: 'Occasional (Social, <1 drink/month)',
      physicalActivity: 'Moderate (30 mins morning walking daily)',
      diet: 'Vegetarian (Low sodium, low glycemic index)',
      occupation: 'Retired Government Officer'
    },
    familyHistory: [
      { relation: 'Father', condition: 'Coronary Artery Disease & Stroke', riskLevel: 'High Risk' },
      { relation: 'Mother', condition: 'Type 2 Diabetes & Osteoarthritis', riskLevel: 'Moderate Risk' },
      { relation: 'Sibling (Brother)', condition: 'Hypertension', riskLevel: 'Moderate Risk' }
    ]
  });

  // Recent Token History State
  const recentTokens = [
    {
      tokenId: 'tok_01',
      tokenNumber: 'CARD-204',
      department: 'Cardiology & Heart Care',
      doctor: 'Dr. Rajesh Sharma',
      hospital: 'AIIMS New Delhi',
      chamber: 'Room 204 (1st Floor Wing B)',
      date: '06 Sep 2026',
      time: '10:30 AM',
      status: 'Active (Turn Soon)',
      priority: 'P2 - Senior Citizen',
      amountPaid: '₹50 (OPD Fee)'
    },
    {
      tokenId: 'tok_02',
      tokenNumber: 'GENM-102',
      department: 'General Medicine',
      doctor: 'Dr. Priya Patel',
      hospital: 'Safdarjung Multi-Speciality',
      chamber: 'Chamber 105',
      date: '28 Aug 2026',
      time: '11:15 AM',
      status: 'Completed',
      priority: 'P2 - Senior Citizen',
      amountPaid: '₹0 (PM-JAY Ayushman Cashless)'
    },
    {
      tokenId: 'tok_03',
      tokenNumber: 'ORTH-311',
      department: 'Orthopedics & Joint Care',
      doctor: 'Dr. Sandeep Mehta',
      hospital: 'AIIMS New Delhi',
      chamber: 'Chamber 312',
      date: '14 Jul 2026',
      time: '09:45 AM',
      status: 'Completed',
      priority: 'P2 - Senior Citizen',
      amountPaid: '₹50 (UPI GPay)'
    }
  ];

  // Billing & Invoices Data
  const billingRecords = [
    {
      invoiceNo: 'INV-2026-0906-01',
      date: '06 Sep 2026',
      service: 'Senior Specialist Cardiology Consultation (CARD-204)',
      provider: 'AIIMS New Delhi',
      amount: '₹50.00',
      status: 'Paid',
      method: 'UPI (Google Pay)',
      txnId: 'UPI-982144321109-0609'
    },
    {
      invoiceNo: 'INV-2026-0828-04',
      date: '28 Aug 2026',
      service: 'General Medicine Consultation & Comprehensive Blood Panel',
      provider: 'Safdarjung Hospital',
      amount: '₹450.00',
      status: 'Covered (Cashless)',
      method: 'Ayushman Bharat PM-JAY (AB-PMJAY-9821109)',
      txnId: 'PMJAY-CLAIM-2026-8819'
    },
    {
      invoiceNo: 'INV-2026-0714-12',
      date: '14 Jul 2026',
      service: 'Orthopedic Knee Joint Digital X-Ray (Bilateral)',
      provider: 'AIIMS Central Radiology',
      amount: '₹120.00',
      status: 'Paid',
      method: 'BHIM UPI QR',
      txnId: 'UPI-BHIM-7782190'
    }
  ];

  // Supported Indian Languages
  const languagesList = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('smartcare_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUserProfile(prev => ({
          ...prev,
          fullName: u.full_name || prev.fullName,
          phone: u.phone || prev.phone,
          aadhaarId: u.aadhaar_id || prev.aadhaarId,
          abhaId: u.abha_id || prev.abhaId,
          age: u.age || prev.age,
          gender: u.gender || prev.gender,
          address: u.address || prev.address
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleCommNeed = (need: string) => {
    setCommunicationNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 max-w-5xl mx-auto pb-32">
      {/* Top Profile Header Banner */}
      <header className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shrink-0">
              {userProfile.fullName ? userProfile.fullName[0] : 'A'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aadhaar Verified Citizen
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  Senior Citizen (Age 68)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {userProfile.fullName}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                ABHA ID: <strong className="text-slate-800">{userProfile.abhaId}</strong> • Aadhaar: <strong className="text-slate-800">XXXX-XXXX-{userProfile.aadhaarId.slice(-4)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/triage"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Launch AI Triage</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-100 mt-6 no-scrollbar">
          {[
            { id: 'personal', label: 'Personal & Language Info', icon: User },
            { id: 'medical', label: 'Full Medical History', icon: Stethoscope },
            { id: 'tokens', label: 'Recent Token History', icon: Clock },
            { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
            { id: 'triage', label: 'AI Triage Hub', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile changes and language preferences saved successfully to your Digital Health Record!</span>
        </div>
      )}

      {/* Tab 1: Personal Info & Language Preferences */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Language & Special Communication Needs */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Languages className="w-4 h-4 text-blue-600" />
                  <span>1. Preferred Communication Language (11 Languages)</span>
                </span>
                <span className="text-[11px] text-slate-500">Government Portal Localization</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.name)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      selectedLanguage === lang.name
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="block font-bold text-xs">{lang.native}</span>
                    <span className="text-[10px] text-slate-500">{lang.name}</span>
                  </button>
                ))}
              </div>

              {/* Special Communication Needs */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                  <Accessibility className="w-4 h-4 text-purple-600" />
                  <span>Special Hospital Assistance & Accessibility Accommodations:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Wheelchair Assistance at Entry',
                    'Sign Language Interpreter',
                    'Braille / Audio Guidance',
                    'Elderly OPD Escort Volunteer',
                    'Stretcher Access'
                  ].map((need) => {
                    const isSelected = communicationNeeds.includes(need);
                    return (
                      <button
                        key={need}
                        type="button"
                        onClick={() => toggleCommNeed(need)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{need}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Basic Demographic Information */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>2. Basic Patient Details (Aadhaar Auto-Derived)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={userProfile.fullName}
                    onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={userProfile.dob}
                    onChange={(e) => setUserProfile({ ...userProfile, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Age & Gender</label>
                  <input
                    type="text"
                    readOnly
                    value={`${userProfile.age} Years • ${userProfile.gender}`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={userProfile.bloodGroup}
                    onChange={(e) => setUserProfile({ ...userProfile, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Marital Status</label>
                  <input
                    type="text"
                    value={userProfile.maritalStatus}
                    onChange={(e) => setUserProfile({ ...userProfile, maritalStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Aadhaar (UIDAI Verified)</label>
                  <input
                    type="text"
                    readOnly
                    value={`XXXX-XXXX-${userProfile.aadhaarId.slice(-4)}`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-800 bg-emerald-50/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Contact Phone</label>
                  <input
                    type="text"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Permanent Residential Address</label>
                <input
                  type="text"
                  value={userProfile.address}
                  onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Emergency Contact Information */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>3. Emergency Contact (Next of Kin)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={userProfile.emergencyContact.name}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      emergencyContact: { ...userProfile.emergencyContact, name: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={userProfile.emergencyContact.relation}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      emergencyContact: { ...userProfile.emergencyContact, relation: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Phone Number</label>
                  <input
                    type="text"
                    value={userProfile.emergencyContact.phone}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      emergencyContact: { ...userProfile.emergencyContact, phone: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md transition text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Profile & Language Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Full Medical History (Past, Active, Social, Family) */}
      {activeTab === 'medical' && (
        <div className="space-y-6">
          {/* Section 1: Past Medical & Surgical History */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>1. Past Medical & Surgical History</span>
              </span>
              <span className="text-[11px] text-slate-500">Hospitalizations & Procedures</span>
            </div>

            <div className="divide-y divide-slate-100">
              {medicalHistory.pastSurgeries.map((surg) => (
                <div key={surg.id} className="py-3 flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-slate-900 block">{surg.procedure}</strong>
                    <span className="text-[11px] text-slate-500">{surg.hospital}</span>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    Year: {surg.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Current Active Health Conditions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>2. Current Active Health Conditions & Medications</span>
              </span>
              <span className="text-[11px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                Active Monitoring
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {medicalHistory.activeConditions.map((cond) => (
                <div key={cond.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-xs text-slate-900 block">{cond.condition}</strong>
                    <span className="text-[11px] text-slate-500">Diagnosed: {cond.since}</span>
                  </div>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-xl">
                    {cond.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Social History (Lifestyle, Habits) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>3. Social & Lifestyle History</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Smoking Status</span>
                <strong className="text-slate-800">{medicalHistory.socialHistory.smoking}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Alcohol Consumption</span>
                <strong className="text-slate-800">{medicalHistory.socialHistory.alcohol}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Physical Activity</span>
                <strong className="text-slate-800">{medicalHistory.socialHistory.physicalActivity}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Dietary Pattern</span>
                <strong className="text-slate-800">{medicalHistory.socialHistory.diet}</strong>
              </div>
            </div>
          </div>

          {/* Section 4: Family Medical History (Genetic Risk) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>4. Family Medical History (Genetic Predisposition)</span>
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {medicalHistory.familyHistory.map((fam, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block">{fam.relation}</strong>
                    <span className="text-slate-500">{fam.condition}</span>
                  </div>
                  <span className={`font-bold px-2.5 py-0.5 rounded-md border text-[10px] ${
                    fam.riskLevel === 'High Risk' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {fam.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Recent Token History */}
      {activeTab === 'tokens' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">OPD Pass History</span>
                <h3 className="text-base font-bold text-slate-900">Your Recent Consultation Tokens</h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
                Total Visits: {recentTokens.length}
              </span>
            </div>

            <div className="space-y-3">
              {recentTokens.map((tok) => (
                <div
                  key={tok.tokenId}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shrink-0">
                      {tok.tokenNumber}
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">{tok.department}</strong>
                      <span className="text-slate-500 block">{tok.doctor} • {tok.hospital}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{tok.chamber}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block ${
                      tok.status.includes('Active')
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}>
                      {tok.status}
                    </span>
                    <p className="text-[11px] text-slate-500">{tok.date} at {tok.time}</p>
                    <p className="text-[11px] font-semibold text-blue-700">{tok.amountPaid}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Billing Data & Invoices */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Financial Records</span>
                <h3 className="text-base font-bold text-slate-900">OPD Consultation & Diagnostic Invoices</h3>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                Ayushman PM-JAY Linked
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {billingRecords.map((rec) => (
                <div key={rec.invoiceNo} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-bold">{rec.service}</strong>
                      <span className="font-mono text-[10px] text-slate-400">#{rec.invoiceNo}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{rec.provider} • Date: {rec.date}</p>
                    <span className="text-[10px] font-mono text-slate-400">Txn: {rec.txnId} ({rec.method})</span>
                  </div>

                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <div>
                      <strong className="text-base font-black text-slate-900">{rec.amount}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ml-2 sm:ml-0 sm:block sm:mt-0.5 ${
                        rec.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadTextFile(`${rec.invoiceNo}-invoice.txt`, `SmartCare invoice\nInvoice: ${rec.invoiceNo}\nDate: ${rec.date}\nService: ${rec.service}\nAmount: ${rec.amount}`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg transition text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Dedicated AI Triage Hub (Integrated in Profile) */}
      {activeTab === 'triage' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Smart OPD Triage & Specialty Matcher</h3>
              <p className="text-xs text-slate-500">Access full 100+ symptoms assessment, priority calculator, and auto-triage.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            Your verified demographic priority (<strong>Senior Citizen Age 68</strong>) will be automatically attached to your clinical assessment score to assign your priority OPD token.
          </div>

          <a
            href="/triage"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-md transition text-xs flex items-center justify-center gap-2"
          >
            <span>Open Comprehensive AI Triage Page</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
