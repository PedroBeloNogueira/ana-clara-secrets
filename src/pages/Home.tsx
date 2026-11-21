import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { BRAND_NAME } from '../data/brand'
import CampaignCarousel from '../components/CampaignCarousel'
import Drawer from '../components/Drawer'
import ProductShelf from '../components/ProductShelf'

const welcomeKey = 'acs_inauguracao_vista'

export default function Home() {
  const { hash } = useLocation()
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    if (seen || hash) return
    try {
      if (sessionStorage.getItem(welcomeKey)) return
    } catch {
      // The welcome card also works when session storage is unavailable.
    }
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3800
    const timer = window.setTimeout(() => {
      if (!document.querySelector('dialog[open]')) setWelcomeOpen(true)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [hash, seen])

  function closeWelcome() {
    setSeen(true)
    setWelcomeOpen(false)
    try { sessionStorage.setItem(welcomeKey, '1') } catch { /* Session storage is optional. */ }
  }

  return <div className="boutique">
    <CampaignCarousel/>
    <ProductShelf/>
    <Drawer open={welcomeOpen && !hash} close={closeWelcome} label="Inauguração" className="welcome-card">
      <button type="button" className="welcome-close" aria-label="Fechar boas-vindas" onClick={closeWelcome}><X size={22}/></button>
      <p className="welcome-brand">{BRAND_NAME}</p>
      <p className="welcome-kicker">Inauguração</p>
      <h2>Seja bem-vindo!</h2>
      <Link className="btn-primary" to="/#produtos" onClick={closeWelcome}>Comprar agora</Link>
    </Drawer>
  </div>
}
