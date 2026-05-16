import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { adminHotelAPI, adminBookingAPI, adminUserAPI, adminReviewAPI } from '../services/api';

const AdminDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [hotelsData, bookingsData, usersData] = await Promise.all([
        adminHotelAPI.getAll(1, 100), // Get first 100 to have some data for filtering if needed, but totalCount is key
        adminBookingAPI.getAll(1, 100),
        adminUserAPI.getAll(1, 100),
      ]);

      setStats({
        hotelsCount: hotelsData.totalCount,
        bookingsCount: bookingsData.totalCount,
        usersCount: usersData.totalCount,
        confirmedBookings: bookingsData.items.filter((b: any) => b.status === 'confirmed').length, // This is still limited to first 100
      });
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити статистику');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Вихід', 'Ви впевнені?', [
      { text: 'Ні', onPress: () => {} },
      {
        text: 'Так',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Адміністраторська панель</Text>
        <Text style={styles.userName}>{user?.fullName}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.hotelsCount || 0}</Text>
          <Text style={styles.statLabel}>Готелі</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.bookingsCount || 0}</Text>
          <Text style={styles.statLabel}>Бронювання</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.confirmedBookings || 0}</Text>
          <Text style={styles.statLabel}>Підтверджені</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.usersCount || 0}</Text>
          <Text style={styles.statLabel}>Користувачі</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminHotels')}
        >
          <Text style={styles.menuIcon}>🏨</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Готелі</Text>
            <Text style={styles.menuSubtitle}>Управління готелями та номерами</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminBookings')}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Бронювання</Text>
            <Text style={styles.menuSubtitle}>Перегляд та управління бронюваннями</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminUsers')}
        >
          <Text style={styles.menuIcon}>👥</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Користувачі</Text>
            <Text style={styles.menuSubtitle}>Управління обліковими записами</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminReviews')}
        >
          <Text style={styles.menuIcon}>💬</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Відгуки</Text>
            <Text style={styles.menuSubtitle}>Модерація відгуків про готелі</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminHotelSubmissions')}
        >
          <Text style={styles.menuIcon}>📮</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Заявки на готелі</Text>
            <Text style={styles.menuSubtitle}>Перегляд та схвалення нових готелів</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={loadStats}>
        <Text style={styles.refreshButtonText}>🔄 Оновити</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Вихід</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  menuContainer: {
    padding: 12,
    gap: 8,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  refreshButton: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 12,
    backgroundColor: '#34C759',
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    marginHorizontal: 12,
    marginVertical: 16,
    marginBottom: 32,
    paddingVertical: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminDashboardScreen;
