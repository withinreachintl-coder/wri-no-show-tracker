# PROGRESS — wri-no-show-tracker

## 2026-05-10 — Phase 1: scaffold

- Cloned from `wri-par-tracker` @ `7bf2005` (origin/main).
- Tailwind v3.4 wired with working `postcss.config.js` + `app/globals.css` `@tailwind` directives. par-tracker has Tailwind broken; this repo leads the fix.
- All UI uses Tailwind utility classes via `className`. No `style={{}}` — patch #2 from Keon.
- `users.id` has no FK to `auth.users` (par-tracker convention preserved — suspected SPEC-0013 culprit).
- `supabase/migrations/0001_init.sql` written but NOT yet applied (waiting on C1 — Supabase project create).
- `app/page.tsx` is a Phase-1 placeholder; full landing built in Phase 3.
- Awaiting C1: Supabase project create + Resend SMTP setup.
