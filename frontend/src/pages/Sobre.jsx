import { useEffect, useRef, useState } from 'react'
import { Users, Award } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getContent } from '../services/api'
import './Sobre.css'

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
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`
      }}
    >
      {children}
    </div>
  )
}

export default function Sobre() {
  const { data: content } = useApi(() => getContent('sobre'), {})
  const c = content || {}

  return (
    <div className="sobre-page">
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__content">
          <span className="page-hero__badge">{c.sobre_hero_badge || 'Sobre a Federação'}</span>
          <h1 className="page-hero__title">{c.sobre_hero_title || 'Quem'} <span className="gold-text">{c.sobre_hero_title_gold || 'Somos'}</span></h1>
          <p className="page-hero__subtitle">
            {c.sobre_hero_subtitle || 'Conheça a Federação Catarinense de Poker Oficial'}
          </p>
        </div>
      </section>

      <section className="sobre-section">
        <div className="sobre-section__inner">
          <AnimatedSection>
            <div className="sobre-block">
              <h2 className="sobre-block__title">
                <Users size={24} className="sobre-block__icon" />
                {c.sobre_block1_title || 'Quem Somos'}
              </h2>
              <div className="sobre-block__content">
                {c.sobre_block1_content ? (
                  <div dangerouslySetInnerHTML={{ __html: c.sobre_block1_content }} />
                ) : (
                  <>
                    <p>A Federação Catarinense de Poker é a entidade responsável por organizar e representar oficialmente o poker no estado de Santa Catarina.</p>
                    <p>A Federação estrutura o circuito estadual, mantém o ranking oficial e atua no fortalecimento do poker como esporte da mente, promovendo organização, transparência e profissionalismo nas competições.</p>
                    <p>A atual gestão é presidida por Garrido, com vice-presidência de Firma, unindo experiência competitiva e visão de gestão para impulsionar o desenvolvimento do poker catarinense.</p>
                  </>
                )}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="sobre-block">
              <h2 className="sobre-block__title">
                <Award size={24} className="sobre-block__icon" />
                {c.sobre_block2_title || 'Seleção Catarinense de Poker'}
              </h2>
              <div className="sobre-block__content">
                {c.sobre_block2_content ? (
                  <div dangerouslySetInnerHTML={{ __html: c.sobre_block2_content }} />
                ) : (
                  <>
                    <p>Um dos principais pilares da Federação é a Seleção Catarinense de Poker, responsável por representar o estado no Campeonato Brasileiro por Equipes (CBPE).</p>
                    <p>A formação da equipe é baseada em critério técnico e meritocracia: parte dos jogadores é convocada pela diretoria, enquanto as demais vagas são destinadas ao líder e ao vice-líder do Ranking Oficial do Circuito Estadual.</p>
                    <p>A Seleção Catarinense acumula participações de destaque e resultados expressivos no cenário nacional, consolidando Santa Catarina como uma das forças do poker brasileiro por equipes.</p>
                  </>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
