import React, { useState } from 'react';
import { Shield, Lock, Phone, ArrowRight, UserCheck, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [authMode, setAuthMode] = useState<'aadhaar' | 'abha' | 'phone'>('aadhaar');
  const [identifier, setIdentifier] = useState('982144321109');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoCitizens = [
    {
      id: '982144321109',
      name: 'Aarav Sharma',
      tag: 'Senior Citizen (68 yrs)',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      abha: 'ABHA-9821-4432-1109'
    },
    {
      id: '884210953218',
      name: 'Pooja Verma',
      tag: 'Maternity / Pregnant (30 yrs)',
      badge: 'bg-pink-100 text-pink-800 border-pink-300',
      abha: 'ABHA-8842-1095-3218'
    },
    {
      id: '771923048512',
      name: 'Rohan Deshmukh',
      tag: 'Person with Disability / PwD (33 yrs)',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      abha: 'ABHA-7719-2304-8512'
    },
    {
      id: '663019482751',
      name: 'Meera Nair',
      tag: 'General Patient (28 yrs)',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      abha: 'ABHA-6630-1948-2751'
    }
  ];

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/triage/auth/aadhaar/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_or_phone: identifier })
      });
      const data = await resp.json();
      if (data.status === 'success') {
        setStep('otp');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      // Fallback for demo simulation
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/triage/auth/aadhaar/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_or_phone: identifier, otp: otp })
      });
      const data = await resp.json();
      if (data.status === 'authenticated') {
        localStorage.setItem('smartcare_user', JSON.stringify(data.citizen_data));
        window.location.href = '/dashboard';
      } else {
        setError('Invalid OTP. Use demo OTP: 123456');
      }
    } catch (err) {
      // Fallback demo storage
      const demoUser = demoCitizens.find(d => d.id === identifier) || demoCitizens[0];
      localStorage.setItem('smartcare_user', JSON.stringify({
        aadhaar_id: demoUser.id,
        abha_id: demoUser.abha,
        full_name: demoUser.name,
        age: demoUser.id === '982144321109' ? 68 : 30,
        is_senior: demoUser.id === '982144321109',
        is_pregnant: demoUser.id === '884210953218',
        is_pwd: demoUser.id === '771923048512',
        phone: '+91 98765 43210',
        gender: 'Male',
        address: 'Noida, UP - 201309'
      }));
      window.location.href = '/dashboard';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pb-24">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Govt. Digital Health Mission (ABHA & Aadhaar e-KYC Demo)</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Patient Portal Login</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in securely using Aadhaar, ABHA Health ID or Mobile to manage tokens & live queue triage.
          </p>
        </div>

        {/* Auth Method Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode('aadhaar'); setStep('input'); }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              authMode === 'aadhaar' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aadhaar UIDAI
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('abha'); setStep('input'); }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              authMode === 'abha' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ABHA Health ID
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('phone'); setStep('input'); }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              authMode === 'phone' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mobile OTP
          </button>
        </div>

        {/* 1-Click Demo Profiles for Quick Evaluation */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Demo Personas (Auto-Priority):</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoCitizens.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setIdentifier(item.id); setStep('input'); }}
                className={`p-2 rounded-lg border text-left text-xs transition flex flex-col justify-between ${
                  identifier === item.id ? 'border-blue-500 bg-blue-50/70 font-semibold' : 'border-slate-200 bg-white hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-slate-800">{item.name}</span>
                  {identifier === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border mt-1 w-fit ${item.badge}`}>
                  {item.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Input Identifier */}
        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {authMode === 'aadhaar' ? 'Enter 12-Digit Aadhaar Number' : authMode === 'abha' ? 'Enter ABHA Health Address' : 'Enter 10-Digit Mobile Number'}
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authMode === 'aadhaar' ? '9821 4432 1109' : authMode === 'abha' ? 'ABHA-9821-4432-1109' : '+91 98765 43210'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending OTP...' : (
                <>
                  <span>Send Demo Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Enter OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span className="font-bold">Simulated OTP Sent!</span>
              <p className="mt-0.5">Use demo code <strong>123456</strong> to complete instant verification.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">6-Digit OTP</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-base font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-xs"
              >
                Change ID
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Open Dashboard</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            First time user without Aadhaar?{' '}
            <a href="/register" className="text-blue-600 font-bold hover:underline">
              Create Manual Registration
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
