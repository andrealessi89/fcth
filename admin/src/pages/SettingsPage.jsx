import { useState, useEffect, useRef } from 'react'
import { Save, Check, Upload, Image, FileText } from 'lucide-react'
import { getSettings, updateSettingsBatch, uploadSettingFile } from '../services/api'

const TEXT_FIELDS = [
  { key: 'site_name', label: 'Nome do Site' },
  { key: 'contact_email', label: 'Email de Contato' },
  { key: 'contact_phone', label: 'Telefone' },
  { key: 'instagram_url', label: 'URL do Instagram' },
  { key: 'instagram_widget_id', label: 'Elfsight Widget ID' },
  { key: 'footer_copyright', label: 'Texto Copyright Footer' },
]

const FILE_FIELDS = [
  { key: 'logo_path', label: 'Logo do Site', accept: 'image/*', icon: 'image' },
  { key: 'regulamento_pdf_path', label: 'Regulamento (PDF)', accept: '.pdf,application/pdf', icon: 'file' },
  { key: 'termo_adesao_path', label: 'Termo de Adesao', accept: '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: 'file' },
]

function FileUploadField({ settingKey, currentValue, accept, icon, onUploaded }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadSettingFile(file, settingKey)
      onUploaded(settingKey, res.path)
    } catch (err) {
      alert('Erro ao enviar: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const isImage = accept && accept.includes('image')

  return (
    <div className="content-image-upload">
      {isImage && currentValue ? (
        <div className="content-image-upload__preview">
          <img src={currentValue} alt="Preview" />
        </div>
      ) : (
        <div className="content-image-upload__preview">
          <div className="content-image-upload__empty">
            {icon === 'image' ? <Image size={28} /> : <FileText size={28} />}
            <span>{currentValue ? 'Arquivo enviado' : 'Nenhum arquivo'}</span>
          </div>
        </div>
      )}
      <div className="content-image-upload__actions">
        <button
          className="btn btn--outline btn--sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} />
          {uploading ? 'Enviando...' : 'Enviar Arquivo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        {currentValue && (
          <span className="content-image-upload__path">{currentValue}</span>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({})
  const [edited, setEdited] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error)
  }, [])

  const getValue = (key) => {
    return edited[key] !== undefined ? edited[key] : (settings[key] || '')
  }

  const handleChange = (key, value) => {
    setEdited(prev => ({ ...prev, [key]: value }))
  }

  const handleFileUploaded = (key, path) => {
    setSettings(prev => ({ ...prev, [key]: path }))
    // Remove from edited since it was saved directly
    setEdited(prev => {
      const { [key]: _, ...rest } = prev
      return rest
    })
    setMsg('Arquivo enviado com sucesso!')
    setTimeout(() => setMsg(''), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const items = Object.entries(edited).map(([setting_key, setting_value]) => ({
        setting_key,
        setting_value,
      }))
      if (items.length === 0) {
        setMsg('Nenhuma alteracao para salvar')
        setTimeout(() => setMsg(''), 3000)
        setSaving(false)
        return
      }
      await updateSettingsBatch(items)
      const fresh = await getSettings()
      setSettings(fresh)
      setEdited({})
      setMsg('Configuracoes atualizadas!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = Object.keys(edited).length > 0

  return (
    <div>
      <div className="page-header">
        <h1>Configuracoes</h1>
        <p>Configuracoes gerais do site</p>
      </div>

      {msg && <div className="alert alert--success"><Check size={16} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>{msg}</div>}

      <div className="card">
        {TEXT_FIELDS.map(field => (
          <div key={field.key} className="form-group">
            <label>{field.label}</label>
            <input
              className="form-input"
              value={getValue(field.key)}
              onChange={e => handleChange(field.key, e.target.value)}
            />
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
          <h3 style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
            Arquivos
          </h3>

          {FILE_FIELDS.map(field => (
            <div key={field.key} className="form-group">
              <label>{field.label}</label>
              <FileUploadField
                settingKey={field.key}
                currentValue={settings[field.key] || ''}
                accept={field.accept}
                icon={field.icon}
                onUploaded={handleFileUploaded}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving || !hasChanges}>
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar Configuracoes'}
          </button>
        </div>
      </div>
    </div>
  )
}
