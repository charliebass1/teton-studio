-- Canvas sections: living document per venture (deal) with 8 sections
-- Each section has current content + status. History kept via updated_at timestamps.

create table if not exists canvas_sections (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  section_key text not null check (section_key in (
    'problem', 'insight', 'solution', 'customers', 'mvp',
    'positioning', 'brand', 'gtm'
  )),
  content text not null default '',
  status text not null default 'empty' check (status in ('empty', 'in_progress', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (deal_id, section_key)
);

-- Index for looking up all sections of a venture
create index if not exists idx_canvas_sections_deal_id on canvas_sections(deal_id);

-- Trigger to auto-update updated_at
create or replace function update_canvas_sections_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_canvas_sections_updated_at on canvas_sections;
create trigger trg_canvas_sections_updated_at
  before update on canvas_sections
  for each row execute function update_canvas_sections_updated_at();

-- RLS
alter table canvas_sections enable row level security;
create policy "Allow all access to canvas_sections" on canvas_sections
  for all using (true) with check (true);
