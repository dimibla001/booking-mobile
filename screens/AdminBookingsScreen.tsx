import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { adminBookingAPI, AdminBookingDto } from '../services/api';

const AdminBookingsScreen = () => {
  const [bookings, setBookings] = useState<AdminBookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await adminBookingAPI.getAll(statusFilter);
      setBookings(data);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити бронювання');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert('Скасувати бронювання?', '', [
      { text: 'Ні', onPress: () => {} },
      {
        text: 'Так',
        onPress: async () => {
          try {
            await adminBookingAPI.cancel(bookingId);
            loadBookings();
            Alert.alert('Успіх', 'Бронювання скасовано');
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося скасувати бронювання');
          }
        },
      },
    ]);
  };

  const handleFilterChange = () => {
    Alert.alert('Фільтр за статусом', '', [
      {
        text: 'Всі статуси',
        onPress: () => setStatusFilter(undefined),
      },
      {
        text: 'Підтверджені',
        onPress: () => setStatusFilter('confirmed'),
      },
      {
        text: 'В очікуванні',
        onPress: () => setStatusFilter('pending'),
      },
      {
        text: 'Скасовані',
        onPress: () => setStatusFilter('cancelled'),
      },
      { text: 'Закрити', onPress: () => {} },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#888';
    }
  };

  const renderBookingItem = ({ item }: { item: AdminBookingDto }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.bookingId}>Бронювання #{item.id.slice(-6)}</Text>
          <Text style={styles.bookingDate}>
            {new Date(item.checkIn).toLocaleDateString('uk-UA')} -{' '}
            {new Date(item.checkOut).toLocaleDateString('uk-UA')}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.detailLabel}>Готель:</Text>
        <Text style={styles.detailValue}>{item.hotelName || 'Невідомо'}</Text>

        <Text style={styles.detailLabel}>Номер:</Text>
        <Text style={styles.detailValue}>{item.roomName || 'Невідомо'}</Text>

        <Text style={styles.detailLabel}>Користувач:</Text>
        <Text style={styles.detailValue}>{item.userFullName || 'Невідомо'}</Text>
        <Text style={styles.emailText}>{item.userEmail}</Text>

        <Text style={styles.detailLabel}>Гості:</Text>
        <Text style={styles.detailValue}>{item.guests} чоловік</Text>

        <View style={styles.priceRow}>
          <Text style={styles.detailLabel}>Сума:</Text>
          <Text style={styles.priceValue}>
            {item.totalPrice} {item.currency}
          </Text>
        </View>
      </View>

      {item.status !== 'cancelled' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.cancelButtonText}>Скасувати бронювання</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Управління бронюваннями</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Фільтр за статусом:</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleFilterChange}
        >
          <Text style={styles.filterButtonText}>
            {statusFilter ? statusFilter : 'Всі статуси'} 🔽
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Бронювання не знайдені</Text>
        }
      />
    </View>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  bookingDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 2,
  },
  emailText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cancelButton: {
    paddingVertical: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});

export default AdminBookingsScreen;
