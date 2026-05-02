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
import { adminReviewAPI, AdminReviewDto } from '../services/api';

const AdminReviewsScreen = () => {
  const [reviews, setReviews] = useState<AdminReviewDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await adminReviewAPI.getAll();
      setReviews(data);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити відгуки');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reviewId: string) => {
    Alert.alert('Видалити відгук?', 'Ця дія необоротна', [
      { text: 'Ні', onPress: () => {} },
      {
        text: 'Так',
        onPress: async () => {
          try {
            await adminReviewAPI.delete(reviewId);
            setReviews(reviews.filter((r) => r.id !== reviewId));
            Alert.alert('Успіх', 'Відгук видалено');
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося видалити відгук');
          }
        },
      },
    ]);
  };

  const renderReviewItem = ({ item }: { item: AdminReviewDto }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewInfo}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.hotelName}>📍 {item.hotelName || 'Невідомо'}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>
          <Text style={styles.ratingNumber}>{item.rating}/5</Text>
        </View>
      </View>

      <Text style={styles.reviewText}>{item.text}</Text>

      <View style={styles.reviewFooter}>
        <Text style={styles.daysAgo}>{item.daysAgo} днів тому</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteButtonText}>🗑️ Видалити</Text>
        </TouchableOpacity>
      </View>
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
        <Text style={styles.title}>Модерація відгуків</Text>
        <Text style={styles.subtitle}>{reviews.length} відгуків</Text>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Відгуки не знайдені</Text>
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
  subtitle: {
    fontSize: 12,
    color: '#e0e0e0',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  hotelName: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 12,
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  reviewText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  daysAgo: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
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

export default AdminReviewsScreen;
