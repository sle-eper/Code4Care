import { Router } from 'express';
import { getDb } from '../db/index.js';

export const staffRoutes = Router();

staffRoutes.get('/', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(
      'SELECT s.id, s.username, s.role, s.name, s.service_id as serviceId, sv.name as serviceName FROM staff s LEFT JOIN services sv ON s.service_id = sv.id ORDER BY s.id'
    ).all();
    res.json(rows.map(r => ({
      id: r.id,
      username: r.username,
      role: r.role,
      name: r.name,
      serviceId: r.serviceId,
      serviceName: r.serviceName
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

staffRoutes.post('/', (req, res) => {
  try {
    const { username, password, role, name, serviceId } = req.body || {};
    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'Username, password, name and role required' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM staff WHERE username = ?').get(username.trim());
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const sid = role === 'admin' ? null : (serviceId != null ? parseInt(serviceId, 10) : null);
    const result = db.prepare(
      'INSERT INTO staff (username, password, role, name, service_id) VALUES (?, ?, ?, ?, ?)'
    ).run(username.trim(), password, role, name.trim(), sid);
    res.status(201).json({
      id: result.lastInsertRowid,
      username: username.trim(),
      role,
      name: name.trim(),
      serviceId: sid
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

staffRoutes.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const { name, username, password, role, serviceId } = req.body || {};
    const db = getDb();
    const existing = db.prepare('SELECT id, username, role FROM staff WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Staff not found' });
    const updates = [];
    const params = [];
    if (name !== undefined && String(name).trim()) {
      updates.push('name = ?');
      params.push(String(name).trim());
    }
    if (username !== undefined && String(username).trim()) {
      const uname = String(username).trim();
      const other = db.prepare('SELECT id FROM staff WHERE username = ? AND id != ?').get(uname, id);
      if (other) return res.status(400).json({ error: 'Username already exists' });
      updates.push('username = ?');
      params.push(uname);
    }
    if (password !== undefined && String(password).length > 0) {
      updates.push('password = ?');
      params.push(String(password));
    }
    if (role !== undefined && (role === 'admin' || role === 'nurse' || role === 'doctor')) {
      updates.push('role = ?');
      params.push(role);
    }
    if (serviceId !== undefined) {
      const effectiveRole = role !== undefined ? role : existing.role;
      const sid = effectiveRole === 'admin' ? null : (serviceId != null && serviceId !== '' ? parseInt(serviceId, 10) : null);
      updates.push('service_id = ?');
      params.push(sid);
    }
    if (updates.length === 0) return res.json({ id, username: existing.username, role: existing.role, name: existing.name, serviceId: null });
    params.push(id);
    db.prepare(`UPDATE staff SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    const row = db.prepare(
      'SELECT s.id, s.username, s.role, s.name, s.service_id as serviceId, sv.name as serviceName FROM staff s LEFT JOIN services sv ON s.service_id = sv.id WHERE s.id = ?'
    ).get(id);
    res.json({
      id: row.id,
      username: row.username,
      role: row.role,
      name: row.name,
      serviceId: row.serviceId,
      serviceName: row.serviceName,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

staffRoutes.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const db = getDb();
    db.prepare('DELETE FROM staff WHERE id = ? AND role != ?').run(id, 'admin');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});
