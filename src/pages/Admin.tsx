import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import PageMeta from '../components/PageMeta'
import { BRAND_NAME } from '../data/brand'
import { backend, catalogChanged, errorText, readCatalog, statusOf, type Category, type ProductRow } from '../data/catalog'
import { brl } from '../utils/format'
import AdminProductForm from './AdminProductForm'

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [verification, setVerification] = useState<{ id: string; result: 'allowed' | 'denied' | 'error' } | null>(null)
  const [loginError, setLoginError] = useState('')
  const [busy, setBusy] = useState(false)
  const userId = session?.user.id
  const access = verification && verification.id === userId ? verification.result : 'checking'

  useEffect(() => {
    if (!backend) return
    const { data } = backend.auth.onAuthStateChange((_event, next) => {
      if (!next) setVerification(null)
      setSession(next)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!backend || !userId) return
    let active = true
    void backend.rpc('is_admin').then(({ data, error }) => {
      if (active) setVerification({ id: userId, result: error ? 'error' : data === true ? 'allowed' : 'denied' })
    }, () => { if (active) setVerification({ id: userId, result: 'error' }) })
    return () => { active = false }
  }, [userId])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!backend || busy) return
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setLoginError('')
    try {
      const { error } = await backend.auth.signInWithPassword({
        email: String(form.get('email')).trim(), password: String(form.get('password')),
      })
      if (error) setLoginError('Não foi possível entrar. Confira o e-mail e a senha.')
    } catch { setLoginError('Conexão indisponível. Tente novamente.') }
    finally { setBusy(false) }
  }

  async function logout() {
    setLoginError('')
    const result = await backend?.auth.signOut()
    if (result?.error) setLoginError('Não foi possível sair. Tente novamente.')
  }

  return <main className="admin-shell">
    <PageMeta title="Administração" description="Painel de administração da loja."/>
    <header className="admin-header">
      <Link className="wordmark" to="/">{BRAND_NAME}</Link>
      <Link className="btn-ghost" to="/">Ver loja</Link>
      {session && <button type="button" className="btn-ghost" onClick={logout}>Sair</button>}
    </header>
    {!backend ? <section className="admin-card">
      <h1>Painel administrativo</h1><p>O painel precisa da conexão com o Supabase. A configuração está no README do projeto.</p>
    </section> : session === undefined || (session && access === 'checking') ? <p role="status">Verificando acesso…</p> :
      !session ? <form className="admin-card admin-login" onSubmit={login}>
        <h1>Painel administrativo</h1>
        <label>E-mail<input type="email" name="email" autoComplete="username" required/></label>
        <label>Senha<input type="password" name="password" autoComplete="current-password" required/></label>
        <button className="btn-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </form> : access === 'allowed' ? <AdminCatalog key={userId}/> : <section className="admin-card">
        <h1>{access === 'error' ? 'Não foi possível verificar o acesso' : 'Acesso restrito'}</h1>
        <p>{access === 'error' ? 'Confira a conexão e atualize a página.' : 'Esta conta precisa ter autorização de administradora.'}</p>
      </section>}
    {loginError && <p role="alert">{loginError}</p>}
  </main>
}

