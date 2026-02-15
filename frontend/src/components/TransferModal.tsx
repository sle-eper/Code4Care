import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface TransferModalProps {
  patient: any;
  services: Array<{ id: number; name: string; color?: string }>;
  onTransfer: (patientId: number, serviceId: number) => Promise<void>;
  onClose: () => void;
}

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
        <h3 className="text-xl font-bold text-card-foreground mb-2">Transfer Patient</h3>
        <p className="text-muted-foreground mb-5">
          {patient?.fullName} — from {fromService?.name}
        </p>

        {!confirmStep ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">To Service</label>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="select-field">
                {options.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-warning">Transfer</button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="p-4 bg-warning-muted border border-warning/20 rounded-2xl">
              <p className="text-sm text-warning-muted-foreground font-medium">Are you sure you want to transfer this patient?</p>
              <p className="text-sm text-warning-muted-foreground mt-1">
                <strong>{patient?.fullName}</strong> will be moved from <strong>{fromService?.name}</strong> to <strong>{selectedService?.name}</strong>.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmStep(false)} className="btn-secondary">Go back</button>
              <button type="button" onClick={handleConfirm} disabled={saving} className="btn-warning">
                {saving ? 'Transferring…' : 'Confirm transfer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
