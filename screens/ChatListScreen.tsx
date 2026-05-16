import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { chatAPI, ChatThreadDto } from '../services/api';

const ChatListScreen = ({ navigation }: any) => {
  const [chats, setChats] = useState<ChatThreadDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.getMyChats();
      setChats(data.items);
    } catch (e) {
      console.log('Load chats failed', e);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const renderChat = ({ item }: { item: ChatThreadDto }) => (
    <TouchableOpacity
      style={styles.chatCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ChatDetail', { threadId: item.id, title: item.hotelName })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.hotelName)}</Text>
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.hotelName} numberOfLines={1}>{item.hotelName}</Text>
          {item.lastMessageAtUtc && (
            <Text style={styles.timeText}>
              {new Date(item.lastMessageAtUtc).toLocaleDateString([], { day: 'numeric', month: 'short' })}
            </Text>
          )}
        </View>

        <View style={styles.messageRow}>
          <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]} numberOfLines={1}>
            {item.lastMessage || 'Почніть переписку...'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Повідомлення</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#006ce4" />
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>У вас ще немає активних чатів</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#006ce4',
    fontWeight: 'bold'
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  list: { paddingVertical: 8 },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center'
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '700',
  },
  chatInfo: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hotelName: { fontSize: 17, fontWeight: '700', color: '#1e293b', flex: 1, marginRight: 8 },
  timeText: { fontSize: 13, color: '#64748b' },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: { fontSize: 15, color: '#64748b', flex: 1, marginRight: 8 },
  unreadMessage: { color: '#0f172a', fontWeight: '600' },
  unreadBadge: {
    backgroundColor: '#006ce4',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 86,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 16 },
});

export default ChatListScreen;
