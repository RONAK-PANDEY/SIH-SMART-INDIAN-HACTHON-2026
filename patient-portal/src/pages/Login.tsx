import React, { useState } from 'react';
import { Shield, Lock, Phone, ArrowRight, UserCheck, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { API_V1_URL } from '../lib/api';

export const Login: React.FC = () => {
  const [authMode, setAuthMode] = useState<'aadhaar' | 'abha' | 'phone'>('phone');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoCitizens = [
    {
      phone: '9821443211',
      name: 'Aarav Sharma',
      tag: 'Senior Citizen (68 yrs)',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      abha: 'ABHA-9821-4432-1109',
      is_senior: true,
      is_pregnant: false,
      is_pwd: false
    },
    {
      phone: '8842109532',
      name: 'Pooja Verma',
      tag: 'Maternity / Pregnant (30 yrs)',
      badge: 'bg-pink-100 text-pink-800 border-pink-300',
      abha: 'ABHA-8842-1095-3218',
      is_senior: false,
      is_pregnant: true,
      is_pwd: false
    },
    {
      phone: '7719230485',
      name: 'Rohan Deshmukh',
      tag: 'Person with Disability / PwD (33 yrs)',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      abha: 'ABHA-7719-2304-8512',
      is_senior: false,
      is_pregnant: false,
      is_pwd: true
    },
    {
      phone: '9876543210',
      name: 'Meera Nair',
      tag: 'General Patient (28 yrs)',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      abha: 'ABHA-6630-1948-2751',
      is_senior: false,
      is_pregnant: false,
      is_pwd: false
    }
  ];

  const handleLogin = async (e: React.FormEvent, customPhone?: string, customName?: string, customCitizen?: any) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const targetPhone = customPhone || phone;
    try {
      const resp = await fetch(`${API_V1_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          password: password || 'Password123!'
        })
      });

      const data = await resp.json();

      if (resp.ok && data.access_token) {
        localStorage.setItem('smartcare_token', data.access_token);
        const citizenObj = customCitizen || demoCitizens.find(d => d.phone === targetPhone) || {
          phone: targetPhone,
          name: data.name || customName || 'Verified Patient',
          full_name: data.name || customName || 'Verified Patient',
          abha_id: `ABHA-${targetPhone.slice(-4)}-2026`,
          age: 35,
          gender: 'Male',
          is_senior: false,
          is_pregnant: false,
          is_pwd: false
        };

        localStorage.setItem('smartcare_user', JSON.stringify({
          id: data.user_id || `usr_${targetPhone.slice(-6)}`,
          phone: targetPhone,
          full_name: citizenObj.name || citizenObj.full_name || 'Verified Patient',
          abha_id: citizenObj.abha || citizenObj.abha_id || 'ABHA-9821-4432-1109',
          age: citizenObj.age || 35,
          gender: citizenObj.gender || 'Male',
          is_senior: !!citizenObj.is_senior,
          is_pregnant: !!citizenObj.is_pregnant,
          is_pwd: !!citizenObj.is_pwd
        }));

        window.location.href = '/dashboard';
      } else {
        setError(data.detail || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('We could not reach the hospital service. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (citizen: typeof demoCitizens[0]) => {
    setPhone(citizen.phone);
    handleLogin(null as any, citizen.phone, citizen.name, citizen);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pb-24">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Digital Health Mission (Real Backend JWT Auth)</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Patient Portal Login</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to book real OPD tokens, generate QR passes, and track queue live.
          </p>
        </div>

        {/* 1-Click Demo Profiles for Quick Evaluation */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Real Auth Personas:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoCitizens.map((item) => (
              <button
                key={item.phone}
                type="button"
                onClick={() => handleSelectDemoUser(item)}
                className="p-2.5 rounded-lg border text-left text-xs transition flex flex-col justify-between border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
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

        {/* Login Form */}
        <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Mobile Number (or Patient ID)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating with Backend...' : (
              <>
                <span>Sign In to Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Need to create a new registration?{' '}
            <a href="/register" className="text-blue-600 font-bold hover:underline">
              Register New Patient
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
