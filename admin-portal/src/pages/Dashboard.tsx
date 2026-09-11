import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import React from 'react';
import { Shield, Building2, Stethoscope, Users, Activity, BarChart3, Star, Bell, Search, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar - Classic Light */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <AdminHeader />

        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Status Banner */}
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-blue-800">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
              <span className="text-sm font-medium">National Healthcare Network is operating optimally. All core services are online.</span>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-md">Updated Just Now</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500 mb-4">Total Patients Today</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-slate-900">1,284</p>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+12%</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500 mb-4">Average Wait Time</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-slate-900">32<span className="text-xl text-slate-500 font-normal">m</span></p>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">-5m</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
              <p className="text-sm font-medium text-slate-500 mb-4">Emergency Cases</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-slate-900">47</p>
                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Active</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500 mb-4">Consultations Completed</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-slate-900">1,102</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-base font-semibold text-slate-800">Hospital Load Distribution</h3>
                <select className="bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option>Delhi NCR</option>
                  <option>Mumbai Region</option>
                  <option>Bangalore</option>
                </select>
              </div>
              <div className="flex-1 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100">
                <p className="text-slate-400 text-sm font-medium">Hospital Load Monitor</p>
              </div>
            </div>
            
            {/* Triage Monitor */}
            <div className="bg-[#fcfaf5] rounded-xl shadow-sm border border-[#ede7dc] p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  Live AI Triage Monitor
                </h3>
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </div>
              
              <div className="space-y-6 flex-1">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">AIIMS Delhi</span>
                    <span className="text-sm font-semibold text-rose-600">12 Critical</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-rose-500 h-1.5 rounded-full w-[80%]"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Safdarjung</span>
                    <span className="text-sm font-semibold text-orange-500">8 Moderate</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-orange-400 h-1.5 rounded-full w-[60%]"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">RML Hospital</span>
                    <span className="text-sm font-semibold text-emerald-600">Normal</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full w-[30%]"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Lok Nayak</span>
                    <span className="text-sm font-semibold text-emerald-600">Normal</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full w-[25%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

