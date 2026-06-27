import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const ROLES = [
  {
    key: 'student',
    label: 'Student',
    description: 'Access counseling resources and support',
  },
  {
    key: 'counselor',
    label: 'School Counselor',
    description: 'Manage students and provide guidance',
  },
  {
    key: 'teacher',
    label: 'Teacher',
    description: 'Support students and communicate with counselors',
  },
  {
    key: 'parent',
    label: 'Parent',
    description: "Stay informed about your child's progress",
  },
] as const;

export default function SignupScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Select your role to get started</Text>

        {ROLES.map(role => (
          <TouchableOpacity
            key={role.key}
            style={styles.card}
            onPress={() => router.push(`/(auth)/signup-${role.key}` as any)}
          >
            <Text style={styles.cardLabel}>{role.label}</Text>
            <Text style={styles.cardDesc}>{role.description}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.linkBtn}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 15, color: '#1e40af' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6b7280' },
  linkBtn: { marginTop: 24, alignItems: 'center' },
  link: { fontSize: 14, color: '#1e40af' },
});
