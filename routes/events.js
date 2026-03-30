import { Router } from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// GET /api/events — public
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM events WHERE ativo = 1 ORDER BY ordem ASC');
    res.json(rows);
  } catch (err) {
    console.error('Events GET error:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// GET /api/events/all — admin (includes inactive)
router.get('/all', auth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM events ORDER BY ordem ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Evento não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
});

// POST /api/events — create
router.post('/', auth, upload.single('banner'), async (req, res) => {
  try {
    const { etapa, nome, cidade, local_nome, data_display, data_fim, horario, garantido, descricao, ordem, ativo } = req.body;
    const banner_path = req.file ? `/uploads/${req.file.filename}` : (req.body.banner_path || null);

    const result = await query(
      'INSERT INTO events (etapa, nome, cidade, local_nome, data_display, data_fim, horario, garantido, banner_path, descricao, ordem, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [etapa, nome, cidade, local_nome, data_display, data_fim, horario || 'A definir', garantido || null, banner_path, descricao || '', parseInt(ordem) || 0, parseInt(ativo) ?? 1]
    );

    const id = result.insertId;
    const rows = await query('SELECT * FROM events WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Event create error:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// PUT /api/events/:id — update
router.put('/:id', auth, upload.single('banner'), async (req, res) => {
  try {
    const { etapa, nome, cidade, local_nome, data_display, data_fim, horario, garantido, descricao, ordem, ativo } = req.body;
    let banner_path = req.body.banner_path;
    if (req.file) {
      banner_path = `/uploads/${req.file.filename}`;
    }

    await query(
      'UPDATE events SET etapa=?, nome=?, cidade=?, local_nome=?, data_display=?, data_fim=?, horario=?, garantido=?, banner_path=?, descricao=?, ordem=?, ativo=? WHERE id=?',
      [etapa, nome, cidade, local_nome, data_display, data_fim, horario || 'A definir', garantido || null, banner_path, descricao || '', parseInt(ordem) || 0, parseInt(ativo) ?? 1, req.params.id]
    );

    const rows = await query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Event update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir evento' });
  }
});

export default router;
