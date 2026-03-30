import { useState, useEffect, useRef } from 'react'
import { Trophy, ChevronDown, Search, Medal } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getRankings } from '../services/api'
import './Ranking.css'

const fallbackCategories = []

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
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`
      }}
    >
      {children}
    </div>
  )
}

function PodiumIcon({ position }) {
  const colors = { 1: '#c8a45e', 2: '#c0c0c0', 3: '#cd7f32' }
  return (
    <div className="podium-icon" style={{ '--podium-color': colors[position] }}>
      <Medal size={20} />
    </div>
  )
}

function formatPts(val) {
  return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Ranking() {
  const { data: categories } = useApi(getRankings, fallbackCategories)
  const [activeCat, setActiveCat] = useState(null)
  const [expandedName, setExpandedName] = useState(null)
  const [search, setSearch] = useState('')

  // Auto-select first category
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCat) {
      setActiveCat(categories[0].slug || categories[0].id)
    }
  }, [categories])

  const currentCat = (categories || []).find(c => (c.slug || c.id) === activeCat) || (categories || [])[0]
  const players = currentCat?.players || []

  const filtered = players.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  )

  const handleTabChange = (cat) => {
    setActiveCat(cat.slug || cat.id)
    setExpandedName(null)
    setSearch('')
  }

  return (
    <div className="ranking-page">
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__content">
          <span className="page-hero__badge">Classificação Oficial</span>
          <h1 className="page-hero__title">Ranking <span className="gold-text">2026</span></h1>
          <p className="page-hero__subtitle">
            Acompanhe a pontuação dos jogadores no campeonato catarinense
          </p>
        </div>
      </section>

      {/* Category tabs */}
      {categories && categories.length > 1 && (
        <section className="ranking-tabs-section">
          <div className="ranking-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`ranking-tab ${(cat.slug || cat.id) === activeCat ? 'ranking-tab--active' : ''}`}
                onClick={() => handleTabChange(cat)}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top 3 Podium */}
      {players.length >= 3 && (
        <section className="podium-section">
          <div className="podium-section__inner">
            {[1, 0, 2].map((idx, i) => {
              const p = players[idx]
              if (!p) return null
              const pos = idx + 1
              return (
                <AnimatedSection key={p.nome} delay={i * 0.15} className={`podium-card podium-card--${pos}`}>
                  <div className="podium-card__inner">
                    <PodiumIcon position={pos} />
                    <div className="podium-card__pos">#{pos}</div>
                    <h3 className="podium-card__name">{p.nome}</h3>
                    <div className="podium-card__points">
                      {formatPts(p.total_pontos)}
                      <span> pts</span>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </section>
      )}

      {/* Full Ranking Table */}
      <section className="ranking-section">
        <div className="ranking-section__inner">
          <div className="ranking-search">
            <Search size={18} className="ranking-search__icon" />
            <input
              type="text"
              placeholder="Buscar jogador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ranking-search__input"
            />
          </div>

          <div className="ranking-full-table">
            <div className="ranking-full__head">
              <span className="ranking-full__col ranking-full__col--pos">Pos.</span>
              <span className="ranking-full__col ranking-full__col--name">Jogador</span>
              <span className="ranking-full__col ranking-full__col--pts">Total</span>
              <span className="ranking-full__col ranking-full__col--action"></span>
            </div>

            {filtered.map((player, i) => (
              <AnimatedSection key={player.nome} delay={Math.min(i * 0.02, 0.5)}>
                <div className={`ranking-full__row ${player.pos <= 3 ? 'ranking-full__row--top' : ''}`}>
                  <div
                    className="ranking-full__row-main"
                    onClick={() => setExpandedName(expandedName === player.nome ? null : player.nome)}
                  >
                    <span className={`ranking-full__pos ranking-full__pos--${player.pos <= 3 ? player.pos : 'default'}`}>
                      {player.pos}
                    </span>
                    <span className="ranking-full__name">{player.nome}</span>
                    <span className="ranking-full__pts">{formatPts(player.total_pontos)}</span>
                    <ChevronDown
                      size={18}
                      className={`ranking-full__chevron ${expandedName === player.nome ? 'ranking-full__chevron--open' : ''}`}
                    />
                  </div>

                  {expandedName === player.nome && player.etapas && (
                    <div className="ranking-full__details">
                      <div className="ranking-full__details-head">
                        <span>Etapa</span>
                        <span>Pontos</span>
                      </div>
                      {player.etapas.map((etapa, j) => (
                        <div key={j} className="ranking-full__details-row">
                          <span>{etapa.etapa}</span>
                          <span className="ranking-full__details-pts">{formatPts(etapa.pontos)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}

            {filtered.length === 0 && (
              <div className="ranking-full__empty">
                {players.length === 0 ? 'Nenhum dado de ranking disponível.' : 'Nenhum jogador encontrado.'}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
