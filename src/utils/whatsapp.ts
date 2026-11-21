import { BRAND_NAME } from '../data/brand'
import type { CartItem, Delivery, Product } from '../types'
import { brl, priceOf } from './format'

export function buildOrderMessage(items: CartItem[], products: Product[], delivery?: Delivery) {
  let total = 0
  const lines = items.flatMap(item => {
    const product = products.find(p => p.id === item.productId && p.available)
    if (!product) return []
    const unit = priceOf(product)
    const subtotal = Math.round(unit * 100) * item.qty / 100
    total += subtotal
    return [`Produto: ${product.name}\nQuantidade: ${item.qty}\nValor unitário: ${brl(unit)}\nSubtotal: ${brl(subtotal)}`]
  })
  return ['Olá! Gostaria de fazer um pedido na '+BRAND_NAME+'.', ...lines, 'Total do pedido: ' + brl(total),
    delivery && 'Modalidade: ' + delivery, 'Gostaria de confirmar a disponibilidade e combinar a entrega ou retirada.'].filter(Boolean).join('\n\n')
}
export const waLink = (number: string, message: string) => `https://wa.me/${number.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`