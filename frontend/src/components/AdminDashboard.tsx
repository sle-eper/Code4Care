import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from './Modal';
import { useT } from '../i18n';

/* ── SVG Icons ── */
const UsersIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const HeartIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const StethIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" />
  </svg>
);
const BuildingIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
    <path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" />
    <path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const PenIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default function AdminDashboard() {
  const { t } = useT();
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

  const addService = () => setModal({ type: 'service', name: '', color: '#0d9488' });

  const saveService = async () => {
    if (!modal?.name?.trim()) return;
    try {
      await api.services.create(modal.name.trim(), modal.color);
      setModal(null); load();
    } catch (e: any) { alert(e.message); }
  };

  const removeService = async (id: number) => {
    if (!confirm(t('admin.confirmRemoveService'))) return;
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
    if (!modal.id && !modal?.password) { alert(t('admin.passwordRequired')); return; }
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
    if (!confirm(t('admin.confirmRemoveStaff'))) return;
    try { await api.staff.delete(id); load(); } catch (e: any) { alert(e.message); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 w-full" />)}
    </div>
  );

  const statCards = [
    { label: t('admin.totalPatients'), value: stats.totalPatients ?? 0, icon: <UsersIcon />, bgColor: 'bg-primary/10', textColor: 'text-primary' },
    { label: t('admin.activePatients'), value: stats.activePatients ?? 0, icon: <HeartIcon />, bgColor: 'bg-success/10', textColor: 'text-success' },
    { label: t('admin.staff'), value: staff.length, icon: <StethIcon />, bgColor: 'bg-info/10', textColor: 'text-info' },
    { label: t('admin.services'), value: services.length, icon: <BuildingIcon />, bgColor: 'bg-accent-foreground/10', textColor: 'text-accent-foreground' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('admin.title')}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage services, staff and view system statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl shadow-card border border-border p-5 card-hover">
            <div className="flex items-center gap-3.5">
              <div className={`stat-icon ${stat.bgColor} ${stat.textColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-0.5`}>{stat.value}</p>
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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><BuildingIcon /></div>
              <h3 className="font-semibold text-card-foreground">{t('admin.servicesHeading')}</h3>
            </div>
            <button type="button" onClick={addService} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5">
              <PlusIcon /> {t('admin.addService')}
            </button>
          </div>
          <ul className="divide-y divide-border p-1.5 max-h-72 overflow-y-auto">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-xl transition-colors">
                <span className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm" style={{ background: s.color }} />
                  <span className="text-sm font-medium text-card-foreground">{s.name}</span>
                </span>
                <button type="button" onClick={() => removeService(s.id)}
                  className="text-destructive/70 hover:text-destructive text-xs font-medium transition-colors flex items-center gap-1">
                  <TrashIcon /> {t('admin.remove')}
                </button>
              </li>
            ))}
            {services.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No services yet</li>
            )}
          </ul>
        </div>

        {/* Staff */}
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center text-info"><StethIcon /></div>
              <h3 className="font-semibold text-card-foreground">{t('admin.staffHeading')}</h3>
            </div>
            <button type="button" onClick={addStaff} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5">
              <PlusIcon /> {t('admin.registerStaff')}
            </button>
          </div>
          <ul className="divide-y divide-border p-1.5 max-h-72 overflow-y-auto">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="capitalize">{s.role}</span>
                      {s.serviceName && <span> · {s.serviceName}</span>}
                    </p>
                  </div>
                </div>
                {s.role !== 'admin' && (
                  <span className="flex gap-2 shrink-0 ml-2">
                    <button type="button" onClick={() => editStaff(s)}
                      className="text-primary/70 hover:text-primary text-xs font-medium transition-colors flex items-center gap-1">
                      <PenIcon /> {t('admin.edit')}
                    </button>
                    <button type="button" onClick={() => removeStaff(s.id)}
                      className="text-destructive/70 hover:text-destructive text-xs font-medium transition-colors flex items-center gap-1">
                      <TrashIcon />
                    </button>
                  </span>
                )}
              </li>
            ))}
            {staff.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No staff registered yet</li>
            )}
          </ul>
        </div>
      </div>

      {/* Add Service Modal */}
      {modal?.type === 'service' && (
        <Modal onClose={() => setModal(null)}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-card-foreground mb-5">{t('admin.addServiceTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">{t('admin.serviceName')}</label>
                <input type="text" value={modal.name}
                  onChange={(e) => setModal((m: any) => ({ ...m, name: e.target.value }))}
                  className="input-field" placeholder={t('admin.serviceNamePlaceholder')} autoFocus />
              </div>
              <div>
                <label className="label-field">{t('admin.serviceColor')}</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={modal.color}
                    onChange={(e) => setModal((m: any) => ({ ...m, color: e.target.value }))}
                    className="h-10 w-14 rounded-lg border border-input cursor-pointer" />
                  <span className="text-sm text-muted-foreground font-mono">{modal.color}</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">{t('admin.cancel')}</button>
                <button type="button" onClick={saveService} className="btn-primary">{t('admin.save')}</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Staff Modal */}
      {modal?.type === 'staff' && (
        <Modal onClose={() => setModal(null)}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-card-foreground mb-5">{modal.id ? t('admin.editStaffTitle') : t('admin.registerStaffTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">{t('admin.fullName')}</label>
                <input type="text" value={modal.name}
                  onChange={(e) => setModal((m: any) => ({ ...m, name: e.target.value }))}
                  className="input-field" autoFocus />
              </div>
              <div>
                <label className="label-field">{t('admin.username')}</label>
                <input type="text" value={modal.username}
                  onChange={(e) => setModal((m: any) => ({ ...m, username: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="label-field">{t('admin.password')} {modal.id && <span className="text-muted-foreground font-normal">{t('admin.passwordKeep')}</span>}</label>
                <input type="password" value={modal.password}
                  onChange={(e) => setModal((m: any) => ({ ...m, password: e.target.value }))}
                  className="input-field" placeholder={modal.id ? '••••••••' : ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">{t('admin.role')}</label>
                  <select value={modal.role}
                    onChange={(e) => setModal((m: any) => ({ ...m, role: e.target.value }))}
                    className="select-field">
                    <option value="nurse">{t('admin.roleNurse')}</option>
                    <option value="doctor">{t('admin.roleDoctor')}</option>
                    {modal.id && modal.role === 'admin' && <option value="admin">{t('admin.roleAdmin')}</option>}
                  </select>
                </div>
                <div>
                  <label className="label-field">{t('admin.service')}</label>
                  <select value={modal.serviceId}
                    onChange={(e) => setModal((m: any) => ({ ...m, serviceId: e.target.value }))}
                    className="select-field">
                    <option value="">{t('admin.servicePlaceholder')}</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">{t('admin.cancel')}</button>
                <button type="button" onClick={saveStaff} className="btn-primary">
                  {modal.id ? t('admin.save') : t('admin.register')}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
