-- Meeting sessions: weekly Monday sync state per venture
create table if not exists meeting_sessions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  week_label text not null,
  agenda jsonb not null default '{}',
  synthesis jsonb default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meeting_sessions_deal_id on meeting_sessions(deal_id);

create or replace function update_meeting_sessions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_meeting_sessions_updated_at on meeting_sessions;
create trigger trg_meeting_sessions_updated_at
  before update on meeting_sessions
  for each row execute function update_meeting_sessions_updated_at();

alter table meeting_sessions enable row level security;
create policy "Allow all access to meeting_sessions" on meeting_sessions
  for all using (true) with check (true);

-- Comments: founder/VC collaboration on canvas sections
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  section_key text not null,
  author_role text not null check (author_role in ('founder', 'vc')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_deal_id on comments(deal_id);
create index if not exists idx_comments_section on comments(deal_id, section_key);

alter table comments enable row level security;
create policy "Allow all access to comments" on comments
  for all using (true) with check (true);
