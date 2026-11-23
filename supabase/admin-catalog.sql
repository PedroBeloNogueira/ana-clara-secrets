-- Execute após schema.sql, ou no banco existente.
begin;
alter table public.products add column if not exists image_urls text[] not null default '{}';
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products drop constraint if exists products_category_id_fkey;
alter table public.products add constraint products_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete set null;
alter table public.products drop constraint if exists products_admin_values;
alter table public.products add constraint products_admin_values check (
  (stock is null or stock >= 0) and (volume_ml is null or volume_ml > 0)
  and (promo_price is null or (promo_price >= 0 and promo_price < price))
) not valid;
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = ''
as $$select exists(select 1 from public.admins where user_id = auth.uid())$$;
grant execute on function public.is_admin() to anon, authenticated;
grant select on public.products, public.categories to anon, authenticated;
grant insert, update, delete on public.products, public.categories to authenticated;
revoke all on public.admins from anon, authenticated;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "admin product image upload" on storage.objects;
create policy "admin product image upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
commit;
