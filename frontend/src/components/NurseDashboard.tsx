import React, { useState, useEffect, useCallback } from 'react';
import { useT } from '../i18n';
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

/* ── SVG Icons ── */
const PlusIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const HeartPulseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </svg>
);
const RefreshIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export default function NurseDashboard({ user }: NurseDashboardProps) {
  const { t } = useT();
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
        setSavingLabel(t('nurse.regeneratingSummary'));
        let summary = '';
        try {
          const res = await api.ai.summary({ ...updated, serviceName: getService(updated.serviceId)?.name });
          summary = res.summary || '';
        } catch (err: any) {
          summary = updated.aiSummary || '';
          if (!summary) alert(t('nurse.summaryFailed', { error: err.message || 'Unknown error' }));
        }
        if (summary) await api.patients.update(formPatient.id, { ...updated, aiSummary: summary, updatedBy: user.name });
        closeFormModal(); load();
      } else {
        const created = await api.patients.create({ ...payload, createdBy: user.name });
        if (options.basicOnly) { closeFormModal(); load(); alert(t('nurse.patientRegistered')); return; }
        setSavingLabel(t('nurse.generatingSummary'));
        let summary = '';
        try {
          const res = await api.ai.summary({ ...created, serviceName: getService(created.serviceId)?.name });
          summary = res.summary || '';
        } catch (err: any) {
          summary = t('nurse.summaryNotGenerated');
          alert(t('nurse.summaryFailed', { error: err.message || 'Unknown error' }));
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('nurse.title')}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor your patients</p>
      </div>

      {/* Stats */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-5 card-hover">
        <div className="flex items-center gap-3.5">
          <div className="stat-icon bg-primary/10 text-primary">
            <HeartPulseIcon />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('nurse.patientsInService')}</p>
            <p className="text-2xl font-bold text-primary mt-0.5">{myPatients.length}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <button type="button" onClick={() => openForm(null)} className="btn-primary flex items-center gap-2">
          <PlusIcon /> {t('nurse.registerPatient')}
        </button>
        <button type="button" onClick={() => setShowReturningSearch(!showReturningSearch)} className="btn-secondary flex items-center gap-2">
          <RefreshIcon /> {t('nurse.findReturning')}
        </button>
      </div>

      {/* Returning Search */}
      {showReturningSearch && (
        <div className="bg-card rounded-2xl shadow-card border border-border p-5 animate-slide-up">
          <p className="text-sm text-muted-foreground mb-3">{t('nurse.returningSearchDesc')}</p>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"><SearchIcon /></span>
              <input type="text" value={returningSearch}
                onChange={(e) => setReturningSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchReturning()}
                placeholder={t('nurse.returningSearchPlaceholder')}
                className="input-field pl-10" />
            </div>
            <button type="button" onClick={searchReturning} className="btn-primary">{t('nurse.search')}</button>
          </div>
          {returningResults.length > 0 && (
            <ul className="mt-4 divide-y divide-border">
              {returningResults.map((p) => (
                <li key={p.id} className="py-3 flex justify-between items-center">
                  <span className="text-sm text-card-foreground">
                    <span className="font-medium">{p.fullName}</span>
                    <span className="text-muted-foreground"> · {p.medicalId || ''}</span>
                    {p.status !== 'Active' && <span className="badge-discharged ml-2">{p.status}</span>}
                  </span>
                  <button type="button" onClick={() => openDetail(p.id)} className="text-primary text-sm font-semibold hover:underline">
                    {t('nurse.open')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Patient Grid */}
      {myPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPatients.map((p) => (
            <PatientCard key={p.id} patient={p}
              serviceName={getService(p.serviceId)?.name}
              serviceColor={getService(p.serviceId)?.color}
              onClick={() => openDetail(p.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <HeartPulseIcon />
          </div>
          <p className="text-muted-foreground text-sm font-medium">No patients in your service yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Register a new patient to get started</p>
        </div>
      )}

      {/* Form Modal */}
      {modal === 'form' && (
        <Modal onClose={closeFormModal}>
          {formPatient !== null ? (
            <PatientForm patient={formPatient} services={services} defaultServiceId={serviceId}
              onSave={handleSavePatient} onClose={closeFormModal} saving={saving} savingLabel={savingLabel} />
          ) : registerStep === 'medical_id' ? (
            <div className="p-6">
              <h3 className="text-xl font-bold text-card-foreground mb-1">{t('nurse.registerTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-5">{t('nurse.registerDesc')}</p>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="label-field">Medical ID</label>
                  <input type="text" value={registerMedicalId}
                    onChange={(e) => setRegisterMedicalId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookupContinue()}
                    placeholder={t('nurse.medicalIdPlaceholder')}
                    className="input-field" autoFocus />
                </div>
                <button type="button" onClick={handleLookupContinue}
                  disabled={lookupLoading || !(registerMedicalId || '').trim()}
                  className="btn-primary mb-px">
                  {lookupLoading ? t('nurse.checking') : t('nurse.continue')}
                </button>
              </div>
            </div>
          ) : registerStep === 'already_exists' && registerExistingPatient ? (
            <div className="p-6">
              <h3 className="text-xl font-bold text-card-foreground mb-3">{t('nurse.alreadyRegisteredTitle')}</h3>
              <div className="p-4 bg-accent rounded-2xl border border-primary/15 mb-5">
                <p className="text-sm text-accent-foreground">
                  <strong>{registerExistingPatient.fullName}</strong> · Medical ID: {registerExistingPatient.medicalId} · Room: {registerExistingPatient.roomNumber}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{t('nurse.alreadyRegisteredDesc')}</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { closeFormModal(); openDetail(registerExistingPatient.id); }} className="btn-primary">
                  {t('nurse.openProfile')}
                </button>
                <button type="button" onClick={closeFormModal} className="btn-secondary">{t('nurse.cancel')}</button>
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
