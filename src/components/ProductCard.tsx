import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '../types'
import { useStore } from '../contexts/StoreContext'
import { productPath, buyNowPath } from '../utils/routes'
import { brl, onSale, priceOf } from '../utils/format'

export default function ProductCard({ p }: { p: Product }) {
  const { add, favs, toggleFav } = useStore()
  const details = productPath(p.slug)
  const favorite = favs.includes(p.id)
  const discounted = onSale(p)

  return (
    <article className="perfume-card group flex min-w-0 flex-col">
      <div className="relative overflow-hidden bg-petala">
        <Link to={details} aria-label={`Ver detalhes de ${p.name}`} className="block"><img src={p.image} alt="" loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></Link>
        {(!p.isDemo && (discounted || p.isNew)) && (
          <span className="absolute left-2 top-2 bg-nevoa px-2 py-1 text-xs font-medium">
            {discounted ? 'Promoção' : 'Lançamento'}
          </span>
        )}
        <button
          onClick={() => toggleFav(p.id)}
          aria-pressed={favorite}
          aria-label={'Favoritar ' + p.name}
          className="absolute top-2 right-2 grid h-11 w-11 place-items-center rounded-full bg-nevoa hover:text-peonia"
        >
          <Heart className={favorite ? 'h-5 w-5 fill-peonia text-peonia' : 'h-5 w-5'} aria-hidden="true" />
        </button>
      </div>
      <div className="card-details flex flex-1 flex-col">
        <h3 className="text-2xl leading-tight"><Link to={details}>{p.name}</Link></h3>
        {(p.brand || p.volumeMl) && <p className="mt-1 text-xs text-vinho/75">{[p.brand,p.volumeMl && p.volumeMl+' ml'].filter(Boolean).join(' · ')}</p>}
        <p className="mt-2 flex justify-center flex-wrap items-baseline gap-x-2 text-sm font-medium">
          {discounted && <s className="text-xs font-normal text-vinho/70">{brl(p.price)}</s>}
          {brl(priceOf(p))}
        </p>
        <div className="mt-auto flex justify-center flex-wrap items-center gap-x-3 gap-y-2 pt-3">
          {p.available ? (
            <>
              <button className="btn-primary add-product" onClick={() => add(p.id)}>Adicionar ao carrinho</button>
              <Link className="text-xs underline underline-offset-4 hover:text-peonia"
                aria-label={'Comprar ' + p.name} to={buyNowPath(p.slug)}>Comprar</Link>
            </>
          ) : <p className="text-sm text-vinho/75">{p.available === false ? 'Esgotado' : 'Disponibilidade a confirmar'}</p>}
        </div>
      </div>
    </article>
  )
}