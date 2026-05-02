import React, { useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { hotelAPI, HotelDto } from '../services/api';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'HotelDetail'>;

export default function HotelDetailScreen({ route, navigation }: Props) {
  const { hotelId } = route.params;
  const [hotel, setHotel] = useState<HotelDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  const loadHotel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await hotelAPI.getById(hotelId);
      setHotel(data);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження готелю');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !hotel) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error || 'Готель не знайдений'}</Text>
          <TouchableOpacity onPress={loadHotel} style={styles.retryButton}>
            <Text style={styles.retryText}>Спробувати знову</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const firstImage = hotel.images?.[0] || 'https://via.placeholder.com/400x260?text=No+Image';
  const firstRoom = hotel.rooms?.[0];

  const handleBooking = () => {
    if (!firstRoom) {
      Alert.alert('Помилка', 'Номери не доступні');
      return;
    }
    navigation.navigate('Booking', { hotel, room: firstRoom });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Назад</Text>
          </TouchableOpacity>
        </View>

        <Image source={{ uri: firstImage }} style={styles.image} defaultSource={undefined} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{hotel.name}</Text>
              <Text style={styles.location}>{hotel.city}, {hotel.country}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.wording}>
            {hotel.distanceToCenterKm.toFixed(1)} км від центру
          </Text>

          <Text style={styles.description}>{hotel.description}</Text>

          {(hotel.amenities || hotel.tags) && (
            <View style={styles.tagsRow}>
              {hotel.amenities?.slice(0, 5).map((tag, i) => (
                <View key={`${tag}-${i}`} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {hotel.facilities && hotel.facilities.length > 0 && (
            <View style={styles.facilitiesSection}>
              <Text style={styles.sectionTitle}>Зручності</Text>
              {hotel.facilities.map((facility) => (
                <View key={facility.name}>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  <Text style={styles.facilityItems}>{facility.items.join(', ')}</Text>
                </View>
              ))}
            </View>
          )}

          {hotel.rooms && hotel.rooms.length > 0 && (
            <View style={styles.roomsSection}>
              <Text style={styles.sectionTitle}>Доступні номери</Text>
              {hotel.rooms.map((room) => (
                <View key={room.id} style={styles.roomCard}>
                  <View style={styles.roomHeader}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomPrice}>${room.price.toFixed(0)}</Text>
                  </View>
                  <Text style={styles.roomBeds}>{room.beds}</Text>
                  {room.freeCancellation && (
                    <Text style={styles.cancellation}>✓ Безкоштовна скасування</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.splitRow}>
            <View>
              <Text style={styles.priceLabel}>Ціна за ніч</Text>
              <Text style={styles.price}>${hotel.pricePerNight.toFixed(0)}</Text>
            </View>
            <TouchableOpacity onPress={handleBooking} style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Забронювати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  error: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    padding: 16,
  },
  backLink: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  image: {
    width: '100%',
    height: 260,
    backgroundColor: '#e5e7eb',
  },
  content: {
    padding: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  location: {
    marginTop: 6,
    color: '#6b7280',
  },
  ratingBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  wording: {
    color: '#4b5563',
    marginBottom: 16,
    fontSize: 14,
  },
  description: {
    lineHeight: 22,
    color: '#374151',
    marginBottom: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tagBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 13,
  },
  facilitiesSection: {
    marginBottom: 24,
  },
  roomsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  facilityName: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  facilityItems: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 8,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontWeight: '600',
    color: '#111827',
  },
  roomPrice: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 16,
  },
  roomBeds: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 4,
  },
  cancellation: {
    color: '#059669',
    fontSize: 13,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  priceLabel: {
    color: '#6b7280',
    marginBottom: 6,
    fontSize: 14,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },
  bookButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  backButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 16,
  },
});
