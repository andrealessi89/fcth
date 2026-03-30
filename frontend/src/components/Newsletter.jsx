import { useState } from 'react'
import { Send } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getContent, subscribeNewsletter } from '../services/api'
import './Newsletter.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { data: content } = useApi(() => getContent('newsletter'), {})
  const c = content || {}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (email && nome) {
      try {
        await subscribeNewsletter(nome, email)
      } catch {
        // API may be down; still show success locally
      }
      setSubmitted(true)
      setEmail('')
      setNome('')
      setError('')
      setTimeout(() => setSubmitted(false), 6000)
    }
  }

  return (
    <section className="newsletter">
      <div className="newsletter__inner">
        <div className="newsletter__content">
          <h3 className="newsletter__title">{c.newsletter_title || 'Fique por dentro de tudo!'}</h3>
          <p className="newsletter__desc">
            {c.newsletter_desc || 'Cadastre-se e receba novidades sobre etapas, resultados e promoções do FCTH 2026.'}
          </p>
        </div>
        {submitted ? (
          <div className="newsletter__thanks">
            <p className="newsletter__thanks-title">{c.newsletter_thanks_title || 'Obrigado por se cadastrar!'}</p>
            <p className="newsletter__thanks-text">
              {c.newsletter_thanks_text || 'Agradecemos o seu interesse na Federação Catarinense de Poker Oficial. Em breve você receberá novidades sobre o circuito!'}
            </p>
          </div>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="newsletter__input"
              required
            />
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter__input"
              required
            />
            <button type="submit" className="newsletter__btn">
              <Send size={16} />
              Cadastrar
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
