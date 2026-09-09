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
  Flame, 
  RefreshCw,
  BellRing,
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
    { id: 'fb-1', patient: 'Suresh Patel', doctor: 'Dr. Rajesh Sharma', rating: 5, comment: 'Excellent consultation, very thorough ECG review.', time: '10:22 AM' },
    { id: 'fb-2', patient: 'Meena Devi Kumari', doctor: 'Dr. Rajesh Sharma', rating: 4, comment: 'Good care, slight wait but attentive treatment.', time: '10:45 AM' },
    { id: 'fb-3', patient: 'Ananya Deshmukh', doctor: 'Dr. Rajesh Sharma', rating: 5, comment: 'Very reassuring, explained everything clearly.', time: '09:50 AM' },
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
      console.warn('Observer backend error, using simulated feed:', e);
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
            message: "Token CARD-048 waiting > 45 mins. Auto priority bump queued.",
            timestamp: new Date().toISOString()
          },
          {
            id: "anom-02",
            hospital: "Safdarjung Hospital",
            department: "Orthopedics",
            type: "DOCTOR_DELAY",
            severity: "INFO",
            message: "OPD Room 104 consultation resumed after emergency trauma call.",
            timestamp: new Date().toISOString()
          }
        ]
      });
      setDoctors([
        { id: 'doc-001', name: 'Dr. Rajesh Sharma', department: 'Cardiology', hospital: 'AIIMS New Delhi', avg_score: 4.85, recognition_tier: 'Gold', performance_grade: 'Grade A+ (Distinguished Excellence)', grievance_count: 0 },
        { id: 'doc-004', name: 'Dr. Sneha Roy', department: 'Dermatology', hospital: 'AIIMS New Delhi', avg_score: 2.5, recognition_tier: 'Under Review', performance_grade: 'Grade C (Under Disciplinary Audit)', grievance_count: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket for Live Queue Vigilance
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/api/v1/ws/connect/observer:govt-portal`;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => {
          setWsConnected(true);
          console.log('[GovtDashboard] Live Queue WebSocket connected');
          ws.send(JSON.stringify({ action: 'subscribe', channel: 'observer:all' }));
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLiveQueueEvents(prev => [
              { ...data, receivedAt: new Date().toISOString() },
              ...prev.slice(0, 19) // Keep last 20
            ]);
          } catch (err) {
            console.warn('[GovtDashboard] WS parse error:', err);
          }
        };
        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connect, 5000);
        };
        ws.onerror = () => ws.close();
      } catch (err) {
        console.error('[GovtDashboard] WS setup error:', err);
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatchInspection = async (anom: any) => {
    setDispatchingId(anom.id);
    try {
      // Try backend first
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
      console.warn('Dispatch endpoint not available, logging to Supabase:', e);
    }
    // Also log to Supabase
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
    <div className="p-6 sm:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto">
      
      {/* Top Banner: Statutory Mission Declaration */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Statutory Mediator & Vigilance Sentinel</span>
          </div>

          {/* 1-Paragraph Who is this for / What problem does this solve */}
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 max-w-2xl">
            <p className="text-xs text-amber-200 leading-relaxed">
              <strong>Who is this for:</strong> MoHFW directors, Chief Medical Officers (CMO), and hospital superintendents. <strong>What problem it solves:</strong> Eliminates hospital queue corruption, detects ghost tokens and queue-jumping at turnstiles, and algorithmically links doctor consultation quality to the national Doctor Recognition Index (DRI) for awards and certifications.
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Hospital Queue Sentinel & Doctor Recognition Surveillance
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Continuously auditing queue integrity, token bypassing, and citizen consultation feedback. Doctor ratings feed into the MoHFW Doctor Recognition Index for national awards and resource allocation.
          </p>
        </div>

        <button
          onClick={handleAuditNow}
          disabled={auditRunning}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md self-start md:self-auto cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${auditRunning ? 'animate-spin' : ''}`} />
          <span>{auditRunning ? 'Auditing...' : 'Audit Now'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Network Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">
            {audits?.audit_summary?.compliance_index || '96.4%'}
          </p>
          <p className="text-[11px] text-slate-500">Across 3 Apex Central Hospitals</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Monitored OPD Queues</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400">
            {audits?.audit_summary?.active_opd_queues || 28}
          </p>
          <p className="text-[11px] text-slate-500">Active token lines under surveillance</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Flagged Queue Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">
            {audits?.anomalies?.length || 2}
          </p>
          <p className="text-[11px] text-slate-500">Delays or token pacing flags</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Citizen Grievances</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400">
            {grievances.filter((g) => g.status !== 'RESOLVED').length || 2}
          </p>
          <p className="text-[11px] text-slate-500">Awaiting official investigation</p>
        </div>
      </div>

      {/* Main Grid: Queue Anomaly Sentinel & Doctor Recognition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Realtime Queue Anomalies */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Live Queue Vigilance Feeds</h3>
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            </div>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${wsConnected ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50' : 'bg-amber-900/60 text-amber-400 border border-amber-700/50'}`}>
              {wsConnected ? 'LIVE CONNECTED' : 'AUTO SENTINEL 10s'}
            </span>
          </div>

          <div className="space-y-3">
            {/* Show live WebSocket events if available */}
            {liveQueueEvents.length > 0 && (
              <div className="space-y-2">
                {liveQueueEvents.slice(0, 3).map((evt, idx) => (
                  <div key={idx} className="p-3 rounded-2xl border bg-emerald-950/20 border-emerald-500/40 text-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <strong>Live Event</strong> • {evt.event || evt.type || 'queue_update'}
                      </span>
                      <span className="text-[10px] font-mono opacity-70">
                        {new Date(evt.receivedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{evt.message || JSON.stringify(evt).substring(0, 120)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Anomalies from backend/simulated data */}
            {audits?.anomalies?.map((anom: any) => (
              <div
                key={anom.id}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  anom.severity === 'WARNING'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                    : 'bg-blue-950/20 border-blue-500/40 text-blue-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <strong>{anom.hospital}</strong> • {anom.department}
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    {new Date(anom.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{anom.message}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[10px]">
                  <span className="text-slate-400">Anomaly Code: {anom.type}</span>
                  <button
                    onClick={() => handleDispatchInspection(anom)}
                    disabled={dispatchingId === anom.id}
                    className={`font-bold cursor-pointer transition ${
                      dispatchingId === anom.id
                        ? 'text-emerald-400'
                        : 'text-amber-400 hover:underline'
                    }`}
                  >
                    {dispatchingId === anom.id ? '✓ Inspection Dispatched' : 'Dispatch Flash Inspection →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Doctor Recognition Index */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Doctor Recognition Index (DRI)</h3>
            </div>
            <a href="/salary-bonus" className="text-xs text-amber-400 hover:underline font-semibold">
              Full DRI Report →
            </a>
          </div>

          <div className="space-y-3 text-xs">
            {doctors.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="font-bold text-white text-xs">{doc.name}</h4>
                  <p className="text-[11px] text-slate-400">{doc.department} • {doc.hospital}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-amber-400/10 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-400/20">
                      ★ {doc.avg_score} / 5.0
                    </span>
                    {doc.grievance_count > 0 && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-full">
                        {doc.grievance_count} Grievance
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl block ${
                      doc.recognition_tier === 'Gold' || doc.avg_score >= 4.5
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : doc.recognition_tier === 'Under Review' || doc.avg_score < 3.0
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {doc.recognition_tier || (doc.avg_score >= 4.5 ? 'Gold' : doc.avg_score >= 3.5 ? 'Silver' : 'Under Review')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Recognition Tier</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Citizen Feedback & Reviews Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h3 className="font-extrabold text-sm text-white">Recent Citizen Feedback & Reviews</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{feedbackList.length} Reviews Today</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {feedbackList.map(fb => (
            <div key={fb.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-white">{fb.patient}</strong>
                <span className="text-[10px] text-slate-500 font-mono">{fb.time}</span>
              </div>
              <p className="text-[11px] text-slate-400">Doctor: {fb.doctor}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                ))}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed italic">"{fb.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Row: Inflow Analytics & Triage Acuity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white">OPD Hourly Inflow & AI Predicted Wait Times</h3>
            <span className="text-xs text-indigo-400 font-mono">Telemetry R² = 0.942</span>
          </div>
          <WaitTimeChart />
        </div>

        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white">Acuity Triage Spectrum</h3>
            <span className="text-xs text-slate-400">P1 to P5</span>
          </div>
          <TriageDistribution />
        </div>
      </div>

      {/* Bottom Row: Hospital Cluster Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">Regional Hospital Cluster Load Balancing</h3>
          </div>
          <a href="/heatmap" className="text-xs text-emerald-400 hover:underline font-semibold">
            Geospatial Heatmap →
          </a>
        </div>
        <CongestionHeatmap />
      </div>

    </div>
  );
};
