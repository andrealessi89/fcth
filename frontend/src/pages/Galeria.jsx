import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { galeriaFotos } from '../data/mockData'
import './Galeria.css'

function useInView(threshold = 0.1) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`
      }}
    >
      {children}
    </div>
  )
}

export default function Galeria() {
  const [filter, setFilter] = useState('Todas')
  const [lightbox, setLightbox] = useState(null)

  const etapas = ['Todas', ...new Set(galeriaFotos.map(f => f.etapa))]
  const filtered = filter === 'Todas' ? galeriaFotos : galeriaFotos.filter(f => f.etapa === filter)

  const openLightbox = (index) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)

  const nextPhoto = () => {
    if (lightbox !== null) {
      setLightbox((lightbox + 1) % filtered.length)
    }
  }

  const prevPhoto = () => {
    if (lightbox !== null) {
      setLightbox((lightbox - 1 + filtered.length) % filtered.length)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightbox === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextPhoto()
      if (e.key === 'ArrowLeft') prevPhoto()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox, filtered.length])

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <div className="galeria-page">
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__content">
          <span className="page-hero__badge">Galeria de Fotos</span>
          <h1 className="page-hero__title">Momentos <span className="gold-text">Marcantes</span></h1>
          <p className="page-hero__subtitle">
            Reviva os melhores momentos dos eventos da Federação Catarinense de Poker Oficial
          </p>
        </div>
      </section>

      <section className="galeria-section">
        <div className="galeria-section__inner">
          {/* Filter tabs */}
          <div className="galeria-filters">
            <Filter size={16} className="galeria-filters__icon" />
            {etapas.map(etapa => (
              <button
                key={etapa}
                className={`galeria-filter ${filter === etapa ? 'galeria-filter--active' : ''}`}
                onClick={() => setFilter(etapa)}
              >
                {etapa}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          <div className="galeria-grid">
            {filtered.map((foto, i) => (
              <AnimatedSection key={foto.id} delay={i * 0.05} className="galeria-item">
                <div className="galeria-card" onClick={() => openLightbox(i)}>
                  <img src={foto.src} alt={foto.alt} loading="lazy" />
                  <div className="galeria-card__overlay">
                    <span className="galeria-card__etapa">{foto.etapa}</span>
                    <span className="galeria-card__desc">{foto.alt}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox__close" onClick={closeLightbox}>
            <X size={24} />
          </button>
          <button
            className="lightbox__nav lightbox__nav--prev"
            onClick={(e) => { e.stopPropagation(); prevPhoto() }}
          >
            <ChevronLeft size={32} />
          </button>
          <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <img src={filtered[lightbox].src} alt={filtered[lightbox].alt} />
            <div className="lightbox__info">
              <span className="lightbox__etapa">{filtered[lightbox].etapa}</span>
              <span className="lightbox__desc">{filtered[lightbox].alt}</span>
            </div>
          </div>
          <button
            className="lightbox__nav lightbox__nav--next"
            onClick={(e) => { e.stopPropagation(); nextPhoto() }}
          >
            <ChevronRight size={32} />
          </button>
          <div className="lightbox__counter">
            {lightbox + 1} / {filtered.length}
          </div>
        </div>
      )}
    </div>
  )
}
