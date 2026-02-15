import React, { useState, useEffect } from 'react';
import { useT } from '../i18n';

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
  const { t } = useT();
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
        {showBasicOnly ? t('form.registerBasicTitle') : patient ? t('form.editTitle') : t('form.registerTitle')}
      </h3>
      {showBasicOnly && (
        <p className="text-sm text-muted-foreground mb-4">{t('form.basicOnlyDesc')}</p>
      )}

      <div className="space-y-6 mt-4">
        {/* ── Basic Information ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary"><UserIcon /></div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('form.basicInfo')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={showBasicOnly ? 'col-span-2 order-first' : 'col-span-2'}>
              <label className="label-field">{t('form.medicalId')}</label>
              <input type="text" required value={form.medicalId}
                onChange={(e) => setForm((f) => ({ ...f, medicalId: e.target.value }))}
                className="input-field font-mono" placeholder={t('form.medicalIdPlaceholder')}
                readOnly={!!initialMedicalId || !!patient} />
            </div>
            <div className="col-span-2">
              <label className="label-field">{t('form.fullName')}</label>
              <input type="text" required value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('form.age')}</label>
              <input type="number" required min={1} value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">{t('form.gender')}</label>
              <select value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="select-field">
                <option value="Male">{t('form.genderMale')}</option>
                <option value="Female">{t('form.genderFemale')}</option>
                <option value="Other">{t('form.genderOther')}</option>
              </select>
            </div>
            <div>
              <label className="label-field">{t('form.roomNumber')}</label>
              <input type="text" required value={form.roomNumber}
                onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                className="input-field" />
            </div>
            {!showBasicOnly && (
              <div>
                <label className="label-field">{t('form.status')}</label>
                <select value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="select-field">
                  <option value="Active">{t('form.statusActive')}</option>
                  <option value="Discharged">{t('form.statusDischarged')}</option>
                </select>
              </div>
            )}
            <div className="col-span-2">
              <label className="label-field">{t('form.service')}</label>
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
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('form.preferences')}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">{t('form.roomTemperature')}</label>
                <select value={form.tempPreference}
                  onChange={(e) => setForm((f) => ({ ...f, tempPreference: e.target.value }))}
                  className="select-field">
                  <option value="Cool">{t('form.tempCool')}</option>
                  <option value="Moderate">{t('form.tempModerate')}</option>
                  <option value="Warm">{t('form.tempWarm')}</option>
                </select>
              </div>
              <div>
                <label className="label-field">{t('form.noiseLevel')}</label>
                <select value={form.noisePreference}
                  onChange={(e) => setForm((f) => ({ ...f, noisePreference: e.target.value }))}
                  className="select-field">
                  <option value="Quiet">{t('form.noiseQuiet')}</option>
                  <option value="Moderate">{t('form.noiseModerate')}</option>
                  <option value="Active">{t('form.noiseActive')}</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">{t('form.dietaryLabel')}</label>
                <textarea rows={2} value={form.dietary}
                  onChange={(e) => setForm((f) => ({ ...f, dietary: e.target.value }))}
                  className="input-field" placeholder={t('form.dietaryPlaceholder')} />
              </div>

              <div>
                <label className="label-field">{t('form.communicationStyle')}</label>
                <select value={form.communicationStyle}
                  onChange={(e) => setForm((f) => ({ ...f, communicationStyle: e.target.value }))}
                  className="select-field">
                  <option value="Detailed">{t('form.commDetailed')}</option>
                  <option value="Simple">{t('form.commSimple')}</option>
                  <option value="Visual">{t('form.commVisual')}</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">{t('form.beliefs')}</label>
                <textarea rows={2} value={form.beliefs}
                  onChange={(e) => setForm((f) => ({ ...f, beliefs: e.target.value }))}
                  className="input-field" placeholder={t('form.beliefsPlaceholder')} />
              </div>
              <div className="col-span-2">
                <label className="label-field">{t('form.hobbies')}</label>
                <textarea rows={2} value={form.hobbies}
                  onChange={(e) => setForm((f) => ({ ...f, hobbies: e.target.value }))}
                  className="input-field" placeholder={t('form.hobbiesPlaceholder')} />
              </div>
              <div className="col-span-2">
                <label className="label-field">{t('form.dislikes')}</label>
                <textarea rows={2} value={form.dislikes}
                  onChange={(e) => setForm((f) => ({ ...f, dislikes: e.target.value }))}
                  className="input-field" placeholder={t('form.dislikesPlaceholder')} />
              </div>
              <div className="col-span-2">
                <label className="label-field">{t('form.visitation')}</label>
                <textarea rows={2} value={form.visitation}
                  onChange={(e) => setForm((f) => ({ ...f, visitation: e.target.value }))}
                  className="input-field" placeholder={t('form.visitationPlaceholder')} />
              </div>
              <div className="col-span-2">
                <label className="label-field">{t('form.additionalNotes')}</label>
                <textarea rows={2} value={form.additionalNotes}
                  onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                  className="input-field" placeholder={t('form.additionalNotesPlaceholder')} />
              </div>
            </div>
          </div>
        )}

        {/* ── Care Preferences ── */}
        {!showBasicOnly && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-info/10 flex items-center justify-center text-info"><HeartHandIcon /></div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('form.carePrefs')}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">{t('form.nurseGenderPref')}</label>
                <select value={form.doctorGenderPref}
                  onChange={(e) => setForm((f) => ({ ...f, doctorGenderPref: e.target.value }))}
                  className="select-field">
                  <option value="No preference">{t('form.noPreference')}</option>
                  <option value="Male">{t('form.genderMale')}</option>
                  <option value="Female">{t('form.genderFemale')}</option>
                </select>
              </div>
              <div>
                <label className="label-field">{t('form.preferredLanguage')}</label>
                <input type="text" value={form.preferredLanguage}
                  onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))}
                  className="input-field" placeholder={t('form.preferredLanguagePlaceholder')} />
              </div>
              <div>
                <label className="label-field">{t('form.painTolerance')}</label>
                <select value={form.painTolerance}
                  onChange={(e) => setForm((f) => ({ ...f, painTolerance: e.target.value }))}
                  className="select-field">
                  <option value="Low">{t('form.painLow')}</option>
                  <option value="Moderate">{t('form.painModerate')}</option>
                  <option value="High">{t('form.painHigh')}</option>
                </select>
              </div>
              <div>
                <label className="label-field">{t('form.emotionalSupport')}</label>
                <select value={form.emotionalSupport}
                  onChange={(e) => setForm((f) => ({ ...f, emotionalSupport: e.target.value }))}
                  className="select-field">
                  <option value="Yes">{t('form.emotionalYes')}</option>
                  <option value="No">{t('form.emotionalNo')}</option>
                  <option value="Sometimes">{t('form.emotionalSometimes')}</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">{t('form.physicalContact')}</label>
                <input type="text" value={form.physicalContactOk}
                  onChange={(e) => setForm((f) => ({ ...f, physicalContactOk: e.target.value }))}
                  className="input-field" placeholder={t('form.physicalContactPlaceholder')} />
              </div>
            </div>
          </div>
        )}

        {/* ── Health & Safety ── */}
        {!showBasicOnly && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-destructive/10 flex items-center justify-center text-destructive"><ShieldAlertIcon /></div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('form.healthSafety')}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">{t('form.fearOfNeedles')}</label>
                <select value={form.fearOfNeedles}
                  onChange={(e) => setForm((f) => ({ ...f, fearOfNeedles: e.target.value }))}
                  className="select-field">
                  <option value="No">{t('form.fearNo')}</option>
                  <option value="Yes">{t('form.fearYes')}</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-field">{t('form.knownAllergies')}</label>
                <textarea rows={2} value={form.knownAllergies}
                  onChange={(e) => setForm((f) => ({ ...f, knownAllergies: e.target.value }))}
                  className="input-field" placeholder={t('form.knownAllergiesPlaceholder')} />
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="btn-secondary">{t('form.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {savingLabel || t('form.saving')}
              </span>
            ) : patient ? t('form.saveChanges') : showBasicOnly ? t('form.registerPatient') : t('form.saveAndGenerate')}
          </button>
        </div>
      </div>
    </form>
  );
}
