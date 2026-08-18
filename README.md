# Maan Armada — Tiffin / Cloud Kitchen Platform

Phase 1: menu catalogue, weekly menu template, customer today's menu, admin dashboard.

## Stack

- **Next.js 16** (App Router)
- **Supabase** (PostgreSQL, Auth, RLS)
- **Tailwind CSS 4** with shared design tokens

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in **SQL Editor**:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Create an admin user:
   - Authentication → Users → Add user (email + password)
   - SQL Editor:
     ```sql
     update public.profiles
     set role = 'admin'
     where id = '<user-uuid-from-auth-users>';
     ```

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Run locally

```bash
npm install
npm run dev
```

- Customer site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Brand colours

Edit CSS variables in `src/app/globals.css`:

```css
--brand-primary: #c45c26;
--brand-secondary: #2d5a3d;
/* ... */
```

All customer and admin UI reads from the same tokens.

## Schema overview

| Table | Purpose |
|-------|---------|
| `profiles` | User roles: customer, admin, delivery |
| `menu_items` | Reusable dish catalogue |
| `weekly_menu_items` | Day-of-week + meal slot assignments |
| `daily_menu_items` | Per-date overrides (Phase 1 schema, UI later) |
| `meal_slot_config` | Breakfast / lunch / dinner cutoff times |

Menu resolution: `get_menu_for_date(date)` — daily overrides win per slot, else weekly template.

## Routes

| Path | Access |
|------|--------|
| `/` | Public — today's menu |
| `/admin/login` | Staff sign-in |
| `/admin` | Dashboard |
| `/admin/menu-items` | CRUD catalogue |
| `/admin/weekly-menu` | Weekly template builder |
