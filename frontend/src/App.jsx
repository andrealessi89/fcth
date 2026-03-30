import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Agenda from './pages/Agenda'
import Sobre from './pages/Sobre'
import Regulamento from './pages/Regulamento'
import Filiese from './pages/Filiese'
import Ranking from './pages/Ranking'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/sobre-a-federacao" element={<Sobre />} />
          <Route path="/regulamento" element={<Regulamento />} />
          <Route path="/filie-se" element={<Filiese />} />
          <Route path="/ranking" element={<Ranking />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
