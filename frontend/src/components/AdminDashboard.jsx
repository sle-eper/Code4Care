import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from './Modal';

export default function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0, activePatients: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    try {
      const [svc, stf, patStats] = await Promise.all([
        api.services.list(),
        api.staff.list(),
        api.patients.stats().catch(() => ({ totalPatients: 0, activePatients: 0 })),
      ]);
      setServices(svc);
      setStaff(stf);
      setStats(patStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addService = () => {
    setModal({
      type: 'service',
      name: '',
      color: '#7c3aed',
    });
  };

  const saveService = async () => {
    if (!modal?.name?.trim()) return;
    try {
      await api.services.create(modal.name.trim(), modal.color);
      setModal(null);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const removeService = async (id) => {
    if (!confirm('Remove this service?')) return;
    try {
      await api.services.delete(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const addStaff = () => {
    setModal({
      type: 'staff',
      id: null,
      name: '',
      username: '',
      password: '',
      role: 'nurse',
      serviceId: String(services[0]?.id ?? ''),
    });
  };

  const editStaff = (s) => {
    setModal({
      type: 'staff',
      id: s.id,
      name: s.name,
      username: s.username,
      password: '',
      role: s.role,
      serviceId: s.serviceId != null ? String(s.serviceId) : '',
    });
  };

  const saveStaff = async () => {
    if (!modal?.name?.trim() || !modal?.username?.trim()) return;
    if (!modal.id && !modal?.password) {
      alert('Password is required for new staff.');
      return;
    }
    try {
      if (modal.id) {
        await api.staff.update(modal.id, {
          name: modal.name.trim(),
          username: modal.username.trim(),
          ...(modal.password ? { password: modal.password } : {}),
          role: modal.role,
          serviceId: modal.role === 'admin' ? null : (modal.serviceId ? parseInt(modal.serviceId, 10) : null),
        });
      } else {
        await api.staff.create({
          name: modal.name.trim(),
          username: modal.username.trim(),
          password: modal.password,
          role: modal.role,
          serviceId: modal.role === 'admin' ? null : parseInt(modal.serviceId, 10),
        });
      }
      setModal(null);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const removeStaff = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await api.staff.delete(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
          <p className="text-slate-500 text-sm">Total Patients</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.totalPatients ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
          <p className="text-slate-500 text-sm">Active Patients</p>
          <p className="text-2xl font-bold text-green-600">{stats.activePatients ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
          <p className="text-slate-500 text-sm">Staff</p>
          <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
          <p className="text-slate-500 text-sm">Services</p>
          <p className="text-2xl font-bold text-purple-600">{services.length}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Services</h3>
            <button
              type="button"
              onClick={addService}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              Add Service
            </button>
          </div>
          <ul className="divide-y divide-slate-100 p-2 max-h-64 overflow-y-auto">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeService(s.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Staff</h3>
            <button
              type="button"
              onClick={addStaff}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              Register Staff
            </button>
          </div>
          <ul className="divide-y divide-slate-100 p-2 max-h-64 overflow-y-auto">
            {staff.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg"
              >
                <span>
                  {s.name} ({s.role}) {s.serviceName ? `· ${s.serviceName}` : ''}
                </span>
                {s.role !== 'admin' && (
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editStaff(s)}
                      className="text-indigo-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStaff(s.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {modal?.type === 'service' && (
        <Modal onClose={() => setModal(null)}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={modal.name}
                  onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Neurologie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                <input
                  type="color"
                  value={modal.color}
                  onChange={(e) => setModal((m) => ({ ...m, color: e.target.value }))}
                  className="h-10 w-full rounded border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveService}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === 'staff' && (
        <Modal onClose={() => setModal(null)}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{modal.id ? 'Edit Staff' : 'Register Staff'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={modal.name}
                  onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={modal.username}
                  onChange={(e) => setModal((m) => ({ ...m, username: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {modal.id && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={modal.password}
                  onChange={(e) => setModal((m) => ({ ...m, password: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder={modal.id ? '••••••••' : ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={modal.role}
                  onChange={(e) => setModal((m) => ({ ...m, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="nurse">Nurse</option>
                  <option value="doctor">Doctor</option>
                  {modal.id && modal.role === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
                <select
                  value={modal.serviceId}
                  onChange={(e) => setModal((m) => ({ ...m, serviceId: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">—</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveStaff}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {modal.id ? 'Save' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
