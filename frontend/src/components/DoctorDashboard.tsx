import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from './Modal';
import PatientCard from './PatientCard';
import PatientDetail from './PatientDetail';

interface DoctorDashboardProps {
  user: { name: string; serviceId?: number };
}

const SearchIcon = () => (
  <svg className="w-4 h-4 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const StethIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" />
  </svg>
);

export default function DoctorDashboard({ user }: DoctorDashboardProps) {
  const [services, setServices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailPatient, setDetailPatient] = useState<any>(null);
  const [modal, setModal] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [svc, list] = await Promise.all([
        api.services.list(),
        api.patients.list({
          ...(serviceFilter ? { serviceId: serviceFilter } : {}),
          ...(search.trim() ? { q: search.trim() } : {}),
        }),
      ]);
      setServices(svc);
      setPatients(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [serviceFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const getService = (id: number) => services.find((s) => s.id === id);

  const openDetail = async (id: number) => {
    try {
      const p = await api.patients.get(id);
      setDetailPatient(p);
      setModal('detail');
    } catch (e: any) { alert(e.message); }
  };

  const refetchDetail = useCallback(async () => {
    if (!detailPatient?.id) return;
    try {
      const p = await api.patients.get(detailPatient.id);
      setDetailPatient(p);
    } catch (e) { console.error(e); }
  }, [detailPatient?.id]);

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-48" />
      <div className="flex gap-3"><div className="skeleton h-11 flex-1" /><div className="skeleton h-11 w-40" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-28 w-full" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Doctor Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">View patients and add clinical notes</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, medical ID, or room..."
            className="input-field pl-10" />
        </div>
        <select value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="select-field w-auto min-w-[160px]">
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Patient Grid */}
      {patients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <PatientCard key={p.id} patient={p}
              serviceName={getService(p.serviceId)?.name}
              serviceColor={getService(p.serviceId)?.color}
              onClick={() => openDetail(p.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <StethIcon />
          </div>
          <p className="text-muted-foreground text-sm font-medium">No patients found</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Detail Modal */}
      {modal === 'detail' && detailPatient && (
        <Modal onClose={() => { setModal(null); setDetailPatient(null); }}>
          <PatientDetail patient={detailPatient}
            serviceName={getService(detailPatient.serviceId)?.name}
            serviceColor={getService(detailPatient.serviceId)?.color}
            canEdit={false} isDoctor userName={user.name}
            onClose={() => { setModal(null); setDetailPatient(null); }}
            onEdited={refetchDetail} />
        </Modal>
      )}
    </div>
  );
}
