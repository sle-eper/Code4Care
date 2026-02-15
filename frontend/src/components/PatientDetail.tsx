import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import { api } from '../api';

interface PatientDetailProps {
  patient: any;
  serviceName?: string;
  serviceColor?: string;
  canEdit: boolean;
  isDoctor: boolean;
  userName: string;
  onClose: () => void;
  onEdited?: (action?: string) => void;
  onTransfer?: (patient: any) => void;
  onReactivate?: (patient: any) => void;
}

export default function PatientDetail({
  patient, serviceName, serviceColor, canEdit, isDoctor, userName,
  onClose, onEdited, onTransfer, onReactivate,
}: PatientDetailProps) {
  const [newNote, setNewNote] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [editingAdditionalNotes, setEditingAdditionalNotes] = useState(false);
  const [additionalNotesDraft, setAdditionalNotesDraft] = useState(patient.additionalNotes || '');
  const [savingAdditionalNotes, setSavingAdditionalNotes] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const color = serviceColor || 'hsl(var(--muted-foreground))';

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await api.ai.summary({ ...patient, serviceName });
      const summary = res.summary?.trim();
      if (summary) {
        await api.patients.update(patient.id, { aiSummary: summary, updatedBy: userName });
        onEdited?.();
      } else {
        alert('No summary returned. Check backend and .env (MINIMAX_API_KEY).');
      }
    } catch (e: any) {
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
    } catch (e: any) {
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
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAddingNote(false);
    }
  };

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

  const hasProfile = patient.dietary || patient.sleepSchedule || patient.beliefs || patient.hobbies || patient.dislikes || patient.visitation || patient.additionalNotes || (patient.tempPreference && patient.tempPreference !== 'Moderate') || (patient.noisePreference && patient.noisePreference !== 'Moderate') || (patient.communicationStyle && patient.communicationStyle !== 'Simple');

  return (
    <>
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-card-foreground">{patient.fullName}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-muted-foreground">
                {patient.medicalId || ''} · Room {patient.roomNumber}
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium text-primary-foreground"
                style={{ background: color }}
              >
                {serviceName}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button type="button" onClick={() => onEdited?.('edit')} className="btn-primary text-sm px-3 py-1.5">
                Edit
              </button>
            )}
            <button type="button" onClick={() => setShowQr(true)} className="btn-secondary text-sm px-3 py-1.5">
              QR Code
            </button>
          </div>
        </div>

        {/* Care Profile */}
        {hasProfile ? (
          <div className="mb-6 p-5 bg-accent rounded-2xl border border-primary/10">
            <h4 className="font-semibold text-card-foreground mb-3">Care profile</h4>
            <div className="text-sm text-card-foreground/80 space-y-4">
              <div>
                <p className="font-semibold text-accent-foreground mb-1">Comfort & environment</p>
                <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>Temperature: {patient.tempPreference || 'Not specified'}</span></p>
                <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>Noise: {patient.noisePreference || 'Not specified'}</span></p>
                {patient.sleepSchedule && <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>Sleep: {patient.sleepSchedule}</span></p>}
              </div>
              <div>
                <p className="font-semibold text-accent-foreground mb-1">Diet & preferences</p>
                <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>{patient.dietary || 'No dietary restrictions'}</span></p>
              </div>
              <div>
                <p className="font-semibold text-accent-foreground mb-1">Avoid</p>
                <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>{patient.dislikes || 'Nothing specific noted'}</span></p>
                {patient.beliefs && <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>Beliefs: {patient.beliefs}</span></p>}
              </div>
              <div>
                <p className="font-semibold text-accent-foreground mb-1">How to interact</p>
                <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>Communication: {patient.communicationStyle || 'Not specified'}</span></p>
              </div>
              <div>
                <p className="font-semibold text-accent-foreground mb-1">Practical tips</p>
                {patient.visitation && <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>Visitation: {patient.visitation}</span></p>}
                {patient.hobbies && <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>Hobbies: {patient.hobbies}</span></p>}
                {!patient.visitation && !patient.hobbies && <p className="ml-4 flex gap-2"><span className="text-primary shrink-0">–</span><span>No specific tips noted</span></p>}
              </div>
              {patient.additionalNotes && (
                <div>
                  <p className="font-semibold text-accent-foreground mb-1">Additional notes</p>
                  <p className="ml-4 text-muted-foreground whitespace-pre-wrap">{patient.additionalNotes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-muted rounded-2xl">
            <p className="text-sm text-muted-foreground">No care profile yet. Complete the questionnaire (Edit) to generate it.</p>
          </div>
        )}

        {/* Clinical Notes */}
        {patient.clinicalNotes?.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-card-foreground mb-2">Clinical notes</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              {patient.clinicalNotes.map((n: any, i: number) => (
                <li key={i} className="p-3 bg-muted rounded-xl">
                  <span className="text-xs text-muted-foreground/70">{new Date(n.at).toLocaleString()}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-medium text-card-foreground">{n.by}:</span>{' '}
                  {n.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Doctor: Add Note */}
        {isDoctor && (
          <div className="mb-6">
            <label className="label-field">Add clinical note</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="input-field flex-1"
                placeholder="Observation…"
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="btn-primary text-sm"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canEdit && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => onTransfer?.(patient)} className="btn-warning-outline">
              Transfer to other service
            </button>
            {patient.status !== 'Active' && onReactivate && (
              <button type="button" onClick={() => onReactivate(patient)} className="btn-success text-sm px-3 py-1.5">
                Reactivate (returning patient)
              </button>
            )}
          </div>
        )}

        {/* Audit Trail */}
        <div className="border-t border-border pt-4">
          <h4 className="font-semibold text-card-foreground mb-2">Last 5 changes (Audit trail)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground py-2 pr-3 font-medium">Date</th>
                  <th className="text-left text-muted-foreground py-2 pr-3 font-medium">By</th>
                  <th className="text-left text-muted-foreground py-2 pr-3 font-medium">Action</th>
                  <th className="text-left text-muted-foreground py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {patient.auditTrail?.length
                  ? patient.auditTrail.map((a: any, i: number) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="text-xs text-muted-foreground py-2 pr-3">{new Date(a.at).toLocaleString()}</td>
                        <td className="text-xs py-2 pr-3">{a.by}</td>
                        <td className="text-xs py-2 pr-3">{a.action}</td>
                        <td className="text-xs text-muted-foreground py-2">{a.details || ''}</td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td colSpan={4} className="text-muted-foreground py-2">No history</td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQr && (
        <Modal onClose={() => setShowQr(false)}>
          <div className="p-8 flex flex-col items-center">
            <h3 className="text-xl font-bold text-card-foreground mb-1">{patient.fullName}</h3>
            <p className="text-sm text-muted-foreground mb-1">Room {patient.roomNumber} · {patient.medicalId || '—'}</p>
            <p className="text-xs text-muted-foreground/70 mb-6">Scan to view patient info and care profile</p>
            <div className="p-5 bg-card rounded-2xl shadow-card border border-border">
              <QRCodeSVG
                value={qrData}
                size={220}
                level="M"
                bgColor="hsl(0 0% 100%)"
                fgColor="hsl(222 47% 11%)"
                includeMargin={false}
              />
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span>{serviceName}</span>
            </div>
            <button type="button" onClick={() => setShowQr(false)} className="mt-6 btn-primary">
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
