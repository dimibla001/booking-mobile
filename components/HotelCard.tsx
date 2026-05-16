import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { HotelDto } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  hotel: HotelDto;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function HotelCard({ hotel, onPress }: Props) {
  const hasImage = hotel.images && hotel.images.length > 0;
  const firstImage = hasImage ? hotel.images[0] : null;

  const openInMaps = () => {
    const query = encodeURIComponent(`${hotel.name}, ${hotel.city}, ${hotel.country}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {hotel.name}
            </Text>
            <Text style={styles.city}>{hotel.city}, {hotel.country}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
          </View>
        </View>

        {hotel.address && (
          <View style={styles.addressRow}>
            <View style={styles.dotIcon} />
            <Text style={styles.addressText} numberOfLines={1}>{hotel.address}</Text>
          </View>
        )}

        <Text style={styles.destination}>
          {hotel.distanceToCenterKm.toFixed(1)} км від центру
        </Text>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.price}>${hotel.pricePerNight.toFixed(0)}</Text>
            <Text style={styles.reviews}>{hotel.reviewCount} відгуків</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.chatButton} onPress={() => Linking.openURL('https://t.me/your_support')}>
              <Text style={styles.chatIcon}>💬</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
              <Text style={styles.mapButtonText}>На мапі</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 170,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  heartIcon: {
    fontSize: 16,
  },
  info: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  city: {
    marginTop: 2,
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dotIcon: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
    marginRight: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#003580', // Booking Dark Blue
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderBottomRightRadius: 0,
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  destination: {
    color: '#6b7280',
    marginBottom: 12,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563eb',
  },
  reviews: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatButton: {
    width: 44,
    height: 44,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  chatIcon: {
    fontSize: 18,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mapIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
});
