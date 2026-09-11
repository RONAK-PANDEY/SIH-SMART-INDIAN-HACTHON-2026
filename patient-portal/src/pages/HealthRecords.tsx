import React, { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  Download, 
  Printer, 
  Stethoscope, 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Building2, 
  Share2, 
  Calendar,
  ShieldCheck,
  Eye,
  Plus
} from 'lucide-react';
import { useTranslation, LanguageSwitcherPill } from '../i18n';

export const HealthRecords: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'labs' | 'billing'>('prescriptions');

  const prescriptions = [
    {
      id: 'RX-2026-0906-01',
      date: '06 Sep 2026',
      tokenNumber: 'CARD-204',
      doctor: 'Dr. Rajesh Sharma',
      department: 'Cardiology & Heart Care',
      hospital: 'AIIMS New Delhi',
      diagnosis: 'Stable Angina Pectoris with Stage 1 Hypertension',
      medicines: [
        { name: 'Tab Sorbitrate 5mg', dosage: '1 Tab SL SOS', duration: '15 Days', notes: 'Take sublingually when chest discomfort occurs' },
        { name: 'Tab Amlodipine 5mg', dosage: '1 Tab Once Daily (OD)', duration: '30 Days', notes: 'Take in the morning after breakfast' },
        { name: 'Tab Atorvastatin 20mg', dosage: '1 Tab at Bedtime (HS)', duration: '30 Days', notes: 'Cholesterol management' }
      ],
      advice: 'Maintain low sodium (<2g/day) diet. Avoid heavy exertion. Review in 15 days.'
    },
    {
      id: 'RX-2026-0828-09',
      date: '28 Aug 2026',
      tokenNumber: 'GENM-102',
      doctor: 'Dr. Priya Patel',
      department: 'General Medicine',
      hospital: 'Safdarjung Multi-Speciality',
      diagnosis: 'Acute Viral Rhinosinusitis with Seasonal Flu',
      medicines: [
        { name: 'Tab Paracetamol 650mg', dosage: '1 Tab TDS', duration: '5 Days', notes: 'Take after food for fever' },
        { name: 'Tab Levocetirizine 5mg', dosage: '1 Tab OD at Night', duration: '7 Days', notes: 'For nasal allergy & sneezing' },
        { name: 'Steam Inhalation', dosage: 'Twice daily', duration: '5 Days', notes: 'Warm saline gargles' }
      ],
      advice: 'Adequate hydration (3L fluids daily), warm soup and rest.'
    }
  ];

  const labReports = [
    {
      id: 'LAB-2026-0906',
      testName: '12-Lead Resting Electrocardiogram (ECG)',
      date: '06 Sep 2026',
      hospital: 'AIIMS Central Pathology & Diagnostics',
      orderedBy: 'Dr. Rajesh Sharma',
      status: 'Verified & Ready',
      resultSummary: 'Normal Sinus Rhythm, HR 76 bpm, No acute ST-T elevation, Mild LVH pattern'
    },
    {
      id: 'LAB-2026-0828',
      testName: 'Comprehensive Lipid Profile & Fasting Blood Sugar',
      date: '28 Aug 2026',
      hospital: 'Safdarjung Clinical Diagnostic Lab',
      orderedBy: 'Dr. Priya Patel',
      status: 'Verified & Ready',
      resultSummary: 'Total Cholesterol: 188 mg/dL (Normal), Triglycerides: 142 mg/dL, FBS: 104 mg/dL'
    },
    {
      id: 'LAB-2026-0714',
      testName: 'Digital X-Ray Knee Joint (AP & Lateral View)',
      date: '14 Jul 2026',
      hospital: 'AIIMS Central Radiology',
      orderedBy: 'Dr. Sandeep Mehta',
      status: 'Verified & Ready',
      resultSummary: 'Grade 1 Osteoarthritic joint space narrowing in medial compartment'
    }
  ];

  const billingInvoices = [
    {
      invoiceNo: 'INV-2026-0906-01',
      date: '06 Sep 2026',
      service: 'Senior Specialist Cardiology Consultation (CARD-204)',
      hospital: 'AIIMS New Delhi',
      amount: '₹50.00',
      status: 'Paid',
      method: 'UPI (Google Pay)',
      txnId: 'UPI-982144321109-0609'
    },
    {
      invoiceNo: 'INV-2026-0828-04',
      date: '28 Aug 2026',
      service: 'General Medicine Consultation & Comprehensive Blood Panel',
      hospital: 'Safdarjung Hospital',
      amount: '₹450.00',
      status: 'Covered (Cashless)',
      method: 'Ayushman Bharat PM-JAY (AB-PMJAY-9821109)',
      txnId: 'PMJAY-CLAIM-2026-8819'
    },
    {
      invoiceNo: 'INV-2026-0714-12',
      date: '14 Jul 2026',
      service: 'Orthopedic Knee Joint Digital X-Ray (Bilateral)',
      hospital: 'AIIMS Central Radiology',
      amount: '₹120.00',
      status: 'Paid',
      method: 'BHIM UPI QR',
      txnId: 'UPI-BHIM-7782190'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 max-w-4xl mx-auto pb-32">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>{t('health_records')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Prescriptions & Billing Vault
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized repository for verified doctor prescriptions, diagnostic lab reports, and payment invoices.
          </p>
        </div>

        <LanguageSwitcherPill />
      </header>

      {/* Vault Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('prescriptions')}
          className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'prescriptions' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('labs')}
          className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'labs' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Diagnostic Reports ({labReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'billing' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Billing & Invoices ({billingInvoices.length})</span>
        </button>
      </div>

      {/* Content 1: Doctor Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-base font-bold text-slate-900">{rx.doctor}</strong>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{rx.id}
                    </span>
                  </div>
                  <span className="text-xs text-blue-700 font-semibold">{rx.department} • {rx.hospital}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-500 block">{rx.date}</span>
                  <span className="text-xs font-bold text-emerald-700">Token: {rx.tokenNumber}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Diagnosis</span>
                <strong className="text-xs text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl block border border-slate-200">
                  {rx.diagnosis}
                </strong>
              </div>

              {/* Medicines Table */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Prescribed Medicines</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                        <th className="py-2">Medicine</th>
                        <th className="py-2">Dosage</th>
                        <th className="py-2">Duration</th>
                        <th className="py-2">Special Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rx.medicines.map((m, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 font-bold text-slate-900">{m.name}</td>
                          <td className="py-2.5 font-mono text-blue-700">{m.dosage}</td>
                          <td className="py-2.5">{m.duration}</td>
                          <td className="py-2.5 text-slate-500">{m.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <strong>Doctor's Advice:</strong> {rx.advice}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Digital Rx</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content 2: Diagnostic Lab Reports */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          {labReports.map((lab) => (
            <div key={lab.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-indigo-600" />
                    <strong className="text-base font-bold text-slate-900">{lab.testName}</strong>
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5 block">{lab.hospital}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                    ✓ {lab.status}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">{lab.date}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Verified Clinical Finding</span>
                <strong className="text-slate-800 font-mono text-xs">{lab.resultSummary}</strong>
                <span className="text-[10px] text-slate-400 block pt-1">Ordered by: {lab.orderedBy}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Downloading Lab Report: ${lab.id}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Lab PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content 3: Billing & Invoices */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">OPD Financial Records</span>
                <h3 className="text-base font-bold text-slate-900">Consultation Slips & Invoices</h3>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                ABHA / PM-JAY Linked
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {billingInvoices.map((rec) => (
                <div key={rec.invoiceNo} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-bold">{rec.service}</strong>
                      <span className="font-mono text-[10px] text-slate-400">#{rec.invoiceNo}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{rec.hospital} • Date: {rec.date}</p>
                    <span className="text-[10px] font-mono text-slate-400">Txn: {rec.txnId} ({rec.method})</span>
                  </div>

                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <div>
                      <strong className="text-base font-black text-slate-900">{rec.amount}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ml-2 sm:ml-0 sm:block sm:mt-0.5 ${
                        rec.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading Invoice: ${rec.invoiceNo}`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg transition text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
