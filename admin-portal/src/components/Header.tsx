import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Critical Patient Alert',
      message: 'Token CARD-205 (Vikram Malhotra) flagged as P1 EMERGENCY — Troponin I elevated.',
      time: '2 min ago',
      read: false,
      type: 'alert'
    },
    {
      id: '2',
      title: 'Turnstile Scan',
      message: 'Token CARD-204 (Aarav Sharma) scanned at Gate 3 — Citizen is waiting outside Chamber 204.',
      time: '5 min ago',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Lab Results Ready',
      message: '12-Lead ECG report for CARD-201 (Suresh Patel) is now available for review.',
      time: '12 min ago',
      read: true,
      type: 'success'
    },
    {
      id: '4',
      title: 'Queue Update',
      message: '3 new patients added to your OPD queue via SmartCare Patient Portal.',
      time: '18 min ago',
      read: true,
      type: 'info'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('smartcare_staff');
    localStorage.removeItem('smartcare_auth');
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-2 sm:px-6 flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="relative w-72 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search doctor, token, or patient ABHA..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 text-[9px] text-white font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="fixed sm:absolute right-3 sm:right-0 left-20 sm:left-auto top-16 sm:top-12 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-800">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 flex gap-3 text-xs hover:bg-slate-50 transition ${!n.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.type === 'alert' ? 'bg-rose-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-300 hover:text-slate-500 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="text-left text-xs">
            <p className="font-bold text-slate-800">Admin Control</p>
            <span className="text-[10px] text-slate-400">AIIMS Medical Supt.</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition text-xs font-semibold border border-rose-200"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
