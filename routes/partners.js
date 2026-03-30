import { Router } from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// GET /api/partners — public
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM partners WHERE ativo = 1 ORDER BY ordem ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar parceiros' });
  }
});

// GET /api/partners/all — admin
router.get('/all', auth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM partners ORDER BY ordem ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar parceiros' });
  }
});

// POST /api/partners
router.post('/', auth, upload.single('logo'), async (req, res) => {
  try {
    const { nome, dark_background, ordem, ativo } = req.body;
    const logo_path = req.file ? `/uploads/${req.file.filename}` : (req.body.logo_path || '');

    const result = await query(
      'INSERT INTO partners (nome, logo_path, dark_background, ordem, ativo) VALUES (?, ?, ?, ?, ?)',
      [nome, logo_path, parseInt(dark_background) || 0, parseInt(ordem) || 0, parseInt(ativo) ?? 1]
    );

    const rows = await query('SELECT * FROM partners WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Partner create error:', err);
    res.status(500).json({ error: 'Erro ao criar parceiro' });
  }
});

// PUT /api/partners/:id
router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const { nome, dark_background, ordem, ativo } = req.body;
    let logo_path = req.body.logo_path;
    if (req.file) {
      logo_path = `/uploads/${req.file.filename}`;
    }

    await query(
      'UPDATE partners SET nome=?, logo_path=?, dark_background=?, ordem=?, ativo=? WHERE id=?',
      [nome, logo_path, parseInt(dark_background) || 0, parseInt(ordem) || 0, parseInt(ativo) ?? 1, req.params.id]
    );

    const rows = await query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar parceiro' });
  }
});

// DELETE /api/partners/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await query('DELETE FROM partners WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir parceiro' });
  }
});

export default router;
