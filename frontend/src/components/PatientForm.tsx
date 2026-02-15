import React, { useState, useEffect } from 'react';

const emptyPatient = {
  fullName: '', age: '', gender: 'Male', medicalId: '', roomNumber: '',
  status: 'Active', serviceId: '', tempPreference: 'Moderate', noisePreference: 'Moderate',
  dietary: '', sleepSchedule: '', communicationStyle: 'Simple', beliefs: '',
  hobbies: '', dislikes: '', visitation: '', additionalNotes: '',
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
    };
    onSave(payload, { basicOnly: isBasic });
  };

  const showBasicOnly = basicOnly && !patient;

  return (
    <form onSubmit={handleSubmit} className="p-6 max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold text-card-foreground mb-2">
        {showBasicOnly ? 'Register patient (basic info)' : patient ? 'Edit Patient' : 'Register New Patient'}
      </h3>
      {showBasicOnly && (
        <p className="text-sm text-muted-foreground mb-4">Fill this before going to the patient. At the bedside, open this patient and complete the questionnaire.</p>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="border-b border-border pb-5">
          <h4 className="font-semibold text-card-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">Basic Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className={showBasicOnly ? 'col-span-2 order-first' : 'col-span-2'}>
              <label className="label-field">Medical ID * (unique)</label>
              <input type="text" required value={form.medicalId}
                onChange={(e) => setForm((f) => ({ ...f, medicalId: e.target.value }))}
                className="input-field" placeholder="Unique identifier"
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

        {/* Preferences */}
        {!showBasicOnly && (
          <div className="border-b border-border pb-5">
            <h4 className="font-semibold text-card-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">Preferences</h4>
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
                  className="input-field" />
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
                  className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="label-field">Hobbies & interests</label>
                <textarea rows={2} value={form.hobbies}
                  onChange={(e) => setForm((f) => ({ ...f, hobbies: e.target.value }))}
                  className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="label-field">Dislikes & triggers</label>
                <textarea rows={2} value={form.dislikes}
                  onChange={(e) => setForm((f) => ({ ...f, dislikes: e.target.value }))}
                  className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="label-field">Family visitation preferences</label>
                <textarea rows={2} value={form.visitation}
                  onChange={(e) => setForm((f) => ({ ...f, visitation: e.target.value }))}
                  className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="label-field">Additional notes</label>
                <textarea rows={2} value={form.additionalNotes}
                  onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                  className="input-field" />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (savingLabel || 'Saving…') : patient ? 'Save' : showBasicOnly ? 'Register patient' : 'Save & generate care profile'}
          </button>
        </div>
      </div>
    </form>
  );
}
