import { Router } from 'express';
import { getDb } from '../db/index.js';

export const authRoutes = Router();

authRoutes.post('/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const db = getDb();
    const row = db.prepare(
      'SELECT id, username, role, name, service_id as serviceId FROM staff WHERE username = ? AND password = ?'
    ).get(username, password);
    if (!row) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({
      user: {
        id: row.id,
        username: row.username,
        role: row.role,
        name: row.name,
        serviceId: row.serviceId
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});
