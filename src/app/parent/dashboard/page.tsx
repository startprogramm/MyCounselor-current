'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, StatsCard, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  profileImage?: string;
  approved: boolean;
}

interface ChildGoal {
  id: number;
  title: string;
  progress: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  studentId: string;
}

interface ChildRequest {
  id: number;
  title: string;
  status: string;
  category: string;
  createdAt: string;
  counselorName: string;
  studentName: string;
}

interface ChildMeeting {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
  counselorName: string;
}

interface ParentDashboardCachePayload {
  children: ChildProfile[];
  counselors: User[];
  goals: ChildGoal[];
  requests: ChildRequest[];
  meetings: ChildMeeting[];
}

const PARENT_DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ParentDashboardPage() {
  const { user, getSchoolCounselors, getSchoolStudents } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [counselors, setCounselors] = useState<User[]>([]);
  const [goals, setGoals] = useState<ChildGoal[]>([]);
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [meetings, setMeetings] = useState<ChildMeeting[]>([]);
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('parent-dashboard', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  const applySnapshot = useCallback((snapshot: ParentDashboardCachePayload) => {
    setChildren(snapshot.children || []);
    setCounselors(snapshot.counselors || []);
    setGoals(snapshot.goals || []);
    setRequests(snapshot.requests || []);
    setMeetings(snapshot.meetings || []);
  }, []);

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setChildren([]);
      setCounselors([]);
      setGoals([]);
      setRequests([]);
      setMeetings([]);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<ParentDashboardCachePayload>(cacheKey, PARENT_DASHBOARD_CACHE_TTL_MS);
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

    writeCachedData<ParentDashboardCachePayload>(cacheKey, {
      children,
      counselors,
      goals,
      requests,
      meetings,
    });
  }, [
    cacheKey,
    isCacheHydrated,
    hasWarmCache,
    hasLoadedFromServer,
    children,
    counselors,
    goals,
    requests,
    meetings,
  ]);

  const loadData = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    // Get school counselors
    const schoolCounselors = getSchoolCounselors(user.schoolId).filter((c) => c.approved === true);
    setCounselors(schoolCounselors);

    // Find linked children by matching childrenNames against school students
    const allStudents = getSchoolStudents(user.schoolId);
    const linkedChildren: ChildProfile[] = [];

    if (user.childrenNames && user.childrenNames.length > 0) {
      for (const childName of user.childrenNames) {
        const nameLower = childName.toLowerCase().trim();
        const match = allStudents.find((s) => {
          const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
          return fullName === nameLower;
        });
        if (match) {
          linkedChildren.push({
            id: match.id,
            firstName: match.firstName,
            lastName: match.lastName,
            gradeLevel: match.gradeLevel || 'N/A',
            profileImage: match.profileImage,
            approved: match.approved === true,
          });
        }
      }
    }

    setChildren(linkedChildren);

    if (linkedChildren.length === 0) {
      setGoals([]);
      setRequests([]);
      setMeetings([]);
      setHasLoadedFromServer(true);
      return;
    }

    const childIds = linkedChildren.map((c) => c.id);

    // Load goals, requests, meetings for all linked children
    const [goalsResult, requestsResult, meetingsResult] = await Promise.all([
      supabase
        .from('goals')
        .select('*')
        .in('student_id', childIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('requests')
        .select('*')
        .in('student_id', childIds)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('meetings')
        .select('*')
        .in('student_id', childIds)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (!goalsResult.error && goalsResult.data) {
      setGoals(
        goalsResult.data.map((row) => ({
          id: row.id,
          title: row.title,
          progress: row.progress,
          deadline: row.deadline,
          priority: row.priority as ChildGoal['priority'],
          studentId: row.student_id,
        }))
      );
    }

    if (!requestsResult.error && requestsResult.data) {
      setRequests(
        requestsResult.data.map((row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          category: row.category,
          createdAt: formatDate(row.created_at),
          counselorName: row.counselor_name,
          studentName: row.student_name,
        }))
      );
    }

    if (!meetingsResult.error && meetingsResult.data) {
      setMeetings(
        meetingsResult.data.map((row) => ({
          id: row.id,
          title: row.title,
          date: row.date,
          time: row.time,
          type: row.type,
          status: row.status,
          counselorName: row.counselor_name,
        }))
      );
    }

    setHasLoadedFromServer(true);
  }, [user?.id, user?.schoolId, user?.childrenNames, getSchoolCounselors, getSchoolStudents]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadData();
  }, [isCacheHydrated, loadData]);

  const isFullyApproved = user?.studentConfirmed === true && user?.approved === true;

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-success';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'confirmed' || m.status === 'pending');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const goalsOnTrack = goals.filter(g => g.progress >= 50).length;
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const stats = [
    {
      title: 'Children Linked',
      value: children.length,
      subtitle: user?.childrenNames?.length
        ? `${user.childrenNames.length} registered`
        : 'None yet',
      accent: 'primary' as const,
    },
    {
      title: 'Goals Progress',
      value: `${avgProgress}%`,
      subtitle: `${goalsOnTrack} of ${goals.length} on track`,
      accent: 'success' as const,
    },
    {
      title: 'Upcoming Meetings',
      value: upcomingMeetings.length,
      subtitle: 'Scheduled',
      accent: 'accent' as const,
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      subtitle: `${requests.length} total`,
      accent: 'warning' as const,
    },
  ];

  // Pending dual-approval view
  if (!isFullyApproved) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome, {user?.firstName || 'Parent'}!
          </h1>
          {user?.childrenNames && user.childrenNames.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.relationship ? `${user.relationship.charAt(0).toUpperCase() + user.relationship.slice(1)} of ` : 'Parent of '}
              {user.childrenNames.join(', ')}
            </p>
          )}
        </div>

        {/* Dual-Approval Status Card */}
        <Card className="p-0 overflow-hidden border-warning/30">
          <div className="h-1 bg-warning" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Account Pending Approval</h2>
                <p className="text-muted-foreground mt-1">
                  Your parent account requires a two-step verification before you can access all features.
                </p>

                {/* Step indicators */}
                <div className="mt-6 space-y-4">
                  {/* Step 1: Student confirmation */}
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      user?.studentConfirmed === true
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {user?.studentConfirmed === true ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">1</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${user?.studentConfirmed === true ? 'text-success' : 'text-foreground'}`}>
                        {user?.studentConfirmed === true ? 'Child confirmed your identity' : 'Waiting for your child to confirm'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {user?.studentConfirmed === true
                          ? 'Your child has verified that you are their parent.'
                          : `Your child (${user?.childrenNames?.join(', ') || 'linked student'}) needs to confirm you are their parent from their dashboard.`}
                      </p>
                      {user?.studentConfirmed !== true && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-warning font-medium">
                          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                          Awaiting student confirmation
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Counselor approval */}
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      user?.approved === true
                        ? 'bg-success/10 text-success'
                        : user?.studentConfirmed === true
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {user?.approved === true ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">2</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        user?.approved === true
                          ? 'text-success'
                          : user?.studentConfirmed === true
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }`}>
                        {user?.approved === true
                          ? 'Counselor approved your account'
                          : 'Waiting for counselor approval'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {user?.studentConfirmed === true && user?.approved !== true
                          ? 'Your child confirmed you. A school counselor will review and approve your account shortly.'
                          : 'After your child confirms, a counselor will review and approve your account.'}
                      </p>
                      {user?.studentConfirmed === true && user?.approved !== true && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-warning font-medium">
                          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                          Awaiting counselor approval
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Counselor Info (read-only) */}
        {counselors.length > 0 && (
          <ContentCard
            title="Your School Counselor(s)"
            description="These counselors will review your account."
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {counselors.map((c, index) => (
                <Card key={c.id} className="p-0 overflow-hidden">
                  <div className={`h-1 ${index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-secondary' : 'bg-accent'}`} />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full border border-border bg-muted/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {c.profileImage ? (
                          <img
                            src={c.profileImage}
                            alt={`${c.firstName} ${c.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className={`font-bold text-sm ${index % 3 === 0 ? 'text-primary' : index % 3 === 1 ? 'text-secondary' : 'text-accent'}`}>
                            {c.firstName[0]}{c.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {c.title || 'School Counselor'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {c.department || 'General'} Department
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ContentCard>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome back, {user?.firstName || 'Parent'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay connected with your child&apos;s educational journey.
          </p>
          {user?.childrenNames && user.childrenNames.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.relationship ? `${user.relationship.charAt(0).toUpperCase() + user.relationship.slice(1)} of ` : 'Parent of '}
              {user.childrenNames.join(', ')}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{today}</div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            accentColor={stat.accent}
            icon={
              index === 0 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ) : index === 1 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : index === 2 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )
            }
          />
        ))}
      </div>

      {/* Children Cards */}
      {children.length > 0 ? (
        <ContentCard
          title="My Children"
          description="Your linked children at this school"
          action={
            <Link href="/parent/children" className="text-sm text-rose-500 hover:text-rose-600">
              View details
            </Link>
          }
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => {
              const childGoals = goals.filter(g => g.studentId === child.id);
              const childAvgProgress = childGoals.length > 0
                ? Math.round(childGoals.reduce((sum, g) => sum + g.progress, 0) / childGoals.length)
                : 0;

              return (
                <Card key={child.id} className="p-0 overflow-hidden" hover>
                  <div className="h-1 bg-rose-500" />
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full border border-border bg-muted/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {child.profileImage ? (
                          <img
                            src={child.profileImage}
                            alt={`${child.firstName} ${child.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-sm text-rose-500">
                            {child.firstName[0]}{child.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {child.firstName} {child.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">Grade {child.gradeLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Goals Progress</span>
                      <span className="font-medium text-foreground">{childAvgProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full ${getProgressColor(childAvgProgress)} transition-all`}
                        style={{ width: `${childAvgProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={child.approved ? 'success' : 'warning'} size="sm">
                        {child.approved ? 'Active' : 'Pending'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {childGoals.length} goal{childGoals.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ContentCard>
      ) : (
        <Card className="p-0 overflow-hidden border-rose-500/20">
          <div className="h-1 bg-rose-500" />
          <div className="p-6 text-center">
            <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="font-medium text-foreground">No children linked yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.childrenNames && user.childrenNames.length > 0
                ? `Looking for ${user.childrenNames.join(', ')} - they haven't registered at this school yet.`
                : 'Your children will appear here once they register at your school.'}
            </p>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <ContentCard
          title="Recent Requests"
          description="Your children's counseling requests"
          className="lg:col-span-2"
        >
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{request.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.studentName} &bull; {request.counselorName} &bull; {request.createdAt}
                    </p>
                  </div>
                  <Badge
                    variant={
                      request.status === 'pending'
                        ? 'warning'
                        : request.status === 'in_progress'
                          ? 'primary'
                          : request.status === 'completed'
                            ? 'success'
                            : 'default'
                    }
                  >
                    {request.status === 'in_progress' ? 'In Progress' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-medium">No requests yet</p>
              <p className="text-sm mt-1">
                Your children&apos;s counseling requests will appear here
              </p>
            </div>
          )}
        </ContentCard>

        {/* Upcoming Meetings */}
        <ContentCard title="Upcoming Meetings">
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.slice(0, 5).map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3 rounded-lg border bg-rose-500/5 border-rose-500/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-sm text-foreground">{meeting.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    {meeting.date} at {meeting.time}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    with {meeting.counselorName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No upcoming meetings</p>
              <p className="text-sm mt-1">Meetings will appear here</p>
            </div>
          )}
        </ContentCard>
      </div>

      {/* School Counselors & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* School Counselors */}
        <ContentCard
          title="School Counselors"
          description="Your child's counseling team"
        >
          {counselors.length > 0 ? (
            <div className="space-y-3">
              {counselors.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full border border-border bg-muted/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {c.profileImage ? (
                      <img
                        src={c.profileImage}
                        alt={`${c.firstName} ${c.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-xs text-rose-500">
                        {c.firstName[0]}{c.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.title || 'School Counselor'} {c.department ? `| ${c.department}` : ''}
                    </p>
                  </div>
                  <Link
                    href="/parent/messages"
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Message
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No counselors registered at your school yet.</p>
            </div>
          )}
        </ContentCard>

        {/* Quick Actions */}
        <ContentCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/parent/messages"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-rose-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Message Counselor</span>
            </Link>
            <Link
              href="/parent/children"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-foreground">View Children</span>
            </Link>
            <Link
              href="/parent/meetings"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-accent mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Meetings</span>
            </Link>
            <Link
              href="/parent/resources"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-medium text-foreground">Resources</span>
            </Link>
          </div>
        </ContentCard>
      </div>

      {/* Goals Overview */}
      {goals.length > 0 && (
        <ContentCard
          title="Children's Goals"
          description="Track your children's academic and personal goals"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {goals.slice(0, 8).map((goal) => {
              const child = children.find(c => c.id === goal.studentId);
              return (
                <Card key={goal.id} className="p-4" hover>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        goal.priority === 'high'
                          ? 'destructive'
                          : goal.priority === 'medium'
                            ? 'warning'
                            : 'default'
                      }
                      size="sm"
                    >
                      {goal.priority}
                    </Badge>
                    <span className="text-sm font-semibold text-rose-500">{goal.progress}%</span>
                  </div>
                  <p className="font-medium text-foreground text-sm mb-1">{goal.title}</p>
                  {child && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {child.firstName} {child.lastName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">Due: {goal.deadline}</p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </ContentCard>
      )}
    </div>
  );
}
