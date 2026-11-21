import Drawer from './Drawer'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useStore } from '../contexts/StoreContext'
import { brl, priceOf } from '../utils/format'
export default function CartDrawer(){
 const {cart,products,cartOpen,setCartOpen,setQty,remove,total}=useStore()
 const navigate=useNavigate()
 // Revalida itens com o catálogo atual: indisponíveis ficam fora do pedido.
 const rows=cart.map(i=>({i,p:products.find(x=>x.id===i.productId)})).filter(r=>r.p)
 const valid=rows.filter(r=>r.p!.available).map(r=>r.i)
 const close=()=>setCartOpen(false)
 return <Drawer open={cartOpen} close={close} label="Carrinho"><header className="flex items-center justify-between border-b border-petala p-5"><h2 className="text-2xl">Seu carrinho</h2>
    <button onClick={close} aria-label="Fechar"><X/></button></header>
   <div className="flex-1 space-y-4 overflow-y-auto p-5">
    {rows.length===0&&<p>Seu carrinho está vazio. Explore o catálogo e escolha seus perfumes.</p>}
    {rows.map(({i,p})=><div key={i.productId} className="flex gap-3 border-b border-petala bg-[var(--panel)] p-3">
     <img src={p!.image} alt={p!.name} className="h-20 w-16  object-cover"/>
     <div className="flex-1"><p className="leading-tight">{p!.name}</p><p className="text-sm">{brl(priceOf(p!))}</p>
      {!p!.available&&<p className="text-xs text-peonia">Esgotado — não entra no pedido</p>}
      <div className="mt-2 flex items-center gap-2">
       <button aria-label="Diminuir" onClick={()=>setQty(i.productId,i.qty-1)}><Minus className="h-4 w-4"/></button><span>{i.qty}</span>
       <button aria-label="Aumentar" onClick={()=>setQty(i.productId,i.qty+1)}><Plus className="h-4 w-4"/></button>
       <button aria-label="Remover" className="ml-auto" onClick={()=>remove(i.productId)}><Trash2 className="h-4 w-4"/></button></div></div>
     <p className="font-medium">{brl(priceOf(p!)*i.qty)}</p></div>)}
   </div>
   {rows.length>0&&<footer className="space-y-3 border-t border-petala p-5">
    <p className="flex justify-between text-lg"><span>Total</span><strong>{brl(total)}</strong></p>
    <button className="btn-primary w-full" disabled={!valid.length} onClick={()=>{close();navigate('/checkout')}}>Continuar para entrega</button>
    <button className="btn-ghost w-full" onClick={close}>Continuar comprando</button>
   </footer>}
  </Drawer>}
