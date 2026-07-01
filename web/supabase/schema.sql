-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Companies ──────────────────────────────────────────────────────────────
create table companies (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  email              text not null unique,
  website            text,
  logo_url           text,
  stripe_customer_id text,
  approved_at        timestamptz,
  created_at         timestamptz default now()
);

alter table companies enable row level security;

-- Users can only read/update their own company row
create policy "company: read own" on companies
  for select using (auth.jwt() ->> 'email' = email);

create policy "company: update own" on companies
  for update using (auth.jwt() ->> 'email' = email);

-- ── Deals ──────────────────────────────────────────────────────────────────
create table deals (
  id                 text primary key,  -- slug e.g. "supabase-3mo-free"
  company_id         uuid references companies(id) on delete cascade not null,
  title              text not null,
  description        text not null,
  category           text not null,
  tags               text[] not null default '{}',
  value_description  text not null,
  landing_url        text not null,
  cost_per_claim     numeric(10,2) not null default 0,
  budget_cap         numeric(10,2),
  is_active          boolean not null default false,
  is_featured        boolean not null default false,
  submitted_at       timestamptz default now(),
  approved_at        timestamptz,
  expires_at         timestamptz
);

alter table deals enable row level security;

-- Public: anyone can read active deals (for the API)
create policy "deals: read active" on deals
  for select using (is_active = true);

-- Partners: read own company's deals (including pending)
create policy "deals: partner read own" on deals
  for select using (
    company_id in (
      select id from companies where email = auth.jwt() ->> 'email'
    )
  );

-- Partners: insert deals for their company
create policy "deals: partner insert" on deals
  for insert with check (
    company_id in (
      select id from companies where email = auth.jwt() ->> 'email'
    )
  );

-- ── Claims ─────────────────────────────────────────────────────────────────
create table claims (
  id             uuid primary key default gen_random_uuid(),
  deal_id        text references deals(id) on delete cascade not null,
  claimed_at     timestamptz default now(),
  redirected_at  timestamptz,
  charged_at     timestamptz,
  amount_charged numeric(10,2)
);

alter table claims enable row level security;

-- Only service role can write claims (no RLS bypass needed for reads via API)
-- Partners can read claim counts for their deals
create policy "claims: partner read own" on claims
  for select using (
    deal_id in (
      select id from deals where company_id in (
        select id from companies where email = auth.jwt() ->> 'email'
      )
    )
  );

-- ── Indexes ────────────────────────────────────────────────────────────────
create index on deals (is_active, is_featured);
create index on deals (company_id);
create index on claims (deal_id);
create index on claims (claimed_at);
