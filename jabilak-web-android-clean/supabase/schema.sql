-- مخطط Supabase المقترح لتطبيق تاجر
-- هذا الملف للتحضير والمراجعة فقط. لا يتم تشغيله تلقائياً من التطبيق.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'merchant', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  slug text not null unique,
  logo_url text,
  cover_url text,
  description text,
  category text,
  province text,
  district text,
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  phone text,
  whatsapp text,
  email text,
  website text,
  is_verified boolean not null default false,
  verification_status text not null default 'not_started' check (verification_status in ('not_started', 'under_review', 'verified', 'needs_changes')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  description text,
  price bigint not null check (price >= 0),
  previous_price bigint check (previous_price is null or previous_price >= 0),
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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  subtotal bigint not null check (subtotal >= 0),
  delivery_fee bigint not null default 0 check (delivery_fee >= 0),
  discount bigint not null default 0 check (discount >= 0),
  total bigint not null check (total >= 0),
  delivery_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total bigint not null check (line_total >= 0)
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  total_amount bigint not null check (total_amount >= 0),
  paid_amount bigint not null default 0 check (paid_amount >= 0),
  status text not null default 'open' check (status in ('open', 'partially_paid', 'paid', 'overdue')),
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount bigint not null check (amount > 0),
  note text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price bigint not null check (price >= 0),
  currency text not null default 'IQD',
  duration_days integer not null check (duration_days > 0),
  product_limit integer not null check (product_limit >= 0),
  ad_limit integer not null check (ad_limit >= 0),
  features jsonb not null default '[]'::jsonb,
  is_recommended boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  status text not null default 'pending' check (status in ('active', 'expired', 'cancelled', 'pending')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  campaign_id uuid,
  amount bigint not null check (amount >= 0),
  currency text not null default 'IQD',
  provider text not null,
  provider_reference text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  type text not null check (type in ('product', 'company', 'promotion')),
  title text not null,
  description text,
  image_url text,
  target_province text,
  target_district text,
  target_category text,
  target_age_min integer,
  target_age_max integer,
  interests jsonb not null default '[]'::jsonb,
  daily_budget bigint not null check (daily_budget >= 0),
  total_budget bigint not null check (total_budget >= 0),
  duration_days integer not null check (duration_days > 0),
  payment_id uuid references public.payments(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'pending_payment', 'pending_review', 'active', 'paused', 'rejected', 'finished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments add constraint payments_campaign_fk foreign key (campaign_id) references public.campaigns(id) on delete set null;

create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  company_type text not null check (company_type in ('individual', 'registered_company', 'store', 'service_provider')),
  status text not null default 'not_started' check (status in ('not_started', 'under_review', 'verified', 'needs_changes')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists products_company_idx on public.products(company_id);
create index if not exists products_search_idx on public.products using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(sku, '')));
create index if not exists orders_company_idx on public.orders(company_id, created_at desc);
create index if not exists orders_customer_idx on public.orders(customer_id, created_at desc);
create index if not exists debts_company_idx on public.debts(company_id, created_at desc);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

create or replace function public.is_company_owner(company_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies
    where id = company_uuid and owner_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.campaigns enable row level security;
alter table public.verification_requests enable row level security;
alter table public.notifications enable row level security;

create policy profiles_self_select on public.profiles for select using (id = auth.uid());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy companies_public_select on public.companies for select using (true);
create policy companies_owner_insert on public.companies for insert with check (owner_id = auth.uid());
create policy companies_owner_update on public.companies for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy companies_owner_delete on public.companies for delete using (owner_id = auth.uid());

create policy products_public_select on public.products for select using (publication_status = 'published' or public.is_company_owner(company_id));
create policy products_owner_insert on public.products for insert with check (public.is_company_owner(company_id));
create policy products_owner_update on public.products for update using (public.is_company_owner(company_id)) with check (public.is_company_owner(company_id));
create policy products_owner_delete on public.products for delete using (public.is_company_owner(company_id));

create policy product_images_public_select on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.publication_status = 'published' or public.is_company_owner(p.company_id))));
create policy product_images_owner_write on public.product_images for all using (exists (select 1 from public.products p where p.id = product_id and public.is_company_owner(p.company_id))) with check (exists (select 1 from public.products p where p.id = product_id and public.is_company_owner(p.company_id)));

