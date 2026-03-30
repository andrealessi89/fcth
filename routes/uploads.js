import { Router } from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// POST /api/uploads — generic file upload
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const category = req.body.category || 'general';
    const filePath = `/uploads/${category}/${req.file.filename}`;

    const result = await query(
      'INSERT INTO uploaded_files (original_name, stored_name, file_path, mime_type, file_size, category) VALUES (?, ?, ?, ?, ?, ?)',
      [req.file.originalname, req.file.filename, filePath, req.file.mimetype, req.file.size, category]
    );

    res.status(201).json({
      id: result.insertId,
      original_name: req.file.originalname,
      file_path: filePath,
      mime_type: req.file.mimetype,
      file_size: req.file.size
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

// GET /api/uploads — list all uploads
router.get('/', auth, async (req, res) => {
  try {
    const { category } = req.query;
    let rows;
    if (category) {
      rows = await query('SELECT * FROM uploaded_files WHERE category = ? ORDER BY created_at DESC', [category]);
    } else {
      rows = await query('SELECT * FROM uploaded_files ORDER BY created_at DESC');
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar uploads' });
  }
});

export default router;
