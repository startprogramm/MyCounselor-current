'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { StatsCard, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';
import { normalizeRequestStatus } from '@/lib/request-status';

interface RequestSummary {
  id: number;
  studentName: string;
  title: string;
  status: string;
}

interface ResourceSummary {
  id: number;
  title: string;
  category: string;
}

interface LetterStats {
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
}

const EMPTY_LETTER_STATS: LetterStats = { pending: 0, inProgress: 0, completed: 0, total: 0 };

interface TeacherDashboardCachePayload {
  studentCount: number;
  requests: RequestSummary[];
  recentResources: ResourceSummary[];
  resourceCount: number;
  counselors: { name: string; title: string }[];
  letterStats: LetterStats;
}

const TEACHER_DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000;

export default function TeacherDashboardPage() {
  const { user, getSchoolStudents, getSchoolCounselors } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [recentResources, setRecentResources] = useState<ResourceSummary[]>([]);
  const [resourceCount, setResourceCount] = useState(0);
  const [counselors, setCounselors] = useState<{ name: string; title: string }[]>([]);
  const [letterStats, setLetterStats] = useState<LetterStats>(EMPTY_LETTER_STATS);
  const [loadError, setLoadError] = useState('');
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('teacher-dashboard', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  const applySnapshot = useCallback((snapshot: TeacherDashboardCachePayload) => {
    setStudentCount(snapshot.studentCount ?? 0);
    setRequests(snapshot.requests || []);
    setRecentResources(snapshot.recentResources || []);
    setResourceCount(snapshot.resourceCount ?? 0);
    setCounselors(snapshot.counselors || []);
    setLetterStats(snapshot.letterStats || EMPTY_LETTER_STATS);
  }, []);

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setStudentCount(0);
      setRequests([]);
      setRecentResources([]);
      setResourceCount(0);
      setCounselors([]);
      setLetterStats(EMPTY_LETTER_STATS);
      setLoadError('');
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<TeacherDashboardCachePayload>(cacheKey, TEACHER_DASHBOARD_CACHE_TTL_MS);
    if (cached.found && cached.data) {
      applySnapshot(cached.data);
      setHasWarmCache(true);
      setIsCacheHydrated(true);
      return;
    }

    setHasWarmCache(false);
    setIsCacheHydrated(true);
  }, [cacheKey, applySnapshot]);

  useEffect(() => {
    if (!cacheKey || !isCacheHydrated) return;
    if (!hasWarmCache && !hasLoadedFromServer) return;

    writeCachedData<TeacherDashboardCachePayload>(cacheKey, {
      studentCount,
      requests,
      recentResources,
      resourceCount,
      counselors,
      letterStats,
    });
  }, [
    cacheKey,
    isCacheHydrated,
    hasWarmCache,
    hasLoadedFromServer,
    studentCount,
    requests,
    recentResources,
    resourceCount,
    counselors,
    letterStats,
  ]);

  const loadData = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    // Get students at this school
    const students = getSchoolStudents(user.schoolId);
    setStudentCount(students.filter((s) => s.approved).length);

    // Get counselors
    const schoolCounselors = getSchoolCounselors(user.schoolId);
    setCounselors(
      schoolCounselors.map((c) => ({
        name: `${c.firstName} ${c.lastName}`,
        title: c.title || 'School Counselor',
      }))
    );

    // Load recommendation-letter requests directed at this teacher
    const [requestsResult, resourcesResult, letterStatusResult] = await Promise.all([
      supabase
        .from('requests')
        .select('id,title,status,teacher_id,student_name,student_id,school_id,created_at')
        .eq('school_id', user.schoolId)
        .eq('teacher_id', user.id)
        .eq('category', 'recommendation')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('resources')
        .select('id,title,category', { count: 'exact' })
        .eq('school_id', user.schoolId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('requests')
        .select('status')
        .eq('school_id', user.schoolId)
        .eq('teacher_id', user.id)
        .eq('category', 'recommendation'),
    ]);

    if (!requestsResult.error && requestsResult.data) {
      setRequests(
        requestsResult.data.map((r) => ({
          id: r.id,
          studentName: r.student_name || 'Unknown',
          title: r.title,
          status: r.status,
        }))
      );
    } else if (requestsResult.error) {
      setLoadError(requestsResult.error.message || 'Unable to load requests.');
    }

    setResourceCount(resourcesResult.count || 0);
    if (!resourcesResult.error && resourcesResult.data) {
      setRecentResources(
        resourcesResult.data.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
        }))
      );
      setLoadError('');
    } else if (resourcesResult.error) {
      setLoadError(resourcesResult.error.message || 'Unable to load resources.');
    }

    if (!letterStatusResult.error && letterStatusResult.data) {
      const counts = letterStatusResult.data.reduce(
        (acc, row) => {
          const status = normalizeRequestStatus(row.status);
          if (status === 'pending') acc.pending += 1;
          else if (status === 'in_progress') acc.inProgress += 1;
          else acc.completed += 1; // 'completed' and 'approved' both read as done
          return acc;
        },
        { pending: 0, inProgress: 0, completed: 0 }
      );
      setLetterStats({ ...counts, total: letterStatusResult.data.length });
    } else if (letterStatusResult.error) {
      setLoadError(letterStatusResult.error.message || 'Unable to load letter status.');
    }

    setHasLoadedFromServer(true);
  }, [user?.id, user?.schoolId, getSchoolStudents, getSchoolCounselors]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadData();
  }, [isCacheHydrated, loadData]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pendingLetterCount = letterStats.pending + letterStats.inProgress;
  const completedPct = letterStats.total > 0 ? Math.round((letterStats.completed / letterStats.total) * 100) : 0;

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
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome back, {user?.firstName || 'Teacher'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your classroom overview for today.
          </p>
          {user?.schoolName && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.schoolName} {user.subject && `\u2022 ${user.subject}`}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{today}</div>
      </div>

      {/* Stats */}
      {loadError && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive font-medium">
          {loadError}
        </div>
      )}

      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Overview</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="School Students"
          value={studentCount}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          accentColor="warning"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingLetterCount}
          subtitle={pendingLetterCount > 0 ? `${pendingLetterCount} need attention` : 'All clear'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
          accentColor="destructive"
        />
        <StatsCard
          title="School Counselors"
          value={counselors.length}
          subtitle={counselors.length > 0 ? 'Available to message' : 'None registered'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          accentColor="primary"
        />
        <StatsCard
          title="Resources Available"
          value={resourceCount}
          subtitle="Published by counselors"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          accentColor="success"
        />
      </div>

      {/* Recommendation Letters */}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your Letters</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Requests */}
        <ContentCard
          title="Recent Requests"
          description="Recommendation letters students have asked you to write"
          action={
            <Link href="/teacher/requests" className="text-sm text-amber-500 hover:text-amber-600">
              View all
            </Link>
          }
          className="lg:col-span-2"
        >
          {requests.length === 0 ? (
            <div className="text-center py-6">
              <svg className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-sm text-muted-foreground">No requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">When a student asks you for a recommendation letter, it'll show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-semibold text-sm">
                      {item.studentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.studentName}</p>
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(item.status)} size="sm">{item.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        {/* Letters at a Glance */}
        <ContentCard title="Letters at a Glance" description="Where things stand overall">
          {letterStats.total === 0 ? (
            <div className="text-center py-6">
              <svg className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-muted-foreground">Nothing to track yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-warning/5 border border-warning/20">
                  <span className="text-sm text-foreground">Pending</span>
                  <span className="text-base font-bold text-warning">{letterStats.pending}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-sm text-foreground">In Progress</span>
                  <span className="text-base font-bold text-primary">{letterStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-success/5 border border-success/20">
                  <span className="text-sm text-foreground">Completed</span>
                  <span className="text-base font-bold text-success">{letterStats.completed}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Overall progress</span>
                  <span>{letterStats.completed}/{letterStats.total}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-success rounded-full transition-all" style={{ width: `${completedPct}%` }} />
                </div>
              </div>
            </>
          )}
        </ContentCard>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your Network &amp; Resources</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Resources */}
        <ContentCard
          title="Recent Resources"
          description="Shared by your counselors"
          action={
            <Link href="/teacher/resources" className="text-sm text-amber-500 hover:text-amber-600">
              View all
            </Link>
          }
        >
          {recentResources.length === 0 ? (
            <div className="text-center py-6">
              <svg className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm text-muted-foreground">No resources published yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-foreground">{resource.title}</span>
                    <Badge variant="accent" size="sm">{resource.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        {/* School Counselors */}
        <ContentCard title="School Counselors" description="Reach out anytime">
          {counselors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No counselors registered yet.</p>
          ) : (
            <div className="space-y-3">
              {counselors.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-sm">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        {/* Quick Actions */}
        <ContentCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/teacher/requests"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-amber-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-sm font-medium text-foreground">View Requests</span>
            </Link>
            <Link
              href="/teacher/messages"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Message Counselor</span>
            </Link>
            <Link
              href="/teacher/resources"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-accent mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-medium text-foreground">Browse Resources</span>
            </Link>
            <Link
              href="/teacher/students"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium text-foreground">View Students</span>
            </Link>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
