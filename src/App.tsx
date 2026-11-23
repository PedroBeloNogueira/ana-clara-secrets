import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { StoreProvider, useStore } from './contexts/StoreContext'
import { productPath } from './utils/routes'
import Layout from './components/Layout'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import ProductPage from './pages/ProductPage'
import { About, Contact, NotFound, Cart } from './pages/StorePages'
import Admin from './pages/Admin'
import PageMeta from './components/PageMeta'

function LegacyProduct() {
  const { slug } = useParams()
  const { products, catalogLoading, catalogError } = useStore()
  if (catalogLoading || catalogError) return <p className="boutique" role="status">{catalogError || 'Carregando catálogo…'}</p>
  const product = products.find(p => p.slug === slug || (p.isDemo && p.id === slug))
  return product ? <Navigate replace to={productPath(product.slug)}/> : <NotFound/>
}

function StoreHome() {
  const { search, hash } = useLocation()
  const { products, catalogLoading, catalogError } = useStore()
  const slug = new URLSearchParams(search).get('perfume')
  if (slug) {
    if (catalogLoading || catalogError) return <p className="boutique" role="status">{catalogError || 'Carregando catálogo…'}</p>
    const product = products.find(p => p.slug === slug || (p.isDemo && p.id === slug))
    return product ? <Navigate replace to={productPath(product.slug)}/> : <NotFound/>
  }
  if (hash === '#contato' || hash === '#sobre') return <Navigate replace to={'/' + hash.slice(1)}/>
  if (hash === '#novidades') return <Navigate replace to="/#campanha"/>
  if (hash === '#entrega') return <Navigate replace to="/contato#entrega"/>
  return <><PageMeta title="Perfumes e beleza" description="Explore a vitrine de perfumes, novidades e favoritos da Ana Clara’s Secret."/><Home/></>
}

export default function App() {
  return <StoreProvider><BrowserRouter><Routes><Route path="admin" element={<Admin/>}/><Route element={<Layout/>}>
    <Route index element={<StoreHome/>}/>
    <Route path="novidades" element={<Navigate replace to="/#campanha"/>}/>
    <Route path="sobre" element={<About/>}/>
    <Route path="contato" element={<Contact/>}/>
    <Route path="carrinho" element={<Cart/>}/>
    <Route path="produto/:slug" element={<ProductPage/>}/>
    <Route path="checkout" element={<Checkout/>}/>
    <Route path="catalogo" element={<Navigate replace to="/#produtos"/>}/>
    <Route path="favoritos" element={<Navigate replace to="/?favoritos=1#produtos"/>}/>
    <Route path="perfumes/:slug" element={<LegacyProduct/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Route></Routes></BrowserRouter></StoreProvider>
}
