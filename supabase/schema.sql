create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists wax_min_grams numeric(12,2);
alter table public.products add column if not exists wax_max_grams numeric(12,2);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  sold_at timestamptz not null default now(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  amount numeric(12,2) not null,
  quantity numeric(12,2) not null default 1,
  channel text not null,
  payment_method text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  spent_at date not null default current_date,
  category text not null,
  amount numeric(12,2) not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  stock numeric(12,3) not null default 0,
  min_stock numeric(12,3) not null default 0,
  average_cost numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  instagram text,
  phone text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_products (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null default 0,
  unit text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  purchased_at date not null default current_date,
  partner_id uuid references public.partners(id) on delete set null,
  supplier_name text,
  material_id uuid references public.materials(id) on delete set null,
  quantity numeric(12,3) not null,
  unit text,
  unit_price numeric(12,2) not null,
  total numeric(12,2) generated always as (quantity * unit_price) stored,
  payment_method text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.purchases add column if not exists supplier_name text;
alter table public.purchases add column if not exists unit text;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_id uuid references public.products(id) on delete set null,
  version text not null default '1.0',
  yield_quantity numeric(12,2) not null default 1,
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists public.recipe_items (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete restrict,
  quantity numeric(12,3) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.production_batches (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete set null,
  produced_at date not null default current_date,
  quantity numeric(12,2) not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.production_batches add column if not exists unit_cost numeric(12,2) not null default 0;

alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.materials enable row level security;
alter table public.partners enable row level security;
alter table public.partner_products enable row level security;
alter table public.purchases enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_items enable row level security;
alter table public.production_batches enable row level security;

-- Single-user MVP policies. Replace with auth.uid()-based policies before team access.
create policy "single user products" on public.products for all using (true) with check (true);
create policy "single user sales" on public.sales for all using (true) with check (true);
create policy "single user expenses" on public.expenses for all using (true) with check (true);
create policy "single user materials" on public.materials for all using (true) with check (true);
create policy "single user partners" on public.partners for all using (true) with check (true);
create policy "single user partner products" on public.partner_products for all using (true) with check (true);
create policy "single user purchases" on public.purchases for all using (true) with check (true);
create policy "single user recipes" on public.recipes for all using (true) with check (true);
create policy "single user recipe items" on public.recipe_items for all using (true) with check (true);
create policy "single user production" on public.production_batches for all using (true) with check (true);
