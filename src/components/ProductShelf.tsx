import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext'
import Drawer from './Drawer'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from './ProductCard'
import { priceOf } from '../utils/format'
import { collections, matchesCollection } from '../data/collections'

const normalize = (text: string) => text.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export default function ProductShelf() {
  const { products, favs, categories: savedCategories, catalogLoading, catalogError } = useStore()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [limit, setLimit] = useState(24)
  function apply(next: URLSearchParams) {
    setLimit(24)
    navigate({pathname:'/',search:next.toString(),hash:'#produtos'}, {replace:true})
  }
  const get = (key: string) => params.get(key) ?? ''
  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    apply(next)
  }
  const [open,setOpen] = useState(false)
  const [draft,setDraft] = useState(new URLSearchParams())
  const keys = ['categoria','familia','min','max','sort','favoritos']
  const active = keys.filter(k=>get(k) && !(k==='sort' && get(k)==='nome'))
  const sortNames: Record<string,string> = {menor:'Menor preço',maior:'Maior preço',novos:'Novidades',vendidos:'Mais vendidos'}
  function changeDraft(key: string,value: string) {
    const next = new URLSearchParams(draft)
    if (value && !(key==='sort' && value==='nome')) next.set(key,value)
    else next.delete(key)
    setDraft(next)
  }
  function clearFilters() {
    const next = new URLSearchParams(params)
    keys.forEach(k=>next.delete(k))
    apply(next)
    setOpen(false)
  }
  const sort = get('sort') || 'nome'
  const filtered = products.filter(p => (!get('favoritos') || favs.includes(p.id)) && normalize(p.name+' '+(p.brand ?? '')).includes(normalize(get('q')))
    && matchesCollection(p,get('categoria')) && (!get('familia') || p.family === get('familia'))
    && priceOf(p) >= Number(get('min')) && (!get('max') || priceOf(p) <= Number(get('max'))))
    .sort((a,b) => {
      if (sort === 'nome' && !!a.featured !== !!b.featured) return Number(!!b.featured) - Number(!!a.featured)
      if (sort === 'menor') return priceOf(a)-priceOf(b)
      if (sort === 'maior') return priceOf(b)-priceOf(a)
      if (sort === 'novos') return Number(!!b.isNew)-Number(!!a.isNew)
      if (sort === 'vendidos') return Number(!!b.bestSeller)-Number(!!a.bestSeller)
      return a.name.localeCompare(b.name,'pt-BR')
    })
  const categories = [...new Set([...savedCategories, ...(products.some(p => p.isDemo) ? collections.map(c => c.name) : []), ...products.map(p => p.category)])]
  return <section id="produtos" aria-label="Pesquisa e vitrine">
    <div role="search" className="shelf-search">
      <label><Search size={18}/><input aria-label="Pesquisar por nome ou marca" id="pesquisar" type="search" placeholder="Pesquisar por nome ou marca" value={get('q')} onChange={e=>update('q',e.target.value)}/></label>
      <button className="btn-ghost" aria-haspopup="dialog" onClick={()=>{setDraft(new URLSearchParams(params));setOpen(true)}}><SlidersHorizontal size={16}/>Filtros{active.length>0 && <b>{active.length}</b>}</button>
    </div>
    {active.length>0 && <div className="filter-chips">{active.map(k=>{
      const label = k==='sort'?sortNames[get(k)] : k==='min'?'A partir de R$ '+get(k) : k==='max'?'Até R$ '+get(k) : k==='favoritos'?'Favoritos':get(k)
      return <button key={k} aria-label={'Remover filtro '+label} onClick={()=>update(k,'')}>{label} <X size={14}/></button>
    })}</div>}
    <Drawer open={open} close={()=>setOpen(false)} label="Filtros" className="filter-panel">
      <form onSubmit={e=>{e.preventDefault();apply(draft);setOpen(false)}}>
        <header><h2>Filtros</h2><button type="button" aria-label="Fechar filtros" onClick={()=>setOpen(false)}><X/></button></header>
        <label>Categoria<select value={draft.get('categoria')||''} onChange={e=>changeDraft('categoria',e.target.value)}><option value="">Todas</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
        <label>Família olfativa<select value={draft.get('familia')||''} onChange={e=>changeDraft('familia',e.target.value)}><option value="">Todas</option>{[...new Set(products.map(p=>p.family).filter(Boolean))].map(f=><option key={f} value={f}>{f==='citrica'?'cítrica':f}</option>)}</select></label>
        <div className="price-range">{['min','max'].map(k=><label key={k}>{k==='min'?'De (R$)':'Até (R$)'}<input type="number" step=".01" min={k==='max'?draft.get('min')||0:0} placeholder="Sem limite" value={draft.get(k)||''} onChange={e=>changeDraft(k,e.target.value)}/></label>)}</div>
        <label>Ordenar<select value={draft.get('sort')||'nome'} onChange={e=>changeDraft('sort',e.target.value)}><option value="nome">Ordem alfabética</option>{Object.entries(sortNames).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label className="fav-filter"><input type="checkbox" checked={draft.get('favoritos')==='1'} onChange={e=>changeDraft('favoritos',e.target.checked?'1':'')}/> Somente favoritos</label>
        <button className="btn-primary">Aplicar filtros</button>
        <button type="button" className="btn-ghost" onClick={clearFilters}>Limpar filtros</button>
      </form>
    </Drawer>
    <h2>Encontre a fragrância perfeita para você.</h2>
    {products.some(p=>p.isDemo) && <p className="shelf-note">Vitrine de demonstração: produtos, preços e disponibilidade sujeitos à confirmação.</p>}
    {catalogError ? <p role="alert">{catalogError}</p> : catalogLoading ? <p role="status">Carregando perfumes…</p> : filtered.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{filtered.slice(0,limit).map(p => <ProductCard key={p.id} p={p}/>)}</div> :
      <div className="py-8"><h2>Nenhum produto encontrado</h2><p className="mb-5">Experimente outra busca ou veja a coleção completa.</p></div>}{filtered.length > limit && <button className="btn-ghost mt-4" onClick={()=>setLimit(limit+24)}>Mostrar mais produtos</button>}</section>
}