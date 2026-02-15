import React, { useState } from 'react';
import Modal from './Modal';

export default function ReactivateModal({ patient, services, defaultServiceId, onReactivate, onClose }) {
  const [roomNumber, setRoomNumber] = useState('');
  const [serviceId, setServiceId] = useState(String(defaultServiceId ?? services[0]?.id ?? ''));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNumber.trim() || !serviceId) return;
    setSaving(true);
    try {
      await onReactivate(patient.id, roomNumber.trim(), parseInt(serviceId, 10));
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Returning patient</h3>
        <p className="text-slate-600 mb-4">
          {patient?.fullName} (Medical ID: {patient?.medicalId}). Assign new room and service. All preferences are kept.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room number</label>
            <input
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="e.g. 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              Reactivate
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
