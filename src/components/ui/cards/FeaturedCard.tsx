import React from 'react';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../themed/ThemedText';
import { ThemedView } from '../../themed/ThemedView';
import { AppConfig } from '../../../config/AppConfig';

interface FeaturedCardProps {
  title: string;
  image: string;
  description: string;
  onPress?: () => void;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({
  title,
  image,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: AppConfig.theme.spacing.md,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: AppConfig.theme.colors.background,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: AppConfig.theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: AppConfig.theme.spacing.xs,
  },
  description: {
    fontSize: 14,
    color: AppConfig.theme.colors.secondary,
  },
});
