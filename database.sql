-- 1. Create the rooms table
create table public.rooms (
  id text primary key,
  host_id text not null,
  settings jsonb not null default '{"mafias": 1, "villagers": 3, "doctors": 0, "detectives": 0}'::jsonb,
  status text not null default 'lobby',
  god_id text
);

-- 2. Create the players table
create table public.players (
  id text primary key, -- We will generate a unique client ID in the frontend
  room_id text references public.rooms(id) on delete cascade,
  username text not null,
  role text,
  is_god boolean default false
);

-- 3. Disable Row Level Security (RLS) since players don't have authenticated accounts
alter table public.rooms disable row level security;
alter table public.players disable row level security;

-- 4. Enable Realtime for both tables so the game updates instantly
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
