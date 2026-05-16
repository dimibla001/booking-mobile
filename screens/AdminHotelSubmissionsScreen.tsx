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
import { adminSubmissionsAPI } from '../services/api';

const AdminHotelSubmissionsScreen = ({ navigation }: any) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await adminSubmissionsAPI.getAll('pending');
      setSubmissions(data.items);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    Alert.alert('Схвалити готель?', 'Він стане доступним для всіх користувачів', [
      { text: 'Скасувати' },
      {
        text: 'Схвалити',
        onPress: async () => {
          try {
            await adminSubmissionsAPI.approve(id);
            Alert.alert('Успіх', 'Готель схвалено');
            loadSubmissions();
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося схвалити готель');
          }
        },
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert(
      'Відхилити заявку?',
      'Ви впевнені, що хочете відхилити цей готель?',
      [
        { text: 'Скасувати' },
        {
          text: 'Відхилити',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminSubmissionsAPI.reject(id, 'Не відповідає вимогам');
              Alert.alert('Успіх', 'Заявку відхилено');
              loadSubmissions();
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося відхилити заявку');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.hotelName}>{item.name}</Text>
        <Text style={styles.statusBadge}>{item.status}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>📍 {item.city}, {item.country}</Text>
        <Text style={styles.detailText}>💵 Ціна: ${item.pricePerNight}</Text>
        <Text style={styles.detailText}>👤 Від: {item.ownerEmail || 'Користувач'}</Text>
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.actionBtnText}>✅ Схвалити</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.actionBtnText}>❌ Відхилити</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Модерація готелів</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Нових заявок немає</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', paddingTop: 50 },
  backButton: { fontSize: 16, color: '#007AFF', marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  hotelName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  statusBadge: { backgroundColor: '#fff7ed', color: '#c2410c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  details: { marginBottom: 16 },
  detailText: { fontSize: 14, color: '#666', marginBottom: 4 },
  description: { fontSize: 13, color: '#888', marginTop: 8, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  approveBtn: { backgroundColor: '#34C759' },
  rejectBtn: { backgroundColor: '#FF3B30' },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});

export default AdminHotelSubmissionsScreen;
