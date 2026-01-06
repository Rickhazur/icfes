/* 
  MIGRACIÓN DE GAMIFICACIÓN - REPARACIÓN FINAL (Intento 4)
  Este script agrega absolutamente todas las columnas potenciales para evitar errores de legado.
*/

-- 1. Tabla store_items
CREATE TABLE IF NOT EXISTS store_items (
    id text PRIMARY KEY,
    name text NOT NULL,
    cost integer NOT NULL
);

-- Inyectar columnas faltantes una por una (Defensive Coding)
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS type text DEFAULT 'misc';
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS rarity text DEFAULT 'common';
ALTER TABLE store_items ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Habilitar RLS
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view store items" ON store_items;
CREATE POLICY "Anyone can view store items" ON store_items FOR SELECT USING (true);


-- 2. Data Inicial
INSERT INTO store_items (id, name, description, cost, type, icon) VALUES
('acc_glasses_1', 'Gafas Nerd', 'Para ver mejor las respuestas', 50, 'eyes', '🤓'),
('acc_hat_1', 'Gorra Cool', 'Estilo urbano', 75, 'head', '🧢'),
('acc_crown_1', 'Corona Real', 'Solo para reyes de la mates', 500, 'head', '👑'),
('acc_cape_1', 'Capa de Héroe', 'Vuela por las lecciones', 200, 'back', '🦸'),
('acc_pet_1', 'Gato Robot', 'Miau.exe', 300, 'pet', '🐱‍👤')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    cost = EXCLUDED.cost,
    type = EXCLUDED.type,
    icon = EXCLUDED.icon;


-- 3. Tabla Economy
CREATE TABLE IF NOT EXISTS economy (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    coins integer DEFAULT 100,
    gems integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE economy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own economy" ON economy;
CREATE POLICY "Users can view own economy" ON economy FOR SELECT USING (auth.uid() = user_id);

-- 4. Perfiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar text DEFAULT 'hero_1';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS owned_accessories jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipped_accessories jsonb DEFAULT '{}'::jsonb;
