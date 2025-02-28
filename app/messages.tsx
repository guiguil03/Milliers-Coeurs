import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { messages } from '../data/messages';

export default function MessagesPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Mes messages</Text>
      </View>
      
      {messages.map(message => (
        <TouchableOpacity key={message.id} style={styles.messageItem}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: message.avatar }} style={styles.avatar} />
            {message.unread && <View style={styles.unreadIndicator} />}
          </View>
          
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.senderName}>{message.sender}</Text>
              <Text >{message.time}</Text>
            </View>
            <Text 
              style={[ message.unread && styles.unreadText]} 
              numberOfLines={2}
            >
              {message.lastMessage}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  titleContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF69B4',
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageContent: {
    flex: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  senderName: {
  
    fontSize: 17,
  },
 
  unreadText: {
    color: '#000',
    fontWeight: '500',
  },
 
});
