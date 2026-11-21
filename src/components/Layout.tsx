import { BRAND_NAME } from '../data/brand'
import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Heart, MessageCircle, Search } from 'lucide-react'
import IslandNav from './IslandNav'
import CartDrawer from './CartDrawer'
import { useStore } from '../contexts/StoreContext'
import { waLink } from '../utils/whatsapp'

export default function Layout() {
  const { whatsapp, toast } = useStore()
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const target = document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo(0,0)
    if (hash === '#pesquisar') target?.focus({preventScroll:true})
  }, [pathname, hash])
  const contact = whatsapp.replace(/\D/g,'') && waLink(whatsapp,'Olá! Gostaria de saber mais sobre os produtos.')
  return <>
    <IslandNav/>
    <div className="shop-tools">
      <Link className="wordmark" to="/">{BRAND_NAME}</Link>
      <Link aria-label="Pesquisar" to="/#pesquisar"><Search size={20}/></Link>
      <Link aria-label="Favoritos" to="/?favoritos=1#produtos"><Heart size={20}/></Link>
    </div>
    <main><Outlet/></main>
    <footer id="contato" className="institution"><div><p className="wordmark">{BRAND_NAME}</p><p id="sobre">Perfumaria e beleza</p></div>
      <nav aria-label="Rodapé"><Link to="/#produtos">Produtos</Link><Link to="/?favoritos=1#produtos">Favoritos</Link><Link to="/?categoria=Novidades#produtos">Lançamentos</Link></nav>
      <div id="entrega"><h2>Entrega e retirada</h2><p>Consulte o frete pelo CEP ou combine a retirada com a loja.</p></div>
      <div><h2>Contato</h2>{contact ? <a href={contact} target="_blank" rel="noreferrer">Conversar pelo WhatsApp</a> : <p>Atendimento pelo WhatsApp em breve.</p>}</div></footer>
    {contact && <a className="floating" href={contact} aria-label="Conversar pelo WhatsApp" target="_blank" rel="noreferrer"><MessageCircle/></a>}
    <CartDrawer/><div className={'toast '+(toast ? 'visible' : '')} role="status">{toast}</div>
  </>
}