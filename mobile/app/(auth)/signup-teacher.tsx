import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { schools } from '../../lib/schools';

export default function SignupTeacherScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolId: '',
    schoolName: '',
    subject: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.schoolId) e.schoolId = 'Please select a school';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const { error } = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: 'teacher',
      schoolId: form.schoolId,
      schoolName: form.schoolName,
      subject: form.subject,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign Up Failed', error);
      return;
    }
    router.replace('/(app)/home');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Teacher Sign Up</Text>

          <Field
            label="First Name"
            value={form.firstName}
            onChangeText={v => set('firstName', v)}
            error={errors.firstName}
            placeholder="John"
          />
          <Field
            label="Last Name"
            value={form.lastName}
            onChangeText={v => set('lastName', v)}
            error={errors.lastName}
            placeholder="Doe"
          />
          <Field
            label="Email"
            value={form.email}
            onChangeText={v => set('email', v)}
            error={errors.email}
            placeholder="you@school.edu"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Password"
            value={form.password}
            onChangeText={v => set('password', v)}
            error={errors.password}
            placeholder="Create a password"
            secureTextEntry
            hint="Must be at least 8 characters"
          />
          <Field
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={v => set('confirmPassword', v)}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
          />

          <Text style={[styles.label, { marginTop: 14 }]}>School</Text>
          <TouchableOpacity
            style={[styles.pickerBtn, errors.schoolId ? styles.inputError : null]}
            onPress={() => setShowSchoolPicker(true)}
          >
            <Text style={form.schoolId ? styles.pickerValue : styles.pickerPlaceholder}>
              {form.schoolId ? form.schoolName : 'Select your school'}
            </Text>
          </TouchableOpacity>
          {errors.schoolId ? <Text style={styles.errorText}>{errors.schoolId}</Text> : null}

          <Field
            label="Subject"
            value={form.subject}
            onChangeText={v => set('subject', v)}
            error={errors.subject}
            placeholder="e.g. Mathematics, English"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showSchoolPicker} animationType="slide">
        <SafeAreaView style={styles.flex}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select School</Text>
            <TouchableOpacity onPress={() => setShowSchoolPicker(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={schools}
            keyExtractor={s => s.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.schoolItem}
                onPress={() => {
                  set('schoolId', item.id);
                  set('schoolName', item.name);
                  setShowSchoolPicker(false);
                }}
              >
                <Text style={styles.schoolItemName}>{item.name}</Text>
                <Text style={styles.schoolItemSub}>
                  {item.city}, {item.state}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  error,
  hint,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoCorrect={false}
      />
      {hint && !error ? <Text style={styles.hintText}>{hint}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 15, color: '#1e40af' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  inputError: { borderColor: '#ef4444' },
  hintText: { fontSize: 12, color: '#6b7280', marginTop: 3 },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 3 },
  btn: {
    backgroundColor: '#1e40af',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pickerBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: '#f9fafb',
  },
  pickerValue: { fontSize: 15, color: '#111827' },
  pickerPlaceholder: { fontSize: 15, color: '#9ca3af' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalClose: { fontSize: 15, color: '#1e40af' },
  schoolItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  schoolItemName: { fontSize: 15, color: '#111827', fontWeight: '500' },
  schoolItemSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
});
