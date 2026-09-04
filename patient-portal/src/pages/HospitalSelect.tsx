import React, { useState } from 'react';
import { Building2, MapPin, Clock, Users, ChevronRight, Search } from 'lucide-react';

const mockHospitals = [
  {
    id: 'hosp-001',
    name: 'AIIMS New Delhi',
    city: 'New Delhi',
    distance: '2.4 km',
    currentWaitMins: 45,
    occupancy: 'High (88%)',
    departments: ['General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics', 'ENT'],
  },
  {
    id: 'hosp-002',
    name: 'Safdarjung District Hospital',
    city: 'New Delhi',
    distance: '3.8 km',
    currentWaitMins: 20,
    occupancy: 'Moderate (54%)',
    departments: ['General Medicine', 'Dermatology', 'Ophthalmology', 'Dental'],
  },
  {
    id: 'hosp-003',
    name: 'Apollo Super Speciality Facility',
    city: 'New Delhi',
    distance: '5.1 km',
    currentWaitMins: 15,
    occupancy: 'Low (35%)',
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Emergency Trauma'],
  },
];

export const HospitalSelect: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockHospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.departments.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-3xl mx-auto pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Select Hospital & OPD</h1>
        <p className="text-xs text-slate-500 mt-1">Realtime queue wait times and department capacity across your city</p>
      </header>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by hospital name or department (e.g., Cardiology)..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Hospital Cards List */}
      <div className="space-y-4">
        {filtered.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{hospital.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{hospital.city} • {hospital.distance} away</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {hospital.occupancy}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Est. Wait: <strong>~{hospital.currentWaitMins} mins</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Available Doctors: <strong>8 Active</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {hospital.departments.map((dept) => (
                  <span key={dept} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={`/book-appointment?hospitalId=${hospital.id}`}
              className="flex items-center justify-center gap-1 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-xs transition"
            >
              <span>Book OPD Token</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
