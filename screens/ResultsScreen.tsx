import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HotelCard } from '../components/HotelCard';
import { hotelAPI, HotelDto } from '../services/api';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ navigation, route }: Props) {
  const [hotels, setHotels] = useState<HotelDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchQuery = route.params?.searchQuery || '';

  useEffect(() => {
    loadResults();
  }, [searchQuery]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: HotelDto[];
      if (searchQuery) {
        data = await hotelAPI.search(searchQuery);
      } else {
        data = await hotelAPI.getAll();
      }
      setHotels(data);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження результатів');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Результати</Text>
        <Text style={styles.subtitle}>
          {isLoading ? 'Завантаження...' : `Знайдено ${hotels.length}`}
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadResults} style={styles.retryButton}>
            <Text style={styles.retryText}>Спробувати знову</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : hotels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Готелі не знайдені</Text>
          <TouchableOpacity
            onPress={() => {
              setHotels([]);
              navigation.goBack();
            }}
          >
            <Text style={styles.emptyLink}>Повернутися до пошуку</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HotelCard
              hotel={item}
              onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  headerRow: {
    marginTop: 16,
    marginBottom: 12,
  },
  backButton: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#991B1B',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
