-- Script de création des tables pour Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Activer l'extension pour les UUID si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE PROFILES
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    email TEXT,
    image TEXT,
    avatar_url TEXT,
    prenom TEXT,
    nom TEXT,
    adresse TEXT,
    code_postal TEXT,
    ville TEXT,
    telephone TEXT,
    biographie TEXT,
    bio TEXT,
    competences JSONB DEFAULT '[]'::jsonb,
    experiences JSONB DEFAULT '[]'::jsonb,
    permis BOOLEAN DEFAULT false,
    vehicule BOOLEAN DEFAULT false,
    user_type TEXT DEFAULT 'benevole' CHECK (user_type IN ('association', 'benevole')),
    preferences JSONB DEFAULT '{"notificationsEmail": true, "notificationsApp": true, "visibilitePublique": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- TABLE ANNONCES
-- ================================================
CREATE TABLE IF NOT EXISTS annonces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    logo TEXT,
    organisation TEXT NOT NULL,
    titre TEXT,
    description TEXT NOT NULL,
    date TEXT,
    important TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lieu TEXT,
    categorie TEXT,
    places INTEGER,
    contact JSONB,
    email TEXT,
    telephone TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    statut TEXT DEFAULT 'active' CHECK (statut IN ('active', 'terminée', 'annulée')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- TABLE RESERVATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    annonce_id UUID REFERENCES annonces(id) ON DELETE CASCADE,
    benevole_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    benevole_name TEXT,
    benevole_email TEXT,
    message TEXT,
    statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'annulee', 'refusee', 'terminee')),
    commentaire_association TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- TABLE FAVORIS
-- ================================================
CREATE TABLE IF NOT EXISTS favoris (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    annonce_id UUID REFERENCES annonces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, annonce_id)
);

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
    timestamp TIMESTAMPTZ DEFAULT now(),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- INDEXES POUR AMÉLIORER LES PERFORMANCES
-- ================================================

-- Index pour les annonces
CREATE INDEX IF NOT EXISTS idx_annonces_user_id ON annonces(user_id);
CREATE INDEX IF NOT EXISTS idx_annonces_categorie ON annonces(categorie);
CREATE INDEX IF NOT EXISTS idx_annonces_statut ON annonces(statut);
CREATE INDEX IF NOT EXISTS idx_annonces_created_at ON annonces(created_at);

-- Index pour les réservations
CREATE INDEX IF NOT EXISTS idx_reservations_annonce_id ON reservations(annonce_id);
CREATE INDEX IF NOT EXISTS idx_reservations_benevole_id ON reservations(benevole_id);
CREATE INDEX IF NOT EXISTS idx_reservations_statut ON reservations(statut);

-- Index pour les favoris
CREATE INDEX IF NOT EXISTS idx_favoris_user_id ON favoris(user_id);
CREATE INDEX IF NOT EXISTS idx_favoris_annonce_id ON favoris(annonce_id);

-- Index pour les conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- ================================================
-- FONCTIONS TRIGGER POUR UPDATED_AT
-- ================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annonces_updated_at 
    BEFORE UPDATE ON annonces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- POLITIQUES RLS (Row Level Security)
-- ================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour les annonces
CREATE POLICY "Tout le monde peut voir les annonces actives" ON annonces
    FOR SELECT USING (statut = 'active');

CREATE POLICY "Les utilisateurs peuvent créer des annonces" ON annonces
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres annonces" ON annonces
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres annonces" ON annonces
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les réservations
CREATE POLICY "Les utilisateurs peuvent voir leurs propres réservations" ON reservations
    FOR SELECT USING (auth.uid() = benevole_id);

CREATE POLICY "Les utilisateurs peuvent créer des réservations" ON reservations
    FOR INSERT WITH CHECK (auth.uid() = benevole_id);

CREATE POLICY "Les créateurs d'annonces peuvent voir les réservations de leurs annonces" ON reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM annonces 
            WHERE annonces.id = reservations.annonce_id 
            AND annonces.user_id = auth.uid()
        )
    );

CREATE POLICY "Les créateurs d'annonces peuvent modifier les réservations de leurs annonces" ON reservations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM annonces 
            WHERE annonces.id = reservations.annonce_id 
            AND annonces.user_id = auth.uid()
        )
    );

-- Politiques pour les favoris
CREATE POLICY "Les utilisateurs peuvent voir leurs propres favoris" ON favoris
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent gérer leurs propres favoris" ON favoris
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les conversations
CREATE POLICY "Les utilisateurs peuvent voir leurs conversations" ON conversations
    FOR SELECT USING (
        (participants::jsonb ? auth.uid()::text)
    );

CREATE POLICY "Les utilisateurs peuvent créer des conversations où ils participent" ON conversations
    FOR INSERT WITH CHECK (
        (participants::jsonb ? auth.uid()::text)
    );

CREATE POLICY "Les participants peuvent modifier leurs conversations" ON conversations
    FOR UPDATE USING (
        (participants::jsonb ? auth.uid()::text)
    );

-- Politiques pour les messages
CREATE POLICY "Les utilisateurs peuvent voir les messages de leurs conversations" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Les utilisateurs peuvent envoyer des messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- ================================================
-- FONCTION POUR CRÉER UN PROFIL AUTOMATIQUEMENT
-- ================================================

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name', now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- STORAGE BUCKET POUR LES IMAGES
-- ================================================

-- Créer un bucket pour les avatars/images de profil
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs d'uploader leurs avatars
CREATE POLICY "Les utilisateurs peuvent uploader leurs avatars" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de voir tous les avatars
CREATE POLICY "Tout le monde peut voir les avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Politique pour permettre aux utilisateurs de mettre à jour leurs avatars
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs avatars" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de supprimer leurs avatars
CREATE POLICY "Les utilisateurs peuvent supprimer leurs avatars" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
); 