-- أبو العريف: كتالوج المنتجات والبحث الحقيقي عبر Supabase.
-- شغّل هذا الملف في Supabase SQL Editor أو عبر Supabase CLI.
-- لا يحتوي بيانات تجريبية ولا يُنفّذ تلقائياً من تطبيق Expo.

create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  slug text not null unique,
  logo_url text,
  province text,
  district text,
  whatsapp text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  description text,
  price bigint not null check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  category text,
  sku text,
  options jsonb not null default '{}'::jsonb,
  publication_status text not null default 'draft' check (publication_status in ('published', 'hidden', 'draft', 'pending_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, sku)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  type text not null check (type in ('product', 'company', 'promotion')),
  target_province text,
  target_district text,
  status text not null default 'draft' check (status in ('draft', 'pending_payment', 'pending_review', 'active', 'paused', 'rejected', 'finished')),
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists search_vector tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(name, '') || ' ' || coalesce(description, '') || ' ' ||
      coalesce(category, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(options::text, '')
    )
  ) stored;

create index if not exists products_company_idx on public.products(company_id);
create index if not exists products_search_vector_idx on public.products using gin(search_vector);
create index if not exists products_published_stock_idx on public.products(publication_status, quantity);
create index if not exists product_images_product_idx on public.product_images(product_id, sort_order);
create index if not exists campaigns_target_idx on public.campaigns(status, company_id);

create or replace function public.is_company_owner(company_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.companies
    where id = company_uuid and owner_id = auth.uid()
  );
$$;

alter table public.companies enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.campaigns enable row level security;

drop policy if exists abu_companies_public_select on public.companies;
drop policy if exists abu_companies_owner_write on public.companies;
drop policy if exists abu_products_public_select on public.products;
drop policy if exists abu_products_owner_insert on public.products;
drop policy if exists abu_products_owner_update on public.products;
drop policy if exists abu_products_owner_delete on public.products;
drop policy if exists abu_images_public_select on public.product_images;
drop policy if exists abu_images_owner_write on public.product_images;
drop policy if exists abu_campaigns_owner_all on public.campaigns;

create policy abu_companies_public_select on public.companies
  for select using (true);
create policy abu_companies_owner_write on public.companies
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy abu_products_public_select on public.products
  for select using (publication_status = 'published' or public.is_company_owner(company_id));
create policy abu_products_owner_insert on public.products
  for insert with check (public.is_company_owner(company_id));
create policy abu_products_owner_update on public.products
  for update using (public.is_company_owner(company_id)) with check (public.is_company_owner(company_id));
create policy abu_products_owner_delete on public.products
  for delete using (public.is_company_owner(company_id));

create policy abu_images_public_select on public.product_images
  for select using (exists (
    select 1 from public.products p
    where p.id = product_id and p.publication_status = 'published'
  ));
create policy abu_images_owner_write on public.product_images
  for all using (exists (
    select 1 from public.products p
    where p.id = product_id and public.is_company_owner(p.company_id)
  )) with check (exists (
    select 1 from public.products p
    where p.id = product_id and public.is_company_owner(p.company_id)
  ));

create policy abu_campaigns_owner_all on public.campaigns
  for all using (public.is_company_owner(company_id))
  with check (public.is_company_owner(company_id));

create or replace function public.search_products(
  search_query text default null,
  color_query text default null,
  max_price bigint default null,
  result_limit integer default 20,
  location_query text default null
)
returns table (
  id uuid,
  name text,
  description text,
  price bigint,
  quantity integer,
  category text,
  sku text,
  company_name text,
  company_whatsapp text,
  company_logo text,
  image_urls text[],
  company_province text,
  company_district text,
  is_verified boolean,
  is_sponsored boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    p.id,
    p.name,
    p.description,
    p.price,
    p.quantity,
    p.category,
    p.sku,
    c.name as company_name,
    c.whatsapp as company_whatsapp,
    c.logo_url as company_logo,
    coalesce(
      array_agg(pi.public_url order by pi.sort_order) filter (where pi.public_url is not null),
      '{}'::text[]
    ) as image_urls,
    c.province as company_province,
    c.district as company_district,
    c.is_verified,
    exists (
      select 1 from public.campaigns ca
      where ca.company_id = p.company_id
        and ca.status = 'active'
        and (ca.target_province is null or ca.target_province = c.province)
        and (ca.target_district is null or ca.target_district = c.district)
    ) as is_sponsored
  from public.products p
  join public.companies c on c.id = p.company_id
  left join public.product_images pi on pi.product_id = p.id
  where p.publication_status = 'published'
    and p.quantity > 0
    and (max_price is null or p.price <= max_price)
    and (
      search_query is null or btrim(search_query) = ''
      or p.search_vector @@ websearch_to_tsquery('simple', search_query)
    )
    and (
      color_query is null or btrim(color_query) = ''
      or lower(coalesce(p.options::text, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.name, ''))
        like '%' || lower(color_query) || '%'
    )
    and (
      location_query is null or btrim(location_query) = ''
      or lower(coalesce(c.province, '') || ' ' || coalesce(c.district, ''))
        like '%' || lower(location_query) || '%'
    )
  group by p.id, c.name, c.whatsapp, c.logo_url, c.province, c.district, c.is_verified
  order by
    is_sponsored desc,
    c.is_verified desc,
    case when search_query is null or btrim(search_query) = '' then 0
      else ts_rank(p.search_vector, websearch_to_tsquery('simple', search_query)) end desc,
    p.created_at desc
  limit least(greatest(coalesce(result_limit, 20), 1), 50);
$$;

revoke all on function public.search_products(text, text, bigint, integer, text) from public;
grant execute on function public.search_products(text, text, bigint, integer, text) to anon, authenticated;
grant select on public.companies, public.products, public.product_images to anon, authenticated;
