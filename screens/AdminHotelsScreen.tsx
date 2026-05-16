import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { adminHotelAPI, HotelDto } from '../services/api';

const AdminHotelsScreen = ({ navigation }: any) => {
  const [hotels, setHotels] = useState<HotelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const data = await adminHotelAPI.getAll();
      setHotels(data.items);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити готелі');
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchText.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = (hotelId: string) => {
    Alert.alert('Видалити готель?', 'Ця дія необоротна', [
      { text: 'Ні', onPress: () => {} },
      {
        text: 'Так',
        onPress: async () => {
          try {
            await adminHotelAPI.delete(hotelId);
            setHotels(hotels.filter((h) => h.id !== hotelId));
            Alert.alert('Успіх', 'Готель видалено');
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося видалити готель');
          }
        },
      },
    ]);
  };

  const renderHotelItem = ({ item }: { item: HotelDto }) => (
    <View style={styles.hotelCard}>
      <View style={styles.hotelHeader}>
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{item.name}</Text>
          <Text style={styles.hotelLocation}>
            {item.city}, {item.country}
          </Text>
        </View>
        <View style={styles.hotelStats}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.price}>${item.pricePerNight}</Text>
        </View>
      </View>

      <Text style={styles.hotelDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.hotelMeta}>
        <Text style={styles.metaItem}>🛏️ {item.rooms?.length || 0} номерів</Text>
        <Text style={styles.metaItem}>💬 {item.reviewCount} відгуків</Text>
        <Text style={styles.metaItem}>📍 {item.distanceToCenterKm}км від центра</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AdminHotelDetail', { hotelId: item.id })}
        >
          <Text style={styles.editButtonText}>✏️ Редагувати</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>Управління готелями</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Пошук за назвою або містом..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AdminHotelCreate')}
      >
        <Text style={styles.addButtonText}>➕ Додати новий готель</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredHotels}
        renderItem={renderHotelItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Готелі не знайдені</Text>
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
  searchInput: {
    margin: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 14,
  },
  addButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    backgroundColor: '#34C759',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  hotelCard: {
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
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  hotelLocation: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  hotelStats: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4,
  },
  hotelDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  hotelMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 12,
    color: '#555',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
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

export default AdminHotelsScreen;
