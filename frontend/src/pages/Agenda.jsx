import { useEffect, useRef, useState, useMemo } from 'react'
import { Calendar, MapPin, Clock, Trophy, ChevronDown, Image, X } from 'lucide-react'
import { events as fallbackEvents } from '../data/mockData'
import { useApi } from '../hooks/useApi'
import { getEvents } from '../services/api'
import './Agenda.css'

function useInView(threshold = 0.15) {
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
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
      }}
    >
      {children}
    </div>
  )
}

function getEventStatus(dataFim) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(dataFim + 'T23:59:59')
  const dayAfterEnd = new Date(endDate)
  dayAfterEnd.setDate(dayAfterEnd.getDate() + 1)
  dayAfterEnd.setHours(0, 0, 0, 0)

  if (today >= dayAfterEnd) return 'encerrado'
  return 'em_breve'
}

function getNextEventId(evts) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (const evt of evts) {
    const endDate = new Date(evt.dataFim + 'T23:59:59')
    const dayAfterEnd = new Date(endDate)
    dayAfterEnd.setDate(dayAfterEnd.getDate() + 1)
    dayAfterEnd.setHours(0, 0, 0, 0)
    if (today < dayAfterEnd) return evt.id
  }
  return null
}

export default function Agenda() {
  const { data: apiEvents } = useApi(getEvents, fallbackEvents)
  const [expandedId, setExpandedId] = useState(null)
  const [modalBanner, setModalBanner] = useState(null)

  const events = (apiEvents || []).map(e => ({
    id: e.id,
    etapa: e.etapa,
    nome: e.nome,
    cidade: e.cidade,
    local: e.local_nome || e.local,
    data: e.data_display || e.data,
    dataFim: e.data_fim || e.dataFim,
    horario: e.horario,
    garantido: e.garantido,
    banner: e.banner_path || e.banner,
    descricao: e.descricao,
  }))

  const nextEventId = useMemo(() => getNextEventId(events), [events])

  useEffect(() => {
    if (modalBanner) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalBanner])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && modalBanner) setModalBanner(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [modalBanner])

  return (
    <div className="agenda-page">
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__content">
          <span className="page-hero__badge">Calendário Oficial</span>
          <h1 className="page-hero__title">Agenda <span className="gold-text">2026</span></h1>
          <p className="page-hero__subtitle">
            Confira todas as etapas do Circuito Catarinense de Poker
          </p>
        </div>
      </section>

      <section className="agenda-section">
        <div className="agenda-section__inner">
          <div className="events-timeline">
            {events.map((evt, i) => {
              const status = getEventStatus(evt.dataFim)
              const isNext = evt.id === nextEventId
              const isEncerrado = status === 'encerrado'

              return (
                <AnimatedSection key={evt.id} delay={i * 0.1}>
                  <div
                    className={[
                      'timeline-card',
                      expandedId === evt.id ? 'timeline-card--expanded' : '',
                      isNext ? 'timeline-card--next' : '',
                      isEncerrado ? 'timeline-card--encerrado' : ''
                    ].filter(Boolean).join(' ')}
                  >
                    <div className="timeline-card__indicator">
                      <div className="timeline-card__dot" />
                      {i < events.length - 1 && <div className="timeline-card__line" />}
                    </div>

                    <div className="timeline-card__content">
                      {evt.banner && (
                        <div className="timeline-card__banner">
                          <img src={evt.banner} alt={`Banner ${evt.etapa}`} />
                          <div className="timeline-card__banner-overlay" />
                        </div>
                      )}
                      <div
                        className="timeline-card__header"
                        onClick={() => setExpandedId(expandedId === evt.id ? null : evt.id)}
                      >
                        <div className="timeline-card__top">
                          <div className="timeline-card__top-left">
                            <span className="timeline-card__badge">{evt.etapa}</span>
                            {isNext && <span className="timeline-card__next-badge">Próxima Etapa</span>}
                          </div>
                          <div className="timeline-card__top-right">
                            {evt.banner && (
                              <button
                                className="timeline-card__banner-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setModalBanner(evt)
                                }}
                              >
                                <Image size={14} />
                                Ver Banner
                              </button>
                            )}
                            <span className={`timeline-card__status ${isEncerrado ? 'timeline-card__status--encerrado' : ''}`}>
                              {isEncerrado ? 'Encerrado' : 'Em breve'}
                            </span>
                          </div>
                        </div>

                        <div className="timeline-card__main">
                          <div className="timeline-card__left">
                            <h3 className="timeline-card__city">{evt.cidade}</h3>
                            <div className="timeline-card__meta">
                              <span className="timeline-card__meta-item">
                                <Calendar size={14} /> {evt.data}
                              </span>
                              <span className="timeline-card__meta-item">
                                <MapPin size={14} /> {evt.local}
                              </span>
                              <span className="timeline-card__meta-item">
                                <Clock size={14} /> {evt.horario}
                              </span>
                            </div>
                          </div>

                          <div className="timeline-card__right">
                            {evt.garantido && (
                              <div className="timeline-card__guaranteed">
                                <Trophy size={18} className="timeline-card__trophy" />
                                <div>
                                  <span className="timeline-card__amount">{evt.garantido}</span>
                                  <span className="timeline-card__amount-label">Garantidos</span>
                                </div>
                              </div>
                            )}
                            <ChevronDown
                              size={20}
                              className={`timeline-card__chevron ${expandedId === evt.id ? 'timeline-card__chevron--open' : ''}`}
                            />
                          </div>
                        </div>
                      </div>

                      {expandedId === evt.id && (
                        <div className="timeline-card__details">
                          <div className="timeline-card__details-inner">
                            <p className="timeline-card__desc">{evt.descricao}</p>
                            <div className="timeline-card__info-grid">
                              <div className="timeline-card__info-item">
                                <span className="timeline-card__info-label">Evento</span>
                                <span className="timeline-card__info-value">{evt.nome}</span>
                              </div>
                              <div className="timeline-card__info-item">
                                <span className="timeline-card__info-label">Local</span>
                                <span className="timeline-card__info-value">{evt.local}</span>
                              </div>
                              <div className="timeline-card__info-item">
                                <span className="timeline-card__info-label">Data</span>
                                <span className="timeline-card__info-value">{evt.data}</span>
                              </div>
                              <div className="timeline-card__info-item">
                                <span className="timeline-card__info-label">Horário</span>
                                <span className="timeline-card__info-value">{evt.horario}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
          <AnimatedSection delay={0.3}>
            <div className="agenda-soon">
              <div className="agenda-soon__icon">📢</div>
              <h3 className="agenda-soon__title">Mais Etapas Em Breve</h3>
              <p className="agenda-soon__text">
                Novas etapas e novidades serão anunciadas em breve.
                Fique ligado nas nossas redes sociais para não perder nenhuma atualização!
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {modalBanner && (
        <div className="banner-modal" onClick={() => setModalBanner(null)}>
          <button className="banner-modal__close" onClick={() => setModalBanner(null)}>
            <X size={24} />
          </button>
          <div className="banner-modal__content" onClick={(e) => e.stopPropagation()}>
            <img src={modalBanner.banner} alt={`Banner ${modalBanner.etapa}`} />
            <div className="banner-modal__info">
              <span className="banner-modal__etapa">{modalBanner.etapa}</span>
              <span className="banner-modal__nome">{modalBanner.nome} - {modalBanner.cidade}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
