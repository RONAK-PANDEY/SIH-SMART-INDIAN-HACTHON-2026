import { useState } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  abhaId?: string;
  role: 'patient' | 'doctor' | 'admin';
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>({
    id: 'usr-109283',
    name: 'Rohan Sharma',
    phone: '+919876543210',
    abhaId: '12-3456-7890-1234',
    role: 'patient',
  });

  const login = (token: string, profile: UserProfile) => {
    localStorage.setItem('smartcare_token', token);
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('smartcare_token');
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
}
