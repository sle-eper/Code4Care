import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSchema, migrateSchema, seed } from './init.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'code4care.db');

let db = null;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    initSchema(db);
    migrateSchema(db);
    seed(db);
  }
  return db;
}

export function rowToPatient(row) {
  if (!row) return null;
  const visitHistory = row.visit_history ? JSON.parse(row.visit_history) : [];
  return {
    id: row.id,
    fullName: row.full_name,
    age: row.age,
    gender: row.gender,
    medicalId: row.medical_id,
    roomNumber: row.room_number,
    status: row.status,
    serviceId: row.service_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    archivedAt: row.archived_at,
    tempPreference: row.temp_preference,
    noisePreference: row.noise_preference,
    dietary: row.dietary,
    sleepSchedule: row.sleep_schedule,
    communicationStyle: row.communication_style,
    beliefs: row.beliefs,
    hobbies: row.hobbies,
    dislikes: row.dislikes,
    visitation: row.visitation,
    additionalNotes: row.additional_notes,
    aiSummary: row.ai_summary,
    visitHistory,
    doctorGenderPref: row.doctor_gender_pref,
    preferredLanguage: row.preferred_language,
    painTolerance: row.pain_tolerance,
    fearOfNeedles: row.fear_of_needles,
    knownAllergies: row.known_allergies,
    physicalContactOk: row.physical_contact_ok,
    emotionalSupport: row.emotional_support,
  };
}

export function patientToRow(p) {
  return {
    full_name: p.fullName,
    age: p.age,
    gender: p.gender || null,
    medical_id: p.medicalId || null,
    room_number: p.roomNumber,
    status: p.status || 'Active',
    service_id: p.serviceId,
    created_at: p.createdAt,
    created_by: p.createdBy,
    archived_at: p.archivedAt || null,
    temp_preference: p.tempPreference || null,
    noise_preference: p.noisePreference || null,
    dietary: p.dietary || null,
    sleep_schedule: p.sleepSchedule || null,
    communication_style: p.communicationStyle || null,
    beliefs: p.beliefs || null,
    hobbies: p.hobbies || null,
    dislikes: p.dislikes || null,
    visitation: p.visitation || null,
    additional_notes: p.additionalNotes || null,
    ai_summary: p.aiSummary || null,
    visit_history: p.visitHistory ? JSON.stringify(p.visitHistory) : null,
    doctor_gender_pref: p.doctorGenderPref || null,
    preferred_language: p.preferredLanguage || null,
    pain_tolerance: p.painTolerance || null,
    fear_of_needles: p.fearOfNeedles || null,
    known_allergies: p.knownAllergies || null,
    physical_contact_ok: p.physicalContactOk || null,
    emotional_support: p.emotionalSupport || null,
  };
}
