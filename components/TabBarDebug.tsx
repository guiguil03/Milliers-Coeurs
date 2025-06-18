import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export function TabBarDebug() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation Debug Info</Text>
      <Text style={styles.info}>Platform: {Platform.OS}</Text>
      <Text style={styles.info}>Screen: {width}x{height}</Text>
      <Text style={styles.info}>Top Safe Area: {insets.top}</Text>
      <Text style={styles.info}>Bottom Safe Area: {insets.bottom}</Text>
      <Text style={styles.info}>Left Safe Area: {insets.left}</Text>
      <Text style={styles.info}>Right Safe Area: {insets.right}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 9999,
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  info: {
    color: 'white',
    fontSize: 10,
    marginBottom: 2,
  },
}); 