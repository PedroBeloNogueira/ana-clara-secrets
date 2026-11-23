import { createClient } from '@supabase/supabase-js'
import type { Product } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
export const backend = url && key ? createClient(url, key) : null
export const catalogChanged = 'acs:catalog-changed'
const imageTypes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }
export const acceptedImages = Object.keys(imageTypes).join(',')

export type Category = { id: string; name: string; active: boolean }
export type ProductRow = {
  id: string; slug: string; name: string; brand: string | null; category_id: string | null
  description: string | null; price: number; promo_price: number | null; volume_ml: number | null
  family: string | null; intensity: Product['intensity'] | null; occasions: string[] | null; notes: string[] | null
  stock: number | null; available: boolean | null; archived: boolean | null
  image_url: string | null; image_urls: string[]; featured: boolean
  is_new: boolean; best_seller: boolean
}

export function statusOf(row: ProductRow) {
  if (row.archived) return 'oculto'
  return row.available && row.stock !== 0 ? 'disponível' : 'esgotado'
}

export async function readCatalog(admin = false) {
  const client = backend
  if (!client) throw new Error('Configure a conexão Supabase da loja.')
  const [rows, groups] = await Promise.all([
    allRows<ProductRow>((from, to) => {
      const query = client.from('products').select('*').order('name').order('id')
      return (admin ? query : query.eq('archived', false)).range(from, to)
    }),
    allRows<Category>((from, to) => {
      const query = client.from('categories').select('id,name,active').order('name').order('id')
      return (admin ? query : query.eq('active', true)).range(from, to)
    }),
  ])
  return { rows, groups }
}

async function allRows<T>(read: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>) {
  const rows: T[] = []
  while (true) {
    const { data, error } = await read(rows.length, rows.length + 99)
    if (error) throw error
    if (!data?.length) return rows
    rows.push(...data as T[])
  }
}

export function storefrontProduct(row: ProductRow, categories: Category[]): Product {
  return {
    id: row.id, slug: row.slug, name: row.name, brand: row.brand ?? undefined,
    category: categories.find(category => category.id === row.category_id)?.name ?? 'Sem categoria',
    description: row.description ?? '', price: Number(row.price),
    promoPrice: row.promo_price == null ? null : Number(row.promo_price),
    image: row.image_url ?? '', images: row.image_urls ?? [], volumeMl: row.volume_ml ?? undefined,
    family: row.family ?? undefined, intensity: row.intensity ?? undefined,
    occasions: row.occasions ?? [], notes: row.notes ?? [],
    available: statusOf(row) === 'disponível', stock: row.stock ?? undefined,
    isNew: row.is_new, bestSeller: row.best_seller, featured: row.featured,
  }
}

export function validateImage(file: File) {
  if (!Object.prototype.hasOwnProperty.call(imageTypes, file.type)) throw new Error('Use imagens JPG, PNG, WebP ou AVIF.')
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('Cada foto deve ter até 5 MB.')
}

export async function uploadImage(file: File) {
  if (!backend) throw new Error('Supabase indisponível.')
  validateImage(file)
  const name = 'catalogo/' + crypto.randomUUID() + '.' + imageTypes[file.type as keyof typeof imageTypes]
  const bucket = backend.storage.from('product-images')
  const { error } = await bucket.upload(name, file, { contentType: file.type })
  if (error) throw error
  return bucket.getPublicUrl(name).data.publicUrl
}

export function errorText(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message
  return 'Tente novamente.'
}
