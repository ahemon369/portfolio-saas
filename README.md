# Premium Developer Portfolio Platform

High-end React + Vite portfolio with SaaS-grade motion, Supabase-backed project management, and production-focused admin security.

## Stack

- React + Vite
- Tailwind CSS + custom design tokens
- Framer Motion
- Supabase (Auth, Database, Storage)
- React Router (`/`, `/admin/login`, `/admin`)

## Security Model

- Admin authentication is Supabase Auth only.
- Admin authorization is role-based via the `admin_users` table.
- Admin route guard redirects unauthenticated users to `/admin/login`.
- Admin service actions are protected with session + role checks.
- Client-side rate limiting is applied for login and admin mutations.

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Create local env file.

```bash
cp .env.example .env
```

3. Fill required variables.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PROJECTS_TABLE` (default: `projects`)
- `VITE_SUPABASE_PROJECTS_BUCKET` (default: `projects`)
- `VITE_SUPABASE_ADMIN_USERS_TABLE` (default: `admin_users`)
- `VITE_SUPABASE_ADMIN_ALLOWED_ROLES` (default: `admin,owner,super_admin`)

4. Run development server.

```bash
npm run dev
```

5. Validate production build.

```bash
npm run build
```

## Recommended Supabase Tables

### `projects`

Recommended columns:

- `id` (uuid or serial primary key)
- `title` (text)
- `description` (text)
- `tech` (text[] or text)
- `live` (text, nullable)
- `github` (text, nullable)
- `image` (text, nullable)
- `created_at` (timestamp with time zone, default now)
- `deleted_at` (timestamp with time zone, nullable, optional soft delete)

### `admin_users`

Recommended columns:

- `user_id` (uuid, references `auth.users.id`)
- `role` (text)
- `is_active` (boolean, default true)

### Optional: activity logs

If `VITE_SUPABASE_ACTIVITY_LOG_TABLE` is configured, the app attempts to log admin mutations.

## Production Hardening Notes

- Keep RLS enabled for all exposed tables.
- Ensure only admin users can mutate `projects`.
- Keep short JWT expiration for sensitive admin operations.
- Use backend rate limiting for true abuse protection (Edge Function or API gateway).

Suggested backend rate-limit keys:

- `admin-login:{ip}`
- `admin-write:{user_id}`
- `admin-upload:{user_id}`

## Deployment (Vercel)

`vercel.json` includes:

- SPA rewrites for route refresh support
- baseline security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)

Set these variables in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PROJECTS_TABLE`
- `VITE_SUPABASE_PROJECTS_BUCKET`
- `VITE_SUPABASE_ADMIN_USERS_TABLE`
- `VITE_SUPABASE_ADMIN_ALLOWED_ROLES`
- `VITE_ENABLE_SOFT_DELETE` (`true` to use soft delete)
- `VITE_SUPABASE_ACTIVITY_LOG_TABLE` (optional)

## Domain + HTTPS Checklist

1. Add production domain in Vercel project settings.
2. Verify SSL certificate is issued and active.
3. Force HTTPS redirects at edge.
4. Register production origin in Supabase Auth URL allowlist.
5. Register `/admin/login` and `/admin` callback/redirect URLs if needed.
6. Verify CORS and API origins match production domain.
