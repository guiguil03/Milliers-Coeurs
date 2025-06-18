-- 🚨 SCRIPT SQL URGENT - À exécuter dans Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/reiruhukxzukufrreejq/sql

-- 1. Ajouter la colonne dateCreation manquante
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dateCreation TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Ajouter la colonne dateModification manquante
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dateModification TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Renommer created_at en dateCreation si elle existe déjà
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles RENAME COLUMN created_at TO dateCreation;
    END IF;
END $$;

-- 4. Renommer updated_at en dateModification si elle existe déjà
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'created_at'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dateCreation'
    ) THEN
        ALTER TABLE profiles RENAME COLUMN created_at TO dateCreation;
    END IF;
END $$;


-- 5. Mettre à jour les profils existants
UPDATE profiles 
SET dateCreation = NOW() 
WHERE dateCreation IS NULL;

UPDATE profiles 
SET dateModification = NOW() 
WHERE dateModification IS NULL;



-- 7. Vérifier que tout est OK
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('id', 'dateCreation', 'dateModification', 'created_at', 'updated_at');

-- 8. Vérifier la structure complète de la table profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 9. Afficher les profils pour vérification
SELECT id, email, dateCreation, dateModification 
FROM profiles 
ORDER BY dateCreation DESC 
LIMIT 5; 