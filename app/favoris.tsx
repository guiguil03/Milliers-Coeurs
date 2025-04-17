import React from 'react';
import { View, StyleSheet } from 'react-native';
import FavorisScreen from '../screens/FavorisScreen';

export default function FavorisPage() {
  return (
    <View style={styles.container}>
      <FavorisScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});
