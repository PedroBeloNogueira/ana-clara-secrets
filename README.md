# Ana Clara’s Secret

Loja em React, TypeScript e Vite, com pedidos pelo WhatsApp e administração do catálogo pelo Supabase.

## Configurar o banco e a proprietária

1. Use o projeto Supabase da loja. Se o banco estiver vazio, execute `supabase/schema.sql` no SQL Editor. Em seguida, execute `supabase/admin-catalog.sql`. Em um banco que já tem o esquema da loja, execute apenas `admin-catalog.sql`. A migração preserva os produtos e as categorias existentes.
2. No Supabase, crie ou localize a conta da proprietária em **Authentication → Users**. Copie o UUID da conta e execute no SQL Editor:

   ```sql
   insert into public.admins (user_id)
   values ('<UUID da conta da proprietária>')
   on conflict (user_id) do nothing;
   ```

3. Copie `.env.example` para `.env` ou adicione à configuração existente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Use a chave pública publishable ou anon, nunca a chave service role.
4. Execute `npm install` e `npm run dev`. Abra `/admin` e entre com o e-mail e a senha da conta autorizada. Crie as categorias e cadastre os produtos reais.

O catálogo lê os registros do Supabase quando configurado. O servidor de desenvolvimento sem Supabase mantém a vitrine de exemplo. O build de produção sem Supabase exibe o catálogo indisponível. O painel calcula estoque baixo a partir de 1 a 3 unidades. Fotos ficam no bucket público `product-images`, com upload restrito à administração.

## Publicar

Configure as mesmas variáveis na hospedagem e gere um novo build com `npm run build`. Vercel e Netlify têm fallback para as rotas do React incluído no repositório. Em outra hospedagem estática, configure fallback para `index.html`.

O WhatsApp padrão da loja é +55 96 9199-0583. Para usar outro destino, configure `VITE_WHATSAPP_FALLBACK` no build com DDI e apenas dígitos. Se uma versão publicada ainda mostrar o aviso antigo de WhatsApp sem configuração, confira a variável da hospedagem e publique novamente com o build atualizado.

`VITE_INSTAGRAM_URL`, `VITE_SERVICE_HOURS` e `VITE_DELIVERY_INFO` são opcionais e aparecem no Contato quando configuradas.
