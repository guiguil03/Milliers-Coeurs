import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAnnonce } from '../hooks/useAnnonce';
import { useAuthContext } from '../contexts/AuthContext';

interface FavoriteButtonProps {
  annonceId: string;
  initialIsFavorite?: boolean;
  size?: number;
  color?: string;
  activeColor?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  annonceId,
  initialIsFavorite = false,
  size = 24,
  color = '#888',
  activeColor = '#FF385C',
  onToggle
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { addToFavoris, removeFromFavoris, isFavori } = useAnnonce();
  const { user } = useAuthContext();

  useEffect(() => {
    // Mettre à jour l'état si la prop initialIsFavorite change
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  useEffect(() => {
    // Vérifier le statut de favori lors du chargement initial
    const checkFavoriStatus = async () => {
      if (user && annonceId) {
        const status = await isFavori(annonceId);
        setIsFavorite(status);
      }
    };

    checkFavoriStatus();
  }, [annonceId, user]);

  const toggleFavorite = async () => {
    if (!user) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavoris(annonceId);
        setIsFavorite(false);
      } else {
        await addToFavoris(annonceId);
        setIsFavorite(true);
      }

      // Appeler le callback si fourni
      if (onToggle) {
        onToggle(!isFavorite);
      }
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleFavorite}
      disabled={isLoading || !user}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={activeColor} />
      ) : (
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorite ? activeColor : color}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
});

export default FavoriteButton;
