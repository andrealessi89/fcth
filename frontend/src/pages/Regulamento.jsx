import { useState, useEffect, useRef } from 'react'
import { Download, BookOpen, ChevronRight } from 'lucide-react'
import { regulamentoTexto } from '../data/mockData'
import './Regulamento.css'

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

function renderMarkdown(text) {
  const lines = text.trim().split('\n')
  const elements = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      elements.push(<br key={key++} />)
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={key++} className="reg__h1">{trimmed.slice(2)}</h1>)
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={key++} className="reg__h2">{trimmed.slice(3)}</h2>)
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={key++} className="reg__list-item">
          <ChevronRight size={14} className="reg__list-icon" />
          <span>{formatBold(trimmed.slice(2))}</span>
        </div>
      )
    } else if (trimmed.startsWith('---')) {
      elements.push(<hr key={key++} className="reg__divider" />)
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      elements.push(<p key={key++} className="reg__italic">{trimmed.replace(/\*/g, '')}</p>)
    } else {
      elements.push(<p key={key++} className="reg__paragraph">{formatBold(trimmed)}</p>)
    }
  }

  return elements
}

function formatBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

export default function Regulamento() {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = './REGULAMENTO FCTH CERTO 2.pdf'
    a.download = 'Regulamento_FCTH_2026.pdf'
    a.click()
  }

  return (
    <div className="regulamento-page">
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__content">
          <span className="page-hero__badge">Documentação Oficial</span>
          <h1 className="page-hero__title">Regulamento <span className="gold-text">FCTH</span></h1>
          <p className="page-hero__subtitle">
            Conheça todas as regras e normas da Federação Catarinense de Poker Oficial 2026
          </p>
        </div>
      </section>

      <section className="regulamento-section">
        <div className="regulamento-section__inner">
          <AnimatedSection>
            <div className="regulamento-actions">
              <div className="regulamento-actions__info">
                <BookOpen size={20} className="regulamento-actions__icon" />
                <div>
                  <span className="regulamento-actions__title">Regulamento Geral - Temporada 2026</span>
                  <span className="regulamento-actions__sub">Última atualização: Janeiro 2026</span>
                </div>
              </div>
              <button className="regulamento-download" onClick={handleDownload}>
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </AnimatedSection>

          <div className="regulamento-content">
            {renderMarkdown(regulamentoTexto)}
          </div>
        </div>
      </section>
    </div>
  )
}
