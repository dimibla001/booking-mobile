import React, { useState, useEffect } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HotelCard } from '../components/HotelCard';
import { hotelAPI, HotelDto, HotelSearchParams } from '../services/api';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [hotels, setHotels] = useState<HotelDto[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<HotelDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{city?: string, country?: string} | null>(null);

  const { user } = useAuth();

  const [filters, setFilters] = useState<HotelSearchParams>({
    query: '',
    city: '',
    country: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    freeCancellation: false,
    sort: '',
  });

  useEffect(() => {
    loadHotels();
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      const locResponse = await fetch('https://ipapi.co/json/');
      const locationData = await locResponse.json();
      if (locationData && locationData.city) {
        setUserLocation({ city: locationData.city, country: locationData.country_name });
        setLocationName(locationData.city);
      }
    } catch (err) {
      console.log('Location detection failed', err);
    }
  };

  const loadHotels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await hotelAPI.getAll();
      setHotels(data.items);
      setFilteredHotels(data.items);
    } catch (err: any) {
      setError('Помилка завантаження готелів');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    navigation.navigate('Results', { searchQuery: searchQuery || filters.query, filters });
  };

  const applyFilters = () => {
    setIsFilterVisible(false);
    navigation.navigate('Results', { filters });
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
      sort: '',
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.title}>Booking</Text>
          <Text style={styles.subtitle}>Знайдіть ідеальне місце</Text>
        </View>
        {user && (
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.fullName[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchBlock}>
        <View style={styles.inputContainer}>
          <View style={styles.searchIconInner}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Назва отеля або місто"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setFilters(prev => ({ ...prev, query: text }));
            }}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterVisible(true)}
        >
          <View style={styles.filterIconInner}>
            <View style={[styles.filterLine, { top: 6 }]} />
            <View style={[styles.filterDot, { top: 4, left: 14 }]} />
            <View style={[styles.filterLine, { top: 14 }]} />
            <View style={[styles.filterDot, { top: 12, left: 4 }]} />
            <View style={[styles.filterLine, { top: 22 }]} />
            <View style={[styles.filterDot, { top: 20, left: 10 }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Результати пошуку' : 'Популярні готелі'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Results', { searchQuery })}>
          <Text style={styles.link}>Усі</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <>
          <FlatList
            data={filteredHotels}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <HotelCard
                hotel={item}
                onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })}
              />
            )}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Готелі не знайдені</Text>
                <TouchableOpacity onPress={loadHotels} style={styles.retryButton}>
                  <Text style={styles.retryText}>Скинути</Text>
                </TouchableOpacity>
              </View>
            }
          />

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
                    style={styles.modalInput}
                    value={filters.query}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, query: text }))}
                    placeholder="Введіть текст для пошуку..."
                  />

                  <View style={styles.row}>
                    <View style={styles.flex1}>
                      <Text style={styles.label}>Місто</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={filters.city}
                        onChangeText={(text) => setFilters(prev => ({ ...prev, city: text }))}
                      />
                    </View>
                    <View style={[styles.flex1, { marginLeft: 10 }]}>
                      <Text style={styles.label}>Країна</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={filters.country}
                        onChangeText={(text) => setFilters(prev => ({ ...prev, country: text }))}
                      />
                    </View>
                  </View>

                  {userLocation && (
                    <TouchableOpacity
                      style={styles.nearbyFilterBtn}
                      onPress={() => setFilters(prev => ({ ...prev, city: userLocation.city, country: userLocation.country }))}
                    >
                      <Text style={styles.nearbyFilterBtnText}>📍 Знайти поруч (м. {userLocation.city})</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.label}>Ціна за ніч (від - до)</Text>
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.modalInput, styles.flex1]}
                      placeholder="Мін"
                      keyboardType="numeric"
                      value={filters.minPrice?.toString()}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text ? parseFloat(text) : undefined }))}
                    />
                    <Text style={styles.dash}>—</Text>
                    <TextInput
                      style={[styles.modalInput, styles.flex1]}
                      placeholder="Макс"
                      keyboardType="numeric"
                      value={filters.maxPrice?.toString()}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text ? parseFloat(text) : undefined }))}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={styles.flex1}>
                      <Text style={styles.label}>Мін. рейтинг</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="4.5"
                        keyboardType="numeric"
                        value={filters.minRating?.toString()}
                        onChangeText={(text) => setFilters(prev => ({ ...prev, minRating: text ? parseFloat(text) : undefined }))}
                      />
                    </View>
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.label}>Безкоштовна скасування</Text>
                    <Switch
                      value={filters.freeCancellation}
                      onValueChange={(val) => setFilters(prev => ({ ...prev, freeCancellation: val }))}
                      trackColor={{ false: "#d1d5db", true: "#2563eb" }}
                    />
                  </View>

                  <Text style={styles.label}>Сортування</Text>
                  <View style={styles.sortRow}>
                    {['PriceAsc', 'PriceDesc', 'RatingDesc'].map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.sortBtn, filters.sort === s && styles.sortBtnActive]}
                        onPress={() => setFilters(prev => ({ ...prev, sort: s }))}
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
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContent: { paddingHorizontal: 16, paddingTop: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#4b5563', fontSize: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  searchBlock: { marginBottom: 24, flexDirection: 'row', gap: 10, paddingHorizontal: 4 },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#1e293b', marginLeft: 8 },
  searchIconInner: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  searchCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#64748b' },
  searchHandle: { width: 6, height: 2, backgroundColor: '#64748b', position: 'absolute', bottom: 2, right: 0, transform: [{ rotate: '45deg' }] },
  filterButton: {
    width: 54,
    height: 54,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  filterIconInner: { width: 24, height: 28, position: 'relative' },
  filterLine: { position: 'absolute', height: 2, width: '100%', backgroundColor: '#fff', opacity: 0.3, borderRadius: 1 },
  filterDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', borderWidth: 1, borderColor: '#2563eb' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  link: { color: '#2563eb', fontWeight: '700' },
  listContent: { paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  retryButton: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },

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
  modalInput: {
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
  nearbyFilterBtn: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 16,
    alignItems: 'center',
  },
  nearbyFilterBtnText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 14,
  },
});
