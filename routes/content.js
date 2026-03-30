import { Router } from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// GET /api/content?page=home
router.get('/', async (req, res) => {
  try {
    const { page } = req.query;
    let rows;
    if (page) {
      rows = await query('SELECT * FROM page_content WHERE page = ?', [page]);
    } else {
      rows = await query('SELECT * FROM page_content ORDER BY page, content_key');
    }

    // Return as key-value map
    const map = {};
    for (const row of rows) {
      map[row.content_key] = row.content_value;
    }
    res.json({ items: rows, map });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar conteúdo' });
  }
});

// GET /api/content/all — admin (includes metadata)
router.get('/all', auth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM page_content ORDER BY page, content_key');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar conteúdo' });
  }
});

// PUT /api/content/batch — update multiple content keys
router.put('/batch', auth, async (req, res) => {
  try {
    const { items } = req.body; // [{ content_key, content_value }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items deve ser um array' });
    }

    for (const item of items) {
      await query(
        'UPDATE page_content SET content_value = ? WHERE content_key = ?',
        [item.content_value, item.content_key]
      );
    }

    res.json({ success: true, updated: items.length });
  } catch (err) {
    console.error('Content batch update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

// PUT /api/content/:key — update single content key
router.put('/:key', auth, async (req, res) => {
  try {
    const { content_value } = req.body;
    await query(
      'UPDATE page_content SET content_value = ? WHERE content_key = ?',
      [content_value, req.params.key]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

// POST /api/content/upload-image — upload image and update content key
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }
    const { content_key } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;

    if (content_key) {
      await query(
        'UPDATE page_content SET content_value = ? WHERE content_key = ?',
        [imagePath, content_key]
      );
    }

    res.json({ success: true, path: imagePath });
  } catch (err) {
    console.error('Content image upload error:', err);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

export default router;
