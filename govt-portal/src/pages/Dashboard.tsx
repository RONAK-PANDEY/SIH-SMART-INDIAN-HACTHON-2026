import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Users, 
  Eye, 
  Scale, 
  ArrowRight, 
  RefreshCw,
  Star,
  MessageSquare
} from 'lucide-react';
import { WaitTimeChart } from '../charts/WaitTimeChart';
import { TriageDistribution } from '../charts/TriageDistribution';
import { CongestionHeatmap } from '../charts/CongestionHeatmap';
import { logVigilanceInspection, logAuditRecord } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const [audits, setAudits] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [liveQueueEvents, setLiveQueueEvents] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([
    { id: 'fb-1', patient: 'Suresh Patel', doctor: 'Dr. Rajesh Sharma', rating: 5, comment: 'Punctual consultation. Gate B scanner cleared entry in under 10 seconds.', time: '10:22 AM' },
    { id: 'fb-2', patient: 'Meena Devi Kumari', doctor: 'Dr. Rajesh Sharma', rating: 4, comment: 'Attentive doctor. Clean queue hall with clear display screens.', time: '10:45 AM' },
    { id: 'fb-3', patient: 'Ananya Deshmukh', doctor: 'Dr. Rajesh Sharma', rating: 5, comment: 'Clear triage explanation and zero waiting counter delay.', time: '09:50 AM' },
  ]);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [auditRunning, setAuditRunning] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAudits, resDocs, resGrv] = await Promise.all([
        fetch('http://localhost:8000/api/v1/observer/audits').then((r) => r.json()),
        fetch('http://localhost:8000/api/v1/observer/doctors/performance').then((r) => r.json()),
        fetch('http://localhost:8000/api/v1/observer/grievances').then((r) => r.json())
      ]);
      setAudits(resAudits);
      setDoctors(resDocs.doctors || []);
      setGrievances(resGrv.grievances || []);
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
        { id: 'doc-001', name: 'Dr. Rajesh Sharma', department: 'Cardiology', hospital: 'AIIMS New Delhi', avg_score: 4.85, recognition_tier: 'Tier 1 - Distinction', performance_grade: 'Grade A+', grievance_count: 0 },
        { id: 'doc-004', name: 'Dr. Sneha Roy', department: 'Dermatology', hospital: 'AIIMS New Delhi', avg_score: 3.2, recognition_tier: 'Tier 3 - Standard', performance_grade: 'Grade B', grievance_count: 1 }
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
      await fetch('http://localhost:8000/api/v1/observer/dispatch-inspection', {
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
    <div className="p-6 sm:p-8 space-y-8 bg-[#0B0F19] text-[#F8FAFC] max-w-7xl mx-auto font-sans pb-32">
      
      {/* 1. Executive Masthead - Clean & Asymmetrical */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#334155]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-0.5 rounded-md border border-slate-700">
              National Health Authority • MoHFW
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Gateway Surveillance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            OPD Turnstile & Queue Oversight Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-normal">
            Continuous auditing of patient throughput, gate check-in compliance, and doctor consultation standards across central hospitals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAuditNow}
            disabled={auditRunning}
            className="bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-[#334155] font-semibold text-xs px-4 py-3 rounded-xl transition-colors flex items-center gap-2 min-h-[44px] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${auditRunning ? 'animate-spin' : ''}`} />
            <span>{auditRunning ? 'Running Audit...' : 'Audit Network Now'}</span>
          </button>
        </div>
      </div>

      {/* 2. Restrained Executive KPI Tiles (8pt Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Network Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-semibold text-emerald-400">
            {audits?.audit_summary?.compliance_index || '96.4%'}
          </p>
          <p className="text-xs text-slate-400">Across 3 Central Apex Hospitals</p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Monitored Outpatient Queues</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-semibold text-blue-400">
            {audits?.audit_summary?.active_opd_queues || 28}
          </p>
          <p className="text-xs text-slate-400">Real-time gate and counter lines</p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Queue Pacing Discrepancies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-semibold text-amber-400">
            {audits?.anomalies?.length || 2}
          </p>
          <p className="text-xs text-slate-400">Automatic escalation dispatched</p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Citizen Grievances</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-semibold text-slate-200">
            {grievances.filter((g) => g.status !== 'RESOLVED').length || 1}
          </p>
          <p className="text-xs text-slate-400">Under review by vigilance desk</p>
        </div>
      </div>

      {/* 3. Main Operational Split (8 Cols Alerts & Feed : 4 Cols Doctor Recognition) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Real-time Anomaly Sentinel */}
        <div className="lg:col-span-8 bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Live Turnstile & Queue Events</h2>
            </div>
            <span className="text-xs text-slate-400">Auto-refresh active</span>
          </div>

          <div className="space-y-3">
            {audits?.anomalies?.map((anom: any) => (
              <div
                key={anom.id}
                className="p-4 rounded-lg border border-[#334155] bg-[#0B0F19] text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    {anom.hospital} • {anom.department}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(anom.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-300 font-normal leading-relaxed">{anom.message}</p>
                <div className="pt-2 flex items-center justify-between border-t border-[#1E293B]">
                  <span className="text-slate-500 text-[11px]">Type: {anom.type}</span>
                  <button
                    type="button"
                    onClick={() => handleDispatchInspection(anom)}
                    disabled={dispatchingId === anom.id}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer min-h-[32px] px-2 py-1 rounded"
                  >
                    {dispatchingId === anom.id ? 'Vigilance Dispatched' : 'Dispatch Field Inspection'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Doctor Recognition Index (DRI) */}
        <div className="lg:col-span-4 bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <h2 className="text-sm font-semibold text-white">Doctor Recognition Status</h2>
            <a href="/salary-bonus" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              View All
            </a>
          </div>

          <div className="space-y-3 text-xs">
            {doctors.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-lg bg-[#0B0F19] border border-[#334155] flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-semibold text-white">{doc.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{doc.department} • {doc.hospital}</p>
                  <span className="inline-block mt-1 text-[11px] text-amber-400 font-semibold">
                    ★ {doc.avg_score} / 5.0
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-emerald-400 block">
                    {doc.recognition_tier || 'Tier 1'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">DPI Tier</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Patient Feedback Feed */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Verified Patient Feedback</h2>
          </div>
          <span className="text-xs text-slate-400">{feedbackList.length} reviews recorded today</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedbackList.map(fb => (
            <div key={fb.id} className="p-4 bg-[#0B0F19] border border-[#334155] rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{fb.patient}</span>
                <span className="text-[11px] text-slate-500">{fb.time}</span>
              </div>
              <p className="text-[11px] text-slate-400">{fb.doctor}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                ))}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">"{fb.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Inflow Analytics and Triage Spectrum Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <h2 className="text-sm font-semibold text-white">OPD Inflow & Predicted Wait Time Trends</h2>
            <span className="text-xs text-slate-400 font-mono">Model Accuracy 94.2%</span>
          </div>
          <WaitTimeChart />
        </div>

        <div className="lg:col-span-4 bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <h2 className="text-sm font-semibold text-white">Clinical Triage Acuity</h2>
            <span className="text-xs text-slate-400">P1 to P5 Spectrum</span>
          </div>
          <TriageDistribution />
        </div>
      </div>

      {/* 6. Hospital Cluster Congestion Map */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Hospital Cluster Load Balancing</h2>
          </div>
          <a href="/heatmap" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
            Open Map View
          </a>
        </div>
        <CongestionHeatmap />
      </div>

    </div>
  );
};
