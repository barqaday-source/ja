create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  video_url text not null,
  thumbnail_url text,
  caption text,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_experiences (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  text text,
  image_url text,
  video_url text,
  created_at timestamptz not null default now(),
  check (image_url is not null or video_url is not null or text is not null)
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (wishlist_id, product_id)
);

create index if not exists reels_created_idx on public.reels(created_at desc);
create index if not exists experiences_product_idx on public.customer_experiences(product_id, created_at desc);

alter table public.reels enable row level security;
alter table public.customer_experiences enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;

create policy reels_public_read on public.reels for select using (true);
create policy reels_creator_insert on public.reels for insert with check (creator_id = auth.uid());
create policy experiences_public_read on public.customer_experiences for select using (true);
create policy experiences_customer_write on public.customer_experiences for insert with check (customer_id = auth.uid());
create policy wishlists_owner_all on public.wishlists for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy wishlist_items_owner_all on public.wishlist_items for all using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.owner_id = auth.uid())) with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.owner_id = auth.uid()));
