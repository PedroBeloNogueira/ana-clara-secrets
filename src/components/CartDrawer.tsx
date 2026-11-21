import Drawer from './Drawer'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useStore } from '../contexts/StoreContext'
import { brl, priceOf } from '../utils/format'
import { productPath } from '../utils/routes'

export function CartContents({ close }: { close?: () => void }) {
  const { cart, products, setQty, remove, total } = useStore()
  const rows = cart.map(item => ({ item, product: products.find(p => p.id === item.productId) }))

  return <>
    <div className={close ? 'flex-1 space-y-4 overflow-y-auto p-5' : 'space-y-4'}>
      {!rows.length && <p>Seu carrinho está vazio.</p>}
      {rows.map(({ item, product }) => {
        const name = product?.name ?? 'Produto removido da vitrine'
        return <div key={item.productId} className="cart-row">
          {product && <Link to={productPath(product.slug)} onClick={close} aria-label={'Ver ' + name}><img src={product.image} alt=""/></Link>}
          <div className="grow">
            {product ? <Link to={productPath(product.slug)} onClick={close}>{name}</Link> : <p>{name}</p>}
            {product && <p className="text-sm">{brl(priceOf(product))} por unidade</p>}
            {!product?.available && <p className="text-sm">{product?.available === false ? 'Esgotado' : 'Indisponível para o pedido'}</p>}
            <div className="cart-quantity">
              <button aria-label={'Diminuir quantidade de ' + name} onClick={() => setQty(item.productId, item.qty - 1)}><Minus size={16}/></button>
              <span>{item.qty}</span>
              <button aria-label={'Aumentar quantidade de ' + name} disabled={!product?.available} onClick={() => setQty(item.productId, item.qty + 1)}><Plus size={16}/></button>
              <button aria-label={'Remover ' + name} onClick={() => remove(item.productId)}><Trash2 size={16}/></button>
            </div>
          </div>
          {product?.available && <strong>{brl(priceOf(product) * item.qty)}</strong>}
        </div>
      })}
    </div>
    <div className={close ? 'space-y-3 border-t border-petala p-5' : 'cart-summary'}>
      {rows.length > 0 && <p className="checkout-total"><span>Total dos produtos</span><strong>{brl(total)}</strong></p>}
      <div className="store-actions">
        {rows.some(({ product }) => product?.available) &&
          <Link className="btn-primary" to="/checkout" onClick={close}>Continuar para entrega</Link>}
        {close ? <button className="btn-ghost" onClick={close}>Continuar comprando</button> :
          <Link className="btn-ghost" to="/#produtos">Explorar perfumes</Link>}
      </div>
    </div>
  </>
}

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useStore()
  const close = () => setCartOpen(false)
  return <Drawer open={cartOpen} close={close} label="Carrinho">
    <header className="flex items-center justify-between border-b border-petala p-5">
      <h2 className="text-2xl">Seu carrinho</h2>
      <button onClick={close} aria-label="Fechar carrinho"><X/></button>
    </header>
    <CartContents close={close}/>
  </Drawer>
}
