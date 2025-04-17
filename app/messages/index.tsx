import React from 'react';
import { View, StyleSheet } from 'react-native';
import MessagesListScreen from '../../screens/MessagesListScreen';

export default function MessagesPage() {
  return (
    <View style={styles.container}>
      <MessagesListScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});
