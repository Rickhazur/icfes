-- TABLA: student_curriculum_plans
-- Almacena los planes de estudio subidos por los padres (PDFs, Imágenes o Texto)
create table student_curriculum_plans (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  title text not null, -- Ej: "Plan Bimestral Matemáticas Q1"
  school_name text,
  grade_level text, -- "2nd Grade", "3ro Primaria"
  start_date date,
  end_date date,
  raw_content text, -- El texto extraído por OCR/IA del PDF/Foto
  original_file_url text, -- URL en Supabase Storage
  status text default 'processing', -- 'processing', 'active', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TABLA: curriculum_topics
-- Desglose granular de los temas extraídos del plan
create table curriculum_topics (
  id uuid default uuid_generate_v4() primary key,
  plan_id uuid references student_curriculum_plans(id) on delete cascade not null,
  week_number int, -- Semana relativa del plan (1, 2, 3...)
  start_date date, -- Fecha estimada de inicio de este tema
  topic_name text not null, -- Nombre original: "Repartición de manzanas"
  mapped_internal_topic text, -- Nuestro topic: "division", "fractions", "geometry"
  description text,
  status text default 'pending' -- 'pending', 'in_progress', 'mastered'
);

-- POLÍTICAS DE SEGURIDAD (RLS)
alter table student_curriculum_plans enable row level security;
alter table curriculum_topics enable row level security;

create policy "Users can view their own children's plans"
  on student_curriculum_plans for select
  using ( auth.uid() in (
    select guardian_id from profiles where id = student_curriculum_plans.student_id
    union
    select id from profiles where id = student_curriculum_plans.student_id -- El estudiante mismo
  ));

create policy "Users can insert plans for their children"
  on student_curriculum_plans for insert
  with check ( auth.uid() in (
    select guardian_id from profiles where id = student_id
  ));

-- (Policies for topics similar to plans)
create policy "Users can view topics of their plans"
  on curriculum_topics for select
  using ( exists (
    select 1 from student_curriculum_plans 
    where student_curriculum_plans.id = curriculum_topics.plan_id
    and (
       student_curriculum_plans.student_id = auth.uid() 
       or 
       student_curriculum_plans.student_id in (select id from profiles where guardian_id = auth.uid())
    )
  ));