function AdminCatalog() {
  const [params, navigate] = useSearchParams()
  const [catalog, setCatalog] = useState<{ rows: ProductRow[]; groups: Category[] } | null>(null)
  const [revision, setRevision] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState({ query: '', category: '', status: '' })
  const [form, setForm] = useState<ProductRow | 'new' | null>(null)
  const view = params.get('secao') ?? 'resumo'

  useEffect(() => {
    let active = true
    readCatalog(true).then(data => { if (active) setCatalog(data) }, err => {
      if (active) setError('Não foi possível carregar o catálogo. ' + errorText(err))
    })
    return () => { active = false }
  }, [revision])

  function open(next: string) {
    setForm(null)
    navigate(next === 'resumo' ? {} : { secao: next })
  }

  function updated(text: string) {
    setMessage(text)
    setRevision(value => value + 1)
    window.dispatchEvent(new Event(catalogChanged))
  }

  async function change(action: () => PromiseLike<{ error: { message: string } | null }>, success: string) {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { error: failure } = await action()
      if (failure) throw failure
      updated(success)
    } catch (err) { setError('Não foi possível concluir a alteração. ' + errorText(err)) }
    finally { setBusy(false) }
  }

  function add() {
    open('produtos')
    setForm('new')
  }

  const rows = catalog?.rows ?? []
  const groups = catalog?.groups ?? []
  const search = filter.query.trim().toLocaleLowerCase('pt-BR')
  const visible = rows.filter(row =>
    (row.name + ' ' + (row.brand ?? '')).toLocaleLowerCase('pt-BR').includes(search)
    && (!filter.category || row.category_id === filter.category)
    && (!filter.status || statusOf(row) === filter.status))

  function changeCategory(event: FormEvent<HTMLFormElement>, category?: Category) {
    event.preventDefault()
    const client = backend
    if (!client) return
    const target = event.currentTarget
    const name = String(new FormData(target).get('name') ?? '').trim()
    if (!name) return
    if (groups.some(group => group.id !== category?.id && group.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) {
      setError('Já existe uma categoria com esse nome.')
      return
    }
    void change(async () => {
      const query = category ? client.from('categories').update({ name }).eq('id', category.id) :
        client.from('categories').insert({ name })
      const result = await query.select('id').single()
      if (!result.error && !category) target.reset()
      return result
    }, category ? 'Categoria atualizada.' : 'Categoria adicionada.')
  }

  return <>
    <nav className="admin-tabs" aria-label="Seções do painel">
      {[['resumo', 'Resumo'], ['produtos', 'Gerenciar produtos'], ['categorias', 'Categorias']].map(([id, title]) =>
        <button key={id} type="button" className={view === id ? 'btn-primary' : 'btn-ghost'}
          aria-current={view === id ? 'page' : undefined} onClick={() => open(id)}>{title}</button>)}
    </nav>
    {message && <p className="admin-feedback" role="status">{message}</p>}
    {error && <p className="admin-feedback" role="alert">{error} <button className="btn-ghost" onClick={() => { setError(''); setRevision(value => value + 1) }}>Atualizar lista</button></p>}
    {!catalog ? !error && <p role="status">Carregando dados da loja…</p> : view === 'produtos' ? <section>
      <div className="admin-section-title"><h1>Gerenciar produtos</h1><button className="btn-primary" onClick={add} disabled={!!form || busy}>+ Adicionar produto</button></div>
      {form ? <AdminProductForm key={form === 'new' ? 'new' : form.id} product={form === 'new' ? undefined : form}
        categories={groups} cancel={() => setForm(null)} saved={() => { setForm(null); updated('Produto salvo com sucesso.') }}/> :
        <div className="admin-card">
          <div className="admin-fields">
            <label>Pesquisar por nome ou marca<input type="search" value={filter.query} onChange={event => setFilter({ ...filter, query: event.target.value })}/></label>
            <label>Categoria<select value={filter.category} onChange={event => setFilter({ ...filter, category: event.target.value })}>
              <option value="">Todas</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select></label>
            <label>Disponibilidade<select value={filter.status} onChange={event => setFilter({ ...filter, status: event.target.value })}>
              <option value="">Todos os status</option><option>disponível</option><option>esgotado</option><option>oculto</option>
            </select></label>
          </div>
          {visible.length ? <ul className="admin-list">{visible.map(row => <li key={row.id}>
            {row.image_url && <img src={row.image_url} alt="" loading="lazy"/>}
            <div><strong>{row.name}</strong><p>{row.brand}</p><p>{row.promo_price != null ? <><s>{brl(row.price)}</s> {brl(row.promo_price)}</> : brl(row.price)}</p>
              <p>Estoque {row.stock ?? 'a informar'} · {statusOf(row)}{row.featured && ' · destaque'}</p></div>
            <div className="admin-row-actions">
              <button className="btn-ghost" disabled={busy} onClick={() => setForm(row)}>Editar</button>
              <button className="btn-ghost" disabled={busy} onClick={() => {
                if (backend) void change(() => backend!.from('products').update({ archived: !row.archived }).eq('id', row.id).select('id').single(), row.archived ? 'Produto exibido na vitrine.' : 'Produto ocultado.')
              }}>{row.archived ? 'Exibir' : 'Ocultar'}</button>
              <button className="btn-ghost" disabled={busy} onClick={() => {
                if (backend && window.confirm('Excluir definitivamente o produto ' + row.name + '?'))
                  void change(() => backend!.from('products').delete().eq('id', row.id).select('id').single(), 'Produto excluído.')
              }}>Excluir</button>
            </div>
          </li>)}</ul> : <p>Nenhum produto encontrado.</p>}
        </div>}
    </section> : view === 'categorias' ? <section>
      <h1>Categorias</h1>
      <div className="admin-card">
        <form className="admin-category-form" onSubmit={event => changeCategory(event)}>
          <label>Nova categoria<input name="name" required maxLength={100}/></label>
          <button className="btn-primary" disabled={busy}>Adicionar categoria</button>
        </form>
        <div className="admin-category-list">{groups.map(group => <form key={group.id + group.name} className="admin-category-form" onSubmit={event => changeCategory(event, group)}>
          <label>Nome da categoria<input name="name" defaultValue={group.name} required maxLength={100}/></label>
          <button className="btn-ghost" disabled={busy}>Renomear</button>
          <button className="btn-ghost" type="button" disabled={busy} onClick={() => {
            if (backend && window.confirm('Excluir a categoria ' + group.name + '? Os produtos ficarão sem categoria.'))
              void change(() => backend!.from('categories').delete().eq('id', group.id).select('id').single(), 'Categoria excluída.')
          }}>Excluir</button>
        </form>)}</div>
      </div>
    </section> : <section>
      <h1>Visão geral</h1>
      <dl className="admin-stats">{[
        ['Produtos cadastrados', rows.length],
        ['Disponíveis', rows.filter(row => statusOf(row) === 'disponível').length],
        ['Esgotados', rows.filter(row => statusOf(row) === 'esgotado').length],
        ['Em promoção', rows.filter(row => !row.archived && row.promo_price != null && row.promo_price < row.price).length],
        ['Estoque baixo (1 a 3)', rows.filter(row => !row.archived && row.stock != null && row.stock > 0 && row.stock <= 3).length],
      ].map(([label, value]) => <div className="admin-card" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="store-actions"><button className="btn-primary" onClick={add}>+ Adicionar produto</button>
        <button className="btn-ghost" onClick={() => open('produtos')}>Gerenciar produtos</button></div>
    </section>}
  </>
}
