import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [birthday, setBirthday] = useState('');

  const { register, isLoading, error, clearError } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Помилка', 'Будь ласка заповніть обов\'язкові поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Помилка', 'Паролі не совпадають');
      return;
    }

    try {
      clearError();
      await register(fullName, email, password, phone, country, birthday);
    } catch (err: any) {
      Alert.alert('Помилка реєстрації', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Реєстрація</Text>
        <Text style={styles.subtitle}>Створіть новий акаунт</Text>

        <TextInput
          style={styles.input}
          placeholder="Повне ім'я *"
          placeholderTextColor="#94A3B8"
          value={fullName}
          onChangeText={setFullName}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Телефон"
          placeholderTextColor="#94A3B8"
          value={phone}
          onChangeText={setPhone}
          editable={!isLoading}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Країна"
          placeholderTextColor="#94A3B8"
          value={country}
          onChangeText={setCountry}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Дата народження (YYYY-MM-DD)"
          placeholderTextColor="#94A3B8"
          value={birthday}
          onChangeText={setBirthday}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Пароль *"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Повторіть пароль *"
          placeholderTextColor="#94A3B8"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Зареєструватися</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Вже маєте акаунт? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
            <Text style={styles.linkText}>Увійдіть</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  backButton: { fontSize: 16, color: '#2563EB', fontWeight: '600', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, color: '#111827', backgroundColor: '#F9FAFB' },
  button: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, paddingBottom: 32 },
  footerText: { color: '#6B7280', fontSize: 14 },
  linkText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
});
