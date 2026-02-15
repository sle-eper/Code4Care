import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import { api } from '../api';

export default function PatientDetail({
  patient,
  serviceName,
  serviceColor,
  canEdit,
  isDoctor,
  userName,
  onClose,
  onEdited,
  onTransfer,
  onReactivate,
}) {
  const [newNote, setNewNote] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [editingAdditionalNotes, setEditingAdditionalNotes] = useState(false);
  const [additionalNotesDraft, setAdditionalNotesDraft] = useState(patient.additionalNotes || '');
  const [savingAdditionalNotes, setSavingAdditionalNotes] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const color = serviceColor || '#64748b';

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await api.ai.summary({
        ...patient,
        serviceName,
      });
      const summary = res.summary?.trim();
      if (summary) {
        await api.patients.update(patient.id, {
          aiSummary: summary,
          updatedBy: userName,
        });
        onEdited?.();
      } else {
        alert('No summary returned. Check backend and .env (MINIMAX_API_KEY).');
      }
    } catch (e) {
      alert(e.message || 'Failed to generate summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const startEditAdditionalNotes = () => {
    setAdditionalNotesDraft(patient.additionalNotes || '');
    setEditingAdditionalNotes(true);
  };

  const cancelEditAdditionalNotes = () => {
    setEditingAdditionalNotes(false);
    setAdditionalNotesDraft(patient.additionalNotes || '');
  };

  const saveAdditionalNotes = async () => {
    setSavingAdditionalNotes(true);
    try {
      await api.patients.update(patient.id, {
        additionalNotes: additionalNotesDraft.trim() || null,
        updatedBy: userName,
      });
      setEditingAdditionalNotes(false);
      onEdited?.();
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingAdditionalNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || addingNote) return;
    setAddingNote(true);
    try {
      await api.patients.addNote(patient.id, newNote.trim(), userName);
      setNewNote('');
      onEdited?.();
    } catch (e) {
      alert(e.message);
    } finally {
      setAddingNote(false);
    }
  };

  // QR content: readable patient info + care profile from form data
  const qrData = [
    'PATIENT',
    `${patient.fullName} · Room ${patient.roomNumber}`,
    `Medical ID: ${patient.medicalId || '—'}`,
    `Service: ${serviceName || '—'}`,
    `Age ${patient.age} · ${patient.gender}`,
    '',
    'CARE PROFILE',
    `Temperature: ${patient.tempPreference || '-'}`,
    `Noise: ${patient.noisePreference || '-'}`,
    `Dietary: ${patient.dietary || 'None'}`,
    `Sleep: ${patient.sleepSchedule || '-'}`,
    `Communication: ${patient.communicationStyle || '-'}`,
    `Beliefs: ${patient.beliefs || '-'}`,
    `Hobbies: ${patient.hobbies || '-'}`,
    `Dislikes: ${patient.dislikes || '-'}`,
    `Visitation: ${patient.visitation || '-'}`,
    patient.additionalNotes ? `Notes: ${patient.additionalNotes}` : '',
  ].filter(Boolean).join('\n');

  return (
    <>
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{patient.fullName}</h3>
            <p className="text-sm text-slate-500">
              {patient.medicalId || ''} · Room {patient.roomNumber} ·{' '}
              <span className="px-1.5 py-0.5 rounded text-xs text-white" style={{ background: color }}>
                {serviceName}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdited?.('edit')}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="px-3 py-1.5 border border-slate-300 text-sm rounded-lg hover:bg-slate-50"
            >
              QR Code
            </button>
          </div>
        </div>

        {(patient.dietary || patient.sleepSchedule || patient.beliefs || patient.hobbies || patient.dislikes || patient.visitation || patient.additionalNotes || (patient.tempPreference && patient.tempPreference !== 'Moderate') || (patient.noisePreference && patient.noisePreference !== 'Moderate') || (patient.communicationStyle && patient.communicationStyle !== 'Simple')) ? (
          <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="font-medium text-slate-700 mb-3">Care profile</h4>
            <div className="text-sm text-slate-700 space-y-3">
              <div>
                <p className="font-semibold text-indigo-800 mb-1">Comfort & environment</p>
                <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>Temperature: {patient.tempPreference || 'Not specified'}</span></p>
                <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>Noise: {patient.noisePreference || 'Not specified'}</span></p>
                {patient.sleepSchedule && <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>Sleep: {patient.sleepSchedule}</span></p>}
              </div>
              <div>
                <p className="font-semibold text-indigo-800 mb-1">Diet & preferences</p>
                <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>{patient.dietary || 'No dietary restrictions'}</span></p>
              </div>
              <div>
                <p className="font-semibold text-indigo-800 mb-1">Avoid</p>
                <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>{patient.dislikes || 'Nothing specific noted'}</span></p>
                {patient.beliefs && <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>Beliefs: {patient.beliefs}</span></p>}
              </div>
              <div>
                <p className="font-semibold text-indigo-800 mb-1">How to interact with this patient</p>
                <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>Communication style: {patient.communicationStyle || 'Not specified'}</span></p>
              </div>
              <div>
                <p className="font-semibold text-indigo-800 mb-1">Practical tips</p>
                {patient.visitation && <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>Visitation: {patient.visitation}</span></p>}
                {patient.hobbies && <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>Hobbies: {patient.hobbies}</span></p>}
                {!patient.visitation && !patient.hobbies && <p className="ml-4 flex gap-2"><span className="text-indigo-500 shrink-0">–</span><span>No specific tips noted</span></p>}
              </div>
              {patient.additionalNotes && (
                <div>
                  <p className="font-semibold text-indigo-800 mb-1">Additional notes</p>
                  <p className="ml-4 text-slate-600 whitespace-pre-wrap">{patient.additionalNotes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-500">No care profile yet. Complete the questionnaire (Edit) to generate it.</p>
          </div>
        )}

        {patient.clinicalNotes?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-slate-700 mb-1">Clinical notes</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              {patient.clinicalNotes.map((n, i) => (
                <li key={i}>
                  {new Date(n.at).toLocaleString()} — {n.by}: {n.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isDoctor && (
          <div className="mb-4">
            <label className="block font-medium text-slate-700 mb-1">Add clinical note</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Observation..."
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {canEdit && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onTransfer?.(patient)}
              className="px-3 py-1.5 border border-amber-500 text-amber-700 text-sm rounded-lg hover:bg-amber-50"
            >
              Transfer to other service
            </button>
            {patient.status !== 'Active' && onReactivate && (
              <button
                type="button"
                onClick={() => onReactivate(patient)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                Reactivate (returning patient)
              </button>
            )}
          </div>
        )}

        <div className="border-t border-slate-200 pt-3">
          <h4 className="font-medium text-slate-700 mb-1">Last 5 changes (Audit trail)</h4>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-slate-500">Date</th>
                <th className="text-left text-slate-500">By</th>
                <th className="text-left text-slate-500">Action</th>
                <th className="text-left text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody>
              {patient.auditTrail?.length
                ? patient.auditTrail.map((a, i) => (
                    <tr key={i}>
                      <td className="text-xs text-slate-500">{new Date(a.at).toLocaleString()}</td>
                      <td className="text-xs">{a.by}</td>
                      <td className="text-xs">{a.action}</td>
                      <td className="text-xs text-slate-600">{a.details || ''}</td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={4} className="text-slate-400">
                        No history
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {showQr && (
        <Modal onClose={() => setShowQr(false)}>
          <div className="p-8 flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 mb-1">{patient.fullName}</h3>
            <p className="text-sm text-slate-500 mb-1">Room {patient.roomNumber} · {patient.medicalId || '—'}</p>
            <p className="text-xs text-slate-400 mb-5">Scan to view patient info and care profile</p>
            <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
              <QRCodeSVG
                value={qrData}
                size={220}
                level="M"
                bgColor="#ffffff"
                fgColor="#1e293b"
                includeMargin={false}
              />
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
              <span>{serviceName}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="mt-5 px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
