import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './services/api'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EventsList from './pages/EventsList'
import PartnersList from './pages/PartnersList'
import ContentEditor from './pages/ContentEditor'
import NewsletterList from './pages/NewsletterList'
import SettingsPage from './pages/SettingsPage'
import RankingsList from './pages/RankingsList'

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/eventos" element={<EventsList />} />
              <Route path="/parceiros" element={<PartnersList />} />
              <Route path="/conteudo" element={<ContentEditor />} />
              <Route path="/newsletter" element={<NewsletterList />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="/rankings" element={<RankingsList />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
