import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { bookingAPI, CreateBookingRequest } from '../services/api';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

export default function BookingScreen({ route, navigation }: Props) {
  const { hotel, room } = route.params;
  const { isAuthenticated } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('2');
  const [isLoading, setIsLoading] = useState(false);

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectingType, setSelectingType] = useState<'in' | 'out'>('in');

  const handleDateSelect = (date: string) => {
    if (selectingType === 'in') {
      setCheckIn(date);
      // Ensure checkout is at least next day
      const nextDay = new Date(new Date(date).getTime() + 86400000).toISOString().split('T')[0];
      if (checkOut <= date) {
        setCheckOut(nextDay);
      }
    } else {
      if (date <= checkIn) {
        Alert.alert('Помилка', 'Дата виїзду має бути пізніше дати заїзду');
        return;
      }
      setCheckOut(date);
    }
    setIsDatePickerVisible(false);
  };

  const generateDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert('Увага', 'Будь ласка, увійдіть в акаунт для бронювання');
      navigation.navigate('Login');
      return;
    }

    if (!checkIn || !checkOut || !guests) {
      Alert.alert('Помилка', 'Будь ласка заповніть всі поля');
      return;
    }

    try {
      setIsLoading(true);
      const bookingRequest: CreateBookingRequest = {
        hotelId: hotel.id,
        roomId: room.id,
        checkIn,
        checkOut,
        guests: parseInt(guests, 10),
        currency: 'USD',
      };

      const booking = await bookingAPI.create(bookingRequest);
      navigation.navigate('Confirmation', { booking });
    } catch (err: any) {
      Alert.alert('Помилка бронювання', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const nights = Math.max(1, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * room.price;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Бронювання</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {hotel.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.smallButton}
            disabled={isLoading}
          >
            <Text style={styles.smallButtonText}>← Назад</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomBeds}>{room.beds}</Text>
          {room.freeCancellation && (
            <Text style={styles.freeCancellation}>✓ Безкоштовне скасування</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дата заселення</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => { setSelectingType('in'); setIsDatePickerVisible(true); }}
          >
            <Text style={styles.dateText}>📅 {new Date(checkIn).toLocaleDateString('uk-UA')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дата виселення</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => { setSelectingType('out'); setIsDatePickerVisible(true); }}
          >
            <Text style={styles.dateText}>📅 {new Date(checkOut).toLocaleDateString('uk-UA')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Кількість гостей</Text>
          <TextInput
            style={styles.input}
            value={guests}
            onChangeText={setGuests}
            placeholder="Кількість"
            keyboardType="number-pad"
            editable={!isLoading}
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Номер:</Text>
            <Text style={styles.summaryValue}>{room.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Дати:</Text>
            <Text style={styles.summaryValue}>
              {nights} {nights === 1 ? 'ніч' : nights < 5 ? 'ночі' : 'ночей'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ціна за ніч:</Text>
            <Text style={styles.summaryValue}>${room.price.toFixed(0)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Всього:</Text>
            <Text style={styles.totalPrice}>${totalPrice.toFixed(0)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, isLoading && styles.buttonDisabled]}
          onPress={handleBooking}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Підтвердити бронювання</Text>
          )}
        </TouchableOpacity>

        {/* Date Picker Modal */}
        <Modal
          visible={isDatePickerVisible}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarCard}>
              <Text style={styles.modalTitle}>
                Виберіть дату {selectingType === 'in' ? 'заїзду' : 'виїзду'}
              </Text>
              <ScrollView style={styles.dateList}>
                {generateDays().map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[styles.dateItem, (selectingType === 'in' ? checkIn : checkOut) === date && styles.dateItemActive]}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text style={[styles.dateItemText, (selectingType === 'in' ? checkIn : checkOut) === date && styles.dateItemTextActive]}>
                      {new Date(date).toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'long' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsDatePickerVisible(false)}>
                <Text style={styles.closeModalText}>Закрити</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 14,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  roomInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  roomName: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  roomBeds: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 4,
  },
  freeCancellation: {
    color: '#059669',
    fontSize: 13,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#374151',
    marginBottom: 10,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  summaryValue: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginBottom: 0,
  },
  totalLabel: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 16,
  },
  totalPrice: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 18,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  dateSelector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  dateList: {
    marginBottom: 20,
  },
  dateItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateItemActive: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  dateItemText: {
    fontSize: 16,
    color: '#334155',
  },
  dateItemTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  closeModalBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#64748b',
    fontWeight: '600',
  },
});
