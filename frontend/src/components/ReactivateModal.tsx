import React, { useState } from 'react';
import { useT } from '../i18n';
import Modal from './Modal';

interface ReactivateModalProps {
  patient: any;
  services: Array<{ id: number; name: string }>;
  defaultServiceId?: number;
  onReactivate: (patientId: number, roomNumber: string, serviceId: number) => Promise<void>;
  onClose: () => void;
}

const RefreshIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export default function ReactivateModal({ patient, services, defaultServiceId, onReactivate, onClose }: ReactivateModalProps) {
  const { t } = useT();
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <RefreshIcon />
          </div>
          <div>
            <h3 className="text-xl font-bold text-card-foreground">{t('reactivate.title')}</h3>
            <p className="text-sm text-muted-foreground">Reactivate and assign a new room</p>
          </div>
        </div>

        <div className="p-4 bg-accent rounded-2xl border border-primary/10 mb-5">
          <p className="text-sm text-accent-foreground">
            <strong>{patient?.fullName}</strong> {t('reactivate.desc', { medicalId: patient?.medicalId || '' })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">{t('reactivate.roomNumber')}</label>
            <input type="text" required value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="input-field" placeholder={t('reactivate.roomPlaceholder')} autoFocus />
          </div>
          <div>
            <label className="label-field">{t('reactivate.service')}</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="select-field">
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">{t('reactivate.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-success flex items-center gap-1.5">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('reactivate.reactivating')}
                </span>
              ) : (
                <>
                  <RefreshIcon /> {t('reactivate.reactivate')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
