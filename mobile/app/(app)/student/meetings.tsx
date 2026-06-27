import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  Modal, ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Counselor {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
}

interface Meeting {
  id: string;
  title: string;
  counselor_id: string;
  counselor_name: string;
  date: string;
  time: string;
  type: 'video' | 'in_person';
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM',
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  cancelled: '#ef4444',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(v: string) {
  const d = new Date(v + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function StudentMeetingsScreen() {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Modal form state
  const [title, setTitle] = useState('');
  const [selectedCounselorId, setSelectedCounselorId] = useState('');
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingType, setMeetingType] = useState<'video' | 'in_person'>('video');
  const [notes, setNotes] = useState('');
  const [counselorPickerVisible, setCounselorPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;

    const [meetingsRes, counselorsRes] = await Promise.all([
      supabase
        .from('meetings')
        .select('*')
        .eq('student_id', user.id)
        .order('date', { ascending: true }),
      supabase
        .from('profiles')
        .select('id,first_name,last_name,title')
        .eq('school_id', user.schoolId)
        .eq('role', 'counselor')
        .eq('approved', true),
    ]);

    setMeetings((meetingsRes.data ?? []) as Meeting[]);
    setCounselors(
      (counselorsRes.data ?? []).map(p => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        title: p.title ?? undefined,
      }))
    );
    setLoading(false);
    setRefreshing(false);
  }, [user?.id, user?.schoolId]);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setTitle('');
    setSelectedCounselorId('');
    setDate('');
    setSelectedTime('');
    setMeetingType('video');
    setNotes('');
  }

  async function submitMeeting() {
    if (!title.trim() || !selectedCounselorId || !date.trim() || !selectedTime || !user?.id) {
      Alert.alert('Missing fields', 'Please fill in title, counselor, date, and time.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      Alert.alert('Invalid date', 'Enter date as YYYY-MM-DD (e.g. 2025-09-15).');
      return;
    }

    const counselor = counselors.find(c => c.id === selectedCounselorId)!;
    setSubmitting(true);

    const { error } = await supabase.from('meetings').insert({
      title: title.trim(),
      student_id: user.id,
      student_name: `${user.firstName} ${user.lastName}`,
      counselor_id: selectedCounselorId,
      counselor_name: `${counselor.firstName} ${counselor.lastName}`,
      school_id: user.schoolId,
      date: date.trim(),
      time: selectedTime,
      type: meetingType,
      notes: notes.trim() || null,
      status: 'pending',
    });

    setSubmitting(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    resetForm();
    setModalVisible(false);
    load();
  }

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator size="large" color="#1e40af" />
      </SafeAreaView>
    );
  }

  const selectedCounselor = counselors.find(c => c.id === selectedCounselorId);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Meetings</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => setModalVisible(true)}>
          <Text style={s.newBtnText}>+ Book</Text>
        </TouchableOpacity>
      </View>

      {/* Meetings list */}
      <FlatList
        data={meetings}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.muted}>No meetings yet. Book one with your counselor!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[item.status] ?? '#6b7280' }]}>
                <Text style={s.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={s.cardSub}>{item.counselor_name}</Text>
            <View style={s.cardRow}>
              <Text style={s.cardMeta}>{formatDate(item.date)} · {item.time}</Text>
              <View style={s.typeBadge}>
                <Text style={s.typeText}>{item.type === 'video' ? 'Video' : 'In-Person'}</Text>
              </View>
            </View>
            {item.notes ? (
              <Text style={s.cardNotes} numberOfLines={2}>{item.notes}</Text>
            ) : null}
          </View>
        )}
      />

      {/* Book Meeting Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Book a Meeting</Text>
            <TouchableOpacity onPress={() => { resetForm(); setModalVisible(false); }}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.label}>Title *</Text>
            <TextInput
              style={s.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. College application help"
              placeholderTextColor="#9ca3af"
            />

            <Text style={s.label}>Counselor *</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setCounselorPickerVisible(true)}>
              <Text style={selectedCounselor ? s.pickerBtnText : s.pickerBtnPlaceholder}>
                {selectedCounselor
                  ? `${selectedCounselor.firstName} ${selectedCounselor.lastName}`
                  : 'Select counselor…'}
              </Text>
            </TouchableOpacity>

            <Text style={s.label}>Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={s.input}
              value={date}
              onChangeText={setDate}
              placeholder="e.g. 2025-09-15"
              placeholderTextColor="#9ca3af"
              keyboardType="numbers-and-punctuation"
            />

            <Text style={s.label}>Time *</Text>
            <View style={s.slotsGrid}>
              {TIME_SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[s.slotChip, selectedTime === slot && s.slotChipSelected]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[s.slotText, selectedTime === slot && s.slotTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Type *</Text>
            <View style={s.typeRow}>
              {(['video', 'in_person'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeChip, meetingType === t && s.typeChipSelected]}
                  onPress={() => setMeetingType(t)}
                >
                  <Text style={[s.typeChipText, meetingType === t && s.typeChipTextSelected]}>
                    {t === 'video' ? 'Video' : 'In-Person'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Notes (optional)</Text>
            <TextInput
              style={[s.input, s.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any details for the counselor…"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[s.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={submitMeeting}
              disabled={submitting}
            >
              <Text style={s.submitBtnText}>{submitting ? 'Booking…' : 'Book Meeting'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Counselor picker sub-modal */}
      <Modal
        visible={counselorPickerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCounselorPickerVisible(false)}
      >
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Select Counselor</Text>
            <ScrollView>
              {counselors.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={s.sheetRow}
                  onPress={() => {
                    setSelectedCounselorId(c.id);
                    setCounselorPickerVisible(false);
                  }}
                >
                  <Text style={s.sheetRowText}>{c.firstName} {c.lastName}</Text>
                  {c.title ? <Text style={s.sheetRowSub}>{c.title}</Text> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.sheetCancel} onPress={() => setCounselorPickerVisible(false)}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  newBtn: { backgroundColor: '#1e40af', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  newBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  // Cards
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  cardSub: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardMeta: { fontSize: 13, color: '#374151' },
  typeBadge: { backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 11, color: '#1e40af', fontWeight: '600' },
  cardNotes: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#f9fafb' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  cancelText: { fontSize: 15, color: '#1e40af' },
  modalBody: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#111827', backgroundColor: '#fff' },
  textArea: { height: 80 },
  pickerBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff' },
  pickerBtnText: { fontSize: 15, color: '#111827' },
  pickerBtnPlaceholder: { fontSize: 15, color: '#9ca3af' },
  // Time slots
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#fff' },
  slotChipSelected: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  slotText: { fontSize: 13, color: '#374151' },
  slotTextSelected: { color: '#fff', fontWeight: '600' },
  // Type
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff' },
  typeChipSelected: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  typeChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  typeChipTextSelected: { color: '#fff', fontWeight: '700' },
  // Submit
  submitBtn: { backgroundColor: '#1e40af', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  // Counselor sub-modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  sheetRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sheetRowText: { fontSize: 15, color: '#111827', fontWeight: '500' },
  sheetRowSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sheetCancel: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
});
