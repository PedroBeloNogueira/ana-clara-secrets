import { useEffect, useState, type FormEvent } from 'react'
import { acceptedImages, backend, errorText, statusOf, uploadImage, validateImage, type Category, type ProductRow } from '../data/catalog'

type Photo = string | File

function PhotoPreview({ photo, alt }: { photo: Photo; alt: string }) {
  const [preview, setPreview] = useState('')
  useEffect(() => {
    if (typeof photo === 'string') return
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])
  const src = typeof photo === 'string' ? photo : preview
  return src ? <img src={src} alt={alt}/> : null
}

export default function AdminProductForm({ product, categories, saved, cancel }: {
  product?: ProductRow; categories: Category[]; saved: () => void; cancel: () => void
}) {
  const [newId] = useState(() => product?.id ?? crypto.randomUUID())
  const [main, setMain] = useState<Photo | null>(product?.image_url || null)
  const [gallery, setGallery] = useState<Photo[]>(product?.image_urls ?? [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function select(files: FileList | null, primary: boolean) {
    if (!files?.length) return
    try {
      const photos = Array.from(files)
      photos.forEach(validateImage)
      if (primary) setMain(photos[0])
      else {
        if (gallery.length + photos.length > 10) throw new Error('A galeria comporta até 10 fotos.')
        setGallery(previous => [...previous, ...photos])
      }
      setError('')
    } catch (err) { setError(errorText(err)) }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!backend || busy) return
    const form = new FormData(event.currentTarget)
    const value = (name: string) => String(form.get(name) ?? '').trim()
    const optionalNumber = (name: string) => value(name) ? Number(value(name)) : null
    const price = Number(value('price'))
    const promoPrice = optionalNumber('promo')
    const stock = Number(value('stock'))
    const status = value('status')

    setBusy(true)
    setError('')
    try {
      if (!value('name') || !value('description')) throw new Error('Preencha o nome e a descrição.')
      if (!main) throw new Error('Selecione a imagem principal.')
      if (promoPrice !== null && promoPrice >= price) throw new Error('O preço promocional deve ser menor que o preço original.')
      if (status === 'disponível' && stock < 1) throw new Error('Informe estoque maior que zero para disponibilizar o produto.')
      const mainUrl = typeof main === 'string' ? main : await uploadImage(main)
      setMain(mainUrl)
      const galleryUrls: string[] = []
      for (const [index, photo] of gallery.entries()) {
        const url = typeof photo === 'string' ? photo : await uploadImage(photo)
        galleryUrls.push(url)
        setGallery(current => current.map((item, position) => position === index ? url : item))
      }
      const fields = {
        name: value('name'), brand: value('brand') || null, category_id: value('category') || null,
        description: value('description'), price, promo_price: promoPrice, image_url: mainUrl, image_urls: galleryUrls,
        volume_ml: optionalNumber('volume'), family: value('family').toLocaleLowerCase('pt-BR') || null,
        stock, archived: status === 'oculto', available: status === 'oculto' ? stock > 0 && (product?.available ?? true) : status === 'disponível', featured: form.has('featured'),
      }
      const baseSlug = fields.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'produto'
      const query = product ? backend.from('products').update(fields).eq('id', product.id) :
        backend.from('products').upsert({ ...fields, id: newId, slug: baseSlug + '-' + newId.slice(0, 12) })
      const { error: failure } = await query.select('id').single()
      if (failure) throw failure
      saved()
    } catch (err) { setError('Não foi possível salvar. ' + errorText(err)) }
    finally { setBusy(false) }
  }

  return <form className="admin-card admin-form" onSubmit={submit}>
    <h2>{product ? 'Editar produto' : 'Adicionar produto'}</h2>
    <fieldset disabled={busy}>
      <div className="admin-fields">
        <label>Nome<input name="name" defaultValue={product?.name} required maxLength={140}/></label>
        <label>Marca<input name="brand" defaultValue={product?.brand ?? ''} maxLength={100}/></label>
        <label>Categoria<select name="category" defaultValue={product?.category_id ?? ''}>
          <option value="">Sem categoria</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select></label>
        <label>Tipo de fragrância<input name="family" list="admin-families" defaultValue={product?.family ?? ''} maxLength={60}/></label>
        <datalist id="admin-families">{['doce', 'floral', 'fresca', 'citrica', 'amadeirada'].map(value => <option key={value} value={value}/>)}</datalist>
        <label className="admin-wide">Descrição<textarea name="description" defaultValue={product?.description ?? ''} required rows={4} maxLength={6000}/></label>
        <label>Preço original (R$)<input type="number" name="price" defaultValue={product?.price} required min="0" max="99999999.99" step=".01"/></label>
        <label>Preço promocional (R$)<input type="number" name="promo" defaultValue={product?.promo_price ?? ''} min="0" max="99999999.99" step=".01"/></label>
        <label>Volume (ml)<input type="number" name="volume" defaultValue={product?.volume_ml ?? ''} min="1" max="2147483647" step="1"/></label>
        <label>Quantidade em estoque<input type="number" name="stock" required defaultValue={product?.stock ?? ''} min="0" max="2147483647" step="1"/></label>
        <label>Status<select name="status" defaultValue={product ? statusOf(product) : 'disponível'}>
          <option value="disponível">Disponível</option><option value="esgotado">Esgotado</option><option value="oculto">Oculto</option>
        </select></label>
        <label className="admin-check"><input type="checkbox" name="featured" defaultChecked={product?.featured}/> Destacar na página inicial</label>
      </div>
      <h3>Fotos</h3>
      <p>JPG, PNG, WebP ou AVIF, até 5 MB por foto.</p>
      <div className="admin-fields">
        <div>
          <label>Imagem principal<input type="file" accept={acceptedImages} onChange={event => { select(event.target.files, true); event.target.value = '' }}/></label>
          {main && <div className="admin-photo"><PhotoPreview photo={main} alt="Prévia da imagem principal"/>
            <button type="button" onClick={() => setMain(null)}>Remover principal</button></div>}
        </div>
        <div>
          <label>Galeria adicional<input type="file" accept={acceptedImages} multiple onChange={event => { select(event.target.files, false); event.target.value = '' }}/></label>
          <div className="admin-photos">{gallery.map((photo, index) => <div className="admin-photo" key={index}>
            <PhotoPreview photo={photo} alt={'Foto da galeria ' + (index + 1)}/>
            <button type="button" onClick={() => setGallery(items => items.filter((_, position) => position !== index))}
              aria-label={'Remover foto ' + (index + 1)}>Remover</button>
          </div>)}</div>
        </div>
      </div>
      <div className="store-actions"><button className="btn-primary">{busy ? 'Salvando…' : 'Salvar produto'}</button>
        <button type="button" className="btn-ghost" onClick={cancel}>Cancelar</button></div>
    </fieldset>
    {error && <p role="alert">{error}</p>}
  </form>
}
