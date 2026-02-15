import React from 'react';

export default function PatientCard({ patient, serviceName, serviceColor, onClick }) {
  const color = serviceColor || '#64748b';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="bg-white rounded-xl shadow border border-slate-100 p-4 card-hover transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-slate-800">{patient.fullName}</p>
          <p className="text-sm text-slate-500">
            {patient.medicalId || ''} · Room {patient.roomNumber}
          </p>
          {serviceName && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded text-xs text-white"
              style={{ background: color }}
            >
              {serviceName}
            </span>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {patient.status}
        </span>
      </div>
    </div>
  );
}
