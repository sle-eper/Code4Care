import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'code4care.db');

export function getDb() {
  return new Database(dbPath);
}

export function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      service_id INTEGER REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT,
      medical_id TEXT,
      room_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      service_id INTEGER NOT NULL REFERENCES services(id),
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      temp_preference TEXT,
      noise_preference TEXT,
      dietary TEXT,
      sleep_schedule TEXT,
      communication_style TEXT,
      beliefs TEXT,
      hobbies TEXT,
      dislikes TEXT,
      visitation TEXT,
      additional_notes TEXT,
      ai_summary TEXT,
      visit_history TEXT,
      doctor_gender_pref TEXT,
      preferred_language TEXT,
      pain_tolerance TEXT,
      fear_of_needles TEXT,
      known_allergies TEXT,
      physical_contact_ok TEXT,
      emotional_support TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_medical_id ON patients(medical_id) WHERE medical_id IS NOT NULL AND medical_id != '';

    CREATE TABLE IF NOT EXISTS patient_audit_trail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id),
      at TEXT NOT NULL,
      by_name TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS patient_clinical_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id),
      at TEXT NOT NULL,
      by_name TEXT NOT NULL,
      text TEXT NOT NULL
    );
  `);
}

// Add new columns to existing DB (safe — ignores if already present)
export function migrateSchema(db) {
  const newCols = [
    'doctor_gender_pref TEXT',
    'preferred_language TEXT',
    'pain_tolerance TEXT',
    'fear_of_needles TEXT',
    'known_allergies TEXT',
    'physical_contact_ok TEXT',
    'emotional_support TEXT',
  ];
  for (const col of newCols) {
    try { db.exec(`ALTER TABLE patients ADD COLUMN ${col}`); } catch (_) { /* already exists */ }
  }
}

export function seed(db) {
  // Always ensure default services exist
  const defaultServices = [
    { name: 'Chirurgie', color: '#7c3aed' },
    { name: 'Réanimation', color: '#dc2626' },
    { name: 'Pédiatrie', color: '#db2777' },
    { name: 'Médecine Interne', color: '#2563eb' },
    { name: 'Cardiologie', color: '#16a34a' },
    { name: 'Psychiatrie', color: '#4f46e5' },
  ];
  const insertService = db.prepare('INSERT INTO services (name, color) VALUES (?, ?)');
  for (const s of defaultServices) {
    const exists = db.prepare('SELECT id FROM services WHERE name = ?').get(s.name);
    if (!exists) insertService.run(s.name, s.color);
  }

  // Always ensure admin/admin exists
  const admin = db.prepare('SELECT id FROM staff WHERE username = ?').get('admin');
  if (!admin) {
    db.prepare(
      'INSERT INTO staff (username, password, role, name, service_id) VALUES (?, ?, ?, ?, ?)'
    ).run('admin', 'admin', 'admin', 'Admin', null);
  }
}

// Run init if executed directly
import fs from 'fs';
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = getDb();
initSchema(db);
seed(db);
db.close();
console.log('Database initialized.');
