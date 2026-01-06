-- Create table for storing ICFES questions
create table public.icfes_questions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category text not null, -- 'LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'
  question_text text not null,
  options jsonb not null, -- Array of {id: string, text: string}
  correct_answer text not null, -- The ID of the correct option (e.g., 'A')
  explanation text, -- Detailed explanation of why it is correct
  socratic_hints text[], -- Array of strings for the AI tutor
  difficulty text default 'medium', -- 'easy', 'medium', 'hard'
  source_document text -- Optional: name of the PDF source
);

-- Enable Row Level Security (RLS)
alter table public.icfes_questions enable row level security;

-- Create policy to allow read access for all authenticated users
create policy "Enable read access for authenticated users"
  on public.icfes_questions for select
  using (auth.role() = 'authenticated');

-- Create policy to allow insert/update/delete only for admins (or all auth for now to simplify)
create policy "Enable write access for authenticated users"
  on public.icfes_questions for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users"
  on public.icfes_questions for update
  using (auth.role() = 'authenticated');
