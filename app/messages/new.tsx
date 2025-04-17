import React from 'react';
import { View, StyleSheet } from 'react-native';
import NewMessageScreen from '../../screens/NewMessageScreen';

export default function NewMessagePage() {
  return (
    <View style={styles.container}>
      <NewMessageScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});
