import { Router } from 'express';
import { getDb } from '../db/index.js';

export const servicesRoutes = Router();

servicesRoutes.get('/', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT id, name, color FROM services ORDER BY id').all();
    res.json(rows.map(r => ({ id: r.id, name: r.name, color: r.color })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

servicesRoutes.post('/', (req, res) => {
  try {
    const { name, color } = req.body || {};
    if (!name || !color) return res.status(400).json({ error: 'Name and color required' });
    const db = getDb();
    const result = db.prepare('INSERT INTO services (name, color) VALUES (?, ?)').run(name.trim(), color);
    res.status(201).json({ id: result.lastInsertRowid, name: name.trim(), color });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

servicesRoutes.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const db = getDb();
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});
