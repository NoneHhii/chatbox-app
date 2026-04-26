import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={24} name='home' color={color} />,
        }}
      />
      <Tabs.Screen
        name="call"
        options={{
          title: 'call',
          tabBarIcon: ({ color }) => <Ionicons size={24} name='call' color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-sharp" size={24} color="black" />,
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: 'setting',
          tabBarIcon: ({ color }) => <Ionicons size={24} name='settings' color={color} />,
        }}
      />
    </Tabs>
  );
}
