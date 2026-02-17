'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, StatsCard, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

interface CounselingRequest {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  counselor: string;
  category: string;
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

interface Conversation {
  id: number;
  counselor: string;
  unread: number;
  messages: { id: number }[];
}

interface Goal {
  id: number;
  title: string;
  progress: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

function buildConversationKey(studentId: string, counselorId: string) {
  return [studentId, counselorId].sort().join('__');
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const quickActions = [
  {
    label: 'Book Meeting',
    description: 'Schedule with counselor',
    href: '/student/meetings',
    icon: 'calendar',
    color: 'bg-primary',
  },
  {
    label: 'New Request',
    description: 'Submit support need',
    href: '/student/requests',
    icon: 'document',
    color: 'bg-secondary',
  },
  {
    label: 'View Resources',
    description: 'Guides and articles',
    href: '/student/guidance',
    icon: 'book',
    color: 'bg-accent',
  },
  {
    label: 'Send Message',
    description: 'Start conversation',
    href: '/student/messages',
    icon: 'chat',
    color: 'bg-warning',
  },
];

interface PendingParent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    role: profile.role,
    schoolId: profile.school_id,
    schoolName: profile.school_name || undefined,
    gradeLevel: profile.grade_level || undefined,
    title: profile.title || undefined,
    department: profile.department || undefined,
    profileImage: profile.profile_image || undefined,
    approved: profile.approved,
    subject: profile.subject || undefined,
    childrenNames: profile.children_names || undefined,
    relationship: profile.relationship || undefined,
  };
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [counselors, setCounselors] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [pendingParents, setPendingParents] = useState<PendingParent[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const loadDashboardData = async () => {
      const [requestsResult, meetingsResult, goalsResult, supportUsersResult] = await Promise.all([
        supabase
          .from('requests')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('meetings')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('school_id', user.schoolId)
          .in('role', ['counselor', 'teacher', 'parent']),
      ]);

      const supportUsers = (supportUsersResult.data || []).map(mapProfileToUser);
      const schoolCounselors = supportUsers.filter((member) => member.role === 'counselor');
      const schoolTeachers = supportUsers.filter((member) => member.role === 'teacher');
      const schoolParents = supportUsers.filter((member) => member.role === 'parent');

      setCounselors(schoolCounselors);
      setTeachers(schoolTeachers);
      setParents(schoolParents);

      setRequests(
        (requestsResult.data || []).map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          createdAt: formatDate(row.created_at),
          counselor: row.counselor_name,
          category: row.category,
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

      setGoals(
        (goalsResult.data || []).map((row) => ({
          id: row.id,
          title: row.title,
          progress: row.progress,
          deadline: row.deadline,
          priority: row.priority as Goal['priority'],
        }))
      );

      const activeCounselors = schoolCounselors.filter((c) => c.approved === true);
      if (activeCounselors.length === 0) {
        setConversations([]);
      } else {
        const keys = activeCounselors.map((c) => buildConversationKey(user.id, c.id));
        const { data: messageRows } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_key', keys)
          .order('created_at', { ascending: true });

        const nextConversations: Conversation[] = activeCounselors.map((counselor, index) => {
          const key = buildConversationKey(user.id, counselor.id);
          const rows = (messageRows || []).filter((row) => row.conversation_key === key);
          const lastStudentIdx = [...rows]
            .reverse()
            .findIndex((row) => row.sender_role === 'student');

          let unread = 0;
          if (lastStudentIdx === -1) {
            unread = rows.filter((row) => row.sender_role === 'counselor').length;
          } else {
            unread = lastStudentIdx;
          }

          return {
            id: index + 1,
            counselor: `${counselor.firstName} ${counselor.lastName}`,
            unread,
            messages: rows.map((row) => ({ id: row.id })),
          };
        });

        setConversations(nextConversations);
      }

      // Load pending parents who want to link to this student
      if (user.approved === true) {
        const studentFullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const { data: parentRows } = await supabase
          .from('profiles')
          .select('*')
          .eq('school_id', user.schoolId)
          .eq('role', 'parent')
          .eq('student_confirmed', false);

        const pending = (parentRows || [])
          .filter(p => {
            const names = p.children_names || [];
            return names.some(n => n.toLowerCase().trim() === studentFullName);
          })
          .map(p => ({
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            relationship: p.relationship || 'Parent',
          }));

        setPendingParents(pending);
      }
    };

    loadDashboardData();
  }, [user?.id, user?.schoolId]);

  // Computed stats from real data
  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'confirmed' || m.status === 'pending'
  );
  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
  const goalsOnTrack = goals.filter((g) => g.progress >= 50).length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const recentRequests = requests.slice(0, 3);
  const upcomingMeetingsList = upcomingMeetings.slice(0, 2);

