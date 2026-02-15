import React, { useState, useEffect } from 'react';

const emptyPatient = {
  fullName: '', age: '', gender: 'Male', medicalId: '', roomNumber: '',
  status: 'Active', serviceId: '', tempPreference: 'Moderate', noisePreference: 'Moderate',
  dietary: '', sleepSchedule: '', communicationStyle: 'Simple', beliefs: '',
  hobbies: '', dislikes: '', visitation: '', additionalNotes: '',
  doctorGenderPref: 'No preference', preferredLanguage: '', painTolerance: 'Moderate',
  fearOfNeedles: 'No', knownAllergies: '', physicalContactOk: '', emotionalSupport: 'Sometimes',
};

interface PatientFormProps {
  patient: any;
  services: Array<{ id: number; name: string }>;
  defaultServiceId?: number;
  onSave: (payload: any, options?: any) => void;
  onClose: () => void;
  saving: boolean;
  savingLabel?: string;
  basicOnly?: boolean;
  initialMedicalId?: string;
}

/* ── SVG Icons ── */
const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const HeartHandIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const ShieldAlertIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="M12 8v4" /><path d="M12 16h.01" />
  </svg>
);
const SettingsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function PatientForm({
  patient, services, defaultServiceId, onSave, onClose, saving, savingLabel, basicOnly, initialMedicalId,
}: PatientFormProps) {
  const [form, setForm] = useState<Record<string, any>>(emptyPatient);

  useEffect(() => {
    if (patient) {
      setForm({
        fullName: patient.fullName || '', age: patient.age ?? '', gender: patient.gender || 'Male',
        medicalId: patient.medicalId || '', roomNumber: patient.roomNumber || '', status: patient.status || 'Active',
        serviceId: patient.serviceId ?? defaultServiceId ?? services[0]?.id ?? '',
        tempPreference: patient.tempPreference || 'Moderate', noisePreference: patient.noisePreference || 'Moderate',
        dietary: patient.dietary || '', sleepSchedule: patient.sleepSchedule || '',
        communicationStyle: patient.communicationStyle || 'Simple', beliefs: patient.beliefs || '',
        hobbies: patient.hobbies || '', dislikes: patient.dislikes || '', visitation: patient.visitation || '',
        additionalNotes: patient.additionalNotes || '',
        doctorGenderPref: patient.doctorGenderPref || 'No preference',
        preferredLanguage: patient.preferredLanguage || '',
        painTolerance: patient.painTolerance || 'Moderate',
        fearOfNeedles: patient.fearOfNeedles || 'No',
        knownAllergies: patient.knownAllergies || '',
        physicalContactOk: patient.physicalContactOk || '',
        emotionalSupport: patient.emotionalSupport || 'Sometimes',
      });
    } else {
      setForm((f) => ({
        ...emptyPatient,
        serviceId: defaultServiceId ?? services[0]?.id ?? '',
        medicalId: (initialMedicalId || f.medicalId || '').trim(),
      }));
    }
  }, [patient, defaultServiceId, services, initialMedicalId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isBasic = basicOnly && !patient;
    const payload = {
      fullName: form.fullName.trim(), age: parseInt(form.age, 10), gender: form.gender,
      medicalId: form.medicalId.trim(), roomNumber: form.roomNumber.trim(), status: form.status,
      serviceId: parseInt(form.serviceId, 10),
      tempPreference: isBasic ? null : form.tempPreference, noisePreference: isBasic ? null : form.noisePreference,
      dietary: isBasic ? null : (form.dietary.trim() || null), sleepSchedule: isBasic ? null : (form.sleepSchedule.trim() || null),
      communicationStyle: isBasic ? null : form.communicationStyle, beliefs: isBasic ? null : (form.beliefs.trim() || null),
      hobbies: isBasic ? null : (form.hobbies.trim() || null), dislikes: isBasic ? null : (form.dislikes.trim() || null),
      visitation: isBasic ? null : (form.visitation.trim() || null), additionalNotes: isBasic ? null : (form.additionalNotes.trim() || null),
      doctorGenderPref: isBasic ? null : form.doctorGenderPref,
      preferredLanguage: isBasic ? null : (form.preferredLanguage.trim() || null),
      painTolerance: isBasic ? null : form.painTolerance,
      fearOfNeedles: isBasic ? null : form.fearOfNeedles,
      knownAllergies: isBasic ? null : (form.knownAllergies.trim() || null),
      physicalContactOk: isBasic ? null : (form.physicalContactOk.trim() || null),
      emotionalSupport: isBasic ? null : form.emotionalSupport,
    };
    onSave(payload, { basicOnly: isBasic });
  };

  const showBasicOnly = basicOnly && !patient;

  return (
    <form onSubmit={handleSubmit} className="p-6 max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold text-card-foreground mb-1">
        {showBasicOnly ? 'Register patient (basic info)' : patient ? 'Edit Patient' : 'Register New Patient'}
      </h3>
      {showBasicOnly && (
        <p className="text-sm text-muted-foreground mb-4">Fill this before going to the patient. At the bedside, open this patient and complete the questionnaire.</p>
      )}

      <div className="space-y-6 mt-4">
        {/* ── Basic Information ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary"><UserIcon /></div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Basic Information</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={showBasicOnly ? 'col-span-2 order-first' : 'col-span-2'}>
              <label className="label-field">Medical ID *</label>
              <input type="text" required value={form.medicalId}
                onChange={(e) => setForm((f) => ({ ...f, medicalId: e.target.value }))}
                className="input-field font-mono" placeholder="Unique identifier"
                readOnly={!!initialMedicalId || !!patient} />
            </div>
            <div className="col-span-2">
              <label className="label-field">Full Name *</label>
              <input type="text" required value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Age *</label>
              <input type="number" required min={1} value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Gender</label>
              <select value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="select-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label-field">Room Number *</label>
              <input type="text" required value={form.roomNumber}
                onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                className="input-field" />
            </div>
            {!showBasicOnly && (
              <div>
                <label className="label-field">Status</label>
                <select value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="select-field">
                  <option value="Active">Active</option>
                  <option value="Discharged">Left hospital</option>
                </select>
              </div>
            )}
            <div className="col-span-2">
              <label className="label-field">Service</label>
              <select value={form.serviceId}
                onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}
                className="select-field">
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Preferences ── */}
        {!showBasicOnly && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-accent-foreground/10 flex items-center justify-center text-accent-foreground"><SettingsIcon /></div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Preferences & Care Profile</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Room temperature</label>
                <select value={form.tempPreference}
                  onChange={(e) => setForm((f) => ({ ...f, tempPreference: e.target.value }))}
                  className="select-field">
                  <option value="Cool">Cool</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Warm">Warm</option>
                </select>
              </div>
              <div>
                <label className="label-field">Noise level</label>
                <select value={form.noisePreference}
                  onChange={(e) => setForm((f) => ({ ...f, noisePreference: e.target.value }))}
                  className="select-field">
                  <option value="Quiet">Quiet</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Active">Active</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">Dietary preferences / allergies</label>
                <textarea rows={2} value={form.dietary}
                  onChange={(e) => setForm((f) => ({ ...f, dietary: e.target.value }))}
                  className="input-field" placeholder="e.g. Vegetarian, no gluten..." />
              </div>
              <div className="col-span-2">
                <label className="label-field">Sleep schedule</label>
                <input type="text" value={form.sleepSchedule}
                  onChange={(e) => setForm((f) => ({ ...f, sleepSchedule: e.target.value }))}
                  className="input-field" placeholder="e.g. 22:00 - 06:00" />
              </div>
              <div>
                <label className="label-field">Communication style</label>
                <select value={form.communicationStyle}
                  onChange={(e) => setForm((f) => ({ ...f, communicationStyle: e.target.value }))}
                  className="select-field">
                  <option value="Detailed">Detailed</option>
                  <option value="Simple">Simple</option>
                  <option value="Visual">Visual</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">Religious / Cultural beliefs</label>
                <textarea rows={2} value={form.beliefs}
                  onChange={(e) => setForm((f) => ({ ...f, beliefs: e.target.value }))}
                  className="input-field" placeholder="Any beliefs to be aware of..." />
              </div>
              <div className="col-span-2">
                <label className="label-field">Hobbies & interests</label>
                <textarea rows={2} value={form.hobbies}
                  onChange={(e) => setForm((f) => ({ ...f, hobbies: e.target.value }))}
                  className="input-field" placeholder="Activities the patient enjoys..." />
              </div>
              <div className="col-span-2">
                <label className="label-field">Dislikes & triggers</label>
                <textarea rows={2} value={form.dislikes}
                  onChange={(e) => setForm((f) => ({ ...f, dislikes: e.target.value }))}
                  className="input-field" placeholder="Things to avoid..." />
              </div>
              <div className="col-span-2">
                <label className="label-field">Family visitation preferences</label>
                <textarea rows={2} value={form.visitation}
                  onChange={(e) => setForm((f) => ({ ...f, visitation: e.target.value }))}
                  className="input-field" placeholder="Preferred visiting times..." />
              </div>
              <div className="col-span-2">
                <label className="label-field">Additional notes</label>
                <textarea rows={2} value={form.additionalNotes}
                  onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                  className="input-field" placeholder="Anything else staff should know..." />
              </div>
            </div>
          </div>
        )}

        {/* ── Care Preferences ── */}
        {!showBasicOnly && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-info/10 flex items-center justify-center text-info"><HeartHandIcon /></div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Care Preferences</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Nurse gender preference</label>
                <select value={form.doctorGenderPref}
                  onChange={(e) => setForm((f) => ({ ...f, doctorGenderPref: e.target.value }))}
                  className="select-field">
                  <option value="No preference">No preference</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="label-field">Preferred language</label>
                <input type="text" value={form.preferredLanguage}
                  onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))}
                  className="input-field" placeholder="e.g. French, Arabic..." />
              </div>
              <div>
                <label className="label-field">Pain tolerance</label>
                <select value={form.painTolerance}
                  onChange={(e) => setForm((f) => ({ ...f, painTolerance: e.target.value }))}
                  className="select-field">
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="label-field">Emotional support needed</label>
                <select value={form.emotionalSupport}
                  onChange={(e) => setForm((f) => ({ ...f, emotionalSupport: e.target.value }))}
                  className="select-field">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Sometimes">Sometimes</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">Acceptable physical contact</label>
                <input type="text" value={form.physicalContactOk}
                  onChange={(e) => setForm((f) => ({ ...f, physicalContactOk: e.target.value }))}
                  className="input-field" placeholder="e.g. Handshake OK, avoid shoulder touch..." />
              </div>
            </div>
          </div>
        )}

        {/* ── Health & Safety ── */}
        {!showBasicOnly && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-destructive/10 flex items-center justify-center text-destructive"><ShieldAlertIcon /></div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Health & Safety</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Fear of needles</label>
                <select value={form.fearOfNeedles}
                  onChange={(e) => setForm((f) => ({ ...f, fearOfNeedles: e.target.value }))}
                  className="select-field">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">Known allergies (non-dietary)</label>
                <textarea rows={2} value={form.knownAllergies}
                  onChange={(e) => setForm((f) => ({ ...f, knownAllergies: e.target.value }))}
                  className="input-field" placeholder="e.g. Latex, Penicillin, Ibuprofen..." />
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {savingLabel || 'Saving...'}
              </span>
            ) : patient ? 'Save Changes' : showBasicOnly ? 'Register patient' : 'Save & generate care profile'}
          </button>
        </div>
      </div>
    </form>
  );
}
