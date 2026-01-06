/*
  FIX GOOGLE CLASSROOM MISSIONS
  Agrega columna para rastrear recompensas reclamadas.
*/

ALTER TABLE google_classroom_assignments ADD COLUMN IF NOT EXISTS reward_claimed boolean DEFAULT false;
ALTER TABLE google_classroom_assignments ADD COLUMN IF NOT EXISTS submission_state text DEFAULT 'NEW';

-- Permitir que el usuario actualice esta columna (ya cubierto por la política de update genérica, pero asegurémonos)
-- La política existente es: "Users can update their own assignments" USING (auth.uid() = user_id);
-- Eso es suficiente.

