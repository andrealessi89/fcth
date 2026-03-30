import { Link } from 'react-router-dom'
import { Instagram, Mail, Phone } from 'lucide-react'
import Newsletter from './Newsletter'
import { useApi } from '../hooks/useApi'
import { getSettings } from '../services/api'
import './Footer.css'

export default function Footer() {
  const { data: settings } = useApi(getSettings, {})
  const s = settings || {}

  return (
    <footer className="footer">
      <Newsletter />
      <div className="footer__main">
        <div className="footer__inner">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img src={s.logo_path || './LOGO_FCTH.png'} alt="FCTH" className="footer__logo-img" />
              <div>
                <div className="footer__logo-title">FCTH</div>
                <div className="footer__logo-sub">Federação Catarinense de Poker Oficial</div>
              </div>
            </Link>
            <div className="footer__socials">
              <a href={s.instagram_url || 'https://www.instagram.com/federacaocatarinensepoker'} target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Navegação</h4>
            <Link to="/" className="footer__col-link">Home</Link>
            <Link to="/agenda" className="footer__col-link">Agenda 2026</Link>
            <Link to="/sobre-a-federacao" className="footer__col-link">Sobre</Link>
            <Link to="/regulamento" className="footer__col-link">Regulamento</Link>
            <Link to="/filie-se" className="footer__col-link">Filie-se</Link>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Contato</h4>
            <div className="footer__contact-item">
              <Mail size={14} />
              <span>{s.contact_email || 'fedcatarinensedepoker@gmail.com'}</span>
            </div>
            <div className="footer__contact-item">
              <Phone size={14} />
              <span>{s.contact_phone || '+55 47 9671-7434'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p>{s.footer_copyright || '© 2026 FCTH - Federação Catarinense de Poker Oficial. Todos os direitos reservados.'}</p>
        </div>
      </div>
    </footer>
  )
}