create policy orders_participants_select on public.orders for select using (customer_id = auth.uid() or public.is_company_owner(company_id));
create policy orders_customer_insert on public.orders for insert with check (customer_id = auth.uid());
create policy orders_owner_update on public.orders for update using (public.is_company_owner(company_id));
create policy order_items_participants_select on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_company_owner(o.company_id))));
create policy order_items_customer_insert on public.order_items for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create policy debts_owner_all on public.debts for all using (public.is_company_owner(company_id)) with check (public.is_company_owner(company_id));
create policy debt_payments_owner_all on public.debt_payments for all using (exists (select 1 from public.debts d where d.id = debt_id and public.is_company_owner(d.company_id))) with check (exists (select 1 from public.debts d where d.id = debt_id and public.is_company_owner(d.company_id)));

create policy plans_public_select on public.subscription_plans for select using (active = true);
create policy subscriptions_owner_select on public.subscriptions for select using (public.is_company_owner(company_id));
create policy payments_owner_select on public.payments for select using (public.is_company_owner(company_id));
create policy campaigns_owner_all on public.campaigns for all using (public.is_company_owner(company_id)) with check (public.is_company_owner(company_id));
create policy verification_owner_all on public.verification_requests for all using (public.is_company_owner(company_id)) with check (public.is_company_owner(company_id));
create policy notifications_self_all on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- أنشئ buckets من لوحة Supabase كـ private:
-- avatars, company-media, product-media, campaign-media, verification-documents
-- لا تجعل verification-documents publicاً. استخدم signed URLs من الخادم بعد التحقق من المالك.

create policy storage_public_media_read on storage.objects for select using (bucket_id in ('avatars', 'company-media', 'product-media', 'campaign-media'));
create policy storage_owner_media_insert on storage.objects for insert with check (
  (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  or (bucket_id in ('company-media', 'product-media', 'campaign-media', 'verification-documents')
      and public.is_company_owner(((storage.foldername(name))[1])::uuid))
);
create policy storage_owner_media_update on storage.objects for update using (
  bucket_id in ('avatars', 'company-media', 'product-media', 'campaign-media', 'verification-documents')
  and owner_id = auth.uid()
);
create policy storage_owner_media_delete on storage.objects for delete using (
  bucket_id in ('avatars', 'company-media', 'product-media', 'campaign-media', 'verification-documents')
  and owner_id = auth.uid()
);


-- Social messaging and calls (prepared only; do not run automatically)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  kind text not null default 'direct' check (kind in ('direct', 'group')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  is_muted boolean not null default false,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  kind text not null check (kind in ('text', 'image', 'voice')),
  body text,
  attachment_path text,
  attachment_url text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  caller_id uuid not null references public.profiles(id) on delete restrict,
  callee_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null default 'agora' check (provider in ('agora')),
  channel_name text not null,
  status text not null default 'ringing' check (status in ('ringing', 'connecting', 'connected', 'ended', 'missed', 'declined')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists conversation_members_user_idx on public.conversation_members(user_id, joined_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at asc);
create index if not exists call_sessions_participants_idx on public.call_sessions(caller_id, callee_id, created_at desc);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.call_sessions enable row level security;

create policy conversations_member_select on public.conversations for select using (
  exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = auth.uid())
);
create policy conversations_creator_insert on public.conversations for insert with check (created_by = auth.uid());
create policy conversations_creator_update on public.conversations for update using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy conversation_members_participant_select on public.conversation_members for select using (
  user_id = auth.uid() or exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid())
);
create policy conversation_members_self_insert on public.conversation_members for insert with check (
  user_id = auth.uid() or exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid())
);
create policy conversation_members_self_update on public.conversation_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy messages_participant_select on public.messages for select using (
  exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid())
);
create policy messages_participant_insert on public.messages for insert with check (
  sender_id = auth.uid() and exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid())
);
create policy messages_sender_update on public.messages for update using (sender_id = auth.uid()) with check (sender_id = auth.uid());
create policy messages_sender_delete on public.messages for delete using (sender_id = auth.uid());

