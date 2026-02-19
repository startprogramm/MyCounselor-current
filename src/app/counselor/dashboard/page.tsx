'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, StatsCard, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { normalizeRequestStatus, type RequestStatus } from '@/lib/request-status';

interface CounselingRequest {
  id: number;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  counselor: string;
  category: string;
  studentName?: string;
}

interface Meeting {
  id: number;
  title: string;
  counselor: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CounselorDashboardPage() {
  const { user, getSchoolStudents, getSchoolCounselors, updateRegisteredUser, removeRegisteredUser, refreshSchoolUsers } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingCounselors, setPendingCounselors] = useState<User[]>([]);
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      if (user.schoolId) {
        const allStudents = getSchoolStudents(user.schoolId);
        setStudentCount(allStudents.length);
        setPendingApprovals(allStudents.filter(s => s.approved !== true).length);

        if (user.approved === true) {
          const allCounselors = getSchoolCounselors(user.schoolId);
          setPendingCounselors(allCounselors.filter(c => c.approved !== true));
        }
      }

      const [requestsResult, meetingsResult] = await Promise.all([
        supabase
          .from('requests')
          .select('*')
          .eq('counselor_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('meetings')
          .select('*')
          .eq('counselor_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setRequests(
        (requestsResult.data || []).map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          status: normalizeRequestStatus(row.status),
          createdAt: formatDate(row.created_at),
          counselor: row.counselor_name,
          category: row.category,
          studentName: row.student_name,
        }))
      );

      setMeetings(
        (meetingsResult.data || []).map((row) => ({
          id: row.id,
          title: row.title,
          counselor: row.counselor_name,
          date: row.date,
          time: row.time,
          type: row.type,
          status: row.status,
        }))
      );
    };

    loadDashboardData();
  }, [user, getSchoolStudents, getSchoolCounselors]);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');
  const upcomingMeetings = meetings.filter(m => m.status === 'confirmed' || m.status === 'pending');

  const stats = [
    { title: 'Students', value: studentCount, subtitle: pendingApprovals > 0 ? `${pendingApprovals} pending approval` : 'At your school', accent: (pendingApprovals > 0 ? 'warning' : 'primary') as 'warning' | 'primary' },
    { title: 'Pending Requests', value: pendingRequests.length, subtitle: `${requests.length} total`, accent: 'warning' as const },
    { title: 'Upcoming Meetings', value: upcomingMeetings.length, subtitle: 'Scheduled', accent: 'accent' as const },
    { title: 'Completed', value: completedRequests.length, subtitle: 'Tasks finished', accent: 'success' as const },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const handleApproveCounselor = async (counselorId: string) => {
    await updateRegisteredUser(counselorId, { approved: true });
    await refreshSchoolUsers();
    setPendingCounselors(prev => prev.filter(c => c.id !== counselorId));
  };

  const handleRejectCounselor = async (counselorId: string) => {
    await removeRegisteredUser(counselorId);
    await refreshSchoolUsers();
    setPendingCounselors(prev => prev.filter(c => c.id !== counselorId));
  };

  // Show pending approval view for unapproved counselors
  if (user && user.approved !== true) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome, {user.firstName}!
          </h1>
          {user.schoolName && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.schoolName} {user.title && `\u2022 ${user.title}`}
            </p>
          )}
        </div>

        <Card className="border-warning/30 bg-warning/5">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Account Pending Approval</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your counselor account is awaiting approval from an existing counselor at {user.schoolName || 'your school'}.
              You&apos;ll get full access once approved.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-warning">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              Waiting for approval
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-foreground mb-2">Your Information</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 text-foreground">{user.firstName} {user.lastName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 text-foreground">{user.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Title:</span>
                <span className="ml-2 text-foreground">{user.title || 'Not set'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>
                <span className="ml-2 text-foreground">{user.department || 'Not set'}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome back, {user?.firstName || 'Counselor'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your counseling overview for today.
          </p>
          {user?.schoolName && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.schoolName} {user.title && `\u2022 ${user.title}`}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {today}
        </div>
      </div>

      {/* Pending Counselor Approvals */}
      {pendingCounselors.length > 0 && (
        <ContentCard
          title="Pending Counselor Approvals"
          description="New counselors requesting access to your school"
        >
          <div className="space-y-3">
            {pendingCounselors.map((counselor) => (
              <div
                key={counselor.id}
                className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-sm">
                    {counselor.firstName[0]}{counselor.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{counselor.firstName} {counselor.lastName}</p>
                    <p className="text-sm text-muted-foreground">{counselor.email}</p>
                    {counselor.title && (
                      <p className="text-xs text-muted-foreground">{counselor.title}{counselor.department ? ` \u2022 ${counselor.department}` : ''}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveCounselor(counselor.id)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectCounselor(counselor.id)}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      )}

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : index === 1 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ) : index === 2 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )
            }
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <ContentCard
          title="Pending Requests"
          description="Student requests needing attention"
          action={
            <Link href="/counselor/tasks" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          }
          className="lg:col-span-2"
        >
          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.slice(0, 4).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {(request.studentName || '?').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.title}</p>
                      <p className="text-sm text-muted-foreground">{request.studentName || 'Unknown Student'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-warning/10 text-warning border-warning/20">
                      {request.createdAt}
                    </span>
                    <Link href="/counselor/tasks">
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No pending student requests</p>
            </div>
          )}
        </ContentCard>

        {/* Upcoming Meetings */}
        <ContentCard
          title="Upcoming Meetings"
          action={
            <Link href="/counselor/meetings" className="text-sm text-primary hover:text-primary/80">
              Full schedule
            </Link>
          }
        >
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.slice(0, 5).map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3 rounded-lg border bg-primary/5 border-primary/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{meeting.time}</span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <p className="text-sm text-foreground">{meeting.title}</p>
                  <p className="text-xs text-muted-foreground">{meeting.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No upcoming meetings</p>
              <p className="text-sm mt-1">Meetings booked by students will appear here</p>
            </div>
          )}
        </ContentCard>
      </div>

      {/* Quick Actions */}
      <ContentCard title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/counselor/students"
            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm font-medium text-foreground">View Students</span>
          </Link>
          <Link
            href="/counselor/tasks"
            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-warning mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-sm font-medium text-foreground">Review Tasks</span>
          </Link>
          <Link
            href="/counselor/availability"
            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Set Hours</span>
          </Link>
          <Link
            href="/counselor/guidance"
            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-accent mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium text-foreground">Add Resource</span>
          </Link>
        </div>
      </ContentCard>
    </div>
  );
}
