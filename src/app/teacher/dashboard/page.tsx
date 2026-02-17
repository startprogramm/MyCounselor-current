'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatsCard, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Referral {
  id: number;
  studentName: string;
  concern: string;
  status: string;
  priority: string;
}

interface Meeting {
  id: number;
  title: string;
  counselorName: string;
  date: string;
  time: string;
  status: string;
}

export default function TeacherDashboardPage() {
  const { user, getSchoolStudents, getSchoolCounselors } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [resourceCount, setResourceCount] = useState(0);
  const [counselors, setCounselors] = useState<{ name: string; title: string }[]>([]);

  useEffect(() => {
    if (!user?.id || !user?.schoolId) return;

    const loadData = async () => {
      // Get students at this school
      const students = getSchoolStudents(user.schoolId);
      setStudentCount(students.filter(s => s.approved).length);

      // Get counselors
      const schoolCounselors = getSchoolCounselors(user.schoolId);
      setCounselors(
        schoolCounselors.map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          title: c.title || 'School Counselor',
        }))
      );

      // Load referrals (requests made by this teacher)
      const [referralsResult, meetingsResult, resourcesResult] = await Promise.all([
        supabase
          .from('requests')
          .select('*')
          .eq('school_id', user.schoolId)
          .eq('counselor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('meetings')
          .select('*')
          .eq('school_id', user.schoolId)
          .or(`student_id.eq.${user.id},counselor_id.eq.${user.id}`)
          .in('status', ['pending', 'confirmed'])
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('resources')
          .select('id', { count: 'exact' })
          .eq('school_id', user.schoolId)
          .eq('status', 'published'),
      ]);

      setReferrals(
        (referralsResult.data || []).map(r => ({
          id: r.id,
          studentName: r.student_name || 'Unknown',
          concern: r.title,
          status: r.status,
          priority: r.category === 'urgent' ? 'high' : r.category === 'academic' ? 'medium' : 'low',
        }))
      );

      setMeetings(
        (meetingsResult.data || []).map(m => ({
          id: m.id,
          title: m.title,
          counselorName: m.counselor_name,
          date: m.date,
          time: m.time,
          status: m.status,
        }))
      );

      setResourceCount(resourcesResult.count || 0);
    };

    loadData();
  }, [user?.id, user?.schoolId, getSchoolStudents, getSchoolCounselors]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'in_progress');

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning' as const;
      case 'in_progress': return 'primary' as const;
      case 'completed': return 'success' as const;
      case 'approved': return 'success' as const;
      default: return 'secondary' as const;
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="School Students"
          value={studentCount}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          accentColor="#F59E0B"
        />
        <StatsCard
          title="Pending Referrals"
          value={pendingReferrals.length}
          subtitle={pendingReferrals.length > 0 ? `${pendingReferrals.length} need attention` : 'All clear'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
          accentColor="#EF4444"
        />
        <StatsCard
          title="Upcoming Meetings"
          value={meetings.length}
          subtitle={meetings.length > 0 ? 'Scheduled' : 'None scheduled'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          accentColor="#1A73E8"
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
          accentColor="#1E8E3E"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Referrals */}
        <ContentCard
          title="Recent Referrals"
          description="Student concerns you've submitted"
          action={
            <Link href="/teacher/referrals" className="text-sm text-amber-500 hover:text-amber-600">
              View all
            </Link>
          }
          className="lg:col-span-2"
        >
          {referrals.length === 0 ? (
            <div className="text-center py-6">
              <svg className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-sm text-muted-foreground">No referrals yet</p>
              <Link href="/teacher/referrals" className="text-sm text-amber-500 hover:text-amber-600 mt-1 inline-block">
                Create a referral
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-semibold text-sm">
                        {item.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityDot(item.priority)} border-2 border-background`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.studentName}</p>
                      <p className="text-sm text-muted-foreground">{item.concern}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(item.status)} size="sm">{item.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        {/* Upcoming Meetings */}
        <ContentCard
          title="Upcoming Meetings"
          action={
            <Link href="/teacher/messages" className="text-sm text-amber-500 hover:text-amber-600">
              View all
            </Link>
          }
        >
          {meetings.length === 0 ? (
            <div className="text-center py-6">
              <svg className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-muted-foreground">No upcoming meetings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{meeting.title}</span>
                    <Badge variant={meeting.status === 'confirmed' ? 'success' : 'warning'} size="sm">{meeting.status}</Badge>
                  </div>
                  <p className="text-sm text-foreground">with {meeting.counselorName}</p>
                  <p className="text-xs text-muted-foreground">{meeting.date} at {meeting.time}</p>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* School Counselors */}
        <ContentCard title="School Counselors">
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
              href="/teacher/referrals"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-amber-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-sm font-medium text-foreground">New Referral</span>
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
