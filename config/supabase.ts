import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Configuration Supabase basée sur les informations fournies
const supabaseUrl = 'https://reiruhukxzukufrreejq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaXJ1aHVreHp1a3VmcnJlZWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzA1OTQsImV4cCI6MjA2NTgwNjU5NH0.LLlL7QnuFfQjOSzuKLnO0P2-KmmiWbYp7BJOvp3BFVQ';

// Vérifier si la configuration est valide
const isValidConfig = (url: string, key: string) => {
  return url && key && !url.includes("YOUR_") && !key.includes("YOUR_");
};

if (!isValidConfig(supabaseUrl, supabaseAnonKey)) {
  console.error("⚠️ CONFIGURATION SUPABASE INVALIDE");
  throw new Error("Configuration Supabase invalide. Vérifiez votre URL et votre clé API.");
}

console.log("Initialisation de Supabase avec l'URL:", supabaseUrl);

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuration pour l'authentification
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    // Configuration pour les fonctionnalités temps réel
    params: {
      eventsPerSecond: 10,
    },
  },
});

console.log("✅ Supabase initialisé avec succès!");

// Export des types utiles
export type { User, Session, AuthError } from '@supabase/supabase-js'; 