import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { hotelAPI, userAPI, HotelDto } from '../services/api';
import { HotelCard } from '../components/HotelCard';

const FavoritesScreen = ({ navigation }: any) => {
  const [favorites, setFavorites] = useState<HotelDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.log('Error loading favorites', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (hotelId: string) => {
    try {
      // In a real app we'd call the API to remove.
      // For now, let's just update local state to feel fast
      await userAPI.removeFavorite(hotelId);
      setFavorites(favorites.filter(h => h.id !== hotelId));
    } catch (e) {
      console.log('Remove favorite failed', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Обране ❤️</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HotelCard
              hotel={item}
              isFavorite={true}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>У вас поки немає обраних готелів</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <Text style={styles.link}>Знайти щось цікаве</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', paddingTop: 50 },
  backButton: { fontSize: 16, color: '#2563eb', fontWeight: 'bold', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#64748b', marginBottom: 12 },
  link: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
});

export default FavoritesScreen;
