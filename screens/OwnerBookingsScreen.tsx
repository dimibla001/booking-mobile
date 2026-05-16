import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { ownerAPI, BookingDto } from '../services/api';

const OwnerBookingsScreen = ({ navigation }: any) => {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await ownerAPI.getBookings();
      setBookings(data.items);
    } catch (error: any) {
      Alert.alert('Помилка', error.message || 'Не вдалося завантажити бронювання вашого готелю');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (id: string, action: 'accept' | 'reject') => {
    const title = action === 'accept' ? 'Підтвердити бронювання?' : 'Відхилити бронювання?';
    Alert.alert(title, '', [
      { text: 'Скасувати' },
      {
        text: action === 'accept' ? 'Підтвердити' : 'Відхилити',
        onPress: async () => {
          try {
            if (action === 'accept') {
              await ownerAPI.accept(id);
            } else {
              await ownerAPI.reject(id, 'Відхилено власником');
            }
            Alert.alert('Успіх', `Бронювання ${action === 'accept' ? 'підтверджено' : 'відхилено'}`);
            loadBookings();
          } catch (error: any) {
            Alert.alert('Помилка', error.message || 'Дія не вдалася');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: BookingDto }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.bookingId}>Бронювання #{item.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.dateText}>
            {new Date(item.checkIn).toLocaleDateString()} — {new Date(item.checkOut).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? '#dcfce7' : '#fef3c7' }]}>
          <Text style={[styles.statusText, { color: item.status === 'confirmed' ? '#166534' : '#92400e' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailRow}>👤 Гостей: {item.guests}</Text>
        <Text style={styles.detailRow}>💵 Дохід: {item.totalPrice} {item.currency}</Text>
      </View>

      {item.status === 'pending_owner_approval' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.acceptBtn]}
            onPress={() => handleAction(item.id, 'accept')}
          >
            <Text style={styles.btnText}>✅ Підтвердити</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={() => handleAction(item.id, 'reject')}
          >
            <Text style={styles.btnText}>❌ Відхилити</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Бронювання моїх готелів</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#006ce4" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>У ваших готелях поки немає бронювань</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingTop: 50 },
  backButton: { fontSize: 16, color: '#006ce4', marginRight: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  bookingId: { fontSize: 14, fontWeight: '800', color: '#1a1a1a' },
  dateText: { fontSize: 13, color: '#64748b', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  details: { marginBottom: 16 },
  detailRow: { fontSize: 14, color: '#475569', marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#10b981' },
  rejectBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 15 },
});

export default OwnerBookingsScreen;
