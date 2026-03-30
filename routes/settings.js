import { Router } from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// GET /api/settings — public
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM settings');
    const map = {};
    for (const row of rows) {
      map[row.setting_key] = row.setting_value;
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// PUT /api/settings/batch — update multiple settings
router.put('/batch', auth, async (req, res) => {
  try {
    const { items } = req.body; // [{ setting_key, setting_value }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items deve ser um array' });
    }

    for (const item of items) {
      // Upsert
      const existing = await query('SELECT id FROM settings WHERE setting_key = ?', [item.setting_key]);
      if (existing.length > 0) {
        await query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [item.setting_value, item.setting_key]);
      } else {
        await query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [item.setting_key, item.setting_value]);
      }
    }

    res.json({ success: true, updated: items.length });
  } catch (err) {
    console.error('Settings batch error:', err);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

// POST /api/settings/upload — upload file and update setting key
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    const { setting_key } = req.body;
    const filePath = `/uploads/${req.file.filename}`;

    if (setting_key) {
      const existing = await query('SELECT id FROM settings WHERE setting_key = ?', [setting_key]);
      if (existing.length > 0) {
        await query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [filePath, setting_key]);
      } else {
        await query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [setting_key, filePath]);
      }
    }

    res.json({ success: true, path: filePath });
  } catch (err) {
    console.error('Settings upload error:', err);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

export default router;
