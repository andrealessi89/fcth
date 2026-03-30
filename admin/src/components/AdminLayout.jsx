import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, FileText, Mail, Settings, LogOut, Trophy } from 'lucide-react'
import { logout, getUser } from '../services/api'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/eventos', icon: Calendar, label: 'Eventos' },
  { to: '/parceiros', icon: Users, label: 'Parceiros' },
  { to: '/rankings', icon: Trophy, label: 'Rankings' },
  { to: '/conteudo', icon: FileText, label: 'Conteudo' },
  { to: '/newsletter', icon: Mail, label: 'Newsletter' },
  { to: '/configuracoes', icon: Settings, label: 'Configuracoes' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">FCTH</div>
          <div>
            <span className="sidebar__logo-text">Admin</span>
            <span className="sidebar__logo-sub">{user?.nome || 'Administrador'}</span>
          </div>
        </div>
        <nav className="sidebar__nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__logout">
          <button className="sidebar__logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
