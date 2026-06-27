import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
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
}

interface Request {
  id: string;
  title: string;
  student_name: string;
  category: string;
  status: string;
  created_at: string;
}

interface Meeting {
  id: string;
  title: string;
  student_name: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

interface Stats {
  totalStudents: number;
  pendingApprovals: number;
  pendingRequests: number;
  upcomingMeetings: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  approved: '#22c55e',
  closed: '#6b7280',
  confirmed: '#22c55e',
  cancelled: '#ef4444',
};

function formatDay(v: string) {
  const d = new Date(v + 'T00:00:00');
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function CounselorDashboardScreen() {
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats>({ totalStudents: 0, pendingApprovals: 0, pendingRequests: 0, upcomingMeetings: 0 });
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    const today = new Date().toISOString().split('T')[0];

    const [studentsRes, requestsRes, meetingsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id,first_name,last_name,email,grade_level,approved')
        .eq('school_id', user.schoolId)
        .eq('role', 'student'),
      supabase
        .from('requests')
        .select('id,title,student_name,category,status,created_at')
        .eq('school_id', user.schoolId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('meetings')
        .select('id,title,student_name,date,time,type,status')
        .eq('counselor_id', user.id)
        .gte('date', today)
        .neq('status', 'cancelled')
        .order('date', { ascending: true })
        .limit(3),
    ]);

    const allStudents = studentsRes.data ?? [];
    const pending = allStudents.filter(s => !s.approved);

    setStats({
      totalStudents: allStudents.length,
      pendingApprovals: pending.length,
      pendingRequests: (requestsRes.data ?? []).filter(r => r.status === 'pending').length,
      upcomingMeetings: (meetingsRes.data ?? []).length,
    });

    setPendingStudents(pending.map(s => ({
      id: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      email: s.email,
      gradeLevel: s.grade_level ?? undefined,
    })));

    setRecentRequests((requestsRes.data ?? []) as Request[]);
    setUpcomingMeetings((meetingsRes.data ?? []) as Meeting[]);
    setLoading(false);
    setRefreshing(false);
  }, [user?.id, user?.schoolId]);

  useEffect(() => { load(); }, [load]);

  async function approveStudent(studentId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', studentId);

    if (error) { Alert.alert('Error', error.message); return; }
    load();
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
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {/* Header */}
        <Text style={s.greeting}>Welcome, {user?.firstName}</Text>
        <Text style={s.sub}>{user?.title ?? 'School Counselor'}</Text>

        {/* Stats grid */}
        <View style={s.statsGrid}>
          {[
            { label: 'Total Students', value: stats.totalStudents },
            { label: 'Pending Approvals', value: stats.pendingApprovals, highlight: stats.pendingApprovals > 0 },
            { label: 'Pending Requests', value: stats.pendingRequests, highlight: stats.pendingRequests > 0 },
            { label: 'Upcoming Meetings', value: stats.upcomingMeetings },
          ].map(stat => (
            <View key={stat.label} style={[s.statCard, stat.highlight && s.statCardHighlight]}>
              <Text style={[s.statValue, stat.highlight && { color: '#dc2626' }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Pending approvals */}
        {pendingStudents.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pending Approvals</Text>
            {pendingStudents.map(student => (
              <View key={student.id} style={s.approvalCard}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{student.firstName[0]}{student.lastName[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.studentName}>{student.firstName} {student.lastName}</Text>
                  <Text style={s.studentMeta}>{student.email}</Text>
                  {student.gradeLevel && <Text style={s.studentMeta}>Grade {student.gradeLevel}</Text>}
                </View>
                <TouchableOpacity
                  style={s.approveBtn}
                  onPress={() => approveStudent(student.id)}
                >
                  <Text style={s.approveBtnText}>Approve</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Recent requests */}
        {recentRequests.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Requests</Text>
            {recentRequests.map(req => (
              <View key={req.id} style={s.requestCard}>
                <View style={s.requestTop}>
                  <Text style={s.requestTitle} numberOfLines={1}>{req.title}</Text>
                  <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[req.status] ?? '#6b7280' }]}>
                    <Text style={s.statusText}>{req.status.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text style={s.requestMeta}>{req.student_name} · {req.category}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Upcoming meetings */}
        {upcomingMeetings.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Upcoming Meetings</Text>
            {upcomingMeetings.map(m => (
              <View key={m.id} style={s.meetingCard}>
                <View style={s.meetingTop}>
                  <Text style={s.meetingTitle} numberOfLines={1}>{m.title}</Text>
                  <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[m.status] ?? '#6b7280' }]}>
                    <Text style={s.statusText}>{m.status}</Text>
                  </View>
                </View>
                <Text style={s.meetingMeta}>{m.student_name} · {formatDay(m.date)} · {m.time}</Text>
              </View>
            ))}
          </View>
        )}

        {pendingStudents.length === 0 && recentRequests.length === 0 && upcomingMeetings.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.muted}>All caught up! No pending items.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 2 },
  sub: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  muted: { fontSize: 13, color: '#6b7280' },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  statCardHighlight: { borderColor: '#fca5a5', backgroundColor: '#fff7f7' },
  statValue: { fontSize: 26, fontWeight: '800', color: '#1e40af', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  // Section
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  // Approval card
  approvalCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e40af', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  studentName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  studentMeta: { fontSize: 12, color: '#6b7280' },
  approveBtn: { backgroundColor: '#22c55e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  // Request card
  requestCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  requestTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  requestTitle: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  requestMeta: { fontSize: 12, color: '#6b7280' },
  // Meeting card
  meetingCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  meetingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  meetingTitle: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  meetingMeta: { fontSize: 12, color: '#6b7280' },
  // Badge
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
});
