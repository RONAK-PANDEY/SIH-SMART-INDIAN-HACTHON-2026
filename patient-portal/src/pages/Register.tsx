import React, { useState } from 'react';
import { User, Phone, Shield, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({ fullName: '', phone: '', abhaId: '', age: '', gender: 'male' });
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-800 text-center">Patient Registration</h2>
        <form className="space-y-4 mt-4">
          <input type="text" placeholder="Full Name" className="w-full p-2.5 border rounded-xl" />
          <input type="tel" placeholder="Phone Number" className="w-full p-2.5 border rounded-xl" />
          <input type="text" placeholder="ABHA Health ID" className="w-full p-2.5 border rounded-xl" />
          <a href="/hospital-select" className="block text-center w-full bg-blue-600 text-white font-semibold py-3 rounded-xl">Continue</a>
        </form>
      </div>
    </div>
  );
};
