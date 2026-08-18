-- Used by the login page to hide Create account after the first kitchen user exists.

create or replace function public.admin_exists()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where role = 'admin'
  );
$$;

grant execute on function public.admin_exists() to anon, authenticated;
