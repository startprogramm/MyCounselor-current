'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { Card, StatsCard, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

interface TeacherReportsCachePayload {
  stats: {
    totalStudents: number;
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
  };
  recentActivity: { id: number; title: string; status: string; date: string }[];
}

const TEACHER_REPORTS_CACHE_TTL_MS = 2 * 60 * 1000;

export default function TeacherReportsPage() {
  const { user, getSchoolStudents } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
  });
  const [recentActivity, setRecentActivity] = useState<{ id: number; title: string; status: string; date: string }[]>([]);
  const [loadError, setLoadError] = useState('');
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('teacher-reports', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setStats({
        totalStudents: 0,
        totalReferrals: 0,
        pendingReferrals: 0,
        completedReferrals: 0,
      });
      setRecentActivity([]);
      setLoadError('');
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<TeacherReportsCachePayload>(cacheKey, TEACHER_REPORTS_CACHE_TTL_MS);
    if (cached.found && cached.data) {
      setStats(cached.data.stats);
      setRecentActivity(cached.data.recentActivity || []);
      setHasWarmCache(true);
      setIsCacheHydrated(true);
      return;
    }

    setHasWarmCache(false);
    setIsCacheHydrated(true);
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey || !isCacheHydrated) return;
    if (!hasWarmCache && !hasLoadedFromServer) return;

    writeCachedData<TeacherReportsCachePayload>(cacheKey, { stats, recentActivity });
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, stats, recentActivity]);

  const loadReports = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    const students = getSchoolStudents(user.schoolId);
    const approvedCount = students.filter((s) => s.approved).length;

    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .eq('school_id', user.schoolId)
      .or(`teacher_id.eq.${user.id},counselor_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && requests) {
      const allRequests = requests;

      setStats({
        totalStudents: approvedCount,
        totalReferrals: allRequests.length,
        pendingReferrals: allRequests.filter((r) => r.status === 'pending' || r.status === 'in_progress').length,
        completedReferrals: allRequests.filter((r) => r.status === 'completed' || r.status === 'approved').length,
      });

      setRecentActivity(
        allRequests.slice(0, 10).map((r) => ({
          id: r.id,
          title: `${r.title} - ${r.student_name}`,
          status: r.status,
          date: new Date(r.created_at).toLocaleDateString(),
        }))
      );
      setLoadError('');
      setHasLoadedFromServer(true);
      return;
    }

    setLoadError(error?.message || 'Unable to load report data.');
  }, [user?.id, user?.schoolId, getSchoolStudents]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadReports();
  }, [isCacheHydrated, loadReports]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning' as const;
      case 'in_progress': return 'primary' as const;
      case 'completed': return 'success' as const;
      case 'approved': return 'success' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Reports</h1>
        <p className="text-muted-foreground mt-1">Overview of your activity and referral statistics</p>
      </div>

      {loadError && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive font-medium">
          {loadError}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="School Students"
          value={stats.totalStudents}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          accentColor="warning"
        />
        <StatsCard
          title="Total Referrals"
          value={stats.totalReferrals}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
          accentColor="primary"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingReferrals}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          accentColor="warning"
        />
        <StatsCard
          title="Completed"
          value={stats.completedReferrals}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          accentColor="success"
        />
      </div>

      <ContentCard title="Recent Activity">
        {recentActivity.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No activity to show yet. Submit referrals to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <Badge variant={getStatusVariant(item.status)} size="sm">{item.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
