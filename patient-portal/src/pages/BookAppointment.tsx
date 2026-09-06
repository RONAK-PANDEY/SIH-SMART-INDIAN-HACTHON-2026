import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Activity,
  QrCode,
  Wallet,
  Landmark,
  Banknote,
  HeartPulse,
  Stethoscope,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useTranslation, LanguageSwitcherPill } from '../i18n';

export const BookAppointment: React.FC = () => {
  const { t } = useTranslation();
  const [selectedHospital, setSelectedHospital] = useState('hosp-aiims-delhi');
  const [selectedDept, setSelectedDept] = useState('dept-cardio');
  const [selectedDate, setSelectedDate] = useState('2026-09-06');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [complaint, setComplaint] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'pmjay' | 'netbanking' | 'card' | 'counter'>('upi');
  const [selectedProblemCard, setSelectedProblemCard] = useState<string | null>('cardio');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<any>(null);

  // Common Problem Types for Direct Department Recommender
  const problemRecommendations = [
    {
      id: 'cardio',
      icon: HeartPulse,
      title: 'Chest Pain / Palpitations / High BP',
      deptId: 'dept-cardio',
      deptName: 'Cardiology & Heart Care',
      doctor: 'Dr. Rajesh Sharma',
      wait: '8 mins',
      color: 'bg-rose-50 border-rose-300 text-rose-950'
    },
    {
      id: 'pulmo',
      icon: Activity,
      title: 'Shortness of Breath / Asthma / Severe Cough',
      deptId: 'dept-pulmo',
      deptName: 'Pulmonology / Chest Clinic',
      doctor: 'Dr. Anil Saxena',
      wait: '12 mins',
      color: 'bg-blue-50 border-blue-300 text-blue-950'
    },
    {
      id: 'ortho',
      icon: Stethoscope,
      title: 'Bone Fracture / Knee & Joint Pain',
      deptId: 'dept-ortho',
      deptName: 'Orthopedics & Joint Replacement',
      doctor: 'Dr. Sandeep Mehta',
      wait: '10 mins',
      color: 'bg-amber-50 border-amber-300 text-amber-950'
    },
    {
      id: 'gastro',
      icon: Activity,
      title: 'Stomach Pain / Acidity / Jaundice / Vomiting',
      deptId: 'dept-gastro',
      deptName: 'Gastroenterology & Liver',
      doctor: 'Dr. Manish Gupta',
      wait: '15 mins',
      color: 'bg-emerald-50 border-emerald-300 text-emerald-950'
    },
    {
      id: 'gynae',
      icon: HeartPulse,
      title: 'Pregnancy Care / Maternal Health / Periods',
      deptId: 'dept-gynae',
      deptName: 'Gynecology & Maternity',
      doctor: 'Dr. Neha Kapoor',
      wait: '9 mins',
      color: 'bg-pink-50 border-pink-300 text-pink-950'
    },
    {
      id: 'pedia',
      icon: Activity,
      title: 'Child Health / Infant Fever / Vaccines',
      deptId: 'dept-pedia',
      deptName: 'Pediatrics / Child Health',
      doctor: 'Dr. Rakesh Goyal',
      wait: '7 mins',
      color: 'bg-purple-50 border-purple-300 text-purple-950'
    },
    {
      id: 'neuro',
      icon: Activity,
      title: 'Severe Headache / Dizziness / Stroke Signs',
      deptId: 'dept-neuro',
      deptName: 'Neurology & Brain Sciences',
      doctor: 'Dr. Sunita Rao',
      wait: '14 mins',
      color: 'bg-indigo-50 border-indigo-300 text-indigo-950'
    },
    {
      id: 'genmed',
      icon: Stethoscope,
      title: 'General Fever / Weakness / Diabetes Refill',
      deptId: 'dept-genmed',
      deptName: 'General & Internal Medicine',
      doctor: 'Dr. Priya Patel',
      wait: '10 mins',
      color: 'bg-slate-50 border-slate-300 text-slate-950'
    }
  ];

  const hospitals = [
    { id: 'hosp-aiims-delhi', name: 'AIIMS New Delhi (Apex Center)', wait: '25m' },
    { id: 'hosp-safdarjung', name: 'Safdarjung Multi-Speciality Hospital', wait: '15m' },
    { id: 'hosp-ram-manohar-lohia', name: 'Dr. RML Hospital', wait: '18m' },
    { id: 'hosp-gtb-hospital', name: 'GTB Hospital Dilshad Garden', wait: '12m' }
  ];

  const departments = [
    { id: 'dept-cardio', name: 'Cardiology & Heart Care', doctor: 'Dr. Rajesh Sharma', fee: '₹50' },
    { id: 'dept-pulmo', name: 'Pulmonology / Chest', doctor: 'Dr. Anil Saxena', fee: '₹50' },
    { id: 'dept-neuro', name: 'Neurology / Brain Care', doctor: 'Dr. Sunita Rao', fee: '₹50' },
    { id: 'dept-ortho', name: 'Orthopedics & Joint Care', doctor: 'Dr. Sandeep Mehta', fee: '₹50' },
    { id: 'dept-gastro', name: 'Gastroenterology', doctor: 'Dr. Manish Gupta', fee: '₹50' },
    { id: 'dept-gynae', name: 'Gynecology & Maternity', doctor: 'Dr. Neha Kapoor', fee: '₹50' },
    { id: 'dept-pedia', name: 'Pediatrics / Child Care', doctor: 'Dr. Rakesh Goyal', fee: '₹50' },
    { id: 'dept-genmed', name: 'General Medicine OPD', doctor: 'Dr. Priya Patel', fee: '₹30' }
  ];

  const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM'];

  const handleSelectProblem = (prob: typeof problemRecommendations[0]) => {
    setSelectedProblemCard(prob.id);
    setSelectedDept(prob.deptId);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = departments.find(d => d.id === selectedDept) || departments[0];
    const hospObj = hospitals.find(h => h.id === selectedHospital) || hospitals[0];
    
    const prefix = deptObj.id.replace('dept-', '').toUpperCase().slice(0, 4);
    const newTokenNumber = `${prefix}-${Math.floor(200 + Math.random() * 100)}`;

    const tokenObj = {
      tokenId: `tok_${Date.now()}`,
      tokenNumber: newTokenNumber,
      patientName: 'Aarav Sharma',
      age: 68,
      gender: 'Male',
      department: deptObj.name,
      doctor: deptObj.doctor,
      hospital: hospObj.name,
      chamber: `Chamber Room ${Math.floor(100 + Math.random() * 300)} (Wing B)`,
      date: selectedDate,
      time: selectedSlot,
      slotTime: `${selectedSlot} - 30 Mins`,
      queuePosition: 2,
      estimatedWaitMins: 8,
      priorityTag: 'P2 - Senior Citizen Accelerated Pass',
      feeStatus: paymentMethod === 'pmjay' ? 'Covered (PM-JAY Cashless ₹0)' : `Paid (${deptObj.fee} via ${paymentMethod.toUpperCase()})`,
      paymentMethod: paymentMethod,
      timestamp: new Date().toLocaleTimeString()
    };

    // Save to localStorage allotted tokens history
    const existingTokens = JSON.parse(localStorage.getItem('smartcare_allotted_tokens') || '[]');
    localStorage.setItem('smartcare_allotted_tokens', JSON.stringify([tokenObj, ...existingTokens]));
    localStorage.setItem('smartcare_current_token', JSON.stringify(tokenObj));

    setGeneratedToken(tokenObj);
    setBookingSuccess(true);
  };

  const currentDeptObj = departments.find(d => d.id === selectedDept) || departments[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 max-w-3xl mx-auto pb-32">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pt-2">
        <div>
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-2 border border-blue-200">
            <Calendar className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">{t('book_token')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Smart OPD Chamber Pass
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('select_problem')}
          </p>
        </div>

        <LanguageSwitcherPill />
      </header>

      {bookingSuccess && generatedToken ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ OPD Pass Allotted
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">{generatedToken.tokenNumber}</h2>
            <p className="text-xs text-slate-500">{generatedToken.department} • {generatedToken.doctor}</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 font-mono text-left max-w-sm mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Hospital:</span>
              <strong className="text-slate-800">{generatedToken.hospital}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Slot:</span>
              <strong className="text-slate-800">{generatedToken.date} ({generatedToken.time})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Billing:</span>
              <strong className="text-emerald-700">{generatedToken.feeStatus}</strong>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <a
              href="/my-token"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Open Scannable QR Pass</span>
            </a>
            <a
              href="/health-records"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md transition"
            >
              <span>View Health Records & Billing</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBook} className="space-y-6">
          {/* Section 1: Direct Department Recommender Matrix */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1. Direct Department Recommender (Click Your Problem)</span>
              </span>
              <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
                Instant 1-Click Match
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {problemRecommendations.map((prob) => {
                const Icon = prob.icon;
                const isSelected = selectedDept === prob.deptId;
                return (
                  <button
                    key={prob.id}
                    type="button"
                    onClick={() => handleSelectProblem(prob)}
                    className={`p-3.5 rounded-2xl border text-left text-xs transition flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-1 ring-blue-400'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <strong className="text-xs text-slate-900 block leading-snug">{prob.title}</strong>
                      <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
                        → {prob.deptName}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{prob.doctor} • Est: {prob.wait}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Hospital, Date & Time Slot */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>2. Target Hospital & Preferred Chamber Slot</span>
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Hospital</label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} (Avg Wait: ~{h.wait})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Available Chamber Slots</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`py-2 rounded-xl border text-[11px] font-bold transition ${
                        selectedSlot === s
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Options Drawer */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>3. Select Payment Gateway (OPD Fee: {currentDeptObj.fee})</span>
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Encrypted & Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3.5 rounded-2xl border text-left text-xs transition flex flex-col justify-between ${
                  paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <strong className="text-xs">UPI / Dynamic QR</strong>
                </div>
                <span className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</span>
              </button>

              {/* PM-JAY Ayushman */}
              <button
                type="button"
                onClick={() => setPaymentMethod('pmjay')}
                className={`p-3.5 rounded-2xl border text-left text-xs transition flex flex-col justify-between ${
                  paymentMethod === 'pmjay'
                    ? 'border-emerald-600 bg-emerald-50/90 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <strong className="text-xs">Ayushman PM-JAY</strong>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold">100% Cashless Coverage (₹0)</span>
              </button>

              {/* Net Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3.5 rounded-2xl border text-left text-xs transition flex flex-col justify-between ${
                  paymentMethod === 'netbanking'
                    ? 'border-indigo-600 bg-indigo-50/90 text-indigo-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Landmark className="w-4 h-4 text-indigo-600" />
                  <strong className="text-xs">Net Banking</strong>
                </div>
                <span className="text-[10px] text-slate-500">SBI, HDFC, ICICI, PNB</span>
              </button>

              {/* Cards */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border text-left text-xs transition flex flex-col justify-between ${
                  paymentMethod === 'card'
                    ? 'border-purple-600 bg-purple-50/90 text-purple-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <strong className="text-xs">Debit / Credit Card</strong>
                </div>
                <span className="text-[10px] text-slate-500">RuPay, Visa, Mastercard</span>
              </button>

              {/* Counter Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('counter')}
                className={`p-3.5 rounded-2xl border text-left text-xs transition flex flex-col justify-between sm:col-span-2 ${
                  paymentMethod === 'counter'
                    ? 'border-amber-600 bg-amber-50/90 text-amber-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <strong className="text-xs">Pay Cash at Hospital Counter</strong>
                </div>
                <span className="text-[10px] text-slate-500">Pay directly when collecting thermal physical slip</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black py-4 rounded-3xl shadow-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirm Booking & Generate Smart Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
