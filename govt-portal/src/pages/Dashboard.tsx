import React, { useState, useEffect } from 'react';
import { API_V1_URL } from '../lib/api';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Eye, 
  RefreshCw
} from 'lucide-react';
import { logVigilanceInspection, logAuditRecord } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const [audits, setAudits] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [auditRunning, setAuditRunning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAudits, resDocs] = await Promise.all([
        fetch(`${API_V1_URL}/observer/audits`).then((r) => r.json()),
        fetch(`${API_V1_URL}/observer/doctors/performance`).then((r) => r.json())
      ]);
      setAudits(resAudits);
      setDoctors(resDocs.doctors || []);
    } catch (e) {
      setAudits({
        audit_summary: {
          hospitals_monitored: 3,
          active_opd_queues: 28,
          anomalies_detected: 2,
          compliance_index: "96.4%"
        },
        anomalies: [
          {
            id: "anom-01",
            hospital: "AIIMS New Delhi",
            department: "Cardiology",
            type: "WAIT_TIME_EXCEEDED",
            severity: "WARNING",
            message: "Token CARD-048 waiting exceeded 45 mins. Automatic queue bump scheduled.",
            timestamp: new Date().toISOString()
          },
          {
            id: "anom-02",
            hospital: "Safdarjung Hospital",
            department: "Orthopedics",
            type: "DOCTOR_DELAY",
            severity: "INFO",
            message: "OPD Room 104 consultation resumed following acute trauma intake.",
            timestamp: new Date().toISOString()
          }
        ]
      });
      setDoctors([
        { id: 'doc-001', name: 'Dr. Rajesh Sharma', department: 'Cardiology', hospital: 'AIIMS New Delhi', avg_score: 4.85, recognition_tier: 'Distinction Tier', performance_grade: 'Grade A+', grievance_count: 0 },
        { id: 'doc-004', name: 'Dr. Sneha Roy', department: 'Dermatology', hospital: 'AIIMS New Delhi', avg_score: 3.2, recognition_tier: 'Standard Tier', performance_grade: 'Grade B', grievance_count: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatchInspection = async (anom: any) => {
    setDispatchingId(anom.id);
    try {
      await fetch(`${API_V1_URL}/observer/dispatch-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly_id: anom.id,
          hospital: anom.hospital,
          department: anom.department,
          type: 'FLASH_INSPECTION'
        })
      });
    } catch (e) {
      console.warn('Dispatch logged locally:', e);
    }
    await logVigilanceInspection({
      id: anom.id,
      hospitalId: 'AIIMS-ND-001',
      department: anom.department,
      type: 'FLASH_INSPECTION',
      notes: anom.message
    });
    setTimeout(() => setDispatchingId(null), 2000);
  };

  const handleAuditNow = async () => {
    setAuditRunning(true);
    await fetchData();
    await logAuditRecord({
      hospitalId: 'AIIMS-ND-001',
      department: 'ALL',
      auditScore: audits?.audit_summary?.compliance_index || '96.4%',
      actionTaken: 'Manual audit triggered from dashboard'
    });
    setTimeout(() => setAuditRunning(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 pb-24 font-sans max-w-7xl mx-auto space-y-6">
      
      {/* 1. Accessible Executive Header */}
      <header className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200 text-xl font-semibold shrink-0">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Active Surveillance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Hospital network overview
            </h1>
          </div>
        </div>

        {/* Massive 56px Tactile Action Button */}
        <div>
          <button
            type="button"
            onClick={handleAuditNow}
            disabled={auditRunning}
            className="btn-tactile-green font-semibold text-sm px-6 py-3.5 rounded-xl flex items-center gap-2 min-h-[56px] cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${auditRunning ? 'animate-spin' : ''}`} />
            <span>{auditRunning ? 'Refreshing…' : 'Refresh data'}</span>
          </button>
        </div>
      </header>

      {/* 2. Four Giant Accessible Status Tiles (Zero Text Confusion) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tile 1: Green Compliance */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Service target</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-emerald-700 font-mono">
            {audits?.audit_summary?.compliance_index || '96.4%'}
          </p>
          <p className="text-xs text-slate-500">Across 3 hospitals</p>
        </div>

        {/* Tile 2: Blue Throughput */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Arrivals today</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-blue-700 font-mono">
            14,820
          </p>
          <p className="text-xs text-slate-500">28 active queues</p>
        </div>

        {/* Tile 3: Average Wait */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average wait</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-900 font-mono">
            18 mins
          </p>
          <p className="text-xs text-emerald-700 font-semibold">↓ 42 mins reduction</p>
        </div>

        {/* Tile 4: Amber Alert */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Needs attention</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-amber-700 font-mono">
            {audits?.anomalies?.length || 2}
          </p>
          <p className="text-xs text-slate-500">Open queue alerts</p>
        </div>

      </div>

      {/* 3. Main Single-Screen Split: Queue Alerts & Doctor Recognition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Cols: Realtime Alerts */}
        <div className="lg:col-span-8 bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-slate-900">Queue alerts</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Updated now</span>
          </div>

          <div className="space-y-3">
            {audits?.anomalies?.map((anom: any) => (
              <div
                key={anom.id}
                className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    {anom.hospital} • {anom.department}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">
                    {new Date(anom.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{anom.message}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <span className="text-slate-500">Anomaly Code: {anom.type}</span>
                  <button
                    type="button"
                    onClick={() => handleDispatchInspection(anom)}
                    disabled={dispatchingId === anom.id}
                    className="btn-tactile-blue font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer min-h-[38px] flex items-center gap-1"
                  >
                    <span>{dispatchingId === anom.id ? 'Team notified' : 'Notify hospital'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Doctor Recognition List */}
        <div className="lg:col-span-4 bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Service quality</h2>
            <a href="/salary-bonus" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              Full List
            </a>
          </div>

          <div className="space-y-3 text-xs">
            {doctors.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                  <p className="text-slate-500 mt-0.5">{doc.department} • {doc.hospital}</p>
                  <span className="inline-block mt-1 text-amber-700 font-semibold">
                    ★ {doc.avg_score} / 5.0
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md block border border-emerald-200">
                    {doc.recognition_tier || 'Distinction'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
