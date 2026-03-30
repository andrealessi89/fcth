import { Router } from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const csvUpload = multer({ storage: multer.memoryStorage() });

// Parse CSV in Brazilian format: pos,name,"1.524,71"
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  return lines.map(line => {
    // Match: position, name, "points" or points (unquoted)
    const match = line.match(/^(\d+),(.+?),("?[\d.,]+"?)$/);
    if (!match) return null;
    const posicao = parseInt(match[1]);
    const nome = match[2].trim();
    let pontosStr = match[3].replace(/"/g, '').trim();
    // Brazilian format: 1.524,71 -> remove dots (thousands), replace comma (decimal) with dot
    pontosStr = pontosStr.replace(/\./g, '').replace(',', '.');
    const pontos = parseFloat(pontosStr) || 0;
    return { posicao, nome, pontos };
  }).filter(Boolean);
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ==================== PUBLIC ====================

// GET /api/rankings — public: all active categories with aggregated players + etapa details
router.get('/', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM ranking_categories WHERE ativo = 1 ORDER BY ordem ASC');

    for (const cat of categories) {
      // Aggregated players
      const players = await query(
        `SELECT re.nome, SUM(re.pontos) as total_pontos
         FROM ranking_entries re
         JOIN ranking_etapas ret ON re.etapa_id = ret.id
         WHERE ret.category_id = ?
         GROUP BY re.nome
         ORDER BY total_pontos DESC`,
        [cat.id]
      );

      // Add position and etapa details for each player
      for (let i = 0; i < players.length; i++) {
        players[i].pos = i + 1;
        const etapas = await query(
          `SELECT ret.nome as etapa, re.pontos
           FROM ranking_entries re
           JOIN ranking_etapas ret ON re.etapa_id = ret.id
           WHERE ret.category_id = ? AND re.nome = ?
           ORDER BY ret.ordem`,
          [cat.id, players[i].nome]
        );
        players[i].etapas = etapas;
      }

      cat.players = players;
    }

    res.json(categories);
  } catch (err) {
    console.error('Rankings GET error:', err);
    res.status(500).json({ error: 'Erro ao buscar rankings' });
  }
});

// ==================== ADMIN: CATEGORIES ====================

// GET /api/rankings/categories — admin
router.get('/categories', auth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM ranking_categories ORDER BY ordem ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// POST /api/rankings/categories
router.post('/categories', auth, async (req, res) => {
  try {
    const { nome, slug, ordem } = req.body;
    const finalSlug = slug || slugify(nome);
    const result = await query(
      'INSERT INTO ranking_categories (nome, slug, ordem, ativo) VALUES (?, ?, ?, ?)',
      [nome, finalSlug, parseInt(ordem) || 0, 1]
    );
    const rows = await query('SELECT * FROM ranking_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Category create error:', err);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// PUT /api/rankings/categories/:id
router.put('/categories/:id', auth, async (req, res) => {
  try {
    const { nome, slug, ordem, ativo } = req.body;
    await query(
      'UPDATE ranking_categories SET nome=?, slug=?, ordem=?, ativo=? WHERE id=?',
      [nome, slug || slugify(nome), parseInt(ordem) || 0, parseInt(ativo) ?? 1, req.params.id]
    );
    const rows = await query('SELECT * FROM ranking_categories WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// DELETE /api/rankings/categories/:id
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    // Delete entries first (SQLite doesn't always cascade)
    const etapas = await query('SELECT id FROM ranking_etapas WHERE category_id = ?', [req.params.id]);
    for (const et of etapas) {
      await query('DELETE FROM ranking_entries WHERE etapa_id = ?', [et.id]);
    }
    await query('DELETE FROM ranking_etapas WHERE category_id = ?', [req.params.id]);
    await query('DELETE FROM ranking_categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir categoria' });
  }
});

// ==================== ADMIN: ETAPAS + CSV UPLOAD ====================

// GET /api/rankings/categories/:id/etapas — list etapas with entry count
router.get('/categories/:id/etapas', auth, async (req, res) => {
  try {
    const etapas = await query(
      'SELECT * FROM ranking_etapas WHERE category_id = ? ORDER BY ordem ASC',
      [req.params.id]
    );
    for (const et of etapas) {
      const countResult = await query('SELECT COUNT(*) as cnt FROM ranking_entries WHERE etapa_id = ?', [et.id]);
      et.entry_count = countResult[0]?.cnt || 0;
    }
    res.json(etapas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar etapas' });
  }
});

// GET /api/rankings/categories/:id/aggregated — aggregated ranking for admin preview
router.get('/categories/:id/aggregated', auth, async (req, res) => {
  try {
    const players = await query(
      `SELECT re.nome, SUM(re.pontos) as total_pontos
       FROM ranking_entries re
       JOIN ranking_etapas ret ON re.etapa_id = ret.id
       WHERE ret.category_id = ?
       GROUP BY re.nome
       ORDER BY total_pontos DESC`,
      [req.params.id]
    );
    players.forEach((p, i) => { p.pos = i + 1; });
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ranking agregado' });
  }
});

// POST /api/rankings/categories/:id/upload — upload CSV for new etapa
router.post('/categories/:id/upload', auth, csvUpload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo CSV enviado' });
    }
    const { etapa_nome } = req.body;
    if (!etapa_nome) {
      return res.status(400).json({ error: 'Nome da etapa é obrigatório' });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const entries = parseCSV(csvText);

    if (entries.length === 0) {
      return res.status(400).json({ error: 'CSV vazio ou formato inválido' });
    }

    // Get next ordem
    const existingEtapas = await query('SELECT COUNT(*) as cnt FROM ranking_etapas WHERE category_id = ?', [req.params.id]);
    const ordem = (existingEtapas[0]?.cnt || 0) + 1;

    // Create etapa
    const result = await query(
      'INSERT INTO ranking_etapas (category_id, nome, ordem) VALUES (?, ?, ?)',
      [req.params.id, etapa_nome, ordem]
    );
    const etapaId = result.insertId;

    // Insert entries
    for (const entry of entries) {
      await query(
        'INSERT INTO ranking_entries (etapa_id, posicao, nome, pontos) VALUES (?, ?, ?, ?)',
        [etapaId, entry.posicao, entry.nome, entry.pontos]
      );
    }

    res.status(201).json({
      success: true,
      etapa_id: etapaId,
      etapa_nome,
      entries_count: entries.length,
    });
  } catch (err) {
    console.error('CSV upload error:', err);
    res.status(500).json({ error: 'Erro ao processar CSV' });
  }
});

// DELETE /api/rankings/etapas/:id
router.delete('/etapas/:id', auth, async (req, res) => {
  try {
    await query('DELETE FROM ranking_entries WHERE etapa_id = ?', [req.params.id]);
    await query('DELETE FROM ranking_etapas WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir etapa' });
  }
});

export default router;
