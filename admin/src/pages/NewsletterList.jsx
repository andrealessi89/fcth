import { useState, useEffect } from 'react'
import { Download, Trash2, Mail, Search } from 'lucide-react'
import { getNewsletterSignups, deleteNewsletterSignup, exportNewsletter } from '../services/api'

export default function NewsletterList() {
  const [signups, setSignups] = useState([])
  const [search, setSearch] = useState('')

  const load = () => getNewsletterSignups().then(setSignups).catch(console.error)
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Excluir este cadastro?')) return
    await deleteNewsletterSignup(id)
    load()
  }

  const handleExport = () => {
    exportNewsletter().catch(err => alert(err.message))
  }

  const filtered = signups.filter(s =>
    s.nome.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h1>Newsletter</h1>
        <p>Cadastros recebidos pelo formulario do site</p>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <Search size={16} />
          <input placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
          <span style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>{signups.length} cadastro(s)</span>
          <button className="btn btn--outline" onClick={handleExport}>
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Data</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.nome}</td>
                <td>
                  <a href={`mailto:${s.email}`} style={{color:'var(--gold)'}}>
                    <Mail size={12} style={{display:'inline',verticalAlign:'middle',marginRight:4}} />
                    {s.email}
                  </a>
                </td>
                <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                <td>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(s.id)}>
                    <Trash2 size={14}/>
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="empty-state">Nenhum cadastro encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
