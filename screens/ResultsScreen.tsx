import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HotelCard } from '../components/HotelCard';
import { hotelAPI, HotelDto, HotelSearchParams } from '../services/api';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ navigation, route }: Props) {
  const { isAuthenticated } = useAuth();
  const [hotels, setHotels] = useState<HotelDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState<HotelSearchParams>(route.params?.filters || {
    query: route.params?.searchQuery || '',
    city: '',
    country: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    freeCancellation: false,
    minReviewCount: undefined,
    maxDistanceToCenterKm: undefined,
    sort: '',
  });

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '' && v !== false);

      if (hasFilters) {
        const data = await hotelAPI.search(filters);
        setHotels(data.items);
      } else {
        const data = await hotelAPI.getAll();
        setHotels(data.items);
      }
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження результатів');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setIsFilterVisible(false);
    loadResults();
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      city: '',
      country: '',
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      freeCancellation: false,
      minReviewCount: undefined,
      maxDistanceToCenterKm: undefined,
      sort: '',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Назад</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setIsFilterVisible(true)}
          >
            <Text style={styles.filterToggleText}>Фільтри ⚙️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Результати</Text>
        <Text style={styles.subtitle}>
          {isLoading ? 'Завантаження...' : `Знайдено ${hotels.length} готелів`}
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
          <Text style={styles.emptyText}>Готелі не знайдені з такими параметрами</Text>
          <TouchableOpacity
            onPress={() => {
              resetFilters();
              setIsFilterVisible(true);
            }}
          >
            <Text style={styles.emptyLink}>Змінити фільтри</Text>
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

      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Розширений пошук</Text>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Назва або опис</Text>
              <TextInput
                style={styles.input}
                value={filters.query}
                onChangeText={(text) => setFilters({...filters, query: text})}
                placeholder="Введіть текст для пошуку..."
              />

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Місто</Text>
                  <TextInput
                    style={styles.input}
                    value={filters.city}
                    onChangeText={(text) => setFilters({...filters, city: text})}
                  />
                </View>
                <View style={[styles.flex1, { marginLeft: 10 }]}>
                  <Text style={styles.label}>Країна</Text>
                  <TextInput
                    style={styles.input}
                    value={filters.country}
                    onChangeText={(text) => setFilters({...filters, country: text})}
                  />
                </View>
              </View>

              <Text style={styles.label}>Ціна за ніч (від - до)</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Мін"
                  keyboardType="numeric"
                  value={filters.minPrice?.toString()}
                  onChangeText={(text) => setFilters({...filters, minPrice: text ? parseFloat(text) : undefined})}
                />
                <Text style={styles.dash}>—</Text>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Макс"
                  keyboardType="numeric"
                  value={filters.maxPrice?.toString()}
                  onChangeText={(text) => setFilters({...filters, maxPrice: text ? parseFloat(text) : undefined})}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Мін. рейтинг</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="4.5"
                    keyboardType="numeric"
                    value={filters.minRating?.toString()}
                    onChangeText={(text) => setFilters({...filters, minRating: text ? parseFloat(text) : undefined})}
                  />
                </View>
                <View style={[styles.flex1, { marginLeft: 10 }]}>
                  <Text style={styles.label}>Мін. відгуків</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    keyboardType="numeric"
                    value={filters.minReviewCount?.toString()}
                    onChangeText={(text) => setFilters({...filters, minReviewCount: text ? parseInt(text) : undefined})}
                  />
                </View>
              </View>

              <Text style={styles.label}>Макс. відстань до центру (км)</Text>
              <TextInput
                style={styles.input}
                placeholder="5"
                keyboardType="numeric"
                value={filters.maxDistanceToCenterKm?.toString()}
                onChangeText={(text) => setFilters({...filters, maxDistanceToCenterKm: text ? parseFloat(text) : undefined})}
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Безкоштовна скасування</Text>
                <Switch
                  value={filters.freeCancellation}
                  onValueChange={(val) => setFilters({...filters, freeCancellation: val})}
                  trackColor={{ false: "#d1d5db", true: "#2563eb" }}
                />
              </View>

              <Text style={styles.label}>Сортування</Text>
              <View style={styles.sortRow}>
                {['PriceAsc', 'PriceDesc', 'RatingDesc'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sortBtn, filters.sort === s && styles.sortBtnActive]}
                    onPress={() => setFilters({...filters, sort: s})}
                  >
                    <Text style={[styles.sortBtnText, filters.sort === s && styles.sortBtnTextActive]}>
                      {s === 'PriceAsc' ? 'Дешевші' : s === 'PriceDesc' ? 'Дорожчі' : 'Рейтинг'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.resetBtn]}
                onPress={resetFilters}
              >
                <Text style={styles.resetBtnText}>Скинути</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.applyBtn]}
                onPress={applyFilters}
              >
                <Text style={styles.applyBtnText}>Застосувати</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsFilterVisible(false)}
            >
              <Text style={styles.closeBtnText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  filterToggle: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterToggleText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  dash: {
    marginHorizontal: 10,
    color: '#9ca3af',
    marginBottom: 16,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  sortBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sortBtnText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  sortBtnTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetBtn: {
    backgroundColor: '#f3f4f6',
  },
  resetBtnText: {
    color: '#374151',
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: '#2563eb',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  closeBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#6b7280',
    fontWeight: '600',
  },
});
