import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel?: string;
  approved: boolean;
  createdAt: string;
}

type Filter = 'All' | 'Pending Approval' | 'Approved';

const FILTERS: Filter[] = ['All', 'Pending Approval', 'Approved'];

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function CounselorStudentsScreen() {
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<Student | null>(null);

  const load = useCallback(async () => {
    if (!user?.schoolId) return;

    const { data } = await supabase
      .from('profiles')
      .select('id,first_name,last_name,email,grade_level,approved,created_at')
      .eq('school_id', user.schoolId)
      .eq('role', 'student')
      .order('first_name', { ascending: true });

    setStudents(
      (data ?? []).map(s => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        email: s.email,
        gradeLevel: s.grade_level ?? undefined,
        approved: !!s.approved,
        createdAt: s.created_at,
      }))
    );
    setLoading(false);
    setRefreshing(false);
  }, [user?.schoolId]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'All'
    ? students
    : filter === 'Pending Approval'
      ? students.filter(s => !s.approved)
      : students.filter(s => s.approved);

  async function approveStudent(studentId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', studentId);

    if (error) { Alert.alert('Error', error.message); return; }
    setSelected(null);
    load();
  }

  async function rejectStudent(studentId: string) {
    Alert.alert(
      'Reject Student',
      'This will permanently remove the student account. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject & Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('profiles')
              .delete()
              .eq('id', studentId);

            if (error) { Alert.alert('Error', error.message); return; }
            setSelected(null);
            load();
          },
        },
      ]
    );
  }

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
        <Text style={s.headerCount}>{students.length} total</Text>
      </View>

      {/* Filter chips */}
      <View style={s.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, filter === f && s.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterChipText, filter === f && s.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Student list */}
      <FlatList
        data={filtered}
        keyExtractor={s => s.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.muted}>No students found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => setSelected(item)}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.cardTop}>
                <Text style={s.cardName}>{item.firstName} {item.lastName}</Text>
                <View style={[s.badge, item.approved ? s.badgeApproved : s.badgePending]}>
                  <Text style={s.badgeText}>{item.approved ? 'Approved' : 'Pending'}</Text>
                </View>
              </View>
              <Text style={s.cardMeta}>{item.email}</Text>
              {item.gradeLevel && <Text style={s.cardMeta}>Grade {item.gradeLevel}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Student detail modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <SafeAreaView style={s.modalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Student Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={s.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.modalBody}>
              {/* Avatar */}
              <View style={s.detailAvatar}>
                <Text style={s.detailAvatarText}>
                  {selected.firstName[0]}{selected.lastName[0]}
                </Text>
              </View>

              <Text style={s.detailName}>{selected.firstName} {selected.lastName}</Text>
              <View style={[s.badge, selected.approved ? s.badgeApproved : s.badgePending, { alignSelf: 'center', marginBottom: 20 }]}>
                <Text style={s.badgeText}>{selected.approved ? 'Approved' : 'Pending Approval'}</Text>
              </View>

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Email</Text>
                <Text style={s.infoValue}>{selected.email}</Text>
              </View>
              {selected.gradeLevel && (
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Grade</Text>
                  <Text style={s.infoValue}>{selected.gradeLevel}</Text>
                </View>
              )}
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Registered</Text>
                <Text style={s.infoValue}>
                  {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>

              {/* Approve/Reject for pending */}
              {!selected.approved && (
                <View style={s.actionRow}>
                  <TouchableOpacity
                    style={[s.actionBtn, s.actionBtnReject]}
                    onPress={() => rejectStudent(selected.id)}
                  >
                    <Text style={s.actionBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.actionBtn, s.actionBtnApprove]}
                    onPress={() => approveStudent(selected.id)}
                  >
                    <Text style={s.actionBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerCount: { fontSize: 13, color: '#6b7280' },
  // Filters
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterChip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  filterChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  // Cards
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1e40af', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 2 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  cardMeta: { fontSize: 12, color: '#6b7280' },
  // Badges
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeApproved: { backgroundColor: '#dcfce7' },
  badgePending: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#111827' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#f9fafb' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  closeText: { fontSize: 15, color: '#1e40af' },
  modalBody: { padding: 24, alignItems: 'stretch' },
  detailAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1e40af', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  detailAvatarText: { color: '#fff', fontWeight: '700', fontSize: 24 },
  detailName: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#111827', fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  actionBtnApprove: { backgroundColor: '#22c55e' },
  actionBtnReject: { backgroundColor: '#ef4444' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
