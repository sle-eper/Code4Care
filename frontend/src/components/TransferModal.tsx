import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface TransferModalProps {
  patient: any;
  services: Array<{ id: number; name: string; color?: string }>;
  onTransfer: (patientId: number, serviceId: number) => Promise<void>;
  onClose: () => void;
}

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const AlertIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

export default function TransferModal({ patient, services, onTransfer, onClose }: TransferModalProps) {
  const [serviceId, setServiceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  const options = services.filter((s) => s.id !== patient?.serviceId);
  const selectedService = services.find((s) => String(s.id) === serviceId);
  const fromService = services.find((s) => s.id === patient?.serviceId);

  useEffect(() => {
    if (options.length) setServiceId(String(options[0].id));
  }, [patient?.serviceId, options.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) return;
    setConfirmStep(true);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onTransfer(patient.id, parseInt(serviceId, 10));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <ArrowRightIcon />
          </div>
          <div>
            <h3 className="text-xl font-bold text-card-foreground">Transfer Patient</h3>
            <p className="text-sm text-muted-foreground">{patient?.fullName} — from {fromService?.name}</p>
          </div>
        </div>

        {!confirmStep ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Transfer to</label>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="select-field">
                {options.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-warning flex items-center gap-1.5">
                <ArrowRightIcon /> Transfer
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="p-4 bg-warning-muted border border-warning/20 rounded-2xl flex gap-3">
              <span className="text-warning shrink-0 mt-0.5"><AlertIcon /></span>
              <div>
                <p className="text-sm text-warning-muted-foreground font-semibold">Confirm transfer</p>
                <p className="text-sm text-warning-muted-foreground mt-1">
                  <strong>{patient?.fullName}</strong> will be moved from <strong>{fromService?.name}</strong> to <strong>{selectedService?.name}</strong>.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmStep(false)} className="btn-secondary">Go back</button>
              <button type="button" onClick={handleConfirm} disabled={saving} className="btn-warning flex items-center gap-1.5">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Transferring...
                  </span>
                ) : 'Confirm transfer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
