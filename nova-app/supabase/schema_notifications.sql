-- TABLA: notifications
-- Sistema de notificaciones para usuarios
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('new_assignment', 'deadline_soon', 'mission_complete', 'reward_earned')),
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para mejor performance
create index notifications_user_id_idx on notifications(user_id);
create index notifications_is_read_idx on notifications(is_read);
create index notifications_created_at_idx on notifications(created_at desc);

-- RLS Policies
alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on notifications for insert
  with check (true);
