import { useNavigate, useSearchParams } from 'react-router-dom'
import Drawer from './Drawer'
import { useStore } from '../contexts/StoreContext'
import { brl, priceOf } from '../utils/format'

export default function ProductDetails() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { products, add, setCartOpen } = useStore()
  const slug = params.get('perfume')
  const p = products.find(p => p.slug === slug)
  function close() {
    const next = new URLSearchParams(params)
    next.delete('perfume')
    navigate({pathname:'/',search:next.toString(),hash:'#produtos'},{replace:true})
  }
  return <Drawer open={!!slug} close={close} label="Detalhes do perfume">
    <div className="p-5 overflow-auto"><button onClick={close} className="btn-ghost mb-4">Voltar à vitrine</button>
      {p ? <>
        <img src={p.image} width="512" height="512" alt={'Frasco de '+p.name}/>
        <h2 className="mt-4 text-3xl">{p.name}</h2>{(p.brand || p.volumeMl) && <p>{[p.brand,p.volumeMl && p.volumeMl+' ml'].filter(Boolean).join(' · ')}</p>}
        <p className="my-4">{p.description}</p><p>Família {p.family === 'citrica' ? 'cítrica' : p.family} · Intensidade {p.intensity}</p>
        <p className="my-4">{priceOf(p)<p.price && <s className="mr-2">{brl(p.price)}</s>}{brl(priceOf(p))}</p>
        <button className="btn-primary" disabled={!p.available} onClick={()=>{add(p.id);close();setCartOpen(true)}}>{p.available?'Adicionar ao carrinho':'Esgotado'}</button>
      </> : <p>Perfume não encontrado.</p>}
    </div>
  </Drawer>
}