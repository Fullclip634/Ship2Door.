import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookShipmentScreen from './src/screens/BookShipmentScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';
import TripDetailScreen from './src/screens/TripDetailScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const colors = {
  orange: '#F5941E',
  navy: '#1B2B4D',
  gray: '#9CA3AF',
  white: '#FFFFFF',
  bg: '#F9FAFB',
};

const tabIcons = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Bookings: { focused: 'cube', unfocused: 'cube-outline' },
  Notifications: { focused: 'notifications', unfocused: 'notifications-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.gray,
        tabBarIcon: ({ focused, color, size }) => {
          const iconSet = tabIcons[route.name] || tabIcons.Home;
          return <Ionicons name={focused ? iconSet.focused : iconSet.unfocused} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ tabBarLabel: 'Shipments' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={HomeTabs} />
          <Stack.Screen name="BookShipment" component={BookShipmentScreen}
            options={{ headerShown: true, title: 'Book Shipment', headerTintColor: colors.navy, headerStyle: { backgroundColor: colors.white } }} />
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen}
            options={{ headerShown: true, title: 'Booking Details', headerTintColor: colors.navy, headerStyle: { backgroundColor: colors.white } }} />
          <Stack.Screen name="TripDetail" component={TripDetailScreen}
            options={{ headerShown: true, title: 'Trip Details', headerTintColor: colors.navy, headerStyle: { backgroundColor: colors.white } }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen}
            options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: colors.white }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
