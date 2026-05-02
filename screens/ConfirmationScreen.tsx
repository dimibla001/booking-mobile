import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingDto } from '../services/api';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

export default function ConfirmationScreen({ route, navigation }: Props) {
  const { booking } = route.params;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('uk-UA');
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        <Text style={styles.title}>Бронювання підтверджено!</Text>
        <Text style={styles.subtitle}>Деталі вашого бронювання</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Номер бронювання:</Text>
            <Text style={styles.cardValue}>{booking.id}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Номер готелю:</Text>
            <Text style={styles.cardValue}>{booking.hotelId}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Заселення:</Text>
            <Text style={styles.cardValue}>{formatDate(booking.checkIn)}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Виселення:</Text>
            <Text style={styles.cardValue}>{formatDate(booking.checkOut)}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Гостей:</Text>
            <Text style={styles.cardValue}>{booking.guests}</Text>
          </View>

          <View style={[styles.cardRow, styles.cardRowBorder]}>
            <Text style={styles.cardLabel}>Статус:</Text>
            <Text style={[styles.cardValue, { color: '#059669' }]}>{booking.status}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.totalLabel}>Всього:</Text>
            <Text style={styles.totalPrice}>
              ${booking.totalPrice.toFixed(2)} {booking.currency}
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>Інформація</Text>
          <Text style={styles.infoText}>
            Переддалі підтвердження буде надіслано на вашу електронну адресу.
          </Text>
          <Text style={styles.infoText}>
            Якщо у вас виникнуть питання, звертайтесь до служби підтримки.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.actionButtonText}>Повернутися на головну</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.secondaryButtonText}>Мої бронювання</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    paddingTop: 32,
    flex: 1,
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkMark: {
    fontSize: 60,
    color: '#059669',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardRowBorder: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cardLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  info: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    color: '#1E40AF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  actionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 16,
  },
});
