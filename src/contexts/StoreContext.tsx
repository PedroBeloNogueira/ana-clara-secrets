import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'
import { DEMO_PRODUCTS } from '../data/demo'
import { backend, catalogChanged, readCatalog, storefrontProduct } from '../data/catalog'
import { storeContact } from '../data/contact'
import { priceOf } from '../utils/format'

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') as T }
  catch { return fallback }
}

type Store = {
  products: Product[]; categories: string[]; catalogLoading: boolean; catalogError: string
  cart: CartItem[]; favs: string[]; cartOpen: boolean; setCartOpen: (open: boolean) => void
  add: (id: string, qty?: number) => void; setQty: (id: string, qty: number) => void
  remove: (id: string) => void; toggleFav: (id: string) => void
  count: number; total: number; toast: string; whatsapp: string
}
const Context = createContext<Store>(null!)
export const useStore = () => useContext(Context)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(!backend && import.meta.env.DEV ? DEMO_PRODUCTS : [])
  const [categories, setCategories] = useState<string[]>([])
  const [catalogLoading, setCatalogLoading] = useState(Boolean(backend))
  const [catalogError, setCatalogError] = useState(!backend && !import.meta.env.DEV ? 'Catálogo temporariamente indisponível.' : '')
  const [cart, setCart] = useState<CartItem[]>(() => load('acs_cart', []))
  const [favs, setFavs] = useState<string[]>(() => load('acs_favs', []))
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!backend) return
    let active = true
    let request = 0
    async function reload() {
      const version = ++request
      try {
        const { rows, groups } = await readCatalog()
        if (!active || version !== request) return
        setProducts(rows.map(row => storefrontProduct(row, groups)))
        setCategories(groups.map(group => group.name))
        setCatalogError('')
      } catch {
        if (active && version === request) setCatalogError('Não foi possível atualizar o catálogo. Tente novamente em instantes.')
      } finally {
        if (active && version === request) setCatalogLoading(false)
      }
    }
    void reload()
    window.addEventListener(catalogChanged, reload)
    window.addEventListener('focus', reload)
    const timer = window.setInterval(reload, 30_000)
    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener(catalogChanged, reload)
      window.removeEventListener('focus', reload)
    }
  }, [])

  useEffect(() => { try { localStorage.setItem('acs_cart', JSON.stringify(cart)) } catch { /* Storage can be disabled. */ } }, [cart])
  useEffect(() => { try { localStorage.setItem('acs_favs', JSON.stringify(favs)) } catch { /* Storage can be disabled. */ } }, [favs])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const find = (id: string) => products.find(product => product.id === id)
  const store: Store = {
    products, categories, catalogLoading, catalogError, cart, favs, cartOpen, setCartOpen, toast,
    whatsapp: storeContact.whatsapp,
    add(id, qty = 1) {
      const product = find(id)
      if (!product?.available || !Number.isSafeInteger(qty) || qty < 1) return
      if ((cart.find(item => item.productId === id)?.qty ?? 0) >= (product.stock ?? Infinity)) {
        setToast('Quantidade máxima em estoque atingida')
        return
      }
      setCart(items => {
        const previous = items.find(item => item.productId === id)
        const next = Math.min((previous?.qty ?? 0) + qty, product.stock ?? Infinity)
        return previous ? items.map(item => item === previous ? { ...item, qty: next } : item) : [...items, { productId: id, qty: next }]
      })
      setToast('Adicionado ao carrinho')
    },
    setQty(id, qty) {
      const product = find(id)
      if (!Number.isSafeInteger(qty)) return
      if (qty < 1) setCart(items => items.filter(item => item.productId !== id))
      else setCart(items => items.map(item => {
        if (item.productId !== id || (qty > item.qty && !product?.available)) return item
        return { ...item, qty: Math.min(qty, product?.stock === 0 ? Infinity : product?.stock ?? Infinity) }
      }))
    },
    remove: id => setCart(items => items.filter(item => item.productId !== id)),
    toggleFav: id => setFavs(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]),
    count: cart.reduce((sum, item) => sum + item.qty, 0),
    total: cart.reduce((sum, item) => {
      const product = find(item.productId)
      return sum + (product?.available ? Math.round(priceOf(product) * 100) * Math.min(item.qty, product.stock ?? Infinity) : 0)
    }, 0) / 100,
  }
  return <Context.Provider value={store}>{children}</Context.Provider>
}
