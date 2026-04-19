# Two-App Architecture (Vite + Supabase)

## Apps

1. Public site (`mysite.com`):
- Path: `./` (root app)
- Purpose: read-only project portfolio
- Supabase permissions: SELECT only via RLS

2. Admin panel (`admin.mysite.com`):
- Path: `./admin-panel`
- Purpose: authenticated admin CRUD + image upload
- Supabase permissions: INSERT / UPDATE / DELETE / storage writes via RLS + admin_users checks

## Recommended Repo Strategy

1. Option A: two repositories
- Repo 1: public site (root app)
- Repo 2: admin panel (`admin-panel` app copied as standalone)

2. Option B: monorepo (current workspace)
- Keep both apps in one repo
- Configure two Vercel projects with different root directories

## Vercel Setup

1. Public app project
- Root directory: `.`
- Domain: `mysite.com`
- Build command: `npm run build`
- Output directory: `dist`

2. Admin app project
- Root directory: `admin-panel`
- Domain: `admin.mysite.com`
- Build command: `npm run build`
- Output directory: `dist`

## Environment Variables (both apps)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Admin app optional variables:

- `VITE_SUPABASE_ADMIN_USERS_TABLE` (default: `admin_users`)
- `VITE_SUPABASE_ADMIN_ALLOWED_ROLES` (default: `admin,owner,super_admin`)
- `VITE_SUPABASE_PROJECTS_TABLE` (default: `projects`)
- `VITE_SUPABASE_PROJECTS_BUCKET` (default: `projects`)

## Security Checklist

1. Keep RLS enabled on all exposed tables.
2. Ensure admin write policies require authenticated users with admin role logic.
3. Ensure `admin_users` table is correctly populated for authorized admins.
4. Block non-admin users by signing them out immediately after login in admin app.
5. Never expose service role keys to frontend apps.
