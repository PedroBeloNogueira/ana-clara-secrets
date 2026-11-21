import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'
import { DEMO_PRODUCTS } from '../data/demo'
import { priceOf } from '../utils/format'
const load=<T,>(k:string,d:T):T=>{try{return JSON.parse(localStorage.getItem(k)??'')as T}catch{return d}}
interface Ctx{products:Product[];cart:CartItem[];favs:string[];cartOpen:boolean;setCartOpen:(b:boolean)=>void;
 add:(id:string,q?:number)=>void;setQty:(id:string,q:number)=>void;remove:(id:string)=>void;toggleFav:(id:string)=>void;
 count:number;total:number;toast:string;whatsapp:string}
const C=createContext<Ctx>(null!)
export const useStore=()=>useContext(C)
export function StoreProvider({children}:{children:ReactNode}){
 // TODO etapa 4: trocar por services/products.ts (Supabase). Mantido local para rodar sem backend.
 const [products]=useState<Product[]>(DEMO_PRODUCTS)
 const [cart,setCart]=useState<CartItem[]>(()=>load('acs_cart',[]))
 const [favs,setFavs]=useState<string[]>(()=>load('acs_favs',[]))
 const [cartOpen,setCartOpen]=useState(false);const [toast,setToast]=useState('')
 useEffect(()=>localStorage.setItem('acs_cart',JSON.stringify(cart)),[cart])
 useEffect(()=>localStorage.setItem('acs_favs',JSON.stringify(favs)),[favs])
 const say=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2000)}
 const v:Ctx=useMemo(()=>({products,cart,favs,cartOpen,setCartOpen,toast,whatsapp:import.meta.env.VITE_WHATSAPP_FALLBACK??'',
  add:(id,q=1)=>{setCart(c=>c.some(i=>i.productId===id)?c.map(i=>i.productId===id?{...i,qty:i.qty+q}:i):[...c,{productId:id,qty:q}]);say('Adicionado ao carrinho')},
  setQty:(id,q)=>setCart(c=>q<1?c.filter(i=>i.productId!==id):c.map(i=>i.productId===id?{...i,qty:q}:i)),
  remove:id=>setCart(c=>c.filter(i=>i.productId!==id)),
  toggleFav:id=>setFavs(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]),
  count:cart.reduce((s,i)=>s+i.qty,0),
  total:cart.reduce((s,i)=>{const p=products.find(x=>x.id===i.productId);return p&&p.available?s+priceOf(p)*i.qty:s},0)}),[products,cart,favs,cartOpen,toast])
 return <C.Provider value={v}>{children}</C.Provider>}
