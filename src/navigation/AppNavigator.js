// src/navigation/AppNavigator.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import AddEditCarScreen from '../screens/AddEditCarScreen';
import AddOperationScreen from '../screens/AddOperationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import DepensesScreen from '../screens/DepensesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingBottom: 6,
        paddingTop: 6,
        height: 64,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ tabBarLabel: 'Véhicules', tabBarIcon: ({ focused }) => <TabIcon emoji="🚗" focused={focused} /> }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ tabBarLabel: 'Alertes', tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} /> }}
    />
    <Tab.Screen
      name="Depenses"
      component={DepensesScreen}
      options={{ tabBarLabel: 'Dépenses', tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} /> }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ tabBarLabel: 'Paramètres', tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
    />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CarDetail" component={CarDetailScreen} options={{ presentation: 'card' }} />
            <Stack.Screen name="AddEditCar" component={AddEditCarScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="AddOperation" component={AddOperationScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Documents" component={DocumentsScreen} options={{ presentation: 'card' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