create policy call_sessions_participant_select on public.call_sessions for select using (caller_id = auth.uid() or callee_id = auth.uid());
create policy call_sessions_caller_insert on public.call_sessions for insert with check (caller_id = auth.uid());
create policy call_sessions_participant_update on public.call_sessions for update using (caller_id = auth.uid() or callee_id = auth.uid()) with check (caller_id = auth.uid() or callee_id = auth.uid());

-- Create this bucket from the Supabase dashboard as private:
-- chat-media
-- Recommended object path: {conversation_id}/{sender_id}/{uuid}.{extension}
create policy chat_media_member_read on storage.objects for select using (
  bucket_id = 'chat-media' and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = ((storage.foldername(name))[1])::uuid and cm.user_id = auth.uid()
  )
);
create policy chat_media_member_insert on storage.objects for insert with check (
  bucket_id = 'chat-media' and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = ((storage.foldername(name))[1])::uuid and cm.user_id = auth.uid()
  )
);

-- Enable the messages table in Supabase Realtime from the dashboard or migration after review:
-- alter publication supabase_realtime add table public.messages;


-- Safe deletion preparation (review before applying in a real Supabase project)
-- Messages can only be deleted by their sender; conversations can only be deleted by their creator.
create policy conversations_creator_delete on public.conversations for delete using (created_by = auth.uid());

-- The app should call protected server procedures for account deletion so storage objects,
-- profile data, posts, messages, notifications, and auth.users are removed in a controlled order.
-- Do not expose a service-role key in the mobile client. Implement this as a server-side
-- Edge Function or protected backend procedure after reviewing retention and legal requirements.

-- Example server-side deletion order (documentation only; do not run from the client):
-- delete from public.messages where sender_id = target_user_id;
-- delete from public.notifications where user_id = target_user_id;
-- delete from public.conversation_members where user_id = target_user_id;
-- delete from public.profiles where id = target_user_id;
-- delete storage.objects where owner = target_user_id;
-- delete auth.users where id = target_user_id;


-- أبو العريف: بحث المنتجات النصي المباشر عبر Postgres Full-Text Search.
-- يُنفذ هذا القسم يدوياً في SQL Editor بعد مراجعة سياسات RLS.
alter table public.products
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector(
      'simple',
      coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(options::text, '')
    )
  ) stored;

create index if not exists products_search_vector_idx
  on public.products using gin (search_vector);

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
security invoker
set search_path = public
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
      select 1
      from public.campaigns ca
      where ca.company_id = p.company_id
        and ca.status = 'active'
        and ca.type in ('promotion', 'product')
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
      search_query is null
      or btrim(search_query) = ''
      or p.search_vector @@ websearch_to_tsquery('simple', search_query)
    )
    and (
      color_query is null
      or btrim(color_query) = ''
      or lower(coalesce(p.options::text, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.name, '')) like '%' || lower(color_query) || '%'
    )
    and (
      location_query is null
      or btrim(location_query) = ''
      or lower(coalesce(c.province, '') || ' ' || coalesce(c.district, '')) like '%' || lower(location_query) || '%'
    )
  group by p.id, c.name, c.whatsapp, c.logo_url, c.province, c.district, c.is_verified
  order by
    is_sponsored desc,
    c.is_verified desc,
    case when search_query is null or btrim(search_query) = '' then 0 else ts_rank(p.search_vector, websearch_to_tsquery('simple', search_query)) end desc,
    p.created_at desc
  limit least(greatest(coalesce(result_limit, 20), 1), 50);
$$;
