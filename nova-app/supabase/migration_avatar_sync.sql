-- MIGRACIÓN: Avatar Persistence
-- Agrega columnas para guardar el inventario y accesorios equipados en la base de datos

-- 1. Agregar columnas a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS owned_accessories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS equipped_accessories jsonb DEFAULT '{}';

-- 2. Asegurarse de que RLS permita ver y editar estas columnas (ya debería estar cubierto por las políticas existentes de profiles, pero por si acaso)
-- Normalmente profiles tiene policy "Users can update own profile".

-- Comentario:
-- owned_accessories: Lista de IDs de items comprados ['glasses1', 'hat2']
-- equipped_accessories: Objeto JSON con lo puesto actualment { "head": "hat2", "eyes": "glasses1" }
