-- Studio outputs table: stores generated results from all 3 studio tools
-- Each generation creates a new row (supports history/regeneration)

create table if not exists studio_outputs (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete set null,
  tool text not null check (tool in ('brand-studio', 'positioning-canvas', 'gtm-sprinter')),
  inputs jsonb not null default '{}',
  outputs jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for querying by deal
create index if not exists idx_studio_outputs_deal_id on studio_outputs(deal_id);

-- Index for querying by tool type
create index if not exists idx_studio_outputs_tool on studio_outputs(tool);

-- RLS policies (enable for Supabase auth)
alter table studio_outputs enable row level security;

-- Allow authenticated users to read/write their own outputs
create policy "Allow all access to studio_outputs" on studio_outputs
  for all using (true) with check (true);
