'use client';

import React from 'react';
import Link from 'next/link';
import { StatsCard, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const stats = [
  { title: 'My Students', value: 32, trend: { value: 4, isPositive: true } },
  { title: 'Pending Referrals', value: 3, subtitle: '1 urgent' },
  { title: 'New Messages', value: 5, subtitle: 'From counselors & parents' },
  { title: 'Resources Shared', value: 12, subtitle: 'This semester' },
];

const studentConcerns = [
  { id: 1, student: 'Alex Johnson', concern: 'Declining grades in Math', status: 'referred', priority: 'high' },
  { id: 2, student: 'Sarah Kim', concern: 'Frequent absences', status: 'monitoring', priority: 'medium' },
  { id: 3, student: 'James Wilson', concern: 'Social isolation', status: 'new', priority: 'high' },
  { id: 4, student: 'Emily Rodriguez', concern: 'Test anxiety', status: 'monitoring', priority: 'low' },
];

const recentMessages = [
  { id: 1, from: 'Ms. Martinez (Counselor)', subject: 'Re: Alex Johnson follow-up', time: '1 hour ago', unread: true },
  { id: 2, from: 'Mr. Smith (Parent)', subject: 'Concern about homework', time: '3 hours ago', unread: true },
  { id: 3, from: 'Dr. Brown (Counselor)', subject: 'Student support meeting', time: 'Yesterday', unread: false },
  { id: 4, from: 'Mrs. Johnson (Parent)', subject: 'Thank you for the update', time: 'Yesterday', unread: false },
];

const upcomingMeetings = [
  { id: 1, title: 'Parent-Teacher Conference', with: 'Johnson Family', time: 'Today, 3:00 PM' },
  { id: 2, title: 'Counselor Collaboration', with: 'Ms. Martinez', time: 'Tomorrow, 10:00 AM' },
  { id: 3, title: 'IEP Review Meeting', with: 'Support Team', time: 'Jan 27, 2:00 PM' },
];

export default function TeacherDashboardPage() {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'referred': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'monitoring': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'new': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
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
              {user.schoolName} {user.subject && `• ${user.subject}`}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Friday, January 24, 2026
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            trend={stat.trend}
            icon={
              index === 0 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : index === 1 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              ) : index === 2 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )
            }
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Student Concerns */}
        <ContentCard
          title="Student Concerns"
          description="Students needing attention"
          action={
            <Link href="/teacher/referrals" className="text-sm text-amber-500 hover:text-amber-600">
              Manage referrals
            </Link>
          }
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {studentConcerns.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-semibold text-sm">
                      {item.student.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityDot(item.priority)} border-2 border-background`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.student}</p>
                    <p className="text-sm text-muted-foreground">{item.concern}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-foreground">{meeting.title}</span>
                </div>
                <p className="text-sm text-foreground">{meeting.with}</p>
                <p className="text-xs text-muted-foreground">{meeting.time}</p>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <ContentCard
          title="Recent Messages"
          action={
            <Link href="/teacher/messages" className="text-sm text-amber-500 hover:text-amber-600">
              View all
            </Link>
          }
        >
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${message.unread ? 'bg-amber-500/5 border-amber-500/20' : 'bg-muted/30 border-border'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${message.unread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                    {message.from}
                  </span>
                  {message.unread && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
              </div>
            ))}
          </div>
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
              href="/teacher/reports"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-foreground">View Reports</span>
            </Link>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
