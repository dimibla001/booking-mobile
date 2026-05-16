import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { userAPI, UserProfileDto } from '../services/api';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userAPI.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження профілю');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Вихід', 'Ви впевнені, що хочете вийти?', [
      { text: 'Ні', onPress: () => {} },
      {
        text: 'Так',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  const displayProfile = profile || user;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Профіль</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {displayProfile && (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {displayProfile.fullName[0].toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.fullName}>{displayProfile.fullName}</Text>
              <Text style={styles.email}>{displayProfile.email}</Text>

              {displayProfile.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Верифіковано</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Контактна інформація</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Телефон:</Text>
                <Text style={styles.infoValue}>{displayProfile.phone || 'Не вказано'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Країна:</Text>
                <Text style={styles.infoValue}>{displayProfile.country || 'Не вказано'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>День народження:</Text>
                <Text style={styles.infoValue}>{displayProfile.birthday || 'Не вказано'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Валюта:</Text>
                <Text style={styles.infoValue}>{displayProfile.preferredCurrency}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MyBookings')}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Мої бронювання</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('HotelSubmission')}
                style={[styles.actionButton, { backgroundColor: '#008009' }]}
              >
                <Text style={styles.actionButtonText}>Зареєструвати свій готель</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('OwnerBookings')}
                style={[styles.actionButton, { backgroundColor: '#111827' }]}
              >
                <Text style={styles.actionButtonText}>Бронювання моїх готелів</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ChatList')}
                style={[styles.actionButton, { backgroundColor: '#006ce4' }]}
              >
                <Text style={styles.actionButtonText}>💬 Повідомлення</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Вийти з акаунту</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#991B1B',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#059669',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  infoValue: {
    fontWeight: '600',
    color: '#111827',
  },
  actions: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  actionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 16,
  },
});