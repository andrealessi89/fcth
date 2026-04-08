import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/api'

const emptyEvent = {
  etapa: '', nome: '', cidade: '', local_nome: '', data_display: '',
  data_fim: '', horario: 'A definir', garantido: '', banner_path: '', grade_path: '', descricao: '', ordem: 0, ativo: 1
}

export default function EventsList() {
  const [events, setEvents] = useState([])
  const [modal, setModal] = useState(null) // null | 'new' | event obj
  const [form, setForm] = useState(emptyEvent)
  const [bannerFile, setBannerFile] = useState(null)
  const [gradeFile, setGradeFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => getEvents().then(setEvents).catch(console.error)
  useEffect(() => { load() }, [])

  const openNew = () => { setForm(emptyEvent); setBannerFile(null); setGradeFile(null); setModal('new') }
  const openEdit = (evt) => { setForm({ ...evt }); setBannerFile(null); setGradeFile(null); setModal(evt) }
  const close = () => { setModal(null); setMsg('') }

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'id' && v !== null && v !== undefined) fd.append(k, v)
      })
      if (bannerFile) fd.append('banner', bannerFile)
      if (gradeFile) fd.append('grade', gradeFile)

      if (modal === 'new') {
        await createEvent(fd)
      } else {
        await updateEvent(form.id, fd)
      }
      await load()
      close()
      setMsg('Evento salvo com sucesso!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir este evento?')) return
    await deleteEvent(id)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Eventos</h1>
        <p>Gerencie as etapas do circuito</p>
      </div>

      {msg && <div className="alert alert--success">{msg}</div>}

      <div className="toolbar">
        <span>{events.length} evento(s)</span>
        <button className="btn btn--primary" onClick={openNew}>
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Cidade</th>
              <th>Data</th>
              <th>Garantido</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {events.map(evt => (
              <tr key={evt.id}>
                <td><strong>{evt.etapa}</strong><br/><span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>{evt.nome}</span></td>
                <td>{evt.cidade}</td>
                <td>{evt.data_display}</td>
                <td>{evt.garantido || '-'}</td>
                <td><span className={`badge ${evt.ativo ? 'badge--active' : 'badge--inactive'}`}>{evt.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button className="btn btn--outline btn--sm" onClick={() => openEdit(evt)}><Pencil size={14}/></button>
                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(evt.id)}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan="6" className="empty-state">Nenhum evento cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{modal === 'new' ? 'Novo Evento' : 'Editar Evento'}</h2>
              <button className="modal__close" onClick={close}><X size={20}/></button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Etapa</label>
                <input className="form-input" value={form.etapa} onChange={e => handleChange('etapa', e.target.value)} placeholder="1a Etapa" />
              </div>
              <div className="form-group">
                <label>Nome</label>
                <input className="form-input" value={form.nome} onChange={e => handleChange('nome', e.target.value)} placeholder="FCTH Florianopolis" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cidade</label>
                <input className="form-input" value={form.cidade} onChange={e => handleChange('cidade', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Local</label>
                <input className="form-input" value={form.local_nome} onChange={e => handleChange('local_nome', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data (display)</label>
                <input className="form-input" value={form.data_display} onChange={e => handleChange('data_display', e.target.value)} placeholder="4 a 8 de Marco" />
              </div>
              <div className="form-group">
                <label>Data Fim (YYYY-MM-DD)</label>
                <input className="form-input" type="date" value={form.data_fim} onChange={e => handleChange('data_fim', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Horario</label>
                <input className="form-input" value={form.horario} onChange={e => handleChange('horario', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Garantido</label>
                <input className="form-input" value={form.garantido || ''} onChange={e => handleChange('garantido', e.target.value)} placeholder="R$ 1 Milhao" />
              </div>
            </div>

            <div className="form-group">
              <label>Descricao</label>
              <textarea className="form-textarea" value={form.descricao || ''} onChange={e => handleChange('descricao', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Banner (imagem)</label>
              <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files[0])} style={{color:'var(--text)'}} />
              {form.banner_path && <img src={form.banner_path} className="preview-img" style={{marginTop:'0.5rem'}} />}
            </div>

            <div className="form-group">
              <label>Grade do Torneio (PDF)</label>
              <input type="file" accept=".pdf,application/pdf" onChange={e => setGradeFile(e.target.files[0])} style={{color:'var(--text)'}} />
              {form.grade_path && (
                <a href={form.grade_path} target="_blank" rel="noopener noreferrer" style={{color:'var(--gold)', fontSize:'0.8rem', marginTop:'0.25rem', display:'inline-block'}}>
                  Ver grade atual
                </a>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ordem</label>
                <input className="form-input" type="number" value={form.ordem} onChange={e => handleChange('ordem', e.target.value)} />
              </div>
              <div className="form-group" style={{display:'flex',alignItems:'flex-end'}}>
                <label className="form-check">
                  <input type="checkbox" checked={!!form.ativo} onChange={e => handleChange('ativo', e.target.checked ? 1 : 0)} />
                  Ativo
                </label>
              </div>
            </div>

            <div className="modal__actions">
              <button className="btn btn--outline" onClick={close}>Cancelar</button>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
