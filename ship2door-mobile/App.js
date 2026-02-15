import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
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

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const brandColors = {
  orange: '#F5941E',
  navy: '#141F38',
  navyLight: '#1B2B4D',
  gray: '#94A3B8',
  grayLight: '#CBD5E1',
  white: '#FFFFFF',
  bg: '#F8FAFC',
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
          backgroundColor: brandColors.white,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          // Shadow
          ...(Platform.OS === 'ios'
            ? {
              shadowColor: '#0F172A',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            }
            : { elevation: 8 }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter_600SemiBold',
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarActiveTintColor: brandColors.orange,
        tabBarInactiveTintColor: brandColors.gray,
        tabBarIcon: ({ focused, color }) => {
          const iconSet = tabIcons[route.name] || tabIcons.Home;
          return <Ionicons name={focused ? iconSet.focused : iconSet.unfocused} size={24} color={color} />;
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    })).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

function AppNavigator() {
  const { user, loading, registerPushToken } = useAuth();
  const [notification, setNotification] = React.useState(false);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  React.useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) registerPushToken(token);
      });

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      return () => {
        notificationListener.current && notificationListener.current.remove();
        responseListener.current && responseListener.current.remove();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="dark-content" backgroundColor={brandColors.bg} />
        <ActivityIndicator size="large" color={brandColors.orange} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={user ? 'light-content' : 'light-content'} backgroundColor={brandColors.navy} translucent={false} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen
              name="BookShipment"
              component={BookShipmentScreen}
              options={{
                headerShown: true,
                title: 'Book Shipment',
                headerTintColor: brandColors.navyLight,
                headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, letterSpacing: -0.2 },
                headerStyle: { backgroundColor: brandColors.white },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="BookingDetail"
              component={BookingDetailScreen}
              options={{
                headerShown: true,
                title: 'Booking Details',
                headerTintColor: brandColors.navyLight,
                headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, letterSpacing: -0.2 },
                headerStyle: { backgroundColor: brandColors.white },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="TripDetail"
              component={TripDetailScreen}
              options={{
                headerShown: true,
                title: 'Trip Details',
                headerTintColor: brandColors.navyLight,
                headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, letterSpacing: -0.2 },
                headerStyle: { backgroundColor: brandColors.white },
                headerShadowVisible: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerShown: true,
                title: '',
                headerTransparent: true,
                headerTintColor: brandColors.white,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="dark-content" backgroundColor={brandColors.bg} />
        <View style={styles.splashContent}>
          <View style={styles.splashLogo}>
            <Ionicons name="boat" size={32} color={brandColors.white} />
          </View>
          <Text style={styles.splashTitle}>Ship2Door</Text>
          <ActivityIndicator size="small" color={brandColors.orange} style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.bg,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashLogo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: brandColors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: brandColors.navy,
    letterSpacing: -0.5,
  },
});
