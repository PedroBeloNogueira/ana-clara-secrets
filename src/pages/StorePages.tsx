import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { BRAND_NAME } from '../data/brand'
import { contactMessage, storeContact } from '../data/contact'
import PageMeta from '../components/PageMeta'
import { CartContents } from '../components/CartDrawer'
import { waLink } from '../utils/whatsapp'

export function Contact() {
  const { whatsapp, instagram, hours, delivery } = storeContact
  return <section className="boutique store-page information-page">
    <PageMeta title="Contato" description="Fale com Clara e saiba como combinar a entrega ou retirada do seu pedido."/>
    <p className="wordmark">{BRAND_NAME}</p>
    <h1>Contato</h1>
    <dl className="product-specs">
      <div><dt>Responsável</dt><dd>Clara</dd></div>
      {whatsapp && <div><dt>WhatsApp</dt><dd>+{whatsapp}</dd></div>}
      {instagram && <div><dt>Instagram</dt><dd><a href={instagram} target="_blank" rel="noreferrer">Ver perfil oficial</a></dd></div>}
      {hours && <div><dt>Horário de atendimento</dt><dd>{hours}</dd></div>}
    </dl>
    {whatsapp ? <a className="btn-primary" href={waLink(whatsapp, contactMessage)} target="_blank" rel="noreferrer">
      <MessageCircle size={20} aria-hidden="true"/> Conversar com a Clara pelo WhatsApp
    </a> : <p>O WhatsApp da loja ainda não foi configurado.</p>}
    <section id="entrega">
      <h2>Entrega e retirada</h2>
      <p>{delivery || 'Informe seu CEP no checkout para consultar a entrega com a loja. Para retirada, combine o local e o horário com a Clara.'}</p>
    </section>
  </section>
}

export function About() {
  return <section className="boutique store-page information-page">
    <PageMeta title="Sobre nós" description="Conheça a proposta da Ana Clara’s Secret e o atendimento com a Clara."/>
    <p className="wordmark">{BRAND_NAME}</p>
    <h1>Sobre nós</h1>
    <p>A Ana Clara’s Secret é uma loja de perfumaria e beleza. Na vitrine, você pode buscar fragrâncias por família olfativa, comparar preços e salvar seus favoritos.</p>
    <p>O atendimento é feito pela Clara. Escolha seus perfumes, revise seu pedido no site e combine a entrega ou a retirada pelo WhatsApp da loja.</p>
    <div className="store-actions"><Link className="btn-primary" to="/#produtos">Explorar perfumes</Link><Link className="btn-ghost" to="/contato">Falar com a Clara</Link></div>
  </section>
}

export function Cart() {
  return <section className="checkout store-page">
    <PageMeta title="Carrinho" description="Confira os perfumes escolhidos, ajuste as quantidades e continue para a entrega."/>
    <h1>Seu carrinho</h1>
    <CartContents/>
  </section>
}

export function NotFound() {
  return <section className="boutique store-page information-page">
    <PageMeta title="Página não encontrada" description="Volte à vitrine da Ana Clara’s Secret para explorar os perfumes disponíveis."/>
    <p className="wordmark">Erro 404</p>
    <h1>Página não encontrada</h1>
    <p>O endereço pode ter mudado ou o perfume pode ter saído da vitrine.</p>
    <Link className="btn-primary" to="/#produtos">Voltar à vitrine</Link>
  </section>
}
