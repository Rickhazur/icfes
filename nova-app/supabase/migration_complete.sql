-- MIGRACIÓN SEGURA: Google Classroom + Notifications
-- Ejecuta este script completo en Supabase SQL Editor

-- Paso 1: Eliminar tablas existentes si existen (para evitar conflictos)
DROP TABLE IF EXISTS google_classroom_assignments CASCADE;
DROP TABLE IF EXISTS google_classroom_courses CASCADE;
DROP TABLE IF EXISTS google_classroom_tokens CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Paso 2: Crear tabla de tokens
CREATE TABLE google_classroom_tokens (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Paso 3: Crear tabla de cursos
CREATE TABLE google_classroom_courses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  google_course_id text NOT NULL,
  name text NOT NULL,
  section text,
  description text,
  teacher_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, google_course_id)
);

-- Paso 4: Crear tabla de tareas
CREATE TABLE google_classroom_assignments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES google_classroom_courses(id) ON DELETE CASCADE NOT NULL,
  google_assignment_id text NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  max_points numeric,
  state text,
  work_type text,
  synced_to_mission boolean DEFAULT false,
  mission_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, google_assignment_id)
);

-- Paso 5: Crear tabla de notificaciones
CREATE TABLE notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('new_assignment', 'deadline_soon', 'mission_complete', 'reward_earned')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Paso 6: Crear índices para mejor performance
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_is_read_idx ON notifications(is_read);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);

-- Paso 7: Habilitar RLS en todas las tablas
ALTER TABLE google_classroom_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_classroom_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_classroom_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Paso 8: Políticas para google_classroom_tokens
CREATE POLICY "Users can view their own tokens"
  ON google_classroom_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON google_classroom_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON google_classroom_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Paso 9: Políticas para google_classroom_courses
CREATE POLICY "Users can view their own courses"
  ON google_classroom_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses"
  ON google_classroom_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Paso 10: Políticas para google_classroom_assignments
CREATE POLICY "Users can view their own assignments"
  ON google_classroom_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignments"
  ON google_classroom_assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments"
  ON google_classroom_assignments FOR UPDATE
  USING (auth.uid() = user_id);

-- Paso 11: Políticas para notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ✅ MIGRACIÓN COMPLETA
-- Ahora tienes todas las tablas necesarias para Google Classroom Sync
