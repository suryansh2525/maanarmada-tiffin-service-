-- Maan Armada Tiffin — Phase 1 schema
-- Meal slots: breakfast, lunch, dinner
-- Weekly menu template + optional daily overrides

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type public.user_role as enum ('customer', 'admin', 'delivery');
create type public.meal_slot as enum ('breakfast', 'lunch', 'dinner');

-- ─── Profiles (extends auth.users) ─────────────────────────────────────────

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Meal slot config (cutoff times — used in later phases) ────────────────

create table public.meal_slot_config (
  meal_slot public.meal_slot primary key,
  label text not null,
  cutoff_time time not null,
  sort_order smallint not null default 0
);

insert into public.meal_slot_config (meal_slot, label, cutoff_time, sort_order) values
  ('breakfast', 'Breakfast', '08:00', 1),
  ('lunch',     'Lunch',     '11:00', 2),
  ('dinner',    'Dinner',    '18:00', 3);

-- ─── Menu items (reusable catalogue) ───────────────────────────────────────

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Weekly menu template (admin sets Mon–Sun per meal slot) ─────────────────
-- day_of_week: 0 = Sunday, 6 = Saturday (matches JS Date.getDay())

create table public.weekly_menu_items (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  meal_slot public.meal_slot not null,
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (day_of_week, meal_slot, menu_item_id)
);

create index weekly_menu_items_lookup on public.weekly_menu_items (day_of_week, meal_slot);

-- ─── Daily menu overrides (special days / manual publish) ────────────────────
-- When rows exist for a date+slot, they replace the weekly template for that slot.

create table public.daily_menu_items (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  meal_slot public.meal_slot not null,
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  is_available boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (date, meal_slot, menu_item_id)
);

create index daily_menu_items_lookup on public.daily_menu_items (date, meal_slot);

-- ─── Helper: resolve menu for a given date ───────────────────────────────────

create or replace function public.get_menu_for_date(p_date date)
returns table (
  meal_slot public.meal_slot,
  menu_item_id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  sort_order smallint,
  source text
)
language sql
stable
as $$
  -- Daily overrides per slot
  with daily as (
    select
      d.meal_slot,
      d.menu_item_id,
      d.sort_order,
      'daily' as source
    from public.daily_menu_items d
    join public.menu_items m on m.id = d.menu_item_id
    where d.date = p_date
      and d.is_available
      and m.is_active
  ),
  slots_with_daily as (
    select distinct meal_slot from daily
  ),
  weekly as (
    select
      w.meal_slot,
      w.menu_item_id,
      w.sort_order,
      'weekly' as source
    from public.weekly_menu_items w
    join public.menu_items m on m.id = w.menu_item_id
    where w.day_of_week = extract(dow from p_date)::smallint
      and m.is_active
      and w.meal_slot not in (select meal_slot from slots_with_daily)
  ),
  combined as (
    select * from daily
    union all
    select * from weekly
  )
  select
    c.meal_slot,
    c.menu_item_id,
    m.name,
    m.description,
    m.price,
    m.image_url,
    c.sort_order,
    c.source
  from combined c
  join public.menu_items m on m.id = c.menu_item_id
  order by c.meal_slot, c.sort_order, m.name;
$$;

-- ─── Row Level Security ──────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.meal_slot_config enable row level security;
alter table public.menu_items enable row level security;
alter table public.weekly_menu_items enable row level security;
alter table public.daily_menu_items enable row level security;

-- Helper: is admin or delivery
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'delivery')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Staff read all profiles"
  on public.profiles for select
  using (public.is_staff());

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Meal slot config — public read
create policy "Public read meal slots"
  on public.meal_slot_config for select
  using (true);

create policy "Admin manage meal slots"
  on public.meal_slot_config for all
  using (public.is_admin());

-- Menu items — public read active, admin write
create policy "Public read active menu items"
  on public.menu_items for select
  using (is_active = true);

create policy "Staff read all menu items"
  on public.menu_items for select
  using (public.is_staff());

create policy "Admin insert menu items"
  on public.menu_items for insert
  with check (public.is_admin());

create policy "Admin update menu items"
  on public.menu_items for update
  using (public.is_admin());

create policy "Admin delete menu items"
  on public.menu_items for delete
  using (public.is_admin());

-- Weekly menu — public read, admin write
create policy "Public read weekly menu"
  on public.weekly_menu_items for select
  using (true);

create policy "Admin manage weekly menu"
  on public.weekly_menu_items for all
  using (public.is_admin());

-- Daily menu — public read available, admin write
create policy "Public read daily menu"
  on public.daily_menu_items for select
  using (is_available = true);

create policy "Staff read all daily menu"
  on public.daily_menu_items for select
  using (public.is_staff());

create policy "Admin manage daily menu"
  on public.daily_menu_items for all
  using (public.is_admin());

-- ─── Updated_at trigger ──────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();
