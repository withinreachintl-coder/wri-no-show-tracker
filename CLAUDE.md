# CLAUDE.md — wri-no-show-tracker

Source spec: `SPEC-0022-no-show-tracker-v0.1.md` (in suite hub repo).
Template: cloned from `wri-par-tracker` (origin/main `7bf2005`, 2026-05-10).

## Stack
Next 14.2.35 · Supabase SSR auth · Tailwind v3.4 (working — see Tailwind rule below) · Stripe v17 · Resend
Deploy: Vercel · Domain: `tracker.wireach.tools`

## Hard rules

### Build verification before push
`npm run build` must exit 0 locally before any commit lands on a pushed branch.
Frontend repos require this — GitHub API commits do not run the build, and TSX encoding/syntax errors will commit silently and fail on Vercel.

### Tailwind utilities only — no `style={{}}`
Use Tailwind utility classes via `className`. Do not use `style={{}}` props.
Brand colors map to defaults: `stone-900` (#1C1917), `amber-600` (#D97706), `stone-50` (#FAFAF9), `stone-100` (#F5F5F4).
Fonts via `font-playfair` and `font-dmsans` utilities (defined in `tailwind.config.ts`).
44px minimum touch targets — use `min-h-[44px]`.

This repo leads the Tailwind fix that par-tracker and tip-pool still need.

### Imports
Relative imports only. No `@/*` alias.

### Schema discipline
- Migrations live in `supabase/migrations/`. Source-of-truth is git.
- `users.id` has NO FK to `auth.users(id)`. (Suspected SPEC-0013 culprit — keep par-tracker's pattern.)
- RLS uses inline subquery: `org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid())`. No `get_user_org_id()` function.

### Auth allowlist audit
Before activating auth in any environment:
1. Confirm Vercel project slug
2. Add `https://[slug]-*-with-reach-tools.vercel.app/auth/callback` to Supabase Redirect URLs
3. Add `https://tracker.wireach.tools/auth/callback`
4. Set Site URL to `https://tracker.wireach.tools`

### Entitlements gate
Single source of truth: `lib/entitlements.ts` → `canLogIncident(orgId)`.
Free tier = 10 lifetime incidents. Paid tier = unlimited.
Free signups must NOT auto-grant paid status. Verify on a clean account before ship.

### Stripe
Single price: $19/mo, 14-day trial. `client_reference_id = org_id`.
Webhook handles `checkout.session.completed` (→ `subscription_tier = 'paid'`) and `customer.subscription.deleted` (→ `'free'`).
Webhook URL is **edited, not recreated** when flipping from preview slug to apex (preserves signing secret).

## Out of scope (v0.2+)
Offline sync, broadcast email, CSV export, severity tiers beyond 3 enums, replacement tracking, Pro tier gating, suite Pro Suite dashboard integration, Twilio.
