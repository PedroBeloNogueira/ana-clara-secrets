import { brl, priceOf } from '../utils/format'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../types'

export default function NewArrivals({ products }: { products: Product[] }) {
  const slides = [
    ...products.filter(p => p.isNew || p.bestSeller).map(p => ({
      title:p.name, description:priceOf(p) < p.price ? 'De '+brl(p.price)+' por '+brl(priceOf(p))+'.' : p.description,
      to:'/?perfume='+encodeURIComponent(p.slug)+'#produtos', action:'Ver perfume',
      label:priceOf(p)<p.price ? 'Oferta' : p.isNew ? 'Lançamento' : 'Mais vendidos',
    })),
    {title:'Entrega ou retirada', description:'Consulte o frete para o seu CEP ou combine a retirada com a loja.',to:'/#entrega',action:'Ver opções',label:'Atendimento'},
    {title:'Florais para presentear',description:'Conheça os perfumes da família floral.',to:'/?familia=floral#produtos',action:'Explorar florais',label:'Seleção'},
  ]
  const count = slides.length
  const [index, setIndex] = useState(0)
  const current = index % count

  useEffect(() => {
    const timer = window.setInterval(() => setIndex(i => (i + 1) % count), 5500)
    return () => window.clearInterval(timer)
  }, [count])

  return <section id="novidades" className="campaign" aria-label="Novidades" aria-roledescription="carrossel">
    {slides.map((slide, i) => <div key={slide.title} className="news-slide" aria-hidden={i !== current}>
      <div className="news-copy"><span>{slide.label}</span>
        <h2>{slide.title}</h2>
        <p>{slide.description}</p>
        <Link className="btn-primary" to={slide.to}>{slide.action}</Link>
      </div>
    </div>)}
    <div className="arrival-controls">
      <button aria-label="Novidade anterior" onClick={() => setIndex(i => (i - 1 + count) % count)}><ChevronLeft/></button>
      <span>{current + 1} / {count}</span>
      <button aria-label="Próxima novidade" onClick={() => setIndex(i => (i + 1) % count)}><ChevronRight/></button>
    </div>
  </section>
}