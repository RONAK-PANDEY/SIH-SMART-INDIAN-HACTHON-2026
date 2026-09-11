import React, { useState } from 'react';
import { Hospital, PhoneCall, X, Search, Copy, Check, ShieldAlert, MapPin, ExternalLink, Phone } from 'lucide-react';
import { useTranslation } from '../i18n';

export interface DemoHospital {
  id: string;
  name: string;
  area: string;
  phone: string;
  altPhone: string;
  badge: string;
  type: 'Government' | 'Private' | 'Emergency';
  hours: string;
}

export const DEMO_HOSPITALS_LIST: DemoHospital[] = [
  {
    id: 'hosp-001',
    name: 'AIIMS Delhi (Apex Center)',
    area: 'Ansari Nagar, New Delhi',
    phone: '011-26588500',
    altPhone: '+91 98110 44321',
    badge: '24x7 Trauma & OPD Helpline',
    type: 'Government',
    hours: '24 Hours Open'
  },
  {
    id: 'hosp-002',
    name: 'Safdarjung Hospital & VMMC',
    area: 'Ring Road, New Delhi',
    phone: '011-26707444',
    altPhone: '1800-11-3000',
    badge: 'General OPD & Casualty',
    type: 'Government',
    hours: '24 Hours Open'
  },
  {
    id: 'hosp-003',
    name: 'Dr. Ram Manohar Lohia (RML) Hospital',
    area: 'Baba Kharak Singh Marg, CP, New Delhi',
    phone: '011-23365555',
    altPhone: '011-23404000',
    badge: 'Central Emergency Desk',
    type: 'Government',
    hours: '24 Hours Open'
  },
  {
    id: 'hosp-004',
    name: 'Lady Hardinge Medical College (LHMC)',
    area: 'Connaught Place, New Delhi',
    phone: '011-23363728',
    altPhone: '011-23408100',
    badge: 'Maternal & Pediatrics OPD',
    type: 'Government',
    hours: '8:00 AM - 8:00 PM'
  },
  {
    id: 'hosp-005',
    name: 'Apollo Super Speciality Emergency',
    area: 'Sarita Vihar, Mathura Road, New Delhi',
    phone: '1066',
    altPhone: '+91 99100 12345',
    badge: 'Super Speciality Helpline',
    type: 'Private',
    hours: '24 Hours Open'
  },
  {
    id: 'hosp-006',
    name: 'Fortis Healthcare Central Hotline',
    area: 'NCR Network & Okhla Facility',
    phone: '+91 11 4713 5555',
    altPhone: '+91 98100 99999',
    badge: '24x7 Cardiac & Trauma',
    type: 'Private',
    hours: '24 Hours Open'
  },
  {
    id: 'hosp-007',
    name: 'Max Super Speciality Hospital Desk',
    area: 'Saket & Patparganj, New Delhi',
    phone: '011-26515050',
    altPhone: '011-40554055',
    badge: 'Emergency Bed Allocation',
    type: 'Private',
    hours: '24 Hours Open'
  },
  {
    id: 'hosp-008',
    name: 'National Emergency Response (Govt Helpline)',
    area: 'Pan-India Toll-Free Helpline',
    phone: '108',
    altPhone: '112',
    badge: 'National Ambulance & Trauma',
    type: 'Emergency',
    hours: '24x7 Instant Dispatch'
  }
];

interface HospitalContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HospitalContactsModal: React.FC<HospitalContactsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Government' | 'Private' | 'Emergency'>('All');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [callingToast, setCallingToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHospitals = DEMO_HOSPITALS_LIST.filter((hosp) => {
    const matchesSearch =
      hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hosp.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hosp.phone.includes(searchTerm) ||
      hosp.altPhone.includes(searchTerm) ||
      hosp.badge.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'All' || hosp.type === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopy = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedNumber(phone);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleDialClick = (hospName: string, phone: string) => {
    setCallingToast(`Initiating call to ${hospName} (${phone})...`);
    setTimeout(() => setCallingToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">
                Hospital Contact Helplines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap any demo number to dial directly or copy helpline numbers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calling Toast Notification */}
        {callingToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 shadow-md">
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>{callingToast}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hospital name, area, or helpline..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['All', 'Government', 'Private', 'Emergency'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'All' ? 'All Helplines' : cat}
            </button>
          ))}
        </div>

        {/* Hospital Contact List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[50vh]">
          {filteredHospitals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No hospital helplines match "{searchTerm}"
            </div>
          ) : (
            filteredHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                      {hosp.name}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                      {hosp.area}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                      hosp.type === 'Emergency'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : hosp.type === 'Government'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {hosp.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Operating: <strong className="text-slate-700 dark:text-slate-300">{hosp.hours}</strong></span>
                  <span className="font-semibold text-slate-400">Demo Helpline</span>
                </div>

                {/* Call Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`tel:${hosp.phone.replace(/[^0-9+]/g, '')}`}
                    onClick={() => handleDialClick(hosp.name, hosp.phone)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call {hosp.phone}</span>
                  </a>

                  {hosp.altPhone && (
                    <a
                      href={`tel:${hosp.altPhone.replace(/[^0-9+]/g, '')}`}
                      onClick={() => handleDialClick(hosp.name, hosp.altPhone)}
                      className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{hosp.altPhone}</span>
                    </a>
                  )}

                  <button
                    onClick={(e) => handleCopy(hosp.phone, e)}
                    className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center"
                    title="Copy helpline number"
                  >
                    {copiedNumber === hosp.phone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Integrated SmartCare Emergency Network</span>
          </div>
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl text-xs hover:opacity-90 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
