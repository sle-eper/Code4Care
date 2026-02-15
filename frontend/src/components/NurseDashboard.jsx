import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Modal from './Modal';
import PatientCard from './PatientCard';
import PatientForm from './PatientForm';
import PatientDetail from './PatientDetail';
import TransferModal from './TransferModal';
import ReactivateModal from './ReactivateModal';

export default function NurseDashboard({ user }) {
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningSearch, setReturningSearch] = useState('');
  const [returningResults, setReturningResults] = useState([]);
  const [showReturningSearch, setShowReturningSearch] = useState(false);
  const [modal, setModal] = useState(null);
  const [detailPatient, setDetailPatient] = useState(null);
  const [formPatient, setFormPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState('');
  const [registerStep, setRegisterStep] = useState(null);
  const [registerMedicalId, setRegisterMedicalId] = useState('');
  const [registerExistingPatient, setRegisterExistingPatient] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const serviceId = user.serviceId;
  const myPatients = patients.filter((p) => p.serviceId === serviceId);

  const load = useCallback(async () => {
    try {
      const [svc, list] = await Promise.all([
        api.services.list(),
        api.patients.list({ serviceId, status: 'Active' }),
      ]);
      setServices(svc);
      setPatients(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    load();
  }, [load]);

  const getService = (id) => services.find((s) => s.id === id);

  const searchReturning = useCallback(async () => {
    if (!returningSearch.trim()) return;
    try {
      const list = await api.patients.list({ status: 'all', q: returningSearch.trim() });
      setReturningResults(list);
    } catch (e) {
      setReturningResults([]);
      alert(e.message);
    }
  }, [returningSearch]);

  const openDetail = async (id) => {
    try {
      const p = await api.patients.get(id);
      setDetailPatient(p);
      setModal('detail');
      setShowReturningSearch(false);
      setReturningResults([]);
      setReturningSearch('');
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

  const openForm = (patient = null) => {
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
    setModal(null);
    setFormPatient(null);
    setRegisterStep(null);
    setRegisterMedicalId('');
    setRegisterExistingPatient(null);
    setSavingLabel('');
  };

  const handleLookupContinue = async () => {
    const mid = (registerMedicalId || '').trim();
    if (!mid) return;
    setLookupLoading(true);
    try {
      const p = await api.patients.lookup(mid);
      setRegisterExistingPatient(p);
      setRegisterStep('already_exists');
    } catch (e) {
      const isNotFound = e.message && (e.message.includes('404') || e.message.toLowerCase().includes('not found'));
      if (isNotFound) {
        setRegisterMedicalId(mid);
        setRegisterStep('basic_form');
      } else {
        alert(e.message);
      }
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSavePatient = async (payload, options = {}) => {
    setSaving(true);
    setSavingLabel('');
    try {
      if (formPatient) {
        const updated = await api.patients.update(formPatient.id, { ...payload, updatedBy: user.name });
        setSavingLabel('Regenerating summary...');
        let summary = '';
        try {
          const res = await api.ai.summary({
            ...updated,
            serviceName: getService(updated.serviceId)?.name,
          });
          summary = res.summary || '';
        } catch (err) {
          summary = updated.aiSummary || '';
          if (!summary) alert(`Summary failed: ${err.message || 'Unknown error'}. Check .env (MINIMAX_API_KEY) and backend logs.`);
        }
        if (summary) {
          await api.patients.update(formPatient.id, { ...updated, aiSummary: summary, updatedBy: user.name });
        }
        closeFormModal();
        load();
      } else {
        const createdBy = user.name;
        const created = await api.patients.create({ ...payload, createdBy });
        if (options.basicOnly) {
          closeFormModal();
          load();
          alert('Patient registered. Open this patient at the bedside to complete the questionnaire.');
          return;
        }
        setSavingLabel('Generating profile summary...');
        let summary = '';
        try {
          const res = await api.ai.summary({
            ...created,
            serviceName: getService(created.serviceId)?.name,
          });
          summary = res.summary || '';
        } catch (err) {
          summary =
            'Profile summary could not be generated. Ask your admin to configure the AI on the server (see README).';
          alert(`Summary failed: ${err.message || 'Unknown error'}. Check .env (MINIMAX_API_KEY) and restart backend.`);
        }
        await api.patients.update(created.id, {
          ...created,
          aiSummary: summary,
          updatedBy: user.name,
        });
        closeFormModal();
        load();
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
      setSavingLabel('');
    }
  };

  const handleTransfer = async (id, sid) => {
    await api.patients.transfer(id, sid, user.name);
    setModal(null);
    setDetailPatient(null);
    load();
  };

  const handleReactivate = async (id, roomNumber, sid) => {
    await api.patients.update(id, {
      status: 'Active',
      roomNumber,
      serviceId: sid,
      updatedBy: user.name,
    });
    setModal(null);
    load();
    const p = await api.patients.get(id);
    setDetailPatient(p);
    setModal('detail');
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Nurse Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border border-slate-100 card-hover transition">
          <p className="text-slate-500 text-sm">Patients in my service</p>
          <p className="text-2xl font-bold text-indigo-600">{myPatients.length}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={() => openForm(null)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          Register new patient
        </button>
        <button
          type="button"
          onClick={() => setShowReturningSearch(!showReturningSearch)}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 font-medium"
        >
          Find returning patient
        </button>
      </div>
      {showReturningSearch && (
        <div className="bg-white rounded-xl shadow border border-slate-100 p-4">
          <p className="text-sm text-slate-600 mb-2">Search by Medical ID or name to reactivate (no need to refill the form).</p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={returningSearch}
              onChange={(e) => setReturningSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchReturning()}
              placeholder="Medical ID or name..."
              className="px-4 py-2 border border-slate-300 rounded-lg flex-1 min-w-[200px]"
            />
            <button
              type="button"
              onClick={searchReturning}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
          {returningResults.length > 0 && (
            <ul className="mt-3 divide-y divide-slate-100">
              {returningResults.map((p) => (
                <li key={p.id} className="py-2 flex justify-between items-center">
                  <span>
                    {p.fullName} · {p.medicalId || ''} {p.status !== 'Active' && `(${p.status})`}
                  </span>
                  <button
                    type="button"
                    onClick={() => openDetail(p.id)}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myPatients.map((p) => (
          <PatientCard
            key={p.id}
            patient={p}
            serviceName={getService(p.serviceId)?.name}
            serviceColor={getService(p.serviceId)?.color}
            onClick={() => openDetail(p.id)}
          />
        ))}
      </div>

      {modal === 'form' && (
        <Modal onClose={closeFormModal}>
          {formPatient !== null ? (
            <PatientForm
              patient={formPatient}
              services={services}
              defaultServiceId={serviceId}
              onSave={handleSavePatient}
              onClose={closeFormModal}
              saving={saving}
              savingLabel={savingLabel}
            />
          ) : registerStep === 'medical_id' ? (
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Register new patient</h3>
              <p className="text-sm text-slate-500 mb-4">Enter the patient&apos;s Medical ID. If they are already registered we&apos;ll open their profile; otherwise you&apos;ll add basic info first, then complete the questionnaire at the bedside.</p>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  value={registerMedicalId}
                  onChange={(e) => setRegisterMedicalId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupContinue()}
                  placeholder="Medical ID"
                  className="px-4 py-2 border border-slate-300 rounded-lg flex-1 min-w-[200px]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleLookupContinue}
                  disabled={lookupLoading || !(registerMedicalId || '').trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  {lookupLoading ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </div>
          ) : registerStep === 'already_exists' && registerExistingPatient ? (
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Patient already registered</h3>
              <p className="text-slate-600 mb-3">
                <strong>{registerExistingPatient.fullName}</strong> · Medical ID: {registerExistingPatient.medicalId} · Room: {registerExistingPatient.roomNumber}
              </p>
              <p className="text-sm text-slate-500 mb-4">Open their profile to view or edit. No need to refill the questionnaire.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeFormModal();
                    openDetail(registerExistingPatient.id);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Open profile
                </button>
                <button type="button" onClick={closeFormModal} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100">
                  Cancel
                </button>
              </div>
            </div>
          ) : registerStep === 'basic_form' ? (
            <PatientForm
              patient={null}
              services={services}
              defaultServiceId={serviceId}
              onSave={handleSavePatient}
              onClose={closeFormModal}
              saving={saving}
              savingLabel={savingLabel}
              basicOnly
              initialMedicalId={registerMedicalId}
            />
          ) : null}
        </Modal>
      )}

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
            canEdit
            isDoctor={false}
            userName={user.name}
            onClose={() => { setModal(null); setDetailPatient(null); }}
            onEdited={(action) => {
              if (action === 'edit') {
                setModal(null);
                openForm(detailPatient);
              } else {
                refetchDetail();
              }
            }}
            onTransfer={(p) => {
              setModal('transfer');
              setDetailPatient(p);
            }}
            onReactivate={(p) => {
              setModal('reactivate');
              setDetailPatient(p);
            }}
          />
        </Modal>
      )}

      {modal === 'transfer' && detailPatient && (
        <TransferModal
          patient={detailPatient}
          services={services}
          onTransfer={handleTransfer}
          onClose={() => setModal('detail')}
        />
      )}

      {modal === 'reactivate' && detailPatient && (
        <ReactivateModal
          patient={detailPatient}
          services={services}
          defaultServiceId={serviceId}
          onReactivate={handleReactivate}
          onClose={() => setModal('detail')}
        />
      )}
    </div>
  );
}
