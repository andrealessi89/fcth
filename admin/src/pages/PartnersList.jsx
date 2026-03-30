import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { getPartners, createPartner, updatePartner, deletePartner } from '../services/api'

const emptyPartner = { nome: '', logo_path: '', dark_background: 0, ordem: 0, ativo: 1 }

export default function PartnersList() {
  const [partners, setPartners] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyPartner)
  const [logoFile, setLogoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => getPartners().then(setPartners).catch(console.error)
  useEffect(() => { load() }, [])

  const openNew = () => { setForm(emptyPartner); setLogoFile(null); setModal('new') }
  const openEdit = (p) => { setForm({ ...p }); setLogoFile(null); setModal(p) }
  const close = () => { setModal(null); setMsg('') }

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'id' && v !== null && v !== undefined) fd.append(k, v)
      })
      if (logoFile) fd.append('logo', logoFile)

      if (modal === 'new') {
        await createPartner(fd)
      } else {
        await updatePartner(form.id, fd)
      }
      await load()
      close()
      setMsg('Parceiro salvo!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir este parceiro?')) return
    await deletePartner(id)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Parceiros</h1>
        <p>Gerencie os parceiros e apoiadores</p>
      </div>

      {msg && <div className="alert alert--success">{msg}</div>}

      <div className="toolbar">
        <span>{partners.length} parceiro(s)</span>
        <button className="btn btn--primary" onClick={openNew}>
          <Plus size={16} /> Novo Parceiro
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nome</th>
              <th>Fundo Escuro</th>
              <th>Ordem</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id}>
                <td>{p.logo_path && <img src={p.logo_path} className="preview-img" style={{maxWidth:80}} />}</td>
                <td><strong>{p.nome}</strong></td>
                <td>{p.dark_background ? 'Sim' : 'Nao'}</td>
                <td>{p.ordem}</td>
                <td><span className={`badge ${p.ativo ? 'badge--active' : 'badge--inactive'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button className="btn btn--outline btn--sm" onClick={() => openEdit(p)}><Pencil size={14}/></button>
                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr><td colSpan="6" className="empty-state">Nenhum parceiro cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{modal === 'new' ? 'Novo Parceiro' : 'Editar Parceiro'}</h2>
              <button className="modal__close" onClick={close}><X size={20}/></button>
            </div>

            <div className="form-group">
              <label>Nome</label>
              <input className="form-input" value={form.nome} onChange={e => handleChange('nome', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Logo (imagem)</label>
              <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} style={{color:'var(--text)'}} />
              {form.logo_path && <img src={form.logo_path} className="preview-img" style={{marginTop:'0.5rem'}} />}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ordem</label>
                <input className="form-input" type="number" value={form.ordem} onChange={e => handleChange('ordem', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-check" style={{marginTop:'1.5rem'}}>
                  <input type="checkbox" checked={!!form.dark_background} onChange={e => handleChange('dark_background', e.target.checked ? 1 : 0)} />
                  Fundo Escuro
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-check">
                <input type="checkbox" checked={!!form.ativo} onChange={e => handleChange('ativo', e.target.checked ? 1 : 0)} />
                Ativo
              </label>
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
