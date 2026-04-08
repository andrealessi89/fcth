import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Calendar, MapPin, Trophy, ChevronRight, Users, Award, Star, Instagram, Image, X, Medal } from 'lucide-react'
import { events as fallbackEvents } from '../data/mockData'
import { useApi } from '../hooks/useApi'
import { getEvents, getPartners, getContent, getRankings } from '../services/api'
import './Home.css'

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
      className={`${className} ${inView ? 'visible' : ''}`}
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

function CountUp({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])
  return <span ref={ref}>{count.toLocaleString('pt-BR')}{suffix}</span>
}

export default function Home() {
  const { data: apiEvents } = useApi(getEvents, fallbackEvents)
  const { data: apiPartners } = useApi(getPartners, [
    { id: 1, nome: 'Start', logo_path: './parceiros/marca_start-02.png', dark_background: 1 },
    { id: 2, nome: 'KKPoker', logo_path: './parceiros/kkpoker_horizontal.png', dark_background: 1 },
  ])
  const { data: content } = useApi(() => getContent('home'), {})
  const { data: rankingCategories } = useApi(getRankings, [])

  // Map API events to component format
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

  const nextEvents = events.slice(0, 3)
  const [bannerModal, setBannerModal] = useState(null)

  const c = content || {}

  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a[href*="elfsight.com"]').forEach(el => el.style.display = 'none')
      document.querySelectorAll('.eapps-instagram-feed-posts-grid-load-more-container').forEach(el => el.style.display = 'none')
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__image hero__image--desktop" style={c.home_hero_image ? { backgroundImage: `url(${c.home_hero_image})` } : undefined} />
          <div className="hero__image hero__image--mobile" style={c.home_hero_image_mobile ? { backgroundImage: `url(${c.home_hero_image_mobile})` } : undefined} />
          <div className="hero__gradient" />
          <div className="hero__pattern" />
        </div>
        <div className="hero__content">
          <AnimatedSection>
            <span className="hero__line1">{c.home_hero_line1 || 'Primeira Etapa do Circuito'}</span>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="hero__title hero__title--floripa">
              {c.home_hero_title || 'Florianópolis'}
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="hero__line3">
              {c.home_hero_line3 || '04 a 08 de Março — Cambirela Hotel'}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="hero__actions">
              <Link to="/agenda" className="hero__btn hero__btn--primary"
                style={c.home_hero_btn1_color || c.home_hero_btn1_bg ? {
                  color: c.home_hero_btn1_color || undefined,
                  background: c.home_hero_btn1_bg || undefined,
                } : undefined}
              >
                <Calendar size={18} />
                {c.home_hero_btn1_text || 'Ver Agenda 2026'}
              </Link>
              <Link to="/sobre-a-federacao" className="hero__btn hero__btn--outline"
                style={c.home_hero_btn2_color || c.home_hero_btn2_bg || c.home_hero_btn2_border ? {
                  color: c.home_hero_btn2_color || undefined,
                  background: c.home_hero_btn2_bg || undefined,
                  borderColor: c.home_hero_btn2_border || undefined,
                } : undefined}
              >
                <Trophy size={18} />
                {c.home_hero_btn2_text || 'Sobre a Federação'}
              </Link>
            </div>
          </AnimatedSection>
        </div>
        <div className="hero__scroll-indicator">
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats__inner">
          <div className="stats__item">
            <div className="stats__icon"><Calendar size={24} /></div>
            <div className="stats__number">{c.home_stats_date || '4 a 8 de Março'}</div>
            <div className="stats__label">{c.home_stats_date_label || 'Próxima Etapa'}</div>
          </div>
          <div className="stats__divider" />
          <div className="stats__item">
            <div className="stats__icon"><Award size={24} /></div>
            <div className="stats__number">{c.home_stats_prize || 'R$ 1.000.000'}</div>
            <div className="stats__label">{c.home_stats_prize_label || 'Garantidos'}</div>
          </div>
          <div className="stats__divider" />
          <div className="stats__item">
            <div className="stats__icon"><MapPin size={24} /></div>
            <div className="stats__number">{c.home_stats_location || 'Florianópolis'}</div>
            <div className="stats__label">{c.home_stats_location_label || 'Hotel Cambirela'}</div>
          </div>
        </div>
      </section>

      {/* Next Events */}
      <section className="home-section home-section--agenda">
        <div className="home-section__inner">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">{c.home_agenda_label || 'Próximas Etapas'}</span>
              <h2 className="section-title">{c.home_agenda_title || 'Agenda'} <span className="gold-text">{c.home_agenda_title_gold || '2026'}</span></h2>
              <p className="section-subtitle">{c.home_agenda_subtitle || 'Confira as próximas etapas do circuito catarinense'}</p>
            </div>
          </AnimatedSection>

          <div className="events-grid">
            {nextEvents.map((evt, i) => (
              <AnimatedSection key={evt.id} delay={i * 0.1}>
                <div className="event-card">
                  <div className="event-card__badge">{evt.etapa}</div>
                  <div className="event-card__content">
                    <h3 className="event-card__city">{evt.cidade}</h3>
                    {evt.garantido && (
                      <div className="event-card__guaranteed">
                        <span className="event-card__amount">{evt.garantido}</span>
                        <span className="event-card__guaranteed-label">Garantidos</span>
                      </div>
                    )}
                    <div className="event-card__details">
                      <div className="event-card__detail">
                        <Calendar size={14} />
                        <span>{evt.data}</span>
                      </div>
                      <div className="event-card__detail">
                        <MapPin size={14} />
                        <span>{evt.local}</span>
                      </div>
                    </div>
                    {evt.banner ? (
                      <button className="event-card__banner-btn" onClick={() => setBannerModal(evt.banner)}>
                        <Image size={14} />
                        Ver Banner
                      </button>
                    ) : (
                      <button className="event-card__banner-btn event-card__banner-btn--disabled" disabled>
                        <Image size={14} />
                        Banner Em Breve
                      </button>
                    )}
                  </div>
                  <div className="event-card__glow" />
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <div className="section-cta">
              <Link to="/agenda" className="btn-link">
                Ver agenda completa <ChevronRight size={18} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Instagram / Momentos Marcantes */}
      <section className="home-section home-section--instagram">
        <div className="home-section__inner">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">{c.home_instagram_label || 'Galeria'}</span>
              <h2 className="section-title">{c.home_instagram_title || 'Nossos Momentos'} <span className="gold-text">{c.home_instagram_title_gold || 'Marcantes'}</span></h2>
              <p className="section-subtitle">{c.home_instagram_subtitle || 'Acompanhe os bastidores e os melhores momentos no nosso Instagram'}</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="elfsight-app-2d93b3c4-cb82-40bc-8750-d37b5cb8fc62" data-elfsight-app-lazy></div>
            <div className="instagram-follow">
              <a
                href="https://www.instagram.com/federacaocatarinensepoker"
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-cta__btn"
              >
                <Instagram size={18} />
                Seguir no Instagram
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Ranking Preview */}
      {rankingCategories && rankingCategories.length > 0 && rankingCategories[0].players?.length > 0 && (
        <section className="home-section home-section--ranking">
          <div className="home-section__inner">
            <AnimatedSection>
              <div className="section-header">
                <span className="section-label">Classificação</span>
                <h2 className="section-title">Ranking <span className="gold-text">2026</span></h2>
                <p className="section-subtitle">Confira os líderes do circuito catarinense</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="home-ranking">
                <div className="home-ranking__table">
                  <div className="home-ranking__head">
                    <span>Pos</span>
                    <span>Jogador</span>
                    <span>Pontos</span>
                  </div>
                  {rankingCategories[0].players.slice(0, 10).map((p, i) => (
                    <div key={p.nome} className={`home-ranking__row ${i < 3 ? 'home-ranking__row--top' : ''}`}>
                      <span className={`home-ranking__pos home-ranking__pos--${i < 3 ? i + 1 : 'default'}`}>
                        {i < 3 ? <Medal size={16} /> : (i + 1)}
                      </span>
                      <span className="home-ranking__name">{p.nome}</span>
                      <span className="home-ranking__pts">{p.total_pontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
                <Link to="/ranking" className="agenda-link">
                  Ver ranking completo <ChevronRight size={18} />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Sponsors */}
      <section className="home-section home-section--sponsors">
        <div className="home-section__inner">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">{c.home_partners_label || 'Nossos Parceiros'}</span>
              <h2 className="section-title">{c.home_partners_title || 'Parceiros'} <span className="gold-text">{c.home_partners_title_gold || 'e Apoio'}</span></h2>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="sponsors-grid">
              {(apiPartners || []).map(partner => (
                <div key={partner.id} className={`sponsor-card ${partner.dark_background ? 'sponsor-card--dark' : ''} ${partner.nome === 'KKPoker' ? 'sponsor-card--kkpoker' : ''}`}>
                  <img src={partner.logo_path} alt={partner.nome} />
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Banner Modal */}
      {bannerModal && (
        <div className="banner-modal" onClick={() => setBannerModal(null)}>
          <button className="banner-modal__close" onClick={() => setBannerModal(null)}>
            <X size={24} />
          </button>
          <img src={bannerModal} alt="Banner do evento" className="banner-modal__img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
