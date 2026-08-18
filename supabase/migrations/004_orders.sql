-- Orders & subscriptions — no wallet.
-- Payment truth lives on order status. WhatsApp is proof, not state.

create type public.order_type as enum (
  'one_off',
  'subscription_cycle',
  'subscription_delivery'
);

create type public.order_status as enum (
  'awaiting_payment',
  'payment_claimed',
  'confirmed',
  'done',
  'closed',
  'rejected'
);

create type public.plan_type as enum ('weekly', 'monthly');

create type public.subscription_status as enum (
  'pending_payment',
  'active',
  'paused',
  'cancelled'
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  plan_type public.plan_type not null,
  meal_slots public.meal_slot[] not null,
  current_cycle_start date,
  current_cycle_end date,
  status public.subscription_status not null default 'pending_payment',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  customer_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  order_type public.order_type not null,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  amount numeric(10, 2) not null check (amount >= 0),
  status public.order_status not null default 'awaiting_payment',
  delivery_date date not null,
  meal_slot public.meal_slot,
  notes text,
  claimed_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  meal_slot public.meal_slot not null,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);

create index orders_status_idx on public.orders (status);
create index orders_delivery_date_idx on public.orders (delivery_date, status);
create index order_items_order_id_idx on public.order_items (order_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Guest checkout: create an unpaid order, then claim payment from the pay page.
create policy "Public insert awaiting payment orders"
  on public.orders for insert
  with check (status = 'awaiting_payment');

create policy "Public read orders"
  on public.orders for select
  using (true);

create policy "Public claim payment"
  on public.orders for update
  using (status = 'awaiting_payment')
  with check (status = 'payment_claimed');

create policy "Admin manage orders"
  on public.orders for all
  using (public.is_admin());

create policy "Public insert order items"
  on public.order_items for insert
  with check (true);

create policy "Public read order items"
  on public.order_items for select
  using (true);

create policy "Admin manage order items"
  on public.order_items for all
  using (public.is_admin());

create policy "Public read subscriptions"
  on public.subscriptions for select
  using (true);

create policy "Admin manage subscriptions"
  on public.subscriptions for all
  using (public.is_admin());
