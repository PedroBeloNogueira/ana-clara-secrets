import type { Product } from '../types'
export const collections = [
  { name: 'Perfumes femininos', image: 1 }, { name: 'Perfumes masculinos', image: 4 },
  { name: 'Kits e presentes', image: 6 }, { name: 'Novidades', image: 3 }, { name: 'Promoções', image: 2 },
]
export function matchesCollection(p: Product, category: string) {
  if (category === 'Novidades') return p.isNew
  if (category === 'Promoções') return p.promoPrice != null && p.promoPrice < p.price
  return !category || p.category === category || p.collections?.includes(category)
}