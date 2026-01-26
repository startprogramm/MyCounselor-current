'use client';

import React from 'react';
import Link from 'next/link';
import { Card, StatsCard, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

// Mock data
const stats = [
  { title: 'Upcoming Meetings', value: 2, subtitle: 'This week', trend: { value: 50, isPositive: true } },
  { title: 'Goals Progress', value: '75%', subtitle: '3 of 4 on track' },
  { title: 'Unread Messages', value: 3, subtitle: 'From counselor' },
  { title: 'Resources Viewed', value: 12, subtitle: 'This month', trend: { value: 20, isPositive: true } },
];

const recentRequests = [
  { id: 1, title: 'College Essay Review', status: 'pending', date: 'Jan 22, 2026', counselor: 'Dr. Martinez' },
  { id: 2, title: 'SAT Prep Guidance', status: 'approved', date: 'Jan 20, 2026', counselor: 'Dr. Martinez' },
  { id: 3, title: 'Schedule Change Request', status: 'completed', date: 'Jan 18, 2026', counselor: 'Mr. Chen' },
];

const upcomingMeetings = [
  { id: 1, title: 'College Application Review', counselor: 'Dr. Sarah Martinez', date: 'Jan 25, 2026', time: '2:00 PM', type: 'video' },
  { id: 2, title: 'Career Exploration', counselor: 'Mr. James Chen', date: 'Jan 28, 2026', time: '10:30 AM', type: 'in-person' },
];

const quickActions = [
  { label: 'Book Meeting', href: '/student/meetings', icon: 'calendar', color: 'bg-primary' },
  { label: 'New Request', href: '/student/requests', icon: 'document', color: 'bg-secondary' },
  { label: 'View Resources', href: '/student/guidance', icon: 'book', color: 'bg-accent' },
  { label: 'Send Message', href: '/student/messages', icon: 'chat', color: 'bg-warning' },
];

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'approved': return 'bg-success/10 text-success';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getActionIcon = (icon: string) => {
    switch (icon) {
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'chat':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      default:
        return null;
    }
  };

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
              {user.schoolName} {user.gradeLevel && `• Grade ${user.gradeLevel}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Last login: Today at 9:15 AM
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/20 hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white`}>
              {getActionIcon(action.icon)}
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
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
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{request.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.counselor} &bull; {request.date}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
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
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-foreground text-sm">{meeting.title}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    meeting.type === 'video' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                  }`}>
                    {meeting.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{meeting.counselor}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {meeting.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {meeting.time}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="outline" fullWidth size="sm">
              Book New Meeting
            </Button>
          </div>
        </ContentCard>
      </div>

      {/* Goals Progress */}
      <ContentCard
        title="Goals Progress"
        description="Track your academic and personal goals"
        action={
          <Button variant="ghost" size="sm">
            Manage Goals
          </Button>
        }
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Complete College Apps', progress: 75, deadline: 'Feb 1, 2026', priority: 'high' },
            { title: 'Improve Math Grade', progress: 60, deadline: 'Jan 31, 2026', priority: 'high' },
            { title: 'Career Workshops', progress: 33, deadline: 'Mar 15, 2026', priority: 'medium' },
            { title: 'Volunteer Hours', progress: 80, deadline: 'Apr 30, 2026', priority: 'low' },
          ].map((goal, index) => (
            <Card key={index} className="p-4" hover>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  goal.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                  goal.priority === 'medium' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {goal.priority}
                </span>
                <span className="text-sm font-semibold text-primary">{goal.progress}%</span>
              </div>
              <p className="font-medium text-foreground text-sm mb-1">{goal.title}</p>
              <p className="text-xs text-muted-foreground mb-3">Due: {goal.deadline}</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}
