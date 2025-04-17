import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConversationScreen from '../../screens/ConversationScreen';

export default function ConversationPage() {
  return (
    <View style={styles.container}>
      <ConversationScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});
