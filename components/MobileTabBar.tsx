import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Platform, 
  Dimensions 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface TabItem {
  route: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

const tabs: TabItem[] = [
  {
    route: '/',
    title: 'Accueil',
    icon: 'home-outline',
    iconFocused: 'home'
  },
  {
    route: '/explorer',
    title: 'Explorer',
    icon: 'search-outline',
    iconFocused: 'search'
  },
  {
    route: '/mes-reservations',
    title: 'Missions',
    icon: 'bookmark-outline',
    iconFocused: 'bookmark'
  },
  {
    route: '/messages',
    title: 'Messages',
    icon: 'chatbubble-outline',
    iconFocused: 'chatbubble'
  },
  {
    route: '/profile',
    title: 'Profil',
    icon: 'person-outline',
    iconFocused: 'person'
  }
];

export function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const handleTabPress = (route: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const isTabActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname === route || pathname.startsWith(route + '/');
  };

  return (
    <View style={[
      styles.container,
      { 
        paddingBottom: Math.max(insets.bottom, 10),
        height: 60 + Math.max(insets.bottom, 10)
      }
    ]}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isActive = isTabActive(tab.route);
          
          return (
            <TouchableOpacity
              key={tab.route}
              style={[
                styles.tab,
                isActive && styles.activeTab
              ]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? tab.iconFocused : tab.icon}
                  size={isActive ? 26 : 24}
                  color={isActive ? '#E0485A' : '#8E8E93'}
                />
                {isActive && <View style={styles.activeIndicator} />}
              </View>
              <Text style={[
                styles.tabLabel,
                isActive && styles.activeTabLabel
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginHorizontal: 2,
    borderRadius: 12,
    minHeight: 50,
  },
  activeTab: {
    backgroundColor: '#FFF5F5',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0485A',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#E0485A',
    fontWeight: '600',
  },
}); 