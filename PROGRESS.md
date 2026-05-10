# PROGRESS — wri-no-show-tracker

## 2026-05-10 — Phase 1: scaffold

- Cloned from `wri-par-tracker` @ `7bf2005` (origin/main).
- Tailwind v3.4 wired with working `postcss.config.js` + `app/globals.css` `@tailwind` directives. par-tracker has Tailwind broken; this repo leads the fix.
- All UI uses Tailwind utility classes via `className`. No `style={{}}` — patch #2 from Keon.
- `users.id` has no FK to `auth.users` (par-tracker convention preserved — suspected SPEC-0013 culprit).
- `supabase/migrations/0001_init.sql` written but NOT yet applied (waiting on C1 — Supabase project create).
- `app/page.tsx` is a Phase-1 placeholder; full landing built in Phase 3.
- C1 closed: Supabase project `gtofkzmilwxrofgonsri` (us-east-2, ACTIVE_HEALTHY), migration applied (4 tables, RLS, triggers verified), `.env.local` populated with Supabase URL/anon/service_role + dedicated Resend API key (`from: noreply@wireach.tools`).

## 2026-05-10 — Phase 3: app build

- Pages built: `/` (full landing), `/dashboard`, `/workers`, `/log` (3-step flow with sticky-bottom save), `/history` (date+worker filter, top-counts panel), `/billing` (Stripe Buy Link with `client_reference_id=org_id`).
- API routes: `/api/workers` (GET, POST), `/api/workers/[id]` (PATCH), `/api/incidents` (GET, POST + entitlements gate), `/api/incidents/[id]` (PATCH for note/soft-delete), `/api/stripe/webhook` (signature verify, `checkout.session.completed`→paid, `customer.subscription.deleted`→free).
- `lib/supabase-server.ts`: server client + admin client + `getUserContext()` helper.
- `lib/entitlements.ts`: `canLogIncident(orgId)` — single source of truth, 10 lifetime free, paid unlimited.
- `lib/welcome.ts`: Resend transactional welcome wired into auth callback (non-blocking).
- `lib/stripe.ts`: lazy Stripe client + webhook secret accessor.
- All UI uses Tailwind utility classes via `className` — no `style={{}}` (Keon patch #2 enforced).
- `npm run build` exit 0 ✓ — 14 routes generated.
- Awaiting C2.5: Vercel preview deploy then manual auth allowlist update.
