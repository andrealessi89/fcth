import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Upload, X, Trophy, FileSpreadsheet } from 'lucide-react'
import {
  getRankingCategories, createRankingCategory, deleteRankingCategory,
  getCategoryEtapas, getAggregatedRanking, uploadRankingCSV, deleteRankingEtapa
} from '../services/api'

export default function RankingsList() {
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [etapas, setEtapas] = useState([])
  const [ranking, setRanking] = useState([])
  const [msg, setMsg] = useState('')

  // New category modal
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  // CSV upload
  const [etapaNome, setEtapaNome] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const loadCategories = async () => {
    const cats = await getRankingCategories()
    setCategories(cats)
    return cats
  }

  const loadCategoryData = async (catId) => {
    const [et, rk] = await Promise.all([
      getCategoryEtapas(catId),
      getAggregatedRanking(catId),
    ])
    setEtapas(et)
    setRanking(rk)
  }

  useEffect(() => {
    loadCategories().then(cats => {
      if (cats.length > 0) {
        setSelectedCat(cats[0].id)
      }
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedCat) {
      loadCategoryData(selectedCat).catch(console.error)
    }
  }, [selectedCat])

  const flash = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    try {
      const cat = await createRankingCategory({ nome: newCatName.trim() })
      setShowNewCat(false)
      setNewCatName('')
      await loadCategories()
      setSelectedCat(cat.id)
      flash('Categoria criada!')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Excluir esta categoria e todos os seus dados?')) return
    try {
      await deleteRankingCategory(id)
      const cats = await loadCategories()
      if (selectedCat === id) {
        setSelectedCat(cats.length > 0 ? cats[0].id : null)
      }
      flash('Categoria excluída!')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleUploadCSV = async () => {
    if (!etapaNome.trim() || !csvFile) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('etapa_nome', etapaNome.trim())
      fd.append('csv', csvFile)
      const result = await uploadRankingCSV(selectedCat, fd)
      flash(`Etapa "${etapaNome}" enviada com ${result.entries_count} jogadores!`)
      setEtapaNome('')
      setCsvFile(null)
      if (fileRef.current) fileRef.current.value = ''
      await loadCategoryData(selectedCat)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteEtapa = async (id, nome) => {
    if (!confirm(`Excluir etapa "${nome}"?`)) return
    try {
      await deleteRankingEtapa(id)
      await loadCategoryData(selectedCat)
      flash('Etapa excluída!')
    } catch (err) {
      alert(err.message)
    }
  }

  const selectedCatObj = categories.find(c => c.id === selectedCat)

  return (
    <div>
      <div className="page-header">
        <h1>Rankings</h1>
        <p>Gerencie categorias de ranking e envie CSVs por etapa</p>
      </div>

      {msg && <div className="alert alert--success">{msg}</div>}

      {/* Category tabs */}
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`btn ${selectedCat === cat.id ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              <Trophy size={14} />
              {cat.nome}
            </button>
          ))}
        </div>
        <button className="btn btn--primary" onClick={() => setShowNewCat(true)}>
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {selectedCatObj && (
        <>
          {/* Upload section */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase' }}>
                {selectedCatObj.nome}
              </h3>
              <button className="btn btn--danger btn--sm" onClick={() => handleDeleteCategory(selectedCat)}>
                <Trash2 size={14} /> Excluir Categoria
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                <label>Nome da Etapa</label>
                <input
                  className="form-input"
                  value={etapaNome}
                  onChange={e => setEtapaNome(e.target.value)}
                  placeholder="Ex: 1ª Etapa"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                <label>Arquivo CSV</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={e => setCsvFile(e.target.files[0])}
                  style={{ color: 'var(--text)', fontSize: '0.85rem' }}
                />
              </div>
              <button
                className="btn btn--primary"
                onClick={handleUploadCSV}
                disabled={uploading || !etapaNome.trim() || !csvFile}
                style={{ height: 42 }}
              >
                <Upload size={16} />
                {uploading ? 'Enviando...' : 'Enviar CSV'}
              </button>
            </div>
          </div>

          {/* Etapas list */}
          {etapas.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
                Etapas Enviadas ({etapas.length})
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Etapa</th>
                    <th>Jogadores</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {etapas.map(et => (
                    <tr key={et.id}>
                      <td>
                        <FileSpreadsheet size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, color: 'var(--gold)' }} />
                        {et.nome}
                      </td>
                      <td>{et.entry_count} jogador(es)</td>
                      <td>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDeleteEtapa(et.id, et.nome)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Aggregated ranking preview */}
          <div className="card">
            <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
              Ranking Agregado ({ranking.length} jogadores)
            </h3>
            {ranking.length === 0 ? (
              <div className="empty-state">Envie um CSV para ver o ranking</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Pos</th>
                    <th>Nome</th>
                    <th style={{ textAlign: 'right' }}>Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map(p => (
                    <tr key={p.pos}>
                      <td><strong>#{p.pos}</strong></td>
                      <td>{p.nome}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gold)' }}>
                        {p.total_pontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {categories.length === 0 && (
        <div className="card">
          <div className="empty-state">Nenhuma categoria criada. Crie uma para começar.</div>
        </div>
      )}

      {/* New category modal */}
      {showNewCat && (
        <div className="modal-backdrop" onClick={() => setShowNewCat(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal__header">
              <h2>Nova Categoria</h2>
              <button className="modal__close" onClick={() => setShowNewCat(false)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label>Nome da Categoria</label>
              <input
                className="form-input"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Ex: Ranking Geral"
                onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                autoFocus
              />
            </div>
            <div className="modal__actions">
              <button className="btn btn--outline" onClick={() => setShowNewCat(false)}>Cancelar</button>
              <button className="btn btn--primary" onClick={handleCreateCategory} disabled={!newCatName.trim()}>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
