import React, { useState } from 'react';
import { User, Phone, Shield, ArrowRight, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    abhaId: '',
    age: '',
    gender: 'male',
    address: '',
    isSenior: false,
    isPregnant: false,
    isPwd: false
  });

  const handleFetchAadhaarDemo = () => {
    setFormData({
      fullName: 'Aarav Sharma',
      phone: '+91 98765 43210',
      abhaId: 'ABHA-9821-4432-1109',
      age: '68',
      gender: 'male',
      address: 'Flat 402, Royal Palms, Sector 62, Noida, UP - 201309',
      isSenior: true,
      isPregnant: false,
      isPwd: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userObj = {
      ...formData,
      age: parseInt(formData.age) || 30,
      is_senior: formData.isSenior || (parseInt(formData.age) >= 60),
      is_pregnant: formData.isPregnant,
      is_pwd: formData.isPwd
    };
    localStorage.setItem('smartcare_user', JSON.stringify(userObj));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pb-24">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">New Patient Registration</h2>
          <p className="text-xs text-slate-500 mt-1">Connect your ABHA ID or mobile number for instant smart OPD queue passes</p>
        </div>

        {/* 1-Click Fast Pre-fill Demo */}
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-900 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Quick Fill</span>
            </span>
            <span className="text-[11px] text-blue-700">Pre-fill profile & priority data from Aadhaar</span>
          </div>
          <button
            type="button"
            onClick={handleFetchAadhaarDemo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-xs"
          >
            Load Demo Data
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Aarav Sharma"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  age: e.target.value,
                  isSenior: parseInt(e.target.value) >= 60
                })}
                placeholder="68"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ABHA Health ID (Optional)</label>
            <input
              type="text"
              value={formData.abhaId}
              onChange={(e) => setFormData({ ...formData, abhaId: e.target.value })}
              placeholder="ABHA-9821-4432-1109"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Sector 62, Noida, UP"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority Criteria Checkboxes */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-700 uppercase mb-2">Government Priority Categories:</span>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isSenior}
                  onChange={(e) => setFormData({ ...formData, isSenior: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Senior Citizen (Age 60+)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isPregnant}
                  onChange={(e) => setFormData({ ...formData, isPregnant: e.target.checked })}
                  className="rounded text-pink-600"
                />
                <span>Pregnant Lady (Maternal Care)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isPwd}
                  onChange={(e) => setFormData({ ...formData, isPwd: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <span>Person with Disability (PwD)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Complete Registration & Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
