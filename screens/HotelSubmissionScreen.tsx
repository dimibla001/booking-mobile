import React, { useState } from 'react';
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
  Modal,
  Switch,
  Image,
} from 'react-native';
import { submissionsAPI, RoomDto } from '../services/api';

const HotelSubmissionScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Partial<RoomDto>[]>([]);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRoom, setNewRoom] = useState({
    id: '',
    name: '',
    beds: '',
    price: '',
    freeCancellation: true,
  });

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    address: '',
    pricePerNight: '',
    distanceToCenterKm: '',
    description: '',
    images: [] as string[],
  });

  const handleAddImage = () => {
    if (!newImageUrl) return;
    setFormData({
      ...formData,
      images: [...formData.images, newImageUrl],
    });
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    const nextImages = [...formData.images];
    nextImages.splice(index, 1);
    setFormData({ ...formData, images: nextImages });
  };

  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.price) {
      Alert.alert('Помилка', 'Будь ласка, вкажіть назву та ціну номера');
      return;
    }
    const room: any = {
      ...newRoom,
      id: `room-${Date.now()}`,
      price: parseFloat(newRoom.price)
    };
    setRooms([...rooms, room]);
    setRoomModalVisible(false);
    setNewRoom({ id: '', name: '', beds: '', price: '', freeCancellation: true });
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.roomCard}>
      <View style={styles.flex1}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomDetails}>{item.beds} • ${item.price}</Text>
      </View>
      <TouchableOpacity onPress={() => removeRoom(index)} style={styles.removeBtn}>
        <Text style={styles.removeText}>Удалити</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSubmit = async () => {
    if (!formData.name || !formData.city || !formData.country) {
      Alert.alert('Помилка', 'Будь ласка, заповніть обов\'язкові поля (Назва, Місто, Країна)');
      return;
    }

    if (rooms.length === 0) {
      Alert.alert('Помилка', 'Потрібно додати хоча б один номер');
      return;
    }

    try {
      setLoading(true);
      const request = {
        ...formData,
        pricePerNight: parseFloat(formData.pricePerNight) || 0,
        distanceToCenterKm: parseFloat(formData.distanceToCenterKm) || 0,
        tags: [],
        amenities: [],
        images: [],
        scoreItems: [],
        facilities: [],
        rooms: rooms,
      };

      await submissionsAPI.create(request);
      Alert.alert('Успіх', 'Заявку на додавання готелю відправлено. Очікуйте на модерацію.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Помилка', error.message || 'Не вдалося відправити заявку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Додати свій готель</Text>
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Назва готелю *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="напр. Central Boutique Hotel"
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Місто *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
            />
          </View>
          <View style={[styles.flex1, { marginLeft: 10 }]}>
            <Text style={styles.label}>Країна *</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) => setFormData({ ...formData, country: text })}
            />
          </View>
        </View>

        <Text style={styles.label}>Точна адреса</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="вулиця, номер будинку"
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Ціна за ніч ($)</Text>
            <TextInput
              style={styles.input}
              value={formData.pricePerNight}
              onChangeText={(text) => setFormData({ ...formData, pricePerNight: text })}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flex1, { marginLeft: 10 }]}>
            <Text style={styles.label}>До центра (км)</Text>
            <TextInput
              style={styles.input}
              value={formData.distanceToCenterKm}
              onChangeText={(text) => setFormData({ ...formData, distanceToCenterKm: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Photos Section */}
        <Text style={styles.label}>Фотографії готелю</Text>
        <View style={styles.imageGrid}>
          {formData.images.map((url, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: url }} style={styles.gridImage} />
              <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(index)}>
                <Text style={styles.removeImgText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.addImageRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Вставте URL фото"
            value={newImageUrl}
            onChangeText={setNewImageUrl}
          />
          <TouchableOpacity style={styles.addImgBtn} onPress={handleAddImage}>
            <Text style={styles.addImgText}>Додати</Text>
          </TouchableOpacity>
        </View>

        {/* Rooms Section */}
        <View style={styles.roomsSection}>
          <Text style={styles.label}>Доступні номери * ({rooms.length})</Text>
          {rooms.map((room, index) => (
            <View key={index} style={styles.roomCard}>
              <View style={styles.flex1}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomDetails}>{room.beds} • ${room.price}</Text>
              </View>
              <TouchableOpacity onPress={() => removeRoom(index)}>
                <Text style={styles.removeText}>Видалити</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addRoomBtn}
            onPress={() => setRoomModalVisible(true)}
          >
            <Text style={styles.addRoomBtnText}>+ Додати номер</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Опис</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Відправити на модерацію</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Room Modal */}
      <Modal visible={roomModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Новий номер</Text>

            <Text style={styles.label}>Назва номера</Text>
            <TextInput
              style={styles.input}
              value={newRoom.name}
              onChangeText={(text) => setNewRoom({...newRoom, name: text})}
              placeholder="напр. Standard Double Room"
            />

            <Text style={styles.label}>Кроваті</Text>
            <TextInput
              style={styles.input}
              value={newRoom.beds}
              onChangeText={(text) => setNewRoom({...newRoom, beds: text})}
              placeholder="напр. 1 double bed"
            />

            <Text style={styles.label}>Ціна номера ($)</Text>
            <TextInput
              style={styles.input}
              value={newRoom.price}
              onChangeText={(text) => setNewRoom({...newRoom, price: text})}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Безкоштовна скасування</Text>
              <Switch
                value={newRoom.freeCancellation}
                onValueChange={(val) => setNewRoom({...newRoom, freeCancellation: val})}
              />
            </View>

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
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50,
  },
  backButton: { fontSize: 16, color: '#006ce4', marginRight: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f9fafb',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', marginBottom: 0 },
  flex1: { flex: 1 },
  roomsSection: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roomName: { fontWeight: '700', color: '#1a1a1a' },
  roomDetails: { color: '#666', fontSize: 13 },
  removeText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
  },
  addRoomBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#006ce4',
    borderStyle: 'dashed',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addRoomBtnText: { color: '#006ce4', fontWeight: '700' },
  button: {
    backgroundColor: '#008009',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3f4f6' },
  cancelBtnText: { color: '#666', fontWeight: '600' },
  saveBtn: { backgroundColor: '#006ce4' },
  saveBtnText: { color: '#fff', fontWeight: '600' },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  imageWrapper: { width: 60, height: 60, position: 'relative' },
  gridImage: { width: '100%', height: '100%', borderRadius: 8 },
  removeImgBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  removeImgText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  addImageRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  addImgBtn: { backgroundColor: '#006ce4', paddingHorizontal: 16, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addImgText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default HotelSubmissionScreen;

