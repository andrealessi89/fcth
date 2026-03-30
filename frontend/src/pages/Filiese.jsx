import { useEffect, useRef, useState } from 'react'
import { Building2, Download } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getContent, getSettings } from '../services/api'
import './Filiese.css'

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

export default function Filiese() {
  const { data: content } = useApi(() => getContent('filiese'), {})
  const { data: settings } = useApi(getSettings, {})
  const c = content || {}

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = (settings && settings.termo_adesao_path) || './TERMO DE ADESÃO - CLUBE FEDERADO v2.docx'
    a.download = 'TERMO_DE_ADESAO_CLUBE_FEDERADO_FCTH.docx'
    a.click()
  }

  return (
    <div className="filiese-page">
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__content">
          <span className="page-hero__badge">{c.filiese_hero_badge || 'Clubes Federados'}</span>
          <h1 className="page-hero__title">{c.filiese_hero_title || 'Filie-se à'} <span className="gold-text">{c.filiese_hero_title_gold || 'FCTH'}</span></h1>
          <p className="page-hero__subtitle">
            {c.filiese_hero_subtitle || 'Seu clube pode fazer parte da estrutura oficial do poker catarinense'}
          </p>
        </div>
      </section>

      <section className="filiese-section">
        <div className="filiese-section__inner">
          <AnimatedSection>
            <div className="filiese-block">
              <h2 className="filiese-block__title">
                <Building2 size={22} className="filiese-block__icon" />
                Seja um Clube Federado
              </h2>
              <div className="filiese-block__content">
                {c.filiese_content ? (
                  <div dangerouslySetInnerHTML={{ __html: c.filiese_content }} />
                ) : (
                  <>
                    <p className="filiese-block__highlight">
                      SEU CLUBE PODE FAZER PARTE DA ESTRUTURA OFICIAL DO POKER CATARINENSE
                    </p>
                    <p>A Federação Catarinense de Texas Hold'em está ampliando seu quadro de Clubes Federados.</p>
                    <p>Se o seu clube atua em Santa Catarina, essa é a oportunidade de integrar oficialmente a entidade que organiza, regulamenta e desenvolve o poker no estado.</p>
                  </>
                )}

                <h3 className="filiese-block__subtitle">Ao se tornar um Clube Federado FCTH, seu clube passa a contar com:</h3>
                <ul className="filiese-list">
                  <li>Reconhecimento oficial junto à Federação</li>
                  <li>Integração ao circuito oficial da FCTH</li>
                  <li>Apoio institucional</li>
                  <li>Fortalecimento da marca perante jogadores e parceiros</li>
                </ul>

                <h3 className="filiese-block__subtitle">Além disso, o Clube Federado passa a ter direito a:</h3>
                <ul className="filiese-list">
                  <li>Percentual da taxa administrativa das inscrições realizadas por seus jogadores nos torneios oficiais</li>
                  <li>Participação no valor líquido arrecadado na Bolha Federada dos torneios paralelos, conforme regulamento vigente</li>
                </ul>

                <p className="filiese-block__note">
                  <strong>Importante:</strong> a participação financeira está vinculada exclusivamente aos jogadores indicados pelo próprio clube, respeitando integralmente o regulamento da Federação.
                </p>
                <p>A FCTH acredita no crescimento coletivo, na organização estruturada e na valorização dos clubes que constroem o poker catarinense diariamente.</p>
                <p>
                  Para saber mais sobre o processo de adesão, entre em contato pelo e-mail oficial da FCTH (<a href={`mailto:${(settings && settings.contact_email) || 'fedcatarinensedepoker@gmail.com'}`} className="filiese-link">{(settings && settings.contact_email) || 'fedcatarinensedepoker@gmail.com'}</a>) e receba todas as informações.
                </p>
              </div>

              <button className="filiese-download" onClick={handleDownload}>
                <Download size={18} />
                Baixar Termo de Adesão
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
