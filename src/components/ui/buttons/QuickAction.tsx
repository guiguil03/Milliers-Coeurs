import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../themed/ThemedText';
import { ThemedView } from '../../themed/ThemedView';
import { AppConfig } from '../../../config/AppConfig';

interface QuickActionProps {
  icon: string;
  title: string;
  onPress?: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  title,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ThemedView style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={AppConfig.theme.colors.primary} />
      </ThemedView>
      <ThemedText style={styles.title}>{title}</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '23%',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppConfig.theme.spacing.sm,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    color: AppConfig.theme.colors.text,
  },
});
