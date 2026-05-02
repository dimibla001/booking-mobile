import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { adminUserAPI, AdminUserDto } from '../services/api';

const AdminUsersScreen = () => {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserAPI.getAll();
      setUsers(data);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити користувачів');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = (userId: string, isBlocked: boolean) => {
    const action = isBlocked ? 'розблокувати' : 'заблокувати';
    Alert.alert(`Ви впевнені, що хочете ${action} користувача?`, '', [
      { text: 'Ні', onPress: () => {} },
      {
        text: 'Так',
        onPress: async () => {
          try {
            if (!isBlocked) {
              await adminUserAPI.block(userId);
            } else {
              await adminUserAPI.unblock(userId);
            }
            loadUsers();
            Alert.alert('Успіх', `Користувач ${action}ований`);
          } catch (error) {
            Alert.alert('Помилка', `Не вдалося ${action}ати користувача`);
          }
        },
      },
    ]);
  };

  const handleRoleChange = (userId: string) => {
    Alert.alert('Змінити роль', 'Виберіть нову роль', [
      { text: 'Скасувати', onPress: () => {} },
      {
        text: 'Admin',
        onPress: async () => {
          try {
            await adminUserAPI.changeRole(userId, { role: 'Admin' });
            loadUsers();
            Alert.alert('Успіх', 'Роль змінена на Admin');
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося змінити роль');
          }
        },
      },
      {
        text: 'User',
        onPress: async () => {
          try {
            await adminUserAPI.changeRole(userId, { role: 'User' });
            loadUsers();
            Alert.alert('Успіх', 'Роль змінена на User');
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося змінити роль');
          }
        },
      },
    ]);
  };

  const renderUserItem = ({ item }: { item: AdminUserDto }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={styles.userBadges}>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  item.role === 'Admin' ? '#FF9500' : '#007AFF',
              },
            ]}
          >
            <Text style={styles.badgeText}>{item.role}</Text>
          </View>
          {item.isBlocked && (
            <View style={styles.blockedBadge}>
              <Text style={styles.badgeText}>🚫</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.detailLabel}>Контакт:</Text>
        <Text style={styles.detailValue}>{item.phone || 'Не вказано'}</Text>

        <Text style={styles.detailLabel}>Місце проживання:</Text>
        <Text style={styles.detailValue}>{item.country || 'Не вказано'}</Text>

        <Text style={styles.detailLabel}>Валюта:</Text>
        <Text style={styles.detailValue}>{item.preferredCurrency}</Text>

        <Text style={styles.detailLabel}>Улюблені готелі:</Text>
        <Text style={styles.detailValue}>{item.favoritesCount}</Text>

        <Text style={styles.detailLabel}>Статус:</Text>
        <Text style={styles.detailValue}>
          {item.verified ? '✓ Верифіковано' : '○ Не верифіковано'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => handleRoleChange(item.id)}
        >
          <Text style={styles.roleButtonText}>👤 Змінити роль</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.blockButton,
            {
              backgroundColor: item.isBlocked ? '#34C759' : '#FF3B30',
            },
          ]}
          onPress={() => handleBlock(item.id, item.isBlocked)}
        >
          <Text style={styles.blockButtonText}>
            {item.isBlocked ? '🔓 Розблокувати' : '🔒 Заблокувати'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Управління користувачами</Text>
        <Text style={styles.subtitle}>{users.length} користувачів</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Користувачі не знайдені</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#e0e0e0',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userEmail: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  blockedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  userDetails: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    color: '#1a1a1a',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#5AC8FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  blockButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  blockButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});

export default AdminUsersScreen;
