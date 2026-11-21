# Ana Clara Secrets
Loja-catálogo em React + TS + Vite + Tailwind com carrinho integrado ao WhatsApp.
## Rodar
```
npm install && cp .env.example .env && npm run dev
```
## Estado atual (v0.1)
Pronto: design system (paleta/tipografia), header, home, catálogo (busca, família, ordenação), cards, favoritos e carrinho (localStorage, validação de disponibilidade, confirmação Retirada/Entrega, mensagem `wa.me` com `encodeURIComponent`).
Dados são **demonstrativos** (`src/data/demo.ts`). Defina o número em `VITE_WHATSAPP_FALLBACK` (só dígitos com DDI) até ele vir de `store_settings`.
## Próximas etapas
1. Supabase: rodar `supabase/schema.sql`, criar bucket `media`, criar `src/lib/supabase.ts` e `services/products.ts`, trocar `DEMO_PRODUCTS` no `StoreContext`. Use só a anon key no front; RLS já restringe escrita a `admins`.
2. Painel `/admin` (Supabase Auth + CRUD com React Hook Form/Zod), página de produto, quiz, banners, páginas legais.
3. Deploy na Vercel/Netlify com as variáveis de ambiente.
