-- TABLA: google_classroom_tokens
-- Almacena los tokens de acceso de Google Classroom por usuario
create table google_classroom_tokens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null unique,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: google_classroom_courses
-- Cursos importados de Google Classroom
create table google_classroom_courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  google_course_id text not null,
  name text not null,
  section text,
  description text,
  teacher_name text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, google_course_id)
);

-- TABLA: google_classroom_assignments
-- Tareas importadas de Google Classroom
create table google_classroom_assignments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references google_classroom_courses(id) on delete cascade not null,
  google_assignment_id text not null,
  title text not null,
  description text,
  due_date timestamp with time zone,
  max_points numeric,
  state text, -- 'PUBLISHED', 'DRAFT', 'DELETED'
  work_type text, -- 'ASSIGNMENT', 'SHORT_ANSWER_QUESTION', 'MULTIPLE_CHOICE_QUESTION'
  synced_to_mission boolean default false,
  mission_id uuid, -- Reference to created mission (if applicable)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, google_assignment_id)
);

-- POLÍTICAS DE SEGURIDAD (RLS)
alter table google_classroom_tokens enable row level security;
alter table google_classroom_courses enable row level security;
alter table google_classroom_assignments enable row level security;

create policy "Users can view their own tokens"
  on google_classroom_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tokens"
  on google_classroom_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tokens"
  on google_classroom_tokens for update
  using (auth.uid() = user_id);

create policy "Users can view their own courses"
  on google_classroom_courses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own courses"
  on google_classroom_courses for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own assignments"
  on google_classroom_assignments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own assignments"
  on google_classroom_assignments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own assignments"
  on google_classroom_assignments for update
  using (auth.uid() = user_id);
