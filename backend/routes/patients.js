import { Router } from 'express';
import { getDb } from '../db/index.js';
import { rowToPatient } from '../db/index.js';

export const patientsRoutes = Router();

function addAudit(db, patientId, byName, action, details = '') {
  db.prepare(
    'INSERT INTO patient_audit_trail (patient_id, at, by_name, action, details) VALUES (?, ?, ?, ?, ?)'
  ).run(patientId, new Date().toISOString(), byName, action, details);
}

function loadAuditAndNotes(db, patientId) {
  const audit = db.prepare(
    'SELECT at as at, by_name as by, action, details FROM patient_audit_trail WHERE patient_id = ? ORDER BY at DESC LIMIT 5'
  ).all(patientId);
  const notes = db.prepare(
    'SELECT at as at, by_name as by, text FROM patient_clinical_notes WHERE patient_id = ? ORDER BY at DESC'
  ).all(patientId);
  return { auditTrail: audit, clinicalNotes: notes };
}

// List patients: default status=Active (current in hospital). status=all for "find returning patient" search.
patientsRoutes.get('/', (req, res) => {
  try {
    const { serviceId, status = 'Active', q } = req.query;
    const db = getDb();
    let sql = 'SELECT * FROM patients WHERE 1=1';
    const params = [];
    if (status === 'Active') {
      sql += ' AND status = ?';
      params.push('Active');
    }
    if (serviceId != null && serviceId !== '') {
      const sid = parseInt(serviceId, 10);
      if (!isNaN(sid)) {
        sql += ' AND service_id = ?';
        params.push(sid);
      }
    }
    if (q && q.trim()) {
      sql += ' AND (full_name LIKE ? OR medical_id LIKE ? OR room_number LIKE ?)';
      const like = `%${q.trim()}%`;
      params.push(like, like, like);
    }
    sql += ' ORDER BY id DESC';
    const rows = db.prepare(sql).all(...params);
    res.json(rows.map((r) => rowToPatient(r)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

patientsRoutes.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as c FROM patients').get();
    const active = db.prepare('SELECT COUNT(*) as c FROM patients WHERE status = ?').get('Active');
    res.json({
      totalPatients: total.c,
      activePatients: active.c,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Lookup by Medical ID (exact match) — used to check if patient already registered
patientsRoutes.get('/lookup', (req, res) => {
  try {
    const medicalId = (req.query.medicalId || '').trim();
    if (!medicalId) return res.status(400).json({ error: 'medicalId query required' });
    const db = getDb();
    const row = db.prepare('SELECT * FROM patients WHERE medical_id = ?').get(medicalId);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(rowToPatient(row));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

patientsRoutes.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const db = getDb();
    const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Patient not found' });
    const patient = rowToPatient(row);
    const { auditTrail, clinicalNotes } = loadAuditAndNotes(db, id);
    patient.auditTrail = auditTrail;
    patient.clinicalNotes = clinicalNotes;
    res.json(patient);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

patientsRoutes.post('/', (req, res) => {
  try {
    const body = req.body || {};
    const createdBy = body.createdBy || 'System';
    const medicalId = (body.medicalId || '').trim() || null;
    if (!medicalId) {
      return res.status(400).json({ error: 'Medical ID is required and must be unique.' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM patients WHERE medical_id = ?').get(medicalId);
    if (existing) {
      return res.status(400).json({ error: 'A patient with this Medical ID already exists.' });
    }
    const now = new Date().toISOString();
    const visitHistory = [{ admittedAt: now, roomNumber: body.roomNumber, serviceId: body.serviceId }];
    const ins = db.prepare(`
      INSERT INTO patients (full_name, age, gender, medical_id, room_number, status, service_id, created_at, created_by,
        temp_preference, noise_preference, dietary, sleep_schedule, communication_style, beliefs, hobbies, dislikes, visitation, additional_notes, ai_summary, visit_history,
        doctor_gender_pref, preferred_language, pain_tolerance, fear_of_needles, known_allergies, physical_contact_ok, emotional_support)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = ins.run(
      body.fullName,
      body.age,
      body.gender || null,
      medicalId,
      body.roomNumber,
      body.status || 'Active',
      body.serviceId,
      now,
      createdBy,
      body.tempPreference || null,
      body.noisePreference || null,
      body.dietary || null,
      body.sleepSchedule || null,
      body.communicationStyle || null,
      body.beliefs || null,
      body.hobbies || null,
      body.dislikes || null,
      body.visitation || null,
      body.additionalNotes || null,
      body.aiSummary || null,
      JSON.stringify(visitHistory),
      body.doctorGenderPref || null,
      body.preferredLanguage || null,
      body.painTolerance || null,
      body.fearOfNeedles || null,
      body.knownAllergies || null,
      body.physicalContactOk || null,
      body.emotionalSupport || null
    );
    const lastId = result.lastInsertRowid;
    addAudit(db, lastId, createdBy, 'Profile created', '');
    const created = db.prepare('SELECT * FROM patients WHERE id = ?').get(lastId);
    res.status(201).json(rowToPatient(created));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'A patient with this Medical ID already exists.' });
    }
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

patientsRoutes.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const body = req.body || {};
    const updatedBy = body.updatedBy || 'System';
    const db = getDb();
    const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Patient not found' });

    const oldRoom = existing.room_number;
    const oldService = existing.service_id;
    const oldStatus = existing.status;
    const newStatus = body.status !== undefined ? body.status : existing.status;
    const newMedicalId = body.medicalId !== undefined ? (body.medicalId || '').trim() || null : existing.medical_id;

    if (newMedicalId && newMedicalId !== (existing.medical_id || '')) {
      const taken = db.prepare('SELECT id FROM patients WHERE medical_id = ? AND id != ?').get(newMedicalId, id);
      if (taken) {
        return res.status(400).json({ error: 'A patient with this Medical ID already exists.' });
      }
    }

    if (newStatus === 'Discharged' && oldStatus !== 'Discharged') {
      const visitHistory = existing.visit_history ? JSON.parse(existing.visit_history) : [];
      visitHistory.push({
        admittedAt: existing.created_at,
        roomNumber: oldRoom,
        serviceId: oldService,
        dischargedAt: new Date().toISOString(),
      });
      db.prepare('UPDATE patients SET status = ?, visit_history = ? WHERE id = ?').run(
        'Discharged',
        JSON.stringify(visitHistory),
        id
      );
      addAudit(db, id, updatedBy, 'Status changed to Discharged', `Room ${oldRoom}`);
      const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
      return res.json(rowToPatient(row));
    }

    if (newStatus === 'Active' && oldStatus !== 'Active') {
      const visitHistory = existing.visit_history ? JSON.parse(existing.visit_history) : [];
      const newRoom = body.roomNumber !== undefined ? body.roomNumber : existing.room_number;
      const newSvc = body.serviceId !== undefined ? body.serviceId : existing.service_id;
      visitHistory.push({
        admittedAt: new Date().toISOString(),
        roomNumber: newRoom,
        serviceId: newSvc,
        reactivatedBy: updatedBy,
      });
      addAudit(db, id, updatedBy, 'Reactivated (returning patient)', `Room ${newRoom}`);
      db.prepare(
        'UPDATE patients SET status = ?, room_number = ?, service_id = ?, visit_history = ? WHERE id = ?'
      ).run('Active', newRoom, newSvc, JSON.stringify(visitHistory), id);
      const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
      return res.json(rowToPatient(row));
    }

    const updates = [];
    const params = [];
    const map = {
      fullName: 'full_name',
      age: 'age',
      gender: 'gender',
      medicalId: 'medical_id',
      roomNumber: 'room_number',
      status: 'status',
      serviceId: 'service_id',
      tempPreference: 'temp_preference',
      noisePreference: 'noise_preference',
      dietary: 'dietary',
      sleepSchedule: 'sleep_schedule',
      communicationStyle: 'communication_style',
      beliefs: 'beliefs',
      hobbies: 'hobbies',
      dislikes: 'dislikes',
      visitation: 'visitation',
      additionalNotes: 'additional_notes',
      aiSummary: 'ai_summary',
      doctorGenderPref: 'doctor_gender_pref',
      preferredLanguage: 'preferred_language',
      painTolerance: 'pain_tolerance',
      fearOfNeedles: 'fear_of_needles',
      knownAllergies: 'known_allergies',
      physicalContactOk: 'physical_contact_ok',
      emotionalSupport: 'emotional_support',
    };
    for (const [k, col] of Object.entries(map)) {
      if (body[k] !== undefined) {
        updates.push(`${col} = ?`);
        params.push(body[k] === null || body[k] === '' ? null : body[k]);
      }
    }
    if (body.roomNumber !== undefined && body.roomNumber !== oldRoom) {
      addAudit(db, id, updatedBy, 'Room changed', `${oldRoom} → ${body.roomNumber}`);
    }
    if (body.serviceId !== undefined && body.serviceId !== oldService) {
      const svc = db.prepare('SELECT name FROM services WHERE id = ?').get(body.serviceId);
      const oldSvc = db.prepare('SELECT name FROM services WHERE id = ?').get(oldService);
      addAudit(db, id, updatedBy, 'Service transferred', `${oldSvc?.name || ''} → ${svc?.name || ''}`);
    }
    if (updates.length) {
      params.push(id);
      db.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      addAudit(db, id, updatedBy, 'Profile updated', '');
    }
    const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    res.json(rowToPatient(row));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'A patient with this Medical ID already exists.' });
    }
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

patientsRoutes.post('/:id/transfer', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { serviceId, updatedBy } = req.body || {};
    if (isNaN(id) || serviceId == null) return res.status(400).json({ error: 'Invalid id or serviceId' });
    const db = getDb();
    const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Patient not found' });
    const sid = parseInt(serviceId, 10);
    if (isNaN(sid)) return res.status(400).json({ error: 'Invalid serviceId' });
    const oldSvc = db.prepare('SELECT name FROM services WHERE id = ?').get(existing.service_id);
    const newSvc = db.prepare('SELECT name FROM services WHERE id = ?').get(sid);
    db.prepare('UPDATE patients SET service_id = ? WHERE id = ?').run(sid, id);
    addAudit(db, id, updatedBy || 'System', 'Service transferred', `${oldSvc?.name || ''} → ${newSvc?.name || ''}`);
    const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    res.json(rowToPatient(row));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

patientsRoutes.post('/:id/notes', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { text, byName } = req.body || {};
    if (isNaN(id) || !text || !byName) return res.status(400).json({ error: 'id, text and byName required' });
    const db = getDb();
    const exists = db.prepare('SELECT id FROM patients WHERE id = ?').get(id);
    if (!exists) return res.status(404).json({ error: 'Patient not found' });
    const at = new Date().toISOString();
    db.prepare('INSERT INTO patient_clinical_notes (patient_id, at, by_name, text) VALUES (?, ?, ?, ?)').run(
      id,
      at,
      byName,
      text.trim()
    );
    addAudit(db, id, byName, 'Clinical note added', text.trim().slice(0, 80));
    const notes = db
      .prepare('SELECT at as at, by_name as by, text FROM patient_clinical_notes WHERE patient_id = ? ORDER BY at DESC')
      .all(id);
    res.json(notes);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});
