import { Tabs } from 'expo-router';
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { HapticTab } from '../../components/HapticTab';
import TabBarBackground from '../../components/ui/TabBarBackground';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  return (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#E0485A',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5EA',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          paddingHorizontal: 5,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
          borderRadius: 12,
          marginHorizontal: 2,
        },
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: 'Explorer',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'search' : 'search-outline'} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
              ),
            }}
          />
          <Tabs.Screen
            name="reservations"
            options={{
          title: 'Mes missions',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'bookmark' : 'bookmark-outline'} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
              ),
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: 'Messages',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'chatbubble' : 'chatbubble-outline'} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
              ),
            }}
          />
        </Tabs>
  );
}
