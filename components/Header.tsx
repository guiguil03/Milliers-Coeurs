import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <SafeAreaView>
      <StatusBar style="dark" />
      <View style={styles.header}>

        <Image source={require('../assets/images/logo.png')} style={{ width: 40, height: 40 }} />
        <Text style={styles.Titre}> Milliers de Coeurs</Text>
        <Ionicons name="person" size={24} color="black" />
      </View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,

    display:'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0485A',

    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  Titre:{
    fontSize: 20,
    fontWeight: 'bold',
  }
  
});
