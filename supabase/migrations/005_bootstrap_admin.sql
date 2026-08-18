-- First signed-in user becomes kitchen admin. Later users cannot self-promote.

create or replace function public.bootstrap_admin()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1 from public.profiles
    where role = 'admin' and id <> auth.uid()
  ) then
    raise exception 'An admin account already exists';
  end if;

  update public.profiles
  set role = 'admin'
  where id = auth.uid();
end;
$$;

grant execute on function public.bootstrap_admin() to authenticated;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    if exists (
      select 1 from public.profiles
      where role = 'admin' and id <> new.id
    ) then
      if not exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      ) then
        raise exception 'Cannot change role';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();
