import { BRAND_NAME } from '../data/brand'
import { Link } from 'react-router-dom'
import NewArrivals from '../components/NewArrivals'
import ProductShelf from '../components/ProductShelf'
import ProductDetails from '../components/ProductDetails'
import { useStore } from '../contexts/StoreContext'

export default function Home() {
  const { products } = useStore()
  return <div className="boutique">
    <header className="brand-hero">
      <img src="/images/campanha-rosa.jpg" alt="" width="1536" height="1024" fetchPriority="high"/>
      <div><span>{BRAND_NAME}</span><h1>Seu próximo perfume favorito está aqui.</h1><Link to="/#produtos">Explorar perfumes ↗</Link></div>
    </header>
    <NewArrivals products={products}/>
    <ProductShelf/>
    <ProductDetails/>
  </div>
}