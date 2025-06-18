-- CORRECTION URGENTE : Annonce avec user_id null
-- Cette annonce ne peut pas être contactée car elle n'a pas d'organisateur associé

-- 1. Identifier l'annonce problématique
SELECT id, titre, organisation, user_id, created_at 
FROM annonces 
WHERE id = '9119e06f-f3ba-42ba-b029-5bda2ebb7459';

-- 2. Option A : Assigner l'annonce à votre compte utilisateur
UPDATE annonces 
SET user_id = '5a66a34b-d0c3-4550-b238-5116220cbef4'  -- Votre UID
WHERE id = '9119e06f-f3ba-42ba-b029-5bda2ebb7459';

-- 3. Option B : Supprimer cette annonce de test si elle n'est pas nécessaire
-- DELETE FROM annonces WHERE id = '9119e06f-f3ba-42ba-b029-5bda2ebb7459';

-- 4. Vérifier toutes les annonces sans user_id
SELECT id, titre, organisation, user_id, created_at 
FROM annonces 
WHERE user_id IS NULL;

-- 5. IMPORTANT : Ajouter une contrainte pour éviter ce problème à l'avenir
ALTER TABLE annonces 
ALTER COLUMN user_id SET NOT NULL;

-- 6. Mettre à jour la politique RLS pour s'assurer que user_id est toujours défini
DROP POLICY IF EXISTS "Users can insert their own annonces" ON annonces;
CREATE POLICY "Users can insert their own annonces" ON annonces
    FOR INSERT WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL); 