-- Kitchen settings (single row) + public-safe read for later checkout

create table public.kitchen_settings (
  id smallint primary key default 1 check (id = 1),
  kitchen_name text not null default 'Maan Armada',
  whatsapp_number text,
  upi_id text,
  upi_qr_url text,
  updated_at timestamptz not null default now()
);

insert into public.kitchen_settings (id) values (1);

alter table public.kitchen_settings enable row level security;

create policy "Public read kitchen settings"
  on public.kitchen_settings for select
  using (true);

create policy "Admin update kitchen settings"
  on public.kitchen_settings for update
  using (public.is_admin());

create trigger kitchen_settings_updated_at
  before update on public.kitchen_settings
  for each row execute function public.set_updated_at();
