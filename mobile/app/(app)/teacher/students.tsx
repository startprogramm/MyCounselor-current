import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel?: string;
}

export default function TeacherStudentsScreen() {
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!user?.schoolId) return;

    const { data } = await supabase
      .from('profiles')
      .select('id,first_name,last_name,email,grade_level')
      .eq('school_id', user.schoolId)
      .eq('role', 'student')
      .eq('approved', true)
      .order('first_name', { ascending: true });

    setStudents(
      (data ?? []).map(p => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        gradeLevel: p.grade_level ?? undefined,
      }))
    );
    setLoading(false);
    setRefreshing(false);
  }, [user?.schoolId]);

  useEffect(() => { load(); }, [load]);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? students.filter(
        s =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          (s.gradeLevel ?? '').toLowerCase().includes(query)
      )
    : students;

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator size="large" color="#1e40af" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Students</Text>
        <Text style={s.headerCount}>{students.length} enrolled</Text>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, or grade…"
          placeholderTextColor="#9ca3af"
          clearButtonMode="while-editing"
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={st => st.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.muted}>
              {query ? 'No students match your search.' : 'No approved students at your school yet.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>{item.firstName} {item.lastName}</Text>
              <Text style={s.cardEmail}>{item.email}</Text>
              {item.gradeLevel && (
                <View style={s.gradeBadge}>
                  <Text style={s.gradeText}>Grade {item.gradeLevel}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerCount: { fontSize: 13, color: '#6b7280' },
  // Search
  searchRow: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  searchInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: '#111827', backgroundColor: '#f9fafb' },
  // Cards
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1e40af', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  cardEmail: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  gradeBadge: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  gradeText: { fontSize: 11, color: '#1e40af', fontWeight: '600' },
});
