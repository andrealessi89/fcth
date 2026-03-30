import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    const users = await query('SELECT * FROM admin_users WHERE username = ?', [username]);
    const user = Array.isArray(users) ? users[0] : null;

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, nome: user.nome },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, nome: user.nome } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
