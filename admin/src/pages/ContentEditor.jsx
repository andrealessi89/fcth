import { useState, useEffect, useRef } from 'react'
import { Save, Check, Upload, Image, X, ChevronDown, ChevronRight } from 'lucide-react'
import { getAllContent, updateContentBatch, uploadContentImage } from '../services/api'

const PAGE_TABS = [
  { key: 'home', label: 'Home' },
  { key: 'sobre', label: 'Sobre' },
  { key: 'filiese', label: 'Filie-se' },
  { key: 'newsletter', label: 'Newsletter' },
]

// Section groupings for Home page
const HOME_SECTIONS = [
  {
    id: 'hero',
    title: 'Hero (Banner Principal)',
    keys: ['home_hero_line1', 'home_hero_title', 'home_hero_line3', 'home_hero_btn1_text', 'home_hero_btn2_text', 'home_hero_image', 'home_hero_image_mobile'],
    imageKeys: [
      { key: 'home_hero_image', label: 'Imagem de Fundo (Desktop)' },
      { key: 'home_hero_image_mobile', label: 'Imagem de Fundo (Mobile)' },
    ],
  },
  {
    id: 'stats',
    title: 'Barra de Estatísticas',
    keys: ['home_stats_date', 'home_stats_date_label', 'home_stats_prize', 'home_stats_prize_label', 'home_stats_location', 'home_stats_location_label'],
  },
  {
    id: 'agenda',
    title: 'Seção Agenda',
    keys: ['home_agenda_label', 'home_agenda_title', 'home_agenda_title_gold', 'home_agenda_subtitle'],
  },
  {
    id: 'instagram',
    title: 'Seção Instagram / Galeria',
    keys: ['home_instagram_label', 'home_instagram_title', 'home_instagram_title_gold', 'home_instagram_subtitle'],
  },
  {
    id: 'partners',
    title: 'Seção Parceiros',
    keys: ['home_partners_label', 'home_partners_title', 'home_partners_title_gold'],
  },
]

function ImageUploadField({ contentKey, currentValue, onUploaded }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const res = await uploadContentImage(file, contentKey)
      onUploaded(contentKey, res.path)
    } catch (err) {
      alert('Erro ao enviar imagem: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const displaySrc = preview || currentValue

  return (
    <div className="content-image-upload">
      <div className="content-image-upload__preview">
        {displaySrc ? (
          <img src={displaySrc} alt="Preview" />
        ) : (
          <div className="content-image-upload__empty">
            <Image size={32} />
            <span>Nenhuma imagem</span>
          </div>
        )}
      </div>
      <div className="content-image-upload__actions">
        <button
          className="btn btn--outline btn--sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} />
          {uploading ? 'Enviando...' : 'Enviar Imagem'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
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

export default function ContentEditor() {
  const [items, setItems] = useState([])
  const [activeTab, setActiveTab] = useState('home')
  const [edited, setEdited] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    getAllContent().then(setItems).catch(console.error)
  }, [])

  const filtered = items.filter(i => i.page === activeTab)

  const handleChange = (key, value) => {
    setEdited(prev => ({ ...prev, [key]: value }))
  }

  const getValue = (item) => {
    return edited[item.content_key] !== undefined ? edited[item.content_key] : item.content_value
  }

  const getValueByKey = (key) => {
    if (edited[key] !== undefined) return edited[key]
    const item = items.find(i => i.content_key === key)
    return item ? item.content_value : ''
  }

  const handleImageUploaded = (key, path) => {
    setEdited(prev => ({ ...prev, [key]: path }))
    // Also update local items for immediate display
    setItems(prev => prev.map(i => i.content_key === key ? { ...i, content_value: path } : i))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const changes = Object.entries(edited).map(([content_key, content_value]) => ({
        content_key,
        content_value,
      }))
      if (changes.length === 0) {
        setMsg('Nenhuma alteracao para salvar')
        setTimeout(() => setMsg(''), 3000)
        setSaving(false)
        return
      }
      await updateContentBatch(changes)
      const fresh = await getAllContent()
      setItems(fresh)
      setEdited({})
      setMsg('Conteudo atualizado com sucesso!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = Object.keys(edited).length > 0

  // Build items map for quick lookup
  const itemsMap = {}
  for (const item of items) {
    itemsMap[item.content_key] = item
  }

  // Render Home tab with sections
  const renderHomeSections = () => {
    return HOME_SECTIONS.map((section) => {
      const sectionItems = section.keys
        .map(key => itemsMap[key])
        .filter(Boolean)

      const imageKeys = section.imageKeys || (section.imageKey ? [{ key: section.imageKey, label: 'Imagem de Fundo' }] : [])
      const allImageKeyNames = imageKeys.map(ik => ik.key)
      const isOpen = !!openSections[section.id]

      return (
        <div key={section.id} className="content-section">
          <div className="content-section__header" onClick={() => toggleSection(section.id)}>
            <div className="content-section__toggle">
              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            <h3 className="content-section__title">{section.title}</h3>
            <span className="content-section__count">{sectionItems.length} campo(s)</span>
          </div>

          {isOpen && (
            <div className="content-section__body">
              {imageKeys.map(ik => (
                <div key={ik.key} className="form-group">
                  <label>{ik.label}</label>
                  <ImageUploadField
                    contentKey={ik.key}
                    currentValue={getValueByKey(ik.key)}
                    onUploaded={handleImageUploaded}
                  />
                </div>
              ))}

              {sectionItems
                .filter(item => !allImageKeyNames.includes(item.content_key))
                .map(item => (
                  <div key={item.id} className="form-group">
                    <label>{item.description || item.content_key}</label>
                    {item.content_type === 'html' ? (
                      <textarea
                        className="form-textarea"
                        value={getValue(item)}
                        onChange={e => handleChange(item.content_key, e.target.value)}
                        style={{ minHeight: 150 }}
                      />
                    ) : (
                      <input
                        className="form-input"
                        value={getValue(item)}
                        onChange={e => handleChange(item.content_key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )
    })
  }

  // Render other tabs (flat list)
  const renderFlatList = () => {
    return filtered.map(item => (
      <div key={item.id} className="form-group">
        <label>{item.description || item.content_key}</label>
        {item.content_type === 'html' ? (
          <textarea
            className="form-textarea"
            value={getValue(item)}
            onChange={e => handleChange(item.content_key, e.target.value)}
            style={{ minHeight: 150 }}
          />
        ) : (
          <input
            className="form-input"
            value={getValue(item)}
            onChange={e => handleChange(item.content_key, e.target.value)}
          />
        )}
      </div>
    ))
  }

  return (
    <div>
      <div className="page-header">
        <h1>Conteudo</h1>
        <p>Edite os textos e imagens de cada pagina do site</p>
      </div>

      {msg && <div className="alert alert--success"><Check size={16} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>{msg}</div>}

      <div className="tabs">
        {PAGE_TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'home' ? (
          <>
            {renderHomeSections()}
          </>
        ) : (
          <>
            {filtered.length === 0 && (
              <div className="empty-state">Nenhum conteudo para esta pagina</div>
            )}
            {renderFlatList()}
          </>
        )}

        {(activeTab === 'home' || filtered.length > 0) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn--primary" onClick={handleSave} disabled={saving || !hasChanges}>
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar Alteracoes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
