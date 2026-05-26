// lib/limits.ts
//
// SPEC-0026 free-tier cap map — SINGLE SOURCE OF TRUTH.
//
// Client-safe leaf: NO server imports (no getAdminClient / next/headers). Both the
// server gate (lib/entitlements.ts) and the client hook (lib/useEntitlements.ts)
// import FREE_LIMITS from here, so the value can cross the server/client boundary
// without pulling server-only code into the client bundle.
//
// resource 'workers' = SPEC-0026 'org_employees'; repo table is `workers`, counted
// where active = true.
export const FREE_LIMITS = { workers: 5 }
export type FreeLimits = typeof FREE_LIMITS
