import { StyleSheet } from 'react-native';
import { AppConfig } from '../config/AppConfig';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppConfig.theme.colors.background,
  },
  content: {
    flex: 1,
    padding: AppConfig.theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConfig.theme.colors.text,
    marginBottom: AppConfig.theme.spacing.md,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: AppConfig.theme.colors.text,
    marginBottom: AppConfig.theme.spacing.sm,
  },
  card: {
    backgroundColor: AppConfig.theme.colors.background,
    borderRadius: 10,
    padding: AppConfig.theme.spacing.md,
    marginBottom: AppConfig.theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
