import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './Header.css'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/agenda', label: 'Agenda 2026' },
  { path: '/ranking', label: 'Ranking' },
  { path: '/sobre-a-federacao', label: 'Sobre' },
  { path: '/regulamento', label: 'Regulamento' },
  { path: '/filie-se', label: 'Filie-se' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header className="header header--scrolled">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="./LOGO_FCTH.png" alt="FCTH" className="header__logo-img" />
          <div className="header__logo-text">
            <span className="header__logo-title">FCTH</span>
            <span className="header__logo-sub">Fed. Catarinense de Poker Oficial</span>
          </div>
        </Link>

        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`header__link ${location.pathname === link.path ? 'header__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="header__mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="header__mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}
    </header>
  )
}
