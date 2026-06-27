import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

interface Stats {
  totalStudents: number;
  totalCounselors: number;
  unreadMessages: number;
}

function conversationKey(a: string, b: string) {
  return [a, b].sort().join('__');
}

function computeUnread(messages: { sender_role: string }[]) {
  const reversed = [...messages].reverse();
  const lastTeacherIdx = reversed.findIndex(m => m.sender_role === 'teacher');
  if (lastTeacherIdx === -1) return messages.filter(m => m.sender_role === 'counselor').length;
  return lastTeacherIdx;
}

export default function TeacherDashboardScreen() {
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalCounselors: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    const [studentsRes, counselorsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', user.schoolId)
        .eq('role', 'student')
        .eq('approved', true),
      supabase
        .from('profiles')
        .select('id')
        .eq('school_id', user.schoolId)
        .eq('role', 'counselor')
        .eq('approved', true),
    ]);

    const counselors = counselorsRes.data ?? [];
    let unread = 0;

    if (counselors.length > 0) {
      const keys = counselors.map(c => conversationKey(user.id, c.id));
      const { data: msgData } = await supabase
        .from('messages')
        .select('sender_role,conversation_key')
        .in('conversation_key', keys)
        .order('created_at', { ascending: true });

      const grouped: Record<string, { sender_role: string }[]> = {};
      keys.forEach(k => { grouped[k] = []; });
      (msgData ?? []).forEach(m => {
        if (grouped[m.conversation_key]) grouped[m.conversation_key].push(m);
      });
      unread = Object.values(grouped).reduce((sum, msgs) => sum + computeUnread(msgs), 0);
    }

    setStats({
      totalStudents: studentsRes.count ?? 0,
      totalCounselors: counselors.length,
      unreadMessages: unread,
    });
    setLoading(false);
    setRefreshing(false);
  }, [user?.id, user?.schoolId]);

  useEffect(() => { load(); }, [load]);

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
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {/* Welcome */}
        <View style={s.welcomeCard}>
          <Text style={s.welcomeName}>Welcome, {user?.firstName}</Text>
          {user?.subject && <Text style={s.welcomeSub}>{user.subject}</Text>}
          <Text style={s.welcomeSchool}>{user?.schoolName}</Text>
        </View>

        {/* Stats */}
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{stats.totalStudents}</Text>
            <Text style={s.statLabel}>Students at School</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{stats.totalCounselors}</Text>
            <Text style={s.statLabel}>Counselors</Text>
          </View>
          <View style={[s.statCard, stats.unreadMessages > 0 && s.statCardHighlight]}>
            <Text style={[s.statValue, stats.unreadMessages > 0 && { color: '#dc2626' }]}>
              {stats.unreadMessages}
            </Text>
            <Text style={s.statLabel}>Unread Messages</Text>
          </View>
        </View>

        {/* Quick links info */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.infoCard}>
          <Text style={s.infoText}>
            Use the <Text style={s.infoStrong}>Students</Text> tab to browse all students at your school.
          </Text>
        </View>
        <View style={s.infoCard}>
          <Text style={s.infoText}>
            Use the <Text style={s.infoStrong}>Messages</Text> tab to communicate with school counselors.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  // Welcome
  welcomeCard: { backgroundColor: '#1e40af', borderRadius: 14, padding: 20, marginBottom: 20 },
  welcomeName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  welcomeSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  welcomeSchool: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  // Section
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  // Stats
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '28%', backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  statCardHighlight: { borderColor: '#fca5a5', backgroundColor: '#fff7f7' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1e40af', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center' },
  // Info cards
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  infoText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  infoStrong: { fontWeight: '700', color: '#1e40af' },
});
