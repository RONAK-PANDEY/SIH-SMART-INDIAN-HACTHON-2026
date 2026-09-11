import React, { useState } from 'react';
import { Search, Bell, Menu, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-20 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Back & Next Navigation Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Go Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button className="text-slate-400 hover:text-slate-600 lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800">System Overview</h2>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search records..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(e.target.value.length > 0);
            }}
            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
            onFocus={() => setIsSearching(searchQuery.length > 0)}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
          />
          
          {/* Search Dropdown */}
          {isSearching && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden flex flex-col z-50">
              <div className="p-3 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Search Results
              </div>
              <div className="p-4 text-sm text-slate-600 flex flex-col gap-2">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  Searching database for "{searchQuery}"...
                </span>
                <span className="text-xs text-slate-400">No immediate records found locally. Press Enter to query central servers.</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col z-50">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Triage Alert: AIIMS Delhi</p>
                    <p className="text-xs text-slate-500 mt-0.5">Critical load detected in Emergency Ward. Diverting ambulances.</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">2 mins ago</p>
                  </div>
                </div>
                <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">System Update Complete</p>
                    <p className="text-xs text-slate-500 mt-0.5">National Queue Sync successfully deployed to region North-1.</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">1 hour ago</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-3 text-center text-xs font-semibold text-blue-600 hover:bg-slate-50 border-t border-slate-100"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">MoHFW Admin</p>
            <p className="text-xs text-slate-500">Directorate General</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer hover:bg-blue-700 transition-colors">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};
