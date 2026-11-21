-- Execute no SQL Editor do Supabase.
create table categories(id uuid primary key default gen_random_uuid(),name text not null,image_url text,sort_order int default 0,active bool default true);
create table products(id uuid primary key default gen_random_uuid(),slug text unique not null,name text not null,brand text,volume_ml int,
 price numeric(10,2) not null check(price>=0),promo_price numeric(10,2),image_url text,description text,
 category_id uuid references categories(id),family text,intensity text,occasions text[] default '{}',notes text[] default '{}',
 available bool default true,stock int,is_new bool default false,best_seller bool default false,archived bool default false,created_at timestamptz default now());
create table banners(id uuid primary key default gen_random_uuid(),title text,subtitle text,image_url text,cta_label text,cta_link text,active bool default true,sort_order int default 0);
create table store_settings(id int primary key default 1 check(id=1),store_name text,whatsapp text,instagram text,pickup_enabled bool default true,delivery_enabled bool default true,delivery_info text,about text);
create table admins(user_id uuid primary key references auth.users(id));
create or replace function is_admin() returns bool language sql security definer stable as $$select exists(select 1 from admins where user_id=auth.uid())$$;
alter table categories enable row level security;alter table products enable row level security;alter table banners enable row level security;alter table store_settings enable row level security;alter table admins enable row level security;
create policy "leitura publica" on categories for select using(active or is_admin());
create policy "leitura publica" on products for select using(not archived or is_admin());
create policy "leitura publica" on banners for select using(active or is_admin());
create policy "leitura publica" on store_settings for select using(true);
create policy "admin escreve" on categories for all using(is_admin()) with check(is_admin());
create policy "admin escreve" on products for all using(is_admin()) with check(is_admin());
create policy "admin escreve" on banners for all using(is_admin()) with check(is_admin());
create policy "admin escreve" on store_settings for all using(is_admin()) with check(is_admin());
-- Storage: crie o bucket público "media" e permita insert/update/delete apenas para is_admin().
-- Primeiro admin: insert into admins values ('<uuid do usuário criado em Auth>');
