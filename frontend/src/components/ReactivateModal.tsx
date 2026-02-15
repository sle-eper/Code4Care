import React, { useState } from 'react';
import Modal from './Modal';

interface ReactivateModalProps {
  patient: any;
  services: Array<{ id: number; name: string }>;
  defaultServiceId?: number;
  onReactivate: (patientId: number, roomNumber: string, serviceId: number) => Promise<void>;
  onClose: () => void;
}

export default function ReactivateModal({ patient, services, defaultServiceId, onReactivate, onClose }: ReactivateModalProps) {
  const [roomNumber, setRoomNumber] = useState('');
  const [serviceId, setServiceId] = useState(String(defaultServiceId ?? services[0]?.id ?? ''));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !serviceId) return;
    setSaving(true);
    try {
      await onReactivate(patient.id, roomNumber.trim(), parseInt(serviceId, 10));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-bold text-card-foreground mb-2">Returning patient</h3>
        <div className="p-4 bg-accent rounded-2xl border border-primary/10 mb-5">
          <p className="text-sm text-accent-foreground">
            <strong>{patient?.fullName}</strong> (Medical ID: {patient?.medicalId}). Assign new room and service. All preferences are kept.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Room number</label>
            <input type="text" required value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="input-field" placeholder="e.g. 101" />
          </div>
          <div>
            <label className="label-field">Service</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="select-field">
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-success">
              {saving ? 'Reactivating…' : 'Reactivate'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
