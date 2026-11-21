import { BRAND_NAME } from '../data/brand'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useStore } from '../contexts/StoreContext'
import { brl, priceOf } from '../utils/format'
import { waLink } from '../utils/whatsapp'
import type { Delivery } from '../types'

const initial = { name:'', phone:'', cep:'', street:'', number:'', complement:'', district:'', city:'', state:'', reference:'' }
type Field = keyof typeof initial
const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
const freight = 'Taxa de entrega a confirmar com a loja'
const digits = (s: string) => s.replace(/\D/g,'')
function maskPhone(value: string) {
  const n = digits(value).slice(0,11)
  const local = n.slice(2)
  const split = n.length === 11 ? 5 : 4
  return (n ? '(' + n.slice(0,2) : '') + (local ? ') ' + local.slice(0,split) : '') + (local.length > split ? '-' + local.slice(split) : '')
}

export default function Checkout() {
  const { cart, products, setCartOpen, whatsapp } = useStore()
  const [data, setData] = useState(initial)
  const [mode, setMode] = useState<Delivery>('Entrega')
  const [noNumber, setNoNumber] = useState(false)
  const [review, setReview] = useState(false)
  const [lookupStatus, setLookupStatus] = useState('')
  const lookup = useRef<AbortController | null>(null)
  const filledByCep = useRef<Partial<typeof initial>>({})
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => () => lookup.current?.abort(), [])
  const rows = cart.flatMap(item => {
    const p = products.find(product => product.id === item.productId && product.available)
    if (!p || !Number.isSafeInteger(item.qty) || item.qty < 1) return []
    const unit = priceOf(p)
    return [{ p, qty:item.qty, unit, cents:Math.round(unit * 100) * item.qty }]
  })
  const total = rows.reduce((sum,row) => sum+row.cents,0)/100
  const delivery = mode === 'Entrega'
  const address = [
    ['Nome',data.name], ['Telefone',data.phone],
    ...(delivery ? [['CEP',data.cep],['Rua',data.street],['Número',noNumber ? 'Sem número' : data.number],
      ['Complemento',data.complement],['Bairro',data.district],['Cidade',data.city],['Estado',data.state],['Referência',data.reference]] : []),
  ].filter(([,value]) => value.trim())
  const message = [
    'Olá, '+BRAND_NAME+'! 💗\n\nGostaria de confirmar meu pedido realizado pelo site.',
    '🛍️ *MEU PEDIDO*',
    ...rows.map(({p,qty,unit,cents}) => ['Produto: '+p.name,p.brand && 'Marca: '+p.brand,p.volumeMl && 'Volume: '+p.volumeMl+' ml',
      'Quantidade: '+qty,'Valor unitário: '+brl(unit),'Subtotal: '+brl(cents/100)].filter(Boolean).join('\n')),
    '💰 *TOTAL DOS PRODUTOS*\n'+brl(total),
    (delivery ? '📍 *ENDEREÇO DE ENTREGA*' : '*RETIRADA*')+'\n'+address.map(([label,value]) => label+': '+value.trim()).join('\n'),
    delivery ? '🚚 *ENTREGA*\n'+freight+'.' : 'Gostaria de combinar o local e o horário de retirada.',
    'Gostaria de confirmar a disponibilidade dos produtos e a finalização do meu pedido. Obrigada!',
  ].join('\n\n')

  function update(key: Field, value: string) {
    if (key === 'cep') {
      value = digits(value).slice(0,8).replace(/^(\d{5})(\d+)/,'$1-$2')
      if (value === data.cep) return
      lookup.current?.abort()
      setLookupStatus('')
      const next = {...data, cep:value}
      for (const key of Object.keys(filledByCep.current) as Field[]) {
        if (next[key] === filledByCep.current[key]) next[key] = ''
      }
      filledByCep.current = {}
      setData(next)
      return
    }
    if (key === 'phone') value = maskPhone(value)
    setData(prev => ({...prev,[key]:value}))
  }
  async function findCep(snapshot: typeof initial) {
    const cep = digits(snapshot.cep)
    if (cep.length !== 8) return
    lookup.current?.abort()
    const controller = new AbortController()
    lookup.current = controller
    setLookupStatus('Consultando CEP…')
    try {
      const result = await fetch('https://viacep.com.br/ws/'+cep+'/json/', {signal:controller.signal,referrerPolicy:'no-referrer'})
      if (!result.ok) throw Error()
      const found = await result.json()
      if (controller.signal.aborted) return
      if (found.erro || !found.localidade || !states.includes(found.uf)) {
        setLookupStatus('CEP não encontrado. Confira os dígitos ou preencha o endereço manualmente.')
        return
      }
      const values = { street:found.logradouro, district:found.bairro, city:found.localidade, state:found.uf }
      filledByCep.current = values
      setData(prev => {
        if (digits(prev.cep) !== cep) return prev
        const next = {...prev}
        for (const key of Object.keys(values) as (keyof typeof values)[]) {
          if (prev[key] === snapshot[key] && typeof values[key] === 'string' && values[key]) next[key] = values[key]
        }
        return next
      })
      setLookupStatus(found.localidade + ' — ' + (found.estado || found.uf) + '. Confira e complete o endereço.')
    } catch {
      if (!controller.signal.aborted) setLookupStatus('Consulta indisponível. Preencha o endereço manualmente.')
    }
  }
  function changeStep(next: boolean) {
    lookup.current?.abort()
    setLookupStatus('')
    setReview(next)
    requestAnimationFrame(() => title.current?.focus())
  }
  function field(key: Field, label: string, optional=false, autoComplete='off') {
    const pattern = key === 'phone' ? '\\([1-9][0-9]\\) [0-9]{4,5}-[0-9]{4}' :
      key === 'cep' ? '[0-9]{5}-[0-9]{3}' : key === 'name' ? '.*\\S\\s+.*\\S.*' : '.*\\S.*'
    return <label>{label}{optional && ' (opcional)'}<input name={key} value={data[key]}
      required={!optional} disabled={key==='number' && noNumber} autoComplete={autoComplete}
      type={key==='phone'?'tel':'text'} inputMode={key==='cep'?'numeric':undefined}
      pattern={optional ? undefined : pattern} maxLength={180}
      onChange={e=>update(key,e.target.value)} /></label>
  }

  if (!rows.length) return <section className="checkout"><h1>Carrinho sem produtos disponíveis</h1><Link className="btn-primary" to="/#produtos">Explorar perfumes</Link></section>
  return <section className="checkout">
    <ol className="checkout-progress" aria-label="Etapas do pedido">{['Carrinho','Endereço','Revisão','WhatsApp'].map((name,i)=>
      <li key={name} aria-current={i===(review?2:1)?'step':undefined}>{name}</li>)}</ol>
    <h1 ref={title} tabIndex={-1}>{review?'Revisão do pedido':'Dados de entrega'}</h1>
    {review ? <>
      <ul className="checkout-items">{rows.map(({p,qty,unit,cents})=><li key={p.id}><img src={p.image} alt=""/>
        <div><strong>{p.name}</strong>{(p.brand || p.volumeMl) && <p>{[p.brand,p.volumeMl && p.volumeMl+' ml'].filter(Boolean).join(' · ')}</p>}<p>{qty} × {brl(unit)}</p></div><b>{brl(cents/100)}</b></li>)}</ul>
      <p className="checkout-total">Total dos produtos <strong>{brl(total)}</strong></p>
      {rows.some(({p})=>p.isDemo) && <p>Confirme os preços e a disponibilidade com a loja antes de concluir o pedido.</p>}
      <button className="checkout-link" onClick={()=>setCartOpen(true)}>Modificar carrinho</button>
      <h2>{delivery?'Endereço de entrega':'Dados para retirada'}</h2>
      <dl className="checkout-address">{address.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      <button className="checkout-link" onClick={()=>changeStep(false)}>Editar dados</button>
      <p>{delivery?freight:'Local e horário de retirada a combinar com a loja.'}</p>
      {whatsapp.replace(/\D/g,'') ? <>
        <a className="btn-primary" target="_blank" rel="noopener noreferrer" href={waLink(whatsapp,message)}><MessageCircle aria-hidden="true"/>Confirmar pedido pelo WhatsApp</a>
        <p>Toque em Enviar no WhatsApp para encaminhar o pedido à loja.</p>
      </> : <details><summary>Ver mensagem de demonstração</summary><p>O WhatsApp da loja ainda não foi configurado.</p><pre>{message}</pre></details>}
    </> : <form onSubmit={e=>{e.preventDefault();changeStep(true)}}>
      <p>Seus dados serão utilizados para organizar a {delivery?'entrega':'retirada'} do pedido.</p>
      <fieldset><legend>Como deseja receber?</legend>{(['Entrega','Retirada'] as Delivery[]).map(m=>
        <label className="checkout-choice" key={m}><input type="radio" name="mode" checked={mode===m} onChange={()=>setMode(m)}/>{m}</label>)}</fieldset>
      <fieldset><legend>Dados pessoais</legend><div className="checkout-fields">
        {field('name','Nome completo',false,'name')}{field('phone','Telefone para contato',false,'tel')}
      </div></fieldset>
      {delivery && <fieldset><legend>Endereço</legend><div className="checkout-fields">
        {field('cep','CEP',false,'postal-code')}
        <button type="button" className="checkout-link" disabled={digits(data.cep).length !== 8} onClick={() => findCep(data)}>Buscar endereço pelo CEP</button>
        {lookupStatus && <p role="status">{lookupStatus}</p>}
        {field('street','Rua ou avenida',false,'address-line1')}{field('number','Número')}
        <label className="checkout-choice"><input type="checkbox" checked={noNumber} onChange={e=>setNoNumber(e.target.checked)}/>Sem número</label>
        {field('complement','Complemento',true)}{field('district','Bairro')}{field('city','Cidade',false,'address-level2')}
        <label>Estado<select name="state" autoComplete="address-level1" required value={data.state} onChange={e=>update('state',e.target.value)}><option value="">Selecione a UF</option>{states.map(s=><option key={s}>{s}</option>)}</select></label>
        {field('reference','Ponto de referência',true)}
      </div></fieldset>}
      <p><strong>Total dos produtos: {brl(total)}</strong>{delivery && <><br/>{freight}</>}</p>
      <button className="btn-primary">Revisar pedido</button>
    </form>}
  </section>
}