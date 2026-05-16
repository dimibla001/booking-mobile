import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { bookingAPI, BookingDto, chatAPI } from '../services/api';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MyBookings'>;

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadBookings();
  }, []);

  const startChat = async (bookingId: string, hotelName: string) => {
    try {
      const chat = await chatAPI.startChat(bookingId);
      navigation.navigate('ChatDetail', { threadId: chat.id, title: hotelName });
    } catch (e: any) {
      Alert.alert('Помилка', 'Не вдалося почати чат: ' + e.message);
    }
  };

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingAPI.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження бронювань');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    Alert.alert('Скасування', 'Ви впевнені, що хочете скасувати бронювання?', [
      { text: 'Ні', onPress: () => {} },
      {
        text: 'Так',
        onPress: async () => {
          try {
            await bookingAPI.cancel(bookingId);
            loadBookings();
            Alert.alert('Успіх', 'Бронювання скасовано');
          } catch (err: any) {
            Alert.alert('Помилка', err.message || 'Не вдалося скасувати бронювання');
          }
        },
      },
    ]);
  };

  const renderBookingCard = ({ item }: { item: BookingDto }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.bookingId}>Бронювання #{item.id.slice(0, 8)}</Text>
          <Text style={styles.bookingHotel}>{item.hotelId}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? '#d1fae5' : '#fef3c7' }]}>
          <Text style={[styles.statusText, { color: item.status === 'confirmed' ? '#059669' : '#b45309' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Заселення:</Text>
          <Text style={styles.detailValue}>{new Date(item.checkIn).toLocaleDateString('uk-UA')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Виселення:</Text>
          <Text style={styles.detailValue}>{new Date(item.checkOut).toLocaleDateString('uk-UA')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Гостей:</Text>
          <Text style={styles.detailValue}>{item.guests}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ціна:</Text>
          <Text style={[styles.detailValue, { color: '#2563EB', fontWeight: '700' }]}>
            ${item.totalPrice.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => startChat(item.id, item.hotelId)}
          style={styles.chatActionBtn}
        >
          <Text style={styles.chatActionBtnText}>💬 Написати власнику</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleCancel(item.id)}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Скасувати бронювання</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Мої бронювання</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Бронювань немає</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Забронювати готель</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#991B1B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingId: {
    fontWeight: '700',
    color: '#111827',
  },
  bookingHotel: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#6B7280',
    fontSize: 13,
  },
  detailValue: {
    fontWeight: '600',
    color: '#111827',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chatActionBtn: {
    flex: 1,
    backgroundColor: '#006ce4',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chatActionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});
