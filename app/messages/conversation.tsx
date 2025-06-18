import React, { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ConversationRedirect() {
  const router = useRouter();
  const { id, userId } = useLocalSearchParams<{ id: string; userId: string }>();

  useEffect(() => {
    // Rediriger vers la nouvelle route de conversation
    if (id && userId) {
      router.replace(`/conversation/${id}?userId=${userId}`);
    } else {
      router.replace('/messages');
    }
  }, [id, userId, router]);

  return null; // Page de redirection, pas d'UI nécessaire
}
