import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { StoreProvider } from './contexts/StoreContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Checkout from './pages/Checkout'

function LegacyStoreLink() {
  const { pathname, search } = useLocation()
  const { slug } = useParams()
  const params = new URLSearchParams(search)
  if (slug) params.set('perfume', slug)
  if (pathname === '/favoritos') params.set('favoritos','1')
  return <Navigate replace to={{pathname:'/', search:params.toString(), hash:'#produtos'}}/>
}

export default function App() {
  return <StoreProvider><BrowserRouter><Routes><Route element={<Layout/>}>
    <Route index element={<Home/>}/>
    <Route path="checkout" element={<Checkout/>}/>
    {['catalogo','perfumes/:slug','favoritos'].map(path => <Route key={path} path={path} element={<LegacyStoreLink/>}/>)}
  </Route></Routes></BrowserRouter></StoreProvider>
}