import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HotelDto } from '../services/api';

type Props = {
  hotel: HotelDto;
  onPress: () => void;
};

export function HotelCard({ hotel, onPress }: Props) {
  const firstImage = hotel.images?.[0] || 'https://via.placeholder.com/300x170?text=No+Image';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: firstImage }}
        style={styles.image}
        defaultSource={{ uri: 'https://via.placeholder.com/300x170?text=Loading' }}
      />
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {hotel.name}
            </Text>
            <Text style={styles.city}>{hotel.city}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.destination}>
          {hotel.distanceToCenterKm.toFixed(1)} км від центру
        </Text>
        <View style={styles.footerRow}>
          <Text style={styles.price}>${hotel.pricePerNight.toFixed(0)}</Text>
          <Text style={styles.reviews}>{hotel.reviewCount} відгуків</Text>
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
  image: {
    width: '100%',
    height: 170,
    backgroundColor: '#f0f0f0',
  },
  info: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
    marginTop: 4,
    color: '#6b7280',
    fontSize: 14,
  },
  ratingBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
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
    color: '#4b5563',
    marginBottom: 12,
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2563eb',
  },
  reviews: {
    color: '#6b7280',
    fontSize: 13,
  },
});
