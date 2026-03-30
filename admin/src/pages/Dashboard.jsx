import { useState, useEffect } from 'react'
import { Calendar, Users, Mail, Trophy } from 'lucide-react'
import { getDashboardStats } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error)
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visao geral do site FCTH</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--gold">
            <Calendar size={20} />
          </div>
          <div className="stat-card__number">{stats?.totalEvents ?? '...'}</div>
          <div className="stat-card__label">Eventos</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue">
            <Users size={20} />
          </div>
          <div className="stat-card__number">{stats?.totalPartners ?? '...'}</div>
          <div className="stat-card__label">Parceiros</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <Mail size={20} />
          </div>
          <div className="stat-card__number">{stats?.totalNewsletter ?? '...'}</div>
          <div className="stat-card__label">Cadastros Newsletter</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--red">
            <Trophy size={20} />
          </div>
          <div className="stat-card__number">{stats?.totalRankings ?? '...'}</div>
          <div className="stat-card__label">Jogadores no Ranking</div>
        </div>
      </div>
    </div>
  )
}
