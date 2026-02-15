import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from './Modal';
import PatientCard from './PatientCard';
import PatientForm from './PatientForm';
import PatientDetail from './PatientDetail';
import TransferModal from './TransferModal';
import ReactivateModal from './ReactivateModal';

interface NurseDashboardProps {
  user: { name: string; serviceId?: number };
}

export default function NurseDashboard({ user }: NurseDashboardProps) {
  const [services, setServices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningSearch, setReturningSearch] = useState('');
  const [returningResults, setReturningResults] = useState<any[]>([]);
  const [showReturningSearch, setShowReturningSearch] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [detailPatient, setDetailPatient] = useState<any>(null);
  const [formPatient, setFormPatient] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState('');
  const [registerStep, setRegisterStep] = useState<string | null>(null);
  const [registerMedicalId, setRegisterMedicalId] = useState('');
  const [registerExistingPatient, setRegisterExistingPatient] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const serviceId = user.serviceId;
  const myPatients = patients.filter((p) => p.serviceId === serviceId);

  const load = useCallback(async () => {
    try {
      const [svc, list] = await Promise.all([
        api.services.list(),
        api.patients.list({ serviceId: String(serviceId), status: 'Active' }),
      ]);
      setServices(svc);
      setPatients(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => { load(); }, [load]);

  const getService = (id: number) => services.find((s) => s.id === id);

  const searchReturning = useCallback(async () => {
    if (!returningSearch.trim()) return;
    try {
      const list = await api.patients.list({ status: 'all', q: returningSearch.trim() });
      setReturningResults(list);
    } catch (e: any) {
      setReturningResults([]);
      alert(e.message);
    }
  }, [returningSearch]);

  const openDetail = async (id: number) => {
    try {
      const p = await api.patients.get(id);
      setDetailPatient(p);
      setModal('detail');
      setShowReturningSearch(false);
      setReturningResults([]);
      setReturningSearch('');
    } catch (e: any) { alert(e.message); }
  };

  const refetchDetail = useCallback(async () => {
    if (!detailPatient?.id) return;
    try {
      const p = await api.patients.get(detailPatient.id);
      setDetailPatient(p);
    } catch (e) { console.error(e); }
  }, [detailPatient?.id]);

  const openForm = (patient: any = null) => {
    setFormPatient(patient);
    setDetailPatient(null);
    setModal('form');
    if (!patient) {
      setRegisterStep('medical_id');
      setRegisterMedicalId('');
      setRegisterExistingPatient(null);
    } else {
      setRegisterStep(null);
    }
  };

  const closeFormModal = () => {
    setModal(null); setFormPatient(null); setRegisterStep(null);
    setRegisterMedicalId(''); setRegisterExistingPatient(null); setSavingLabel('');
  };

  const handleLookupContinue = async () => {
    const mid = (registerMedicalId || '').trim();
    if (!mid) return;
    setLookupLoading(true);
    try {
      const p = await api.patients.lookup(mid);
      setRegisterExistingPatient(p);
      setRegisterStep('already_exists');
    } catch (e: any) {
      const isNotFound = e.message && (e.message.includes('404') || e.message.toLowerCase().includes('not found'));
      if (isNotFound) {
        setRegisterMedicalId(mid);
        setRegisterStep('basic_form');
      } else { alert(e.message); }
    } finally { setLookupLoading(false); }
  };

  const handleSavePatient = async (payload: any, options: any = {}) => {
    setSaving(true); setSavingLabel('');
    try {
      if (formPatient) {
        const updated = await api.patients.update(formPatient.id, { ...payload, updatedBy: user.name });
        setSavingLabel('Regenerating summary…');
        let summary = '';
        try {
          const res = await api.ai.summary({ ...updated, serviceName: getService(updated.serviceId)?.name });
          summary = res.summary || '';
        } catch (err: any) {
          summary = updated.aiSummary || '';
          if (!summary) alert(`Summary failed: ${err.message || 'Unknown error'}.`);
        }
        if (summary) await api.patients.update(formPatient.id, { ...updated, aiSummary: summary, updatedBy: user.name });
        closeFormModal(); load();
      } else {
        const created = await api.patients.create({ ...payload, createdBy: user.name });
        if (options.basicOnly) { closeFormModal(); load(); alert('Patient registered. Open this patient at the bedside to complete the questionnaire.'); return; }
        setSavingLabel('Generating profile summary…');
        let summary = '';
        try {
          const res = await api.ai.summary({ ...created, serviceName: getService(created.serviceId)?.name });
          summary = res.summary || '';
        } catch (err: any) {
          summary = 'Profile summary could not be generated.';
          alert(`Summary failed: ${err.message || 'Unknown error'}.`);
        }
        await api.patients.update(created.id, { ...created, aiSummary: summary, updatedBy: user.name });
        closeFormModal(); load();
      }
    } catch (e: any) { alert(e.message); } finally { setSaving(false); setSavingLabel(''); }
  };

  const handleTransfer = async (id: number, sid: number) => {
    await api.patients.transfer(id, sid, user.name);
    setModal(null); setDetailPatient(null); load();
  };

  const handleReactivate = async (id: number, roomNumber: string, sid: number) => {
    await api.patients.update(id, { status: 'Active', roomNumber, serviceId: sid, updatedBy: user.name });
    setModal(null); load();
    const p = await api.patients.get(id);
    setDetailPatient(p); setModal('detail');
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-48" />
      <div className="skeleton h-24 w-full max-w-sm" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-28 w-full" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Nurse Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl shadow-card p-5 border border-border card-hover">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <p className="text-sm text-muted-foreground">Patients in my service</p>
              <p className="text-2xl font-bold text-primary">{myPatients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <button type="button" onClick={() => openForm(null)} className="btn-primary">
          Register new patient
        </button>
        <button type="button" onClick={() => setShowReturningSearch(!showReturningSearch)} className="btn-secondary">
          Find returning patient
        </button>
      </div>

      {/* Returning Search */}
      {showReturningSearch && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-5 animate-slide-up">
          <p className="text-sm text-muted-foreground mb-3">Search by Medical ID or name to reactivate.</p>
          <div className="flex gap-3 flex-wrap">
            <input type="text" value={returningSearch}
              onChange={(e) => setReturningSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchReturning()}
              placeholder="Medical ID or name…"
              className="input-field flex-1 min-w-[200px]" />
            <button type="button" onClick={searchReturning} className="btn-primary">Search</button>
          </div>
          {returningResults.length > 0 && (
            <ul className="mt-4 divide-y divide-border">
              {returningResults.map((p) => (
                <li key={p.id} className="py-3 flex justify-between items-center">
                  <span className="text-card-foreground">
                    {p.fullName} · {p.medicalId || ''}{' '}
                    {p.status !== 'Active' && <span className="badge-discharged ml-1">{p.status}</span>}
                  </span>
                  <button type="button" onClick={() => openDetail(p.id)} className="text-primary text-sm font-medium hover:underline">
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myPatients.map((p) => (
          <PatientCard key={p.id} patient={p}
            serviceName={getService(p.serviceId)?.name}
            serviceColor={getService(p.serviceId)?.color}
            onClick={() => openDetail(p.id)} />
        ))}
      </div>

      {/* Form Modal */}
      {modal === 'form' && (
        <Modal onClose={closeFormModal}>
          {formPatient !== null ? (
            <PatientForm patient={formPatient} services={services} defaultServiceId={serviceId}
              onSave={handleSavePatient} onClose={closeFormModal} saving={saving} savingLabel={savingLabel} />
          ) : registerStep === 'medical_id' ? (
            <div className="p-6">
              <h3 className="text-xl font-bold text-card-foreground mb-2">Register new patient</h3>
              <p className="text-sm text-muted-foreground mb-5">Enter the patient&apos;s Medical ID. If they are already registered we&apos;ll open their profile.</p>
              <div className="flex gap-3 items-center flex-wrap">
                <input type="text" value={registerMedicalId}
                  onChange={(e) => setRegisterMedicalId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupContinue()}
                  placeholder="Medical ID"
                  className="input-field flex-1 min-w-[200px]" autoFocus />
                <button type="button" onClick={handleLookupContinue}
                  disabled={lookupLoading || !(registerMedicalId || '').trim()}
                  className="btn-primary">
                  {lookupLoading ? 'Checking…' : 'Continue'}
                </button>
              </div>
            </div>
          ) : registerStep === 'already_exists' && registerExistingPatient ? (
            <div className="p-6">
              <h3 className="text-xl font-bold text-card-foreground mb-2">Patient already registered</h3>
              <div className="p-4 bg-accent rounded-2xl border border-primary/10 mb-5">
                <p className="text-sm text-accent-foreground">
                  <strong>{registerExistingPatient.fullName}</strong> · Medical ID: {registerExistingPatient.medicalId} · Room: {registerExistingPatient.roomNumber}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Open their profile to view or edit.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { closeFormModal(); openDetail(registerExistingPatient.id); }} className="btn-primary">
                  Open profile
                </button>
                <button type="button" onClick={closeFormModal} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : registerStep === 'basic_form' ? (
            <PatientForm patient={null} services={services} defaultServiceId={serviceId}
              onSave={handleSavePatient} onClose={closeFormModal} saving={saving}
              savingLabel={savingLabel} basicOnly initialMedicalId={registerMedicalId} />
          ) : null}
        </Modal>
      )}

      {/* Detail Modal */}
      {modal === 'detail' && detailPatient && (
        <Modal onClose={() => { setModal(null); setDetailPatient(null); }}>
          <PatientDetail patient={detailPatient}
            serviceName={getService(detailPatient.serviceId)?.name}
            serviceColor={getService(detailPatient.serviceId)?.color}
            canEdit isDoctor={false} userName={user.name}
            onClose={() => { setModal(null); setDetailPatient(null); }}
            onEdited={(action) => {
              if (action === 'edit') { setModal(null); openForm(detailPatient); }
              else refetchDetail();
            }}
            onTransfer={(p) => { setModal('transfer'); setDetailPatient(p); }}
            onReactivate={(p) => { setModal('reactivate'); setDetailPatient(p); }} />
        </Modal>
      )}

      {modal === 'transfer' && detailPatient && (
        <TransferModal patient={detailPatient} services={services}
          onTransfer={handleTransfer} onClose={() => setModal('detail')} />
      )}

      {modal === 'reactivate' && detailPatient && (
        <ReactivateModal patient={detailPatient} services={services}
          defaultServiceId={serviceId} onReactivate={handleReactivate}
          onClose={() => setModal('detail')} />
      )}
    </div>
  );
}
