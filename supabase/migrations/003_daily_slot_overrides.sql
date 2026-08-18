-- Empty overrides: a slot can be overridden with zero items (kitchen closed that meal)

create table public.daily_slot_overrides (
  date date not null,
  meal_slot public.meal_slot not null,
  created_at timestamptz not null default now(),
  primary key (date, meal_slot)
);

alter table public.daily_slot_overrides enable row level security;

create policy "Public read daily slot overrides"
  on public.daily_slot_overrides for select
  using (true);

create policy "Admin manage daily slot overrides"
  on public.daily_slot_overrides for all
  using (public.is_admin());

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
  with slots_with_daily as (
    select meal_slot
    from public.daily_slot_overrides
    where date = p_date
  ),
  daily as (
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
      and d.meal_slot in (select meal_slot from slots_with_daily)
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
