import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import ResultsScreen from './screens/ResultsScreen';
import HotelDetailScreen from './screens/HotelDetailScreen';
import BookingScreen from './screens/BookingScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { MyBookingsScreen } from './screens/MyBookingsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminHotelsScreen from './screens/AdminHotelsScreen';
import AdminHotelCreateScreen from './screens/AdminHotelCreateScreen';
import AdminHotelDetailScreen from './screens/AdminHotelDetailScreen';
import AdminBookingsScreen from './screens/AdminBookingsScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';
import AdminReviewsScreen from './screens/AdminReviewsScreen';
import AdminHotelSubmissionsScreen from './screens/AdminHotelSubmissionsScreen';
import HotelSubmissionScreen from './screens/HotelSubmissionScreen';
import OwnerBookingsScreen from './screens/OwnerBookingsScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Завантаження...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : isAdmin ? (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="AdminHotels" component={AdminHotelsScreen} />
          <Stack.Screen name="AdminHotelCreate" component={AdminHotelCreateScreen} />
          <Stack.Screen name="AdminHotelDetail" component={AdminHotelDetailScreen} />
          <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} />
          <Stack.Screen name="AdminHotelSubmissions" component={AdminHotelSubmissionsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
          <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="HotelSubmission" component={HotelSubmissionScreen} />
          <Stack.Screen name="OwnerBookings" component={OwnerBookingsScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
