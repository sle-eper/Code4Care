import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from './Modal';

export default function AdminDashboard() {
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPatients: 0, activePatients: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);

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

  useEffect(() => { load(); }, [load]);

  const addService = () => setModal({ type: 'service', name: '', color: '#7c3aed' });

  const saveService = async () => {
    if (!modal?.name?.trim()) return;
    try {
      await api.services.create(modal.name.trim(), modal.color);
      setModal(null); load();
    } catch (e: any) { alert(e.message); }
  };

  const removeService = async (id: number) => {
    if (!confirm('Remove this service?')) return;
    try { await api.services.delete(id); load(); } catch (e: any) { alert(e.message); }
  };

  const addStaff = () => setModal({
    type: 'staff', id: null, name: '', username: '', password: '',
    role: 'nurse', serviceId: String(services[0]?.id ?? ''),
  });

  const editStaff = (s: any) => setModal({
    type: 'staff', id: s.id, name: s.name, username: s.username, password: '',
    role: s.role, serviceId: s.serviceId != null ? String(s.serviceId) : '',
  });

  const saveStaff = async () => {
    if (!modal?.name?.trim() || !modal?.username?.trim()) return;
    if (!modal.id && !modal?.password) { alert('Password is required for new staff.'); return; }
    try {
      if (modal.id) {
        await api.staff.update(modal.id, {
          name: modal.name.trim(), username: modal.username.trim(),
          ...(modal.password ? { password: modal.password } : {}),
          role: modal.role,
          serviceId: modal.role === 'admin' ? null : (modal.serviceId ? parseInt(modal.serviceId, 10) : null),
        });
      } else {
        await api.staff.create({
          name: modal.name.trim(), username: modal.username.trim(), password: modal.password,
          role: modal.role,
          serviceId: modal.role === 'admin' ? null : parseInt(modal.serviceId, 10),
        });
      }
      setModal(null); load();
    } catch (e: any) { alert(e.message); }
  };

  const removeStaff = async (id: number) => {
    if (!confirm('Remove this staff member?')) return;
    try { await api.staff.delete(id); load(); } catch (e: any) { alert(e.message); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 w-full" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: stats.totalPatients ?? 0, icon: '👥', color: 'text-primary' },
          { label: 'Active Patients', value: stats.activePatients ?? 0, icon: '💚', color: 'text-success' },
          { label: 'Staff', value: staff.length, icon: '🩺', color: 'text-info' },
          { label: 'Services', value: services.length, icon: '🏥', color: 'text-accent-foreground' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl shadow-card border border-border p-5 card-hover">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Services & Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services */}
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">Services</h3>
            <button type="button" onClick={addService} className="btn-primary text-sm px-3 py-1.5">Add Service</button>
          </div>
          <ul className="divide-y divide-border p-2 max-h-64 overflow-y-auto">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted rounded-xl transition-colors">
                <span className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <span className="text-card-foreground">{s.name}</span>
                </span>
                <button type="button" onClick={() => removeService(s.id)} className="text-destructive text-sm font-medium hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Staff */}
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">Staff</h3>
            <button type="button" onClick={addStaff} className="btn-primary text-sm px-3 py-1.5">Register Staff</button>
          </div>
          <ul className="divide-y divide-border p-2 max-h-64 overflow-y-auto">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted rounded-xl transition-colors">
                <span className="text-card-foreground">
                  {s.name} <span className="text-muted-foreground">({s.role})</span>{' '}
                  {s.serviceName ? <span className="text-muted-foreground">· {s.serviceName}</span> : ''}
                </span>
                {s.role !== 'admin' && (
                  <span className="flex gap-3">
                    <button type="button" onClick={() => editStaff(s)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                    <button type="button" onClick={() => removeStaff(s.id)} className="text-destructive text-sm font-medium hover:underline">Remove</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add Service Modal */}
      {modal?.type === 'service' && (
        <Modal onClose={() => setModal(null)}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-card-foreground mb-5">Add Service</h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">Name</label>
                <input type="text" value={modal.name}
                  onChange={(e) => setModal((m: any) => ({ ...m, name: e.target.value }))}
                  className="input-field" placeholder="e.g. Neurologie" />
              </div>
              <div>
                <label className="label-field">Color</label>
                <input type="color" value={modal.color}
                  onChange={(e) => setModal((m: any) => ({ ...m, color: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-input cursor-pointer" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={saveService} className="btn-primary">Save</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Staff Modal */}
      {modal?.type === 'staff' && (
        <Modal onClose={() => setModal(null)}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-card-foreground mb-5">{modal.id ? 'Edit Staff' : 'Register Staff'}</h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">Full Name</label>
                <input type="text" value={modal.name}
                  onChange={(e) => setModal((m: any) => ({ ...m, name: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="label-field">Username</label>
                <input type="text" value={modal.username}
                  onChange={(e) => setModal((m: any) => ({ ...m, username: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="label-field">Password {modal.id && '(leave blank to keep current)'}</label>
                <input type="password" value={modal.password}
                  onChange={(e) => setModal((m: any) => ({ ...m, password: e.target.value }))}
                  className="input-field" placeholder={modal.id ? '••••••••' : ''} />
              </div>
              <div>
                <label className="label-field">Role</label>
                <select value={modal.role}
                  onChange={(e) => setModal((m: any) => ({ ...m, role: e.target.value }))}
                  className="select-field">
                  <option value="nurse">Nurse</option>
                  <option value="doctor">Doctor</option>
                  {modal.id && modal.role === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>
              <div>
                <label className="label-field">Service</label>
                <select value={modal.serviceId}
                  onChange={(e) => setModal((m: any) => ({ ...m, serviceId: e.target.value }))}
                  className="select-field">
                  <option value="">—</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={saveStaff} className="btn-primary">
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
