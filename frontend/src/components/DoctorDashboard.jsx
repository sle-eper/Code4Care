import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from './Modal';
import PatientCard from './PatientCard';
import PatientDetail from './PatientDetail';

export default function DoctorDashboard({ user }) {
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailPatient, setDetailPatient] = useState(null);
  const [modal, setModal] = useState(null);

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

  const getService = (id) => services.find((s) => s.id === id);

  const openDetail = async (id) => {
    try {
      const p = await api.patients.get(id);
      setDetailPatient(p);
      setModal('detail');
    } catch (e) {
      alert(e.message);
    }
  };

  const refetchDetail = useCallback(async () => {
    if (!detailPatient?.id) return;
    try {
      const p = await api.patients.get(detailPatient.id);
      setDetailPatient(p);
    } catch (e) {
      console.error(e);
    }
  }, [detailPatient?.id]);

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, medical ID, or room..."
          className="px-4 py-2 border border-slate-300 rounded-lg flex-1 min-w-[200px]"
        />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
        >
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => (
          <PatientCard
            key={p.id}
            patient={p}
            serviceName={getService(p.serviceId)?.name}
            serviceColor={getService(p.serviceId)?.color}
            onClick={() => openDetail(p.id)}
          />
        ))}
      </div>

      {modal === 'detail' && detailPatient && (
        <Modal
          onClose={() => {
            setModal(null);
            setDetailPatient(null);
          }}
        >
          <PatientDetail
            patient={detailPatient}
            serviceName={getService(detailPatient.serviceId)?.name}
            serviceColor={getService(detailPatient.serviceId)?.color}
            canEdit={false}
            isDoctor
            userName={user.name}
            onClose={() => { setModal(null); setDetailPatient(null); }}
            onEdited={refetchDetail}
          />
        </Modal>
      )}
    </div>
  );
}