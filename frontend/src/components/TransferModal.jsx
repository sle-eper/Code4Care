import React, { useState } from 'react';
import Modal from './Modal';

export default function TransferModal({ patient, services, onTransfer, onClose }) {
  const [serviceId, setServiceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  const options = services.filter((s) => s.id !== patient?.serviceId);
  const selectedService = services.find((s) => String(s.id) === serviceId);
  const fromService = services.find((s) => s.id === patient?.serviceId);

  React.useEffect(() => {
    if (options.length) setServiceId(String(options[0].id));
  }, [patient?.serviceId, options.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!serviceId) return;
    setConfirmStep(true);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onTransfer(patient.id, parseInt(serviceId, 10));
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Transfer Patient</h3>
        <p className="text-slate-600 mb-4">
          {patient?.fullName} — from {fromService?.name}
        </p>

        {!confirmStep ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Service</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                {options.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Transfer
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">Are you sure you want to transfer this patient?</p>
              <p className="text-sm text-amber-700 mt-1">
                <strong>{patient?.fullName}</strong> will be moved from <strong>{fromService?.name}</strong> to <strong>{selectedService?.name}</strong>.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmStep(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                Go back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={saving}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60"
              >
                {saving ? 'Transferring...' : 'Confirm transfer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
