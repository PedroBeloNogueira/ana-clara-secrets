import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext'
import PageMeta from '../components/PageMeta'
import ProductCard from '../components/ProductCard'
import type { Product } from '../types'
import { brl, onSale, priceOf } from '../utils/format'
import { buyNowPath, productPath } from '../utils/routes'
import { NotFound } from './StorePages'

export default function ProductPage() {
  const { slug } = useParams()
  const { products, catalogLoading, catalogError } = useStore()
  if (catalogLoading || catalogError) return <p className="boutique" role="status">{catalogError || 'Carregando catálogo…'}</p>
  const product = products.find(p => p.slug === slug || (p.isDemo && p.id === slug))
  if (!product) return <NotFound/>
  if (product.slug !== slug) return <Navigate replace to={productPath(product.slug)}/>
  return <ProductView key={product.id} product={product}/>
}

function ProductView({ product }: { product: Product }) {
  const { products, add } = useStore()
  const [photo, setPhoto] = useState(0)
  const photos = [...new Set([product.image, ...(product.images ?? [])].filter(Boolean))]
  const related = products.filter(p => p.id !== product.id).sort((a, b) => relevance(b) - relevance(a)).slice(0, 4)
  const details = [
    ['Marca', product.brand],
    ['Volume', product.volumeMl ? product.volumeMl + ' ml' : undefined],
    ['Família olfativa', product.family === 'citrica' ? 'cítrica' : product.family],
    ['Notas olfativas', product.notes?.filter(Boolean).join(', ')],
    ['Intensidade', product.intensity],
    ['Ocasiões', product.occasions.join(', ')],
  ].filter(([, value]) => Boolean(value))

  function relevance(p: Product) {
    return Number(Boolean(product.family && product.family === p.family)) * 2 + Number(product.category === p.category)
  }

  return <article className="boutique store-page product-page">
    <PageMeta title={product.name} description={product.description || [product.name, product.brand, 'Ana Clara’s Secret'].filter(Boolean).join(' · ')}/>
    <Link className="checkout-link back-link" to="/#produtos">Voltar à vitrine</Link>
    <div className="product-layout">
      <div>
        {photos.length > 0 && <img className="product-photo" src={photos[photo]} width="640" height="640"
          alt={photos.length > 1 ? product.name + ', foto ' + (photo + 1) : 'Frasco de ' + product.name}/>}
        {photos.length > 1 && <div className="product-thumbnails" role="group" aria-label="Fotos do perfume">
          {photos.map((src, index) => <button key={src} type="button" aria-label={'Mostrar foto ' + (index + 1)}
            aria-pressed={index === photo} onClick={() => setPhoto(index)}><img src={src} alt="" loading="lazy"/></button>)}
        </div>}
      </div>
      <div className="product-copy">
        <h1>{product.name}</h1>
        <p className="product-price">{onSale(product) && <s>{brl(product.price)}</s>}<strong>{brl(priceOf(product))}</strong></p>
        {product.isDemo ? <p className="shelf-note">Produto de demonstração. Confirme o preço e a disponibilidade com a Clara.{product.available === false && ' Indisponível para compra online.'}</p> :
          product.available !== undefined && <p>{product.available ? 'Disponível' : 'Esgotado'}</p>}
        {product.available && <div className="store-actions">
          <button className="btn-primary" onClick={() => add(product.id)}>Adicionar ao carrinho</button>
          <Link className="btn-ghost" to={buyNowPath(product.slug)}>Comprar agora</Link>
        </div>}
        {product.description && <p className="product-description">{product.description}</p>}
        {details.length > 0 && <dl className="product-specs">{details.map(([label, value]) =>
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        )}</dl>}
      </div>
    </div>
    {related.length > 0 && <section className="related-products" aria-labelledby="related-title">
      <h2 id="related-title">Perfumes relacionados</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map(p => <ProductCard key={p.id} p={p}/>)}</div>
    </section>}
  </article>
}
