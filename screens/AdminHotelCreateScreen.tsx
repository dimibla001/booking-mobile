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
  Image,
} from 'react-native';
import { adminHotelAPI } from '../services/api';

const AdminHotelCreateScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    city: '',
    country: '',
    address: '',
    pricePerNight: '',
    rating: '5.0',
    reviewCount: '0',
    distanceToCenterKm: '0',
    description: '',
    images: [] as string[],
  });

  const handleCreate = async () => {
    if (!formData.id || !formData.name || !formData.city || !formData.country) {
      Alert.alert('Помилка', 'Будь ласка, заповніть обов\'язкові поля (ID, Назва, Місто, Країна)');
      return;
    }

    try {
      setLoading(true);
      const request = {
        ...formData,
        pricePerNight: parseFloat(formData.pricePerNight) || 0,
        rating: parseFloat(formData.rating) || 5.0,
        reviewCount: parseInt(formData.reviewCount) || 0,
        distanceToCenterKm: parseFloat(formData.distanceToCenterKm) || 0,
        tags: [],
        amenities: [],
        scoreItems: [],
        facilities: [],
        rooms: [],
      };

      await adminHotelAPI.create(request);
      Alert.alert('Успіх', 'Готель створено');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Помилка', error.message || 'Не вдалося створити готель');
    } finally {
      setLoading(false);
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

  const removeImage = (index: number) => {
    const nextImages = [...formData.images];
    nextImages.splice(index, 1);
    setFormData({ ...formData, images: nextImages });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Створити готель</Text>
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>ID (унікальний рядок) *</Text>
        <TextInput
          style={styles.input}
          value={formData.id}
          onChangeText={(text) => setFormData({ ...formData, id: text })}
          placeholder="напр. hotel-1"
        />

        <Text style={styles.label}>Назва *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
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

        <Text style={styles.label}>Ціна за ніч ($)</Text>
        <TextInput
          style={styles.input}
          value={formData.pricePerNight}
          onChangeText={(text) => setFormData({ ...formData, pricePerNight: text })}
          keyboardType="numeric"
        />

        {/* Photos section in create */}
        <Text style={styles.label}>Фотографії</Text>
        <View style={styles.imageGrid}>
          {formData.images.map((url, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: url }} style={styles.gridImage} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.addImageRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="URL фото"
            value={newImageUrl}
            onChangeText={setNewImageUrl}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddImage}>
            <Text style={styles.addBtnText}>+</Text>
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
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Створити готель</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  backButton: { fontSize: 16, color: '#007AFF', marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  form: { padding: 16 },
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
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', marginBottom: 16 },
  flex1: { flex: 1 },
  button: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  imageWrapper: { width: 60, height: 60, position: 'relative' },
  gridImage: { width: '100%', height: '100%', borderRadius: 8 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  addImageRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  addBtn: { backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24 },
});

export default AdminHotelCreateScreen;
