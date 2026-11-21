# Ana Clara Secrets
Loja-catálogo em React + TS + Vite + Tailwind com carrinho integrado ao WhatsApp.
## Rodar
```
npm install && cp .env.example .env && npm run dev
```
## Estado atual (v0.1)
Pronto: design system (paleta/tipografia), header, home, catálogo (busca, família, ordenação), cards, favoritos e carrinho (localStorage, validação de disponibilidade, confirmação Retirada/Entrega, mensagem `wa.me` com `encodeURIComponent`).
Dados são **demonstrativos** (`src/data/demo.ts`). O WhatsApp padrão da loja é +55 96 9199-0583. Para trocar o destino no build, defina `VITE_WHATSAPP_FALLBACK` com o DDI e apenas dígitos.
## Próximas etapas
1. Supabase: rodar `supabase/schema.sql`, criar bucket `media`, criar `src/lib/supabase.ts` e `services/products.ts`, trocar `DEMO_PRODUCTS` no `StoreContext`. Use só a anon key no front; RLS já restringe escrita a `admins`.
2. Painel `/admin` (Supabase Auth + CRUD com React Hook Form/Zod), quiz, banners, páginas legais.
3. Deploy na Vercel ou Netlify com as variáveis de ambiente. As duas configurações incluídas encaminham as rotas do React para o HTML da loja. Em outra hospedagem estática, configure fallback para `index.html` em URLs sem arquivo.

`VITE_INSTAGRAM_URL`, `VITE_SERVICE_HOURS` e `VITE_DELIVERY_INFO` são opcionais e aparecem no Contato quando configuradas.
