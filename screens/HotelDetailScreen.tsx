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
  Linking,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { hotelAPI, reviewAPI, HotelDto, ReviewDto } from '../services/api';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'HotelDetail'>;

export default function HotelDetailScreen({ route, navigation }: Props) {
  const { hotelId } = route.params;
  const [hotel, setHotel] = useState<HotelDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadData();
  }, [hotelId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [hotelData, reviewsData] = await Promise.all([
        hotelAPI.getById(hotelId),
        reviewAPI.getByHotel(hotelId)
      ]);
      setHotel(hotelData);
      setReviews(reviewsData);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження даних');
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
          <TouchableOpacity onPress={loadData} style={styles.retryButton}>
            <Text style={styles.retryText}>Спробувати знову</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const firstImage = hotel.images && hotel.images.length > 0 ? hotel.images[0] : null;
  const firstRoom = hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0] : null;

  const popularAmenityIcons: { [key: string]: string } = {
    'WiFi': '📶',
    'Free WiFi': '📶',
    'Wi-Fi': '📶',
    'Parking': '🅿️',
    'Private Parking': '🅿️',
    'Family rooms': '👥',
    'Non-smoking rooms': '🚭',
    'Elevator': '↕️',
    'Air conditioning': '❄️',
    'Heating': '♨️',
    'Baggage storage': '🧳',
    'Restaurant': '🍴',
    'Bar': '🍸',
    'Swimming pool': '🏊',
    'Gym': '💪',
    'Fitness center': '💪',
    'Spa': '🧖',
    '24-hour front desk': '🕒',
    'Room service': '🛎️',
  };

  const getPopularAmenities = () => {
    const allAmenities = new Set<string>();
    hotel.amenities?.forEach(a => allAmenities.add(a));
    hotel.facilities?.forEach(f => f.items.forEach(i => allAmenities.add(i)));

    return Array.from(allAmenities)
      .filter(a => popularAmenityIcons[a])
      .slice(0, 10);
  };

  const popularAmenities = getPopularAmenities();

  const getCityCoords = (city: string) => {
    const coords: { [key: string]: string } = {
      'Kyiv': '30.52,50.45',
      'Lviv': '24.03,49.84',
      'Warsaw': '21.01,52.23',
      'Berlin': '13.40,52.52',
      'Rome': '12.49,41.89',
      'Paris': '2.35,48.85',
      'London': '-0.12,51.50',
      'Barcelona': '2.17,41.38',
    };
    return coords[city] || '2.17,41.38'; // Default to Barcelona if city not found
  };

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

        <View style={styles.imageContainer}>
          {hotel.images && hotel.images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              {hotel.images.map((img, index) => (
                <View key={index} style={styles.slide}>
                  <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
                  <View style={styles.imageBadge}>
                    <Text style={styles.imageBadgeText}>{index + 1} / {hotel.images.length}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Фото відсутнє</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{hotel.name}</Text>
              <Text style={styles.location}>
                {hotel.city}, {hotel.country}{hotel.address ? `, ${hotel.address}` : ''}
              </Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.wording}>
            {hotel.distanceToCenterKm.toFixed(1)} км від центру
          </Text>

          <Text style={styles.description}>{hotel.description}</Text>

          {/* Map Section */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.sectionTitle}>Місцезнаходження</Text>
              <View style={styles.locationRating}>
                <Text style={styles.locationRatingText}>Чудове розташування! </Text>
                <View style={styles.miniRating}>
                  <Text style={styles.miniRatingText}>9.5</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.mapPreviewContainer}
              activeOpacity={0.9}
              onPress={() => {
                const query = encodeURIComponent(`${hotel.name}, ${hotel.address || ''}, ${hotel.city}, ${hotel.country}`);
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
              }}
            >
              <Image
                source={{ uri: `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${getCityCoords(hotel.city)}&z=14&l=map&size=600,300&pt=${getCityCoords(hotel.city)},pm2rdm` }}
                style={styles.mapImage}
              />
              <View style={styles.mapOverlay}>
                <View style={styles.showMapButton}>
                  <Text style={styles.showMapButtonText}>📍 Показати на карті</Text>
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.fullAddressText}>
              <Text style={{ fontWeight: 'bold', color: '#1a1a1a' }}>Адреса: </Text>
              {hotel.address ? hotel.address : `${hotel.city}, ${hotel.country}`}
            </Text>
          </View>

          {popularAmenities.length > 0 && (
            <View style={styles.popularFacilitiesSection}>
              <Text style={styles.sectionTitle}>Популярні зручності</Text>
              <View style={styles.popularGrid}>
                {popularAmenities.map((amenity, index) => (
                  <View key={index} style={styles.popularItem}>
                    <Text style={styles.popularIcon}>{popularAmenityIcons[amenity]}</Text>
                    <Text style={styles.popularText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {hotel.facilities && hotel.facilities.length > 0 && (
            <View style={styles.facilitiesSection}>
              <Text style={styles.sectionTitle}>Зручності</Text>
              {hotel.facilities.map((facility, index) => (
                <View key={`${facility.name}-${index}`}>
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

          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Відгуки ({reviews.length})</Text>

              {isAuthenticated && (
                <View style={styles.addReviewCard}>
                  <Text style={styles.addReviewTitle}>Поділіться враженнями</Text>
                  <View style={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                        <Text style={[styles.star, star <= reviewRating && styles.starActive]}>
                          {star <= reviewRating ? '★' : '☆'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Напишіть ваш відгук..."
                    value={reviewText}
                    onChangeText={setReviewText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.submitReviewBtn, isSubmittingReview && { opacity: 0.7 }]}
                    onPress={async () => {
                      if (!reviewText.trim()) return;
                      try {
                        setIsSubmittingReview(true);
                        await reviewAPI.create(hotelId, { rating: reviewRating, text: reviewText });
                        setReviewText('');
                        loadData(); // Refresh reviews
                        Alert.alert('Дякуємо!', 'Ваш відгук опубліковано');
                      } catch (e) {
                        Alert.alert('Помилка', 'Не вдалося залишити відгук');
                      } finally {
                        setIsSubmittingReview(false);
                      }
                    }}
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.submitReviewBtnText}>Надіслати відгук</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.author}</Text>
                    <View style={styles.reviewRating}>
                      <Text style={styles.reviewRatingText}>⭐ {review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{review.daysAgo} днів тому</Text>
                  <Text style={styles.reviewText}>{review.text}</Text>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  error: { fontSize: 16, color: '#EF4444', fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  backButton: { padding: 16 },
  backLink: { color: '#2563EB', fontWeight: '600', fontSize: 16 },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  image: { width: '100%', height: 260, backgroundColor: '#e5e7eb' },
  content: { padding: 18 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  titleContainer: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  location: { marginTop: 6, color: '#6b7280' },
  ratingBadge: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, minWidth: 50, justifyContent: 'center', alignItems: 'center' },
  ratingText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  wording: { color: '#4b5563', marginBottom: 16, fontSize: 14 },
  description: { lineHeight: 22, color: '#374151', marginBottom: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  tagBadge: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  tagText: { color: '#111827', fontWeight: '600', fontSize: 13 },
  facilitiesSection: { marginBottom: 24 },
  roomsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  facilityName: { fontWeight: '600', color: '#374151', marginBottom: 4 },
  facilityItems: { color: '#6B7280', fontSize: 13, marginBottom: 8 },
  roomCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomName: { fontWeight: '600', color: '#111827' },
  roomPrice: { color: '#2563EB', fontWeight: '700', fontSize: 16 },
  roomBeds: { color: '#6B7280', fontSize: 13, marginBottom: 4 },
  cancellation: { color: '#059669', fontSize: 13 },
  reviewsSection: { marginBottom: 24 },
  reviewCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewAuthor: { fontWeight: '700', color: '#111827', fontSize: 15 },
  reviewRating: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  reviewRatingText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  reviewDate: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  reviewText: { color: '#374151', lineHeight: 20 },
  addReviewCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addReviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    fontSize: 28,
    color: '#d1d5db',
    marginRight: 4,
  },
  starActive: {
    color: '#FF9500',
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    color: '#333',
  },
  submitReviewBtn: {
    backgroundColor: '#006ce4',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 20 },
  priceLabel: { color: '#6b7280', marginBottom: 6, fontSize: 14 },
  price: { fontSize: 24, fontWeight: '800', color: '#2563EB' },
  bookButton: { backgroundColor: '#2563eb', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14 },
  bookButtonText: { color: '#fff', fontWeight: '700' },
  retryButton: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  backButtonText: { color: '#2563EB', fontWeight: '600', fontSize: 16 },
  imageContainer: { width: '100%', height: 260, backgroundColor: '#e5e7eb' },
  imageScroll: { width: '100%', height: '100%' },
  slide: { width: SCREEN_WIDTH, height: 260, position: 'relative' },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#9ca3af', fontWeight: '#600' },
  locationSection: {
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  miniRating: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 4,
  },
  miniRatingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mapPreviewContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e5e7eb',
    marginBottom: 10,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showMapButton: {
    backgroundColor: '#006ce4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  showMapButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  fullAddressText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  popularFacilitiesSection: {
    marginBottom: 28,
    paddingTop: 12,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 16,
    paddingRight: 10,
  },
  popularIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#008009', // Booking Green
    fontWeight: 'bold',
  },
  popularText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
  },
});
