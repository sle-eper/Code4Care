import React, { useState, useRef } from 'react';
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

/* ── SVG Icons ── */
const QrIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
  </svg>
);
const PenIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const ThermIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </svg>
);
const MoonIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);
const UtensilsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);
const MessageIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
const ClipboardIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const HistoryIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
  </svg>
);
const SpeakerIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);
const StopCircleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><rect width="6" height="6" x="9" y="9" />
  </svg>
);

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

  // TTS state
  const [ttsState, setTtsState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

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

  // Build natural-language text for TTS — reads everything shown in the care profile
  const buildTtsText = () => {
    const parts: string[] = [];

    parts.push(`Care profile for ${patient.fullName}.`);
    parts.push(`Room ${patient.roomNumber}, ${serviceName || 'unknown service'}.`);

    // Comfort & Environment
    parts.push(`Comfort and environment.`);
    parts.push(`Temperature preference: ${patient.tempPreference || 'Not specified'}.`);
    parts.push(`Noise level: ${patient.noisePreference || 'Not specified'}.`);
    if (patient.sleepSchedule) {
      parts.push(`Sleep schedule: ${patient.sleepSchedule}.`);
    }

    // Diet
    parts.push(`Diet and preferences: ${patient.dietary || 'No dietary restrictions'}.`);

    // Avoid
    parts.push(`Things to avoid: ${patient.dislikes || 'Nothing specific noted'}.`);
    if (patient.beliefs) {
      parts.push(`Beliefs to be aware of: ${patient.beliefs}.`);
    }

    // Interaction
    parts.push(`Communication style: ${patient.communicationStyle || 'Not specified'}.`);

    // Practical tips
    if (patient.visitation) {
      parts.push(`Visitation preferences: ${patient.visitation}.`);
    }
    if (patient.hobbies) {
      parts.push(`Hobbies and interests: ${patient.hobbies}.`);
    }

    // Care preferences
    if (patient.doctorGenderPref && patient.doctorGenderPref !== 'No preference') {
      parts.push(`Nurse gender preference: ${patient.doctorGenderPref}.`);
    }
    if (patient.preferredLanguage) {
      parts.push(`Preferred language: ${patient.preferredLanguage}.`);
    }
    parts.push(`Pain tolerance: ${patient.painTolerance || 'Moderate'}.`);
    parts.push(`Emotional support needed: ${patient.emotionalSupport || 'Sometimes'}.`);
    if (patient.physicalContactOk) {
      parts.push(`Physical contact: ${patient.physicalContactOk}.`);
    }

    // Health & safety
    if (patient.fearOfNeedles === 'Yes') {
      parts.push(`Important: this patient has a fear of needles.`);
    }
    if (patient.knownAllergies) {
      parts.push(`Known allergies: ${patient.knownAllergies}.`);
    }

    // Additional notes
    if (patient.additionalNotes) {
      parts.push(`Additional notes: ${patient.additionalNotes}.`);
    }

    parts.push(`End of care profile.`);

    return parts.join(' ');
  };

  const handleTtsPlay = async () => {
    if (ttsState === 'playing') {
      // Stop
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setTtsState('idle');
      return;
    }

    setTtsState('loading');
    try {
      const text = buildTtsText();
      const blob = await api.tts.speak(text);

      // Revoke previous URL if any
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);

      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setTtsState('idle');
      audio.onerror = () => {
        setTtsState('idle');
        alert('Audio playback failed.');
      };

      await audio.play();
      setTtsState('playing');
    } catch (e: any) {
      setTtsState('idle');
      alert(e.message || 'Text-to-speech failed.');
    }
  };

  const qrData = [
    'PATIENT',
    `${patient.fullName} · Room ${patient.roomNumber}`,
    `Medical ID: ${patient.medicalId || '\u2014'}`,
    `Service: ${serviceName || '\u2014'}`,
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
    `Nurse gender: ${patient.doctorGenderPref || '-'}`,
    patient.preferredLanguage ? `Language: ${patient.preferredLanguage}` : '',
    `Pain tolerance: ${patient.painTolerance || '-'}`,
    `Fear of needles: ${patient.fearOfNeedles || 'No'}`,
    patient.knownAllergies ? `Allergies: ${patient.knownAllergies}` : '',
    patient.physicalContactOk ? `Contact: ${patient.physicalContactOk}` : '',
    `Emotional support: ${patient.emotionalSupport || '-'}`,
    patient.additionalNotes ? `Notes: ${patient.additionalNotes}` : '',
  ].filter(Boolean).join('\n');

  const hasProfile = patient.dietary || patient.sleepSchedule || patient.beliefs || patient.hobbies || patient.dislikes || patient.visitation || patient.additionalNotes || (patient.tempPreference && patient.tempPreference !== 'Moderate') || (patient.noisePreference && patient.noisePreference !== 'Moderate') || (patient.communicationStyle && patient.communicationStyle !== 'Simple') || (patient.doctorGenderPref && patient.doctorGenderPref !== 'No preference') || patient.preferredLanguage || (patient.painTolerance && patient.painTolerance !== 'Moderate') || patient.fearOfNeedles === 'Yes' || patient.knownAllergies || patient.physicalContactOk || (patient.emotionalSupport && patient.emotionalSupport !== 'Sometimes');

  const profileSections = [
    {
      icon: <ThermIcon />, title: 'Comfort & Environment',
      items: [
        { label: 'Temperature', value: patient.tempPreference || 'Not specified' },
        { label: 'Noise', value: patient.noisePreference || 'Not specified' },
        ...(patient.sleepSchedule ? [{ label: 'Sleep', value: patient.sleepSchedule }] : []),
      ],
    },
    {
      icon: <UtensilsIcon />, title: 'Diet & Preferences',
      items: [{ label: '', value: patient.dietary || 'No dietary restrictions' }],
    },
    {
      icon: <ShieldIcon />, title: 'Avoid & Sensitivities',
      items: [
        { label: '', value: patient.dislikes || 'Nothing specific noted' },
        ...(patient.beliefs ? [{ label: 'Beliefs', value: patient.beliefs }] : []),
      ],
    },
    {
      icon: <MessageIcon />, title: 'How to Interact',
      items: [{ label: 'Communication', value: patient.communicationStyle || 'Not specified' }],
    },
    {
      icon: <ClipboardIcon />, title: 'Practical Tips',
      items: [
        ...(patient.visitation ? [{ label: 'Visitation', value: patient.visitation }] : []),
        ...(patient.hobbies ? [{ label: 'Hobbies', value: patient.hobbies }] : []),
        ...(!patient.visitation && !patient.hobbies ? [{ label: '', value: 'No specific tips noted' }] : []),
      ],
    },
    {
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>,
      title: 'Care Preferences',
      items: [
        { label: 'Nurse gender', value: patient.doctorGenderPref || 'No preference' },
        ...(patient.preferredLanguage ? [{ label: 'Language', value: patient.preferredLanguage }] : []),
        { label: 'Pain tolerance', value: patient.painTolerance || 'Moderate' },
        { label: 'Emotional support', value: patient.emotionalSupport || 'Sometimes' },
        ...(patient.physicalContactOk ? [{ label: 'Physical contact', value: patient.physicalContactOk }] : []),
      ],
    },
    {
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>,
      title: 'Health & Safety',
      items: [
        { label: 'Fear of needles', value: patient.fearOfNeedles === 'Yes' ? 'Yes' : 'No' },
        ...(patient.knownAllergies ? [{ label: 'Allergies', value: patient.knownAllergies }] : [{ label: 'Allergies', value: 'None known' }]),
      ],
    },
  ];

  return (
    <>
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                {patient.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-card-foreground">{patient.fullName}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-muted-foreground font-mono">
                    {patient.medicalId || ''}
                  </span>
                  <span className="text-border">|</span>
                  <span className="text-sm text-muted-foreground">Room {patient.roomNumber}</span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                    style={{ background: color }}
                  >
                    {serviceName}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {canEdit && (
              <button type="button" onClick={() => onEdited?.('edit')} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5">
                <PenIcon /> Edit
              </button>
            )}
            <button type="button" onClick={() => setShowQr(true)} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
              <QrIcon /> QR
            </button>
          </div>
        </div>

        {/* Care Profile */}
        {hasProfile ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-card-foreground">Care Profile</h4>
              </div>
              {/* TTS Read Aloud button */}
              <button
                type="button"
                onClick={handleTtsPlay}
                disabled={ttsState === 'loading'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
                  ttsState === 'playing'
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 ring-1 ring-destructive/20'
                    : ttsState === 'loading'
                      ? 'bg-primary/10 text-primary animate-pulse cursor-wait'
                      : 'bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/15'
                }`}
                title={ttsState === 'playing' ? 'Stop reading' : 'Read care profile aloud'}
              >
                {ttsState === 'playing' ? (
                  <><StopCircleIcon /> Stop</>
                ) : ttsState === 'loading' ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <><SpeakerIcon /> Read aloud</>
                )}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profileSections.map((section) => (
                <div key={section.title} className="p-4 bg-muted/50 rounded-xl border border-border/60">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-primary/70">{section.icon}</span>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</p>
                  </div>
                  <div className="space-y-1.5">
                    {section.items.map((item, i) => (
                      <p key={i} className="text-sm text-card-foreground/80">
                        {item.label && <span className="font-medium text-card-foreground">{item.label}: </span>}
                        {item.value}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {patient.additionalNotes && (
              <div className="mt-3 p-4 bg-accent/50 rounded-xl border border-primary/10">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Additional Notes</p>
                <p className="text-sm text-card-foreground/80 whitespace-pre-wrap">{patient.additionalNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 p-5 bg-muted/40 rounded-2xl border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground font-medium">No care profile yet</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Complete the questionnaire (Edit) to generate it.</p>
          </div>
        )}

        {/* Clinical Notes */}
        {patient.clinicalNotes?.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-card-foreground mb-2 flex items-center gap-2 text-sm">
              <ClipboardIcon /> Clinical Notes
            </h4>
            <div className="space-y-2">
              {patient.clinicalNotes.map((n: any, i: number) => (
                <div key={i} className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-muted-foreground font-mono">{new Date(n.at).toLocaleString()}</span>
                    <span className="text-xs font-semibold text-primary">{n.by}</span>
                  </div>
                  <p className="text-sm text-card-foreground/80">{n.text}</p>
                </div>
              ))}
            </div>
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
                placeholder="Observation..."
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
            <button type="button" onClick={() => onTransfer?.(patient)} className="btn-warning-outline flex items-center gap-1.5">
              <ArrowRightIcon /> Transfer to other service
            </button>
            {patient.status !== 'Active' && onReactivate && (
              <button type="button" onClick={() => onReactivate(patient)} className="btn-success text-sm px-3 py-1.5">
                Reactivate (returning patient)
              </button>
            )}
          </div>
        )}

        {/* Audit Trail */}
        <div className="border-t border-border pt-5">
          <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2 text-sm">
            <HistoryIcon /> Last 5 changes (Audit trail)
          </h4>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-xs text-muted-foreground py-2.5 px-3 font-semibold uppercase tracking-wider">Date</th>
                  <th className="text-left text-xs text-muted-foreground py-2.5 px-3 font-semibold uppercase tracking-wider">By</th>
                  <th className="text-left text-xs text-muted-foreground py-2.5 px-3 font-semibold uppercase tracking-wider">Action</th>
                  <th className="text-left text-xs text-muted-foreground py-2.5 px-3 font-semibold uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {patient.auditTrail?.length
                  ? patient.auditTrail.map((a: any, i: number) => (
                      <tr key={i} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="text-xs text-muted-foreground py-2.5 px-3 font-mono">{new Date(a.at).toLocaleString()}</td>
                        <td className="text-xs font-medium py-2.5 px-3">{a.by}</td>
                        <td className="text-xs py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-muted rounded-md font-medium">{a.action}</span>
                        </td>
                        <td className="text-xs text-muted-foreground py-2.5 px-3">{a.details || ''}</td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td colSpan={4} className="text-muted-foreground py-6 text-center text-sm">No history</td>
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
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <QrIcon />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-0.5">{patient.fullName}</h3>
            <p className="text-sm text-muted-foreground mb-1">Room {patient.roomNumber} · {patient.medicalId || '\u2014'}</p>
            <p className="text-xs text-muted-foreground/60 mb-6">Scan to view patient info and care profile</p>
            <div className="p-5 bg-white rounded-2xl shadow-card border border-border">
              <QRCodeSVG
                value={qrData}
                size={220}
                level="M"
                bgColor="#ffffff"
                fgColor="hsl(210, 40%, 11%)"
                includeMargin={false}
              />
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span>{serviceName}</span>
            </div>
            <button type="button" onClick={() => setShowQr(false)} className="mt-6 btn-primary px-8">
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
