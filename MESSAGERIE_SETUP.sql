-- 🚨 SCRIPT SQL MESSAGERIE - À exécuter dans Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/reiruhukxzukufrreejq/sql

-- ===============================================
-- 1. CRÉATION DES TABLES DE MESSAGERIE
-- ===============================================

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 2. CRÉATION DES INDEX POUR LES PERFORMANCES
-- ===============================================

-- Index pour les conversations par utilisateur
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, read) WHERE read = FALSE;

-- ===============================================
-- 3. POLITIQUES RLS (ROW LEVEL SECURITY)
-- ===============================================

-- Activer RLS sur les tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour les conversations
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Politiques pour les messages
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = sender_id);

-- ===============================================
-- 4. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ===============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour messages
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour last_message_at dans conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.timestamp
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour last_message_at quand un message est créé
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;
CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- ===============================================
-- 5. FONCTIONS UTILITAIRES
-- ===============================================

-- Fonction pour obtenir le nom d'un utilisateur par son ID
CREATE OR REPLACE FUNCTION get_user_name(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_name TEXT;
BEGIN
    SELECT COALESCE(display_name, email, 'Utilisateur inconnu')
    INTO user_name
    FROM profiles
    WHERE id = user_id;
    
    IF user_name IS NULL THEN
        SELECT email INTO user_name FROM auth.users WHERE id = user_id;
    END IF;
    
    RETURN COALESCE(user_name, 'Utilisateur inconnu');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- 6. VÉRIFICATIONS ET TESTS
-- ===============================================

-- Vérifier que les tables existent
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages')
ORDER BY table_name;

-- Vérifier les colonnes des tables
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages')
ORDER BY table_name, ordinal_position;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

-- Test rapide d'insertion (remplacez les UUIDs par de vrais IDs d'utilisateurs)
-- INSERT INTO conversations (user1_id, user2_id) 
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   (SELECT id FROM auth.users OFFSET 1 LIMIT 1)
-- );

-- ===============================================
-- RÉSUMÉ DES TABLES CRÉÉES :
-- ===============================================
-- ✅ conversations : Gère les conversations entre utilisateurs
-- ✅ messages : Stocke tous les messages des conversations
-- ✅ Index optimisés pour les performances
-- ✅ RLS configuré pour la sécurité
-- ✅ Triggers pour la mise à jour automatique
-- ✅ Fonction utilitaire pour les noms d'utilisateurs 