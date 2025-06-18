import { supabase } from '../config/supabase';
import type { User } from '@supabase/supabase-js';

// Types pour les messages
export interface IMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  read: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IConversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  created_at?: string;
  updated_at?: string;
}

// Fonctions utilitaires
export async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || '';
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserNameById(userId: string): Promise<string> {
  try {
    // D'abord essayer dans la table profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, prenom, nom, email')
      .eq('id', userId)
      .single();

    if (profile) {
      if (profile.display_name) return profile.display_name;
      if (profile.prenom && profile.nom) return `${profile.prenom} ${profile.nom}`;
      if (profile.email) return profile.email;
    }

    // Sinon essayer dans auth.users via la fonction SQL
    const { data, error } = await supabase.rpc('get_user_name', {
      user_id: userId
    });

    if (error) {
      console.error('Erreur lors de la récupération du nom utilisateur:', error);
      return 'Utilisateur inconnu';
    }

    return data || 'Utilisateur inconnu';
  } catch (error) {
    console.error('Erreur lors de la récupération du nom utilisateur:', error);
    return 'Utilisateur inconnu';
  }
}

export async function clearConversationMessages(conversationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la suppression des messages:', error);
    throw error;
  }
}

// Gestion des conversations
export async function createConversation(user1Id: string, user2Id: string): Promise<string> {
  try {
    // Vérifier si une conversation existe déjà
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
      .single();

    if (existingConv) {
      return existingConv.id;
    }

    // Créer une nouvelle conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user1_id: user1Id,
          user2_id: user2Id,
          last_message_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    throw error;
  }
}

export async function getConversations(userId: string): Promise<IConversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    throw error;
  }
}

// Gestion des messages
export async function sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: content,
          timestamp: new Date().toISOString(),
          read: false
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour la conversation avec le timestamp du dernier message
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data.id;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    throw error;
  }
}

export async function sendMessageWithAutoConversation(senderId: string, receiverId: string, content: string): Promise<string> {
  try {
    // Créer ou récupérer la conversation
    const conversationId = await createConversation(senderId, receiverId);
    
    // Envoyer le message
    return await sendMessage(conversationId, senderId, receiverId, content);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message avec auto-conversation:', error);
    throw error;
  }
}

export async function getConversationMessages(conversationId: string): Promise<IMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    throw error;
  }
}

export function listenToConversationMessages(conversationId: string, callback: (messages: IMessage[]) => void): () => void {
  // Charger les messages initiaux
  getConversationMessages(conversationId).then(callback);

  // Écouter les nouveaux messages en temps réel
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      () => {
        // Recharger tous les messages quand il y a un changement
        getConversationMessages(conversationId).then(callback);
      }
    )
    .subscribe();

  // Retourner la fonction de nettoyage
  return () => {
    supabase.removeChannel(subscription);
  };
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors du marquage des messages comme lus:', error);
    throw error;
  }
}

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erreur lors du comptage des messages non lus:', error);
    return 0;
  }
}

export async function deleteMessage(messageId: string, userId: string): Promise<void> {
  try {
    // Vérifier que l'utilisateur est le propriétaire du message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();

    if (fetchError) throw fetchError;
    
    if (message.sender_id !== userId) {
      throw new Error('Vous ne pouvez supprimer que vos propres messages');
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    throw error;
  }
}

export async function deleteConversation(conversationId: string, userId: string): Promise<void> {
  try {
    // Vérifier que l'utilisateur fait partie de la conversation
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (fetchError) throw fetchError;
    
    if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
      throw new Error('Vous ne pouvez supprimer que vos propres conversations');
    }

    // Supprimer tous les messages de la conversation
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    // Supprimer la conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    throw error;
  }
} 