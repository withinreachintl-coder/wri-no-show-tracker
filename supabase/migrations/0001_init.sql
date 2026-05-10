-- 0001_init.sql — wri-no-show-tracker v0.1
-- Pattern lifted from wri-par-tracker (no FK from users.id to auth.users)
-- RLS uses inline subquery against public.users (no get_user_org_id() function)

create extension if not exists "pgcrypto";

-- organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_email text not null unique,
  subscription_tier text default 'free',
  subscription_status text default 'trial',
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  subscription_end_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- users (id is auth.uid() — no FK constraint to auth.users; SPEC-0013 culprit)
create table public.users (
  id uuid primary key,
  org_id uuid references public.organizations(id),
  email text not null,
  name text not null,
  role text default 'admin',
  created_at timestamptz default now()
);

-- workers
create table public.workers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  role text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workers_org_active_idx on public.workers (org_id, active);

-- incidents
create type incident_type as enum ('no_show', 'late', 'left_early');

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete restrict,
  incident_date date not null,
  type incident_type not null,
  note text,
  logged_by uuid not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index incidents_org_date_idx
  on public.incidents (org_id, incident_date desc)
  where deleted_at is null;
create index incidents_worker_idx
  on public.incidents (worker_id, incident_date desc)
  where deleted_at is null;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger workers_set_updated_at
  before update on public.workers
  for each row execute function public.set_updated_at();
create trigger orgs_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- RLS
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.workers enable row level security;
alter table public.incidents enable row level security;

-- organizations
create policy org_isolation_organizations on public.organizations
  for all
  using (id in (select org_id from public.users where id = auth.uid()));
create policy owner_can_read_org on public.organizations
  for select
  using (owner_email = auth.email());

-- users
create policy user_can_read_own_row on public.users
  for select
  using (auth.uid() = id);
create policy allow_own_user_insert on public.users
  for insert
  with check (auth.uid() = id);
create policy org_isolation_users_update on public.users
  for update
  using (org_id in (select org_id from public.users u where u.id = auth.uid()));
create policy org_isolation_users_delete on public.users
  for delete
  using (org_id in (select org_id from public.users u where u.id = auth.uid()));

-- workers
create policy org_isolation_workers on public.workers
  for all
  using (org_id in (select org_id from public.users where id = auth.uid()))
  with check (org_id in (select org_id from public.users where id = auth.uid()));

-- incidents (members read non-deleted; insert with own logged_by)
create policy org_isolation_incidents_select on public.incidents
  for select
  using (
    org_id in (select org_id from public.users where id = auth.uid())
    and deleted_at is null
  );
create policy org_isolation_incidents_insert on public.incidents
  for insert
  with check (
    org_id in (select org_id from public.users where id = auth.uid())
    and logged_by = auth.uid()
  );
create policy org_isolation_incidents_update on public.incidents
  for update
  using (org_id in (select org_id from public.users where id = auth.uid()))
  with check (org_id in (select org_id from public.users where id = auth.uid()));
