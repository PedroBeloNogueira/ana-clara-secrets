import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Home, Grid2X2, Sparkles, Info, MessageCircle, ShoppingBag } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext'

const tabs = [
  { name: 'Início', icon: Home, to: '/' },
  { name: 'Produtos', icon: Grid2X2, to: '/#produtos' },
  { name: 'Novidades', icon: Sparkles, to: '/#novidades' },
  { name: 'Sobre', icon: Info, to: '/#sobre' },
  { name: 'Contato', icon: MessageCircle, to: '/#contato' },
  { name: 'Carrinho', icon: ShoppingBag, to: '' },
]
const clamp = (value: number) => Math.max(0, Math.min(tabs.length - 1, value))

export default function IslandNav() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { cartOpen, setCartOpen, count } = useStore()
  const [compact, setCompact] = useState(false)
  const [section, setSection] = useState(0)
  const [drag, setDrag] = useState<number | null>(null)
  const nav = useRef<HTMLElement>(null)
  const indicator = useRef<HTMLSpanElement>(null)
  const gesture = useRef<{ x: number; y: number; start: number; offset: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const active = cartOpen || pathname === '/checkout' ? 5 : section
  const physics = useRef({ position: active, velocity: 0 })

  useEffect(() => {
    let last = window.scrollY
    function track() {
      const y = window.scrollY
      if (Math.abs(y - last) > 5 || y === 0) {
        setCompact(y > 80 && y > last)
        last = y
      }
      if (pathname !== '/') return
      const top = (id: string) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity
      const bottom = y > 0 && y + innerHeight >= document.documentElement.scrollHeight - 3
      if (top('contato') <= 112 || bottom) setSection(hash === '#sobre' ? 3 : 4)
      else if (top('sobre') <= 112) setSection(3)
      else if (top('produtos') <= 112) setSection(1)
      else if (top('novidades') <= 112) setSection(2)
      else setSection(0)
    }
    track()
    window.addEventListener('scroll', track, { passive: true })
    window.addEventListener('resize', track)
    return () => { window.removeEventListener('scroll', track); window.removeEventListener('resize', track) }
  }, [pathname, hash])

  useLayoutEffect(() => {
    const node = indicator.current
    if (!node) return
    const state = physics.current
    const target = drag ?? active
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let last = performance.now()
    function paint() {
      if (!node) return
      node.style.transform = 'translateX(' + state.position * 100 + '%) scaleX(' + (1 + Math.min(.12, Math.abs(state.velocity) * .004)) + ')'
    }
    function snap() {
      cancelAnimationFrame(frame)
      state.position = target
      state.velocity = 0
      paint()
    }
    function step(now: number) {
      const dt = Math.min((now - last) / 1000, .025)
      last = now
      state.velocity += ((target - state.position) * 310 - state.velocity * 31) * dt
      state.position += state.velocity * dt
      if (Math.abs(target - state.position) < .001 && Math.abs(state.velocity) < .01) return snap()
      paint()
      frame = requestAnimationFrame(step)
    }
    if (drag !== null || motion.matches) snap()
    else frame = requestAnimationFrame(step)
    motion.addEventListener('change', snap)
    return () => { cancelAnimationFrame(frame); motion.removeEventListener('change', snap) }
  }, [active, drag])

  function select(index: number) {
    const to = tabs[index].to
    if (to) {
      navigate(to)
      if (to === '/') window.scrollTo(0, 0)
      else if (pathname === '/') document.getElementById(to.split('#')[1])?.scrollIntoView()
    } else setCartOpen(true)
  }

  return <header className="island-anchor"><div className="island-shell" data-compact={compact}>
    <nav className="island-track" aria-label="Navegação principal" ref={nav}
      onKeyDown={event => {
        const button = (event.target as HTMLElement).closest<HTMLElement>('[data-tab]')
        if (!button || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return
        event.preventDefault()
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
          (Number(button.dataset.tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
        nav.current?.querySelector<HTMLElement>('[data-tab="'+next+'"]')?.focus()
      }}
      onPointerDown={event => {
        suppressClick.current = false
        if (event.pointerType === 'mouse' || !event.isPrimary) return
        gesture.current = {x:event.clientX, y:event.clientY, start:active, offset:active, moved:false}
      }}
      onPointerMove={event => {
        const g = gesture.current
        if (!g || !event.isPrimary) return
        const dx = event.clientX - g.x
        if (!g.moved && Math.abs(dx) < 8) return
        if (!g.moved && Math.abs(dx) < Math.abs(event.clientY-g.y)) { gesture.current=null; return }
        if (!g.moved) event.currentTarget.setPointerCapture(event.pointerId)
        g.moved = true
        g.offset = clamp(g.start + dx / (event.currentTarget.clientWidth / tabs.length))
        setDrag(g.offset)
      }}
      onPointerCancel={() => { gesture.current=null; setDrag(null) }}
      onPointerUp={() => {
        const g = gesture.current
        gesture.current = null
        if (g?.moved) {
          suppressClick.current = true
          select(Math.round(g.offset))
        }
        setDrag(null)
      }}
      onClickCapture={event => {
        if (suppressClick.current && event.detail > 0) { event.preventDefault(); event.stopPropagation() }
        suppressClick.current = false
      }}>
      <span ref={indicator} className="island-indicator" aria-hidden="true"/>
      {tabs.map(({name,icon:Icon,to}, index) => {
        const selected = index === active
        const content = <><Icon size={19} aria-hidden="true"/><span>{name}</span>{index===5 && count>0 && <small>{count}</small>}</>
        return to ? <Link key={name} className="island-tab" data-tab={index} data-active={selected} to={to} aria-label={name}
          aria-current={selected ? 'location' : undefined} onClick={() => { if(to==='/') window.scrollTo(0,0); else if(pathname === '/') document.getElementById(to.split('#')[1])?.scrollIntoView() }}>{content}</Link> :
          <button key={name} className="island-tab" data-tab={index} data-active={selected} aria-label={'Carrinho, '+count+' itens'}
            aria-haspopup="dialog" onClick={() => select(index)}>{content}</button>
      })}
    </nav>
  </div></header>
}