  const stats = [
    {
      title: 'Upcoming Meetings',
      value: upcomingMeetings.length,
      subtitle: 'Scheduled',
      accent: 'primary' as const,
    },
    {
      title: 'Goals Progress',
      value: `${goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0}%`,
      subtitle: `${goalsOnTrack} of ${goals.length} on track`,
      accent: 'success' as const,
    },
    {
      title: 'Unread Messages',
      value: unreadMessages,
      subtitle: 'From counselors',
      accent: 'warning' as const,
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      subtitle: `${requests.length} total requests`,
      accent: 'accent' as const,
    },
  ];

  const updateGoalProgress = async (goalId: number, newProgress: number) => {
    if (!user) return;
    const progress = Math.min(100, Math.max(0, newProgress));

    const { error } = await supabase
      .from('goals')
      .update({ progress })
      .eq('id', goalId)
      .eq('student_id', user.id);

    if (error) return;

    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, progress } : goal)));
    setEditingGoal(null);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'approved':
        return 'Approved';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getActionIcon = (icon: string) => {
    switch (icon) {
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case 'chat':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleConfirmParent = async (parentId: string) => {
    await supabase.from('profiles').update({ student_confirmed: true }).eq('id', parentId);
    setPendingParents(prev => prev.filter(p => p.id !== parentId));
  };

  const handleRejectParent = async (parentId: string) => {
    await supabase.from('profiles').delete().eq('id', parentId);
    setPendingParents(prev => prev.filter(p => p.id !== parentId));
  };

  // Pending approval view for unapproved students
  if (user?.approved !== true) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome, {user?.firstName || 'Student'}!
          </h1>
          {user?.schoolName && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.schoolName} {user.gradeLevel && `| Grade ${user.gradeLevel}`}
            </p>
          )}
        </div>

        {/* Pending Approval Notice */}
        <Card className="p-0 overflow-hidden border-warning/30">
          <div className="h-1 bg-warning" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-warning"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Account Pending Approval</h2>
                <p className="text-muted-foreground mt-1">
                  Your account has been created successfully. A school counselor needs to approve
                  your account before you can access all features. This usually happens within 1-2
                  school days.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-warning font-medium">
                  <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  Waiting for counselor approval
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Counselor Info (read-only) */}
        {counselors.length > 0 && (
          <ContentCard
            title="Your School Counselor(s)"
            description="Your counselors will review your account."
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {counselors.map((c, index) => (
                <Card key={c.id} className="p-0 overflow-hidden">
                  <div
                    className={`h-1 ${index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-secondary' : 'bg-accent'}`}
                  />
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
                          <span
                            className={`font-bold text-sm ${index % 3 === 0 ? 'text-primary' : index % 3 === 1 ? 'text-secondary' : 'text-accent'}`}
                          >
                            {c.firstName[0]}
                            {c.lastName[0]}
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
            Welcome back, {user?.firstName || 'Student'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your counseling journey.
          </p>
          {user?.schoolName && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.schoolName} {user.gradeLevel && `| Grade ${user.gradeLevel}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group p-4 bg-card rounded-xl border border-border hover:border-primary/20 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 ${action.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}
              >
                {getActionIcon(action.icon)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Parent Confirmations */}
      {pendingParents.length > 0 && (
        <ContentCard
          title="Parent Confirmation Requests"
          description="These people want to link as your parent"
        >
          <div className="space-y-3">
            {pendingParents.map(parent => (
              <div
                key={parent.id}
                className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-sm text-warning">
                      {parent.firstName[0]}{parent.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {parent.firstName} {parent.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {parent.relationship.charAt(0).toUpperCase() + parent.relationship.slice(1)} — wants to link as your parent
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleConfirmParent(parent.id)}
                    className="bg-success hover:bg-success/90 text-white"
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectParent(parent.id)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      )}

      {/* Your School Counselor(s) */}
      {counselors.length > 0 && (
        <ContentCard
          title="Your School Counselor(s)"
          description="Your assigned support team, organized for quick contact."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {counselors.map((c, index) => (
              <Card key={c.id} className="p-0 overflow-hidden h-full" hover>
                <div
                  className={`h-1 ${index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-secondary' : 'bg-accent'}`}
                />
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full border border-border bg-muted/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {c.profileImage ? (
                        <img
                          src={c.profileImage}
                          alt={`${c.firstName} ${c.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className={`font-bold text-base ${index % 3 === 0 ? 'text-primary' : index % 3 === 1 ? 'text-secondary' : 'text-accent'}`}
                        >
                          {c.firstName[0]}
                          {c.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 rounded-xl border border-border bg-muted/20 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {c.title || 'School Counselor'}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground mt-0.5">
                          Assigned
                        </span>
                      </div>

                      <div className="space-y-1 text-sm mt-2">
                        <p className="text-muted-foreground">
                          Department:{' '}
                          <span className="text-foreground font-medium capitalize">
                            {c.department || 'General'}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          School:{' '}
                          <span className="text-foreground font-medium">
                            {c.schoolName || user?.schoolName || 'Assigned School'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/student/messages"
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Message
                    </Link>
                    <Link
                      href="/student/meetings"
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                    >
                      Book Meeting
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ContentCard>
      )}

      {(counselors.length > 0 || teachers.length > 0 || parents.length > 0) && (
        <ContentCard
          title="Registered School Contacts"
          description="Everyone registered at your school by role."
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground">Counselors</p>
                <Badge variant="primary" size="sm">{counselors.length}</Badge>
              </div>
              {counselors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No counselors registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {counselors.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-card border border-border">
                      <p className="text-sm font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.title || 'School Counselor'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground">Teachers</p>
                <Badge variant="accent" size="sm">{teachers.length}</Badge>
              </div>
              {teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teachers registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {teachers.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-card border border-border">
                      <p className="text-sm font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.subject || 'Teacher'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground">Parents</p>
                <Badge variant="warning" size="sm">{parents.length}</Badge>
              </div>
              {parents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No parents registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {parents.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-card border border-border">
                      <p className="text-sm font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.relationship || 'Parent'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <ContentCard
          title="Recent Requests"
          description="Your latest counseling requests"
          action={
            <Link href="/student/requests" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          }
          className="lg:col-span-2"
        >
          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{request.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.counselor} &bull; {request.createdAt}
                    </p>
                  </div>
                  <Badge
                    variant={
                      request.status === 'pending'
                        ? 'warning'
                        : request.status === 'in_progress'
                          ? 'primary'
                          : request.status === 'approved'
                            ? 'success'
                            : 'default'
                    }
                  >
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No requests yet.</p>
              <Link
                href="/student/requests"
                className="text-primary text-sm hover:underline mt-1 inline-block"
              >
                Create your first request
              </Link>
            </div>
          )}
        </ContentCard>

        {/* Upcoming Meetings */}
        <ContentCard
          title="Upcoming Meetings"
          action={
            <Link href="/student/meetings" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          }
        >
          {upcomingMeetingsList.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetingsList.map((meeting) => (
                <div key={meeting.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-foreground text-sm">{meeting.title}</p>
                    <Badge variant={meeting.type === 'video' ? 'primary' : 'accent'} size="sm">
                      {meeting.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{meeting.counselor}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {meeting.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {meeting.time}
                    </span>
                  </div>
                </div>
              ))}
              <Link href="/student/meetings">
                <Button variant="outline" fullWidth size="sm">
                  Book New Meeting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No upcoming meetings.</p>
              <Link href="/student/meetings">
                <Button variant="outline" size="sm" className="mt-3">
                  Book a Meeting
                </Button>
              </Link>
            </div>
          )}
        </ContentCard>
      </div>

      {/* Goals Progress */}
      <ContentCard
        title="Goals Progress"
        description="Track your academic and personal goals"
        action={goals.length > 0 ? undefined : undefined}
      >
        {goals.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {goals.map((goal) => (
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
                  <span className="text-sm font-semibold text-primary">{goal.progress}%</span>
                </div>
                <p className="font-medium text-foreground text-sm mb-1">{goal.title}</p>
                <p className="text-xs text-muted-foreground mb-3">Due: {goal.deadline}</p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      goal.progress >= 75
                        ? 'bg-success'
                        : goal.progress >= 50
                          ? 'bg-primary'
                          : goal.progress >= 25
                            ? 'bg-warning'
                            : 'bg-destructive'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                {editingGoal === goal.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => {
                        const newGoals = goals.map((g) =>
                          g.id === goal.id ? { ...g, progress: parseInt(e.target.value) } : g
                        );
                        setGoals(newGoals);
                      }}
                      className="flex-1 h-1.5 accent-primary"
                    />
                    <button
                      onClick={() => updateGoalProgress(goal.id, goal.progress)}
                      className="text-xs text-primary font-medium hover:text-primary/80"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingGoal(goal.id)}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Update Progress
                  </button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">No goals set yet</p>
            <p className="text-sm mt-1">
              Talk to your counselor to set academic and personal goals
            </p>
          </div>
        )}
      </ContentCard>
    </div>
  );
}
