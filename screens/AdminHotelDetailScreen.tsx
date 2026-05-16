import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  Modal,
  Switch,
} from 'react-native';
import { adminHotelAPI, HotelDto, RoomDto } from '../services/api';

const AdminHotelDetailScreen = ({ route, navigation }: any) => {
  const { hotelId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hotel, setHotel] = useState<HotelDto | null>(null);

  // Hotel form data
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    address: '',
    pricePerNight: '',
    description: '',
    images: [] as string[],
  });

  // Room modal state
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [newRoom, setNewRoom] = useState({
    id: '',
    name: '',
    beds: '',
    price: '',
    freeCancellation: true,
    image: '',
  });

  // Image input state
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      const data = await adminHotelAPI.getById(hotelId);
      setHotel(data);
      setFormData({
        name: data.name,
        city: data.city,
        country: data.country,
        address: data.address || '',
        pricePerNight: data.pricePerNight.toString(),
        description: data.description,
        images: data.images || [],
      });
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити дані готелю');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const request = {
        ...hotel, // Keep existing fields like tags, amenities, scoreItems
        ...formData,
        pricePerNight: parseFloat(formData.pricePerNight) || 0,
      };

      await adminHotelAPI.update(hotelId, request);
      Alert.alert('Успіх', 'Дані готелю оновлено');
    } catch (error: any) {
      Alert.alert('Помилка', error.message || 'Не вдалося оновити готель');
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl) return;
    setFormData({
      ...formData,
      images: [...formData.images, newImageUrl],
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleAddRoom = async () => {
    if (!newRoom.id || !newRoom.name || !newRoom.price) {
      Alert.alert('Помилка', 'Будь ласка, заповніть ID, назву та ціну номера');
      return;
    }

    try {
      setSaving(true);
      const request = {
        ...newRoom,
        price: parseFloat(newRoom.price) || 0,
      };
      const updatedHotel = await adminHotelAPI.addRoom(hotelId, request);
      setHotel(updatedHotel);
      setRoomModalVisible(false);
      setNewRoom({ id: '', name: '', beds: '', price: '', freeCancellation: true, image: '' });
      Alert.alert('Успіх', 'Номер додано');
    } catch (error: any) {
      Alert.alert('Помилка', error.message || 'Не вдалося додати номер');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    Alert.alert('Видалити номер?', 'Ця дія необоротна', [
      { text: 'Ні' },
      {
        text: 'Так',
        onPress: async () => {
          try {
            setSaving(true);
            await adminHotelAPI.deleteRoom(hotelId, roomId);
            // Refresh hotel data
            const updatedHotel = await adminHotelAPI.getById(hotelId);
            setHotel(updatedHotel);
            Alert.alert('Успіх', 'Номер видалено');
          } catch (error: any) {
            Alert.alert('Помилка', 'Не вдалося видалити номер');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Редагувати готель</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основна інформація</Text>

          <Text style={styles.label}>Назва</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Місто</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
            </View>
            <View style={[styles.flex1, { marginLeft: 10 }]}>
              <Text style={styles.label}>Країна</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
              />
            </View>
          </View>

          <Text style={styles.label}>Точна адреса (вулиця, будинок)</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="напр. Carrer de Mallorca, 401"
          />

          <Text style={styles.label}>Ціна за ніч ($)</Text>
          <TextInput
            style={styles.input}
            value={formData.pricePerNight}
            onChangeText={(text) => setFormData({ ...formData, pricePerNight: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Опис</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Зберегти зміни готелю</Text>}
          </TouchableOpacity>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Фотографії</Text>
          <View style={styles.imageGrid}>
            {formData.images.map((url, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: url }} style={styles.gridImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addImageRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="URL фотографії (натисніть +)"
              value={newImageUrl}
              onChangeText={setNewImageUrl}
            />
            <TouchableOpacity style={styles.smallAddBtn} onPress={handleAddImage}>
              <Text style={styles.smallAddBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Після додавання всіх фото натисніть кнопку "Зберегти зміни"</Text>
        </View>

        {/* Rooms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Номери ({hotel?.rooms?.length || 0})</Text>
          {hotel?.rooms?.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomBeds}>{room.beds}</Text>
                <Text style={styles.roomPrice}>${room.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteRoomBtn}
                onPress={() => handleDeleteRoom(room.id)}
              >
                <Text style={styles.deleteRoomBtnText}>Видалити</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addRoomButton}
            onPress={() => setRoomModalVisible(true)}
          >
            <Text style={styles.addRoomButtonText}>+ Додати номер</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Room Modal */}
      <Modal
        visible={roomModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRoomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Новий номер</Text>

            <ScrollView>
              <Text style={styles.label}>ID номера *</Text>
              <TextInput
                style={styles.input}
                value={newRoom.id}
                onChangeText={(text) => setNewRoom({...newRoom, id: text})}
                placeholder="room-101"
              />

              <Text style={styles.label}>Назва *</Text>
              <TextInput
                style={styles.input}
                value={newRoom.name}
                onChangeText={(text) => setNewRoom({...newRoom, name: text})}
                placeholder="Double Room"
              />

              <Text style={styles.label}>Ліжка</Text>
              <TextInput
                style={styles.input}
                value={newRoom.beds}
                onChangeText={(text) => setNewRoom({...newRoom, beds: text})}
                placeholder="1 double bed"
              />

              <Text style={styles.label}>Ціна ($) *</Text>
              <TextInput
                style={styles.input}
                value={newRoom.price}
                onChangeText={(text) => setNewRoom({...newRoom, price: text})}
                keyboardType="numeric"
              />

              <Text style={styles.label}>URL фото</Text>
              <TextInput
                style={styles.input}
                value={newRoom.image}
                onChangeText={(text) => setNewRoom({...newRoom, image: text})}
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Безкоштовне скасування</Text>
                <Switch
                  value={newRoom.freeCancellation}
                  onValueChange={(val) => setNewRoom({...newRoom, freeCancellation: val})}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setRoomModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleAddRoom}
              >
                <Text style={styles.saveBtnText}>Додати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50,
  },
  backButton: { fontSize: 16, color: '#007AFF', marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', marginBottom: 16 },
  flex1: { flex: 1 },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Image styles
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  imageWrapper: { width: '31%', aspectRatio: 1, position: 'relative' },
  gridImage: { width: '100%', height: '100%', borderRadius: 8 },
  removeImageBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  addImageRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  smallAddBtn: { backgroundColor: '#34C759', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  smallAddBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#888', marginTop: 8, fontStyle: 'italic' },

  // Room styles
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 16, fontWeight: '600', color: '#333' },
  roomBeds: { fontSize: 13, color: '#888' },
  roomPrice: { fontSize: 15, fontWeight: 'bold', color: '#007AFF', marginTop: 4 },
  deleteRoomBtn: { padding: 8 },
  deleteRoomBtnText: { color: '#FF3B30', fontWeight: '600' },
  addRoomButton: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addRoomButtonText: { color: '#007AFF', fontWeight: '600' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f0f0f0' },
  cancelBtnText: { color: '#333', fontWeight: '600' },
  saveBtn: { backgroundColor: '#007AFF' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});

export default AdminHotelDetailScreen;
