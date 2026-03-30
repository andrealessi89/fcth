import { Router } from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';

const router = Router();

// POST /api/newsletter — public signup
router.post('/', async (req, res) => {
  try {
    const { nome, email } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    // Check duplicate
    const existing = await query('SELECT id FROM newsletter_signups WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.json({ success: true, message: 'Email já cadastrado' });
    }

    await query('INSERT INTO newsletter_signups (nome, email) VALUES (?, ?)', [nome, email]);
    res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso' });
  } catch (err) {
    console.error('Newsletter signup error:', err);
    res.status(500).json({ error: 'Erro ao cadastrar' });
  }
});

// GET /api/newsletter — admin list
router.get('/', auth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM newsletter_signups ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar cadastros' });
  }
});

// GET /api/newsletter/export — CSV download
router.get('/export', auth, async (req, res) => {
  try {
    const rows = await query('SELECT nome, email, created_at FROM newsletter_signups ORDER BY created_at DESC');

    let csv = 'Nome,Email,Data de Cadastro\n';
    for (const row of rows) {
      const nome = `"${(row.nome || '').replace(/"/g, '""')}"`;
      const email = `"${(row.email || '').replace(/"/g, '""')}"`;
      const data = row.created_at || '';
      csv += `${nome},${email},${data}\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter_fcth.csv');
    res.send('\uFEFF' + csv); // BOM for Excel compatibility
  } catch (err) {
    res.status(500).json({ error: 'Erro ao exportar' });
  }
});

// DELETE /api/newsletter/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await query('DELETE FROM newsletter_signups WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir cadastro' });
  }
});

export default router;
