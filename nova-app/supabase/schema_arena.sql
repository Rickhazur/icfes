-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Quests Table
create table if not exists public.quests (
  id uuid default uuid_generate_v4() primary key,
  title_en text not null,
  title_es text not null,
  description_en text not null,
  description_es text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  category text not null,
  reward_coins int not null default 0,
  reward_xp int not null default 0,
  duration_minutes int not null default 5,
  icon text not null,
  dba_reference text,
  min_grade int not null default 1,
  max_grade int not null default 5,
  challenge_data jsonb, -- Stores the { type, question: {en, es}, options: [], correctOptionId, hint: {en, es} }
  created_at timestamptz default now()
);

-- 2. Create User Quest Progress Table
create table if not exists public.user_quest_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete cascade not null,
  completed_at timestamptz default now(),
  unique(user_id, quest_id) -- User can only complete a quest once (for now)
);

-- 3. Enable RLS
alter table public.quests enable row level security;
alter table public.user_quest_progress enable row level security;

-- 4. RLS Policies
-- Quests are readable by everyone, but only writable by service_role (admins)
create policy "Quests are viewable by everyone" on public.quests
  for select using (true);

-- User Progress is readable by the user themselves
create policy "Users can view their own progress" on public.user_quest_progress
  for select using (auth.uid() = user_id);

-- Users can insert their own completion records
create policy "Users can mark quests as complete" on public.user_quest_progress
  for insert with check (auth.uid() = user_id);

-- 5. Seed some initial data (Optional but helpful test data)
-- You can run the seed script separately to populate this.
