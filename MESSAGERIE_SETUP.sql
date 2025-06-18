-- SCRIPT COMPLET MESSAGERIE SUPABASE
-- À exécuter dans l'éditeur SQL de Supabase

-- ================================================
-- TABLE CONVERSATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participants JSONB NOT NULL,
    last_message JSONB,
    unread_count JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- TABLE MESSAGES
-- ================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- POLITIQUES RLS
-- ================================================

-- Activer RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour conversations
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (participants ? auth.uid()::text);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (participants ? auth.uid()::text);

DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
CREATE POLICY "Users can update conversations they participate in" ON conversations
    FOR UPDATE USING (participants ? auth.uid()::text);

-- Politiques pour messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR 
        receiver_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
CREATE POLICY "Users can update their received messages" ON messages
    FOR UPDATE USING (receiver_id = auth.uid());

-- ================================================
-- INDEXES POUR PERFORMANCES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages (receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp DESC);

-- ================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ================================================

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour la conversation lors d'un nouveau message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Récupérer le nom de l'expéditeur depuis le profil
    SELECT COALESCE(display_name, email, 'Utilisateur') INTO sender_name
    FROM profiles 
    WHERE id = NEW.sender_id;
    
    -- Mettre à jour la conversation avec le dernier message
    UPDATE conversations 
    SET 
        last_message = jsonb_build_object(
            'content', NEW.content,
            'sender_id', NEW.sender_id,
            'sender_name', sender_name,
            'timestamp', NEW.timestamp
        ),
        updated_at = now(),
        unread_count = jsonb_set(
            COALESCE(unread_count, '{}'::jsonb),
            ARRAY[NEW.receiver_id::text],
            (COALESCE((unread_count->>NEW.receiver_id::text)::int, 0) + 1)::text::jsonb
        )
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour la conversation
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;
CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Fonction pour réinitialiser le compteur de messages non lus
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le message est marqué comme lu
    IF OLD.read = false AND NEW.read = true THEN
        UPDATE conversations 
        SET unread_count = jsonb_set(
            COALESCE(unread_count, '{}'::jsonb),
            ARRAY[NEW.receiver_id::text],
            '0'::jsonb
        )
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour réinitialiser le compteur
DROP TRIGGER IF EXISTS reset_unread_on_read ON messages;
CREATE TRIGGER reset_unread_on_read
    AFTER UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION reset_unread_count();

-- ================================================
-- VÉRIFICATION FINALE
-- ================================================
SELECT 'Setup messagerie terminé!' as status;
SELECT 'Tables créées:' as info, COUNT(*) as count FROM information_schema.tables 
WHERE table_name IN ('conversations', 'messages') AND table_schema = 'public'; 