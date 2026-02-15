import React from 'react';

interface Patient {
  fullName: string;
  medicalId?: string;
  roomNumber: string;
  status: string;
  age?: number;
  gender?: string;
}

interface PatientCardProps {
  patient: Patient;
  serviceName?: string;
  serviceColor?: string;
  onClick: () => void;
}

const UserIcon = () => (
  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const RoomIcon = () => (
  <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function PatientCard({ patient, serviceName, serviceColor, onClick }: PatientCardProps) {
  const color = serviceColor || 'hsl(var(--muted-foreground))';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="group bg-card rounded-2xl shadow-card border border-border p-5 card-hover cursor-pointer relative overflow-hidden"
    >
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: color }} />

      <div className="flex justify-between items-start pl-2">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
              <UserIcon />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">{patient.fullName}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono">{patient.medicalId || '—'}</span>
                <span className="text-border">|</span>
                <RoomIcon />
                <span>{patient.roomNumber}</span>
              </div>
            </div>
          </div>

          {serviceName && (
            <div className="flex items-center gap-2 pl-11">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ background: color }}
              >
                {serviceName}
              </span>
            </div>
          )}
        </div>

        <span className={patient.status === 'Active' ? 'badge-active' : 'badge-discharged'}>
          {patient.status}
        </span>
      </div>
    </div>
  );
}
