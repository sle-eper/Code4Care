import React from 'react';

interface Patient {
  fullName: string;
  medicalId?: string;
  roomNumber: string;
  status: string;
}

interface PatientCardProps {
  patient: Patient;
  serviceName?: string;
  serviceColor?: string;
  onClick: () => void;
}

export default function PatientCard({ patient, serviceName, serviceColor, onClick }: PatientCardProps) {
  const color = serviceColor || 'hsl(var(--muted-foreground))';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="bg-card rounded-2xl shadow-card border border-border p-5 card-hover cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <p className="font-semibold text-card-foreground">{patient.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {patient.medicalId || ''} · Room {patient.roomNumber}
          </p>
          {serviceName && (
            <span
              className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-primary-foreground"
              style={{ background: color }}
            >
              {serviceName}
            </span>
          )}
        </div>
        <span className={patient.status === 'Active' ? 'badge-active' : 'badge-discharged'}>
          {patient.status}
        </span>
      </div>
    </div>
  );
}
