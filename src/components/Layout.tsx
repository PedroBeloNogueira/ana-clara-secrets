import { BRAND_NAME } from '../data/brand'
import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Heart, MessageCircle, Search } from 'lucide-react'
import Glitter from './Glitter'
import IslandNav from './IslandNav'
import CartDrawer from './CartDrawer'
import { useStore } from '../contexts/StoreContext'
import { contactMessage, storeContact } from '../data/contact'
import { waLink } from '../utils/whatsapp'

export default function Layout() {
  return <>
    <Glitter/>
    <div className="storefront"><StoreLayout/></div>
  </>
}

function StoreLayout() {
  const { whatsapp, toast } = useStore()
  const { pathname, hash, key } = useLocation()
  const searchFocusKey = hash === '#pesquisar' ? key : ''
  useEffect(() => {
    const target = document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'instant' })
    if (hash === '#pesquisar') target?.focus({preventScroll:true})
  }, [pathname, hash, searchFocusKey])
  const contact = whatsapp.replace(/\D/g,'') && waLink(whatsapp, contactMessage)
  return <>
    <IslandNav/>
    <div className="shop-tools">
      <Link className="wordmark" to="/">{BRAND_NAME}</Link>
      <Link aria-label="Pesquisar" to="/#pesquisar"><Search size={20}/></Link>
      <Link aria-label="Favoritos" to="/?favoritos=1#produtos"><Heart size={20}/></Link>
    </div>
    <main><Outlet/></main>
    <footer className="institution">
      <div><p className="wordmark">{BRAND_NAME}</p><p>Perfumaria e beleza</p></div>
      <div className="footer-contact">
        {contact && <a href={contact} target="_blank" rel="noreferrer">WhatsApp +{whatsapp}</a>}
        {storeContact.instagram && <a href={storeContact.instagram} target="_blank" rel="noreferrer">Instagram</a>}
        <p>© {new Date().getFullYear()} Ana Clara’s Secret</p>
      </div>
    </footer>
    {contact && <a className="floating" href={contact} aria-label="Conversar pelo WhatsApp" target="_blank" rel="noreferrer"><MessageCircle/></a>}
    <CartDrawer/><div className={'toast '+(toast ? 'visible' : '')} role="status">{toast}</div>
  </>
}