'use client';

import React, { useState } from 'react';
import DashboardStats from './components/DashboardStats';
import StudentSearchBar from './components/StudentSearchBar';
import PriorityQueue from './components/PriorityQueue';
import UpcomingAppointments from './components/UpcomingAppointments';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';

// Mock data for the dashboard
const statsData = [
  { title: 'Active Students', value: 156, change: '+12%', trend: 'up' as const, icon: 'UserGroupIcon', color: 'blue' },
  { title: 'Pending Requests', value: 23, change: '+5', trend: 'up' as const, icon: 'InboxIcon', color: 'amber' },
  { title: "Today's Meetings", value: 8, change: '2 remaining', trend: 'neutral' as const, icon: 'CalendarIcon', color: 'emerald' },
  { title: 'Response Rate', value: '94%', change: '+2%', trend: 'up' as const, icon: 'ChartBarIcon', color: 'violet' },
];

const priorityItems = [
  {
    id: 1,
    studentName: 'Emily Johnson',
    studentImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    studentImageAlt: 'Emily Johnson profile photo',
    issue: 'Experiencing anxiety about upcoming college applications. Requested urgent meeting.',
    priority: 'urgent' as const,
    timestamp: '10 minutes ago',
    category: 'Mental Health'
  },
  {
    id: 2,
    studentName: 'Michael Chen',
    studentImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    studentImageAlt: 'Michael Chen profile photo',
    issue: 'Need guidance on course selection for next semester. AP vs Regular track decision.',
    priority: 'high' as const,
    timestamp: '1 hour ago',
    category: 'Academic'
  },
  {
    id: 3,
    studentName: 'Sarah Williams',
    studentImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    studentImageAlt: 'Sarah Williams profile photo',
    issue: 'Looking for internship opportunities in computer science field.',
    priority: 'medium' as const,
    timestamp: '2 hours ago',
    category: 'Career'
  },
  {
    id: 4,
    studentName: 'David Park',
    studentImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    studentImageAlt: 'David Park profile photo',
    issue: 'Questions about SAT prep resources and testing schedule.',
    priority: 'medium' as const,
    timestamp: '3 hours ago',
    category: 'College'
  },
];

const appointmentsData = [
  {
    id: 1,
    studentName: 'Alex Rivera',
    studentImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    studentImageAlt: 'Alex Rivera profile photo',
    time: '9:00 AM',
    duration: '30 min',
    type: 'In-Person',
    location: 'Counseling Office 201'
  },
  {
    id: 2,
    studentName: 'Jessica Lee',
    studentImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    studentImageAlt: 'Jessica Lee profile photo',
    time: '10:30 AM',
    duration: '45 min',
    type: 'Virtual',
    location: 'Zoom Meeting'
  },
  {
    id: 3,
    studentName: 'Marcus Thompson',
    studentImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    studentImageAlt: 'Marcus Thompson profile photo',
    time: '1:00 PM',
    duration: '30 min',
    type: 'In-Person',
    location: 'Counseling Office 201'
  },
  {
    id: 4,
    studentName: 'Emma Davis',
    studentImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    studentImageAlt: 'Emma Davis profile photo',
    time: '2:30 PM',
    duration: '30 min',
    type: 'Phone',
    location: 'Phone Call'
  },
];

const quickActionsData = [
  { id: 1, label: 'New Meeting', icon: 'CalendarIcon', color: 'blue', count: 0 },
  { id: 2, label: 'Messages', icon: 'ChatBubbleLeftRightIcon', color: 'emerald', count: 5 },
  { id: 3, label: 'Resources', icon: 'FolderIcon', color: 'violet', count: 0 },
  { id: 4, label: 'Reports', icon: 'DocumentChartBarIcon', color: 'amber', count: 0 },
  { id: 5, label: 'Emergency', icon: 'ExclamationTriangleIcon', color: 'rose', count: 0 },
];

const recentActivityData = [
  { id: 1, type: 'meeting', description: 'Completed meeting with Emily Johnson', timestamp: '30 minutes ago', icon: 'CheckCircleIcon', color: 'emerald' },
  { id: 2, type: 'message', description: 'Sent college application resources to Michael Chen', timestamp: '1 hour ago', icon: 'PaperAirplaneIcon', color: 'blue' },
  { id: 3, type: 'note', description: 'Added counseling notes for Sarah Williams', timestamp: '2 hours ago', icon: 'PencilSquareIcon', color: 'violet' },
  { id: 4, type: 'schedule', description: 'Scheduled follow-up with David Park', timestamp: '3 hours ago', icon: 'CalendarIcon', color: 'amber' },
  { id: 5, type: 'meeting', description: 'Completed career guidance session', timestamp: '4 hours ago', icon: 'CheckCircleIcon', color: 'emerald' },
];

export default function CounselorCommandCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  const handlePriorityClick = (id: number) => {
    console.log('Priority item clicked:', id);
  };

  const handleAppointmentClick = (id: number) => {
    console.log('Appointment clicked:', id);
  };

  const handleActionClick = (id: number) => {
    console.log('Quick action clicked:', id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Counselor Command Center</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your overview for today.</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <StudentSearchBar onSearch={handleSearch} />
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats stats={statsData} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Priority Queue */}
          <PriorityQueue items={priorityItems} onItemClick={handlePriorityClick} />

          {/* Upcoming Appointments */}
          <UpcomingAppointments appointments={appointmentsData} onAppointmentClick={handleAppointmentClick} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickActions actions={quickActionsData} onActionClick={handleActionClick} />
          <RecentActivity activities={recentActivityData} />
        </div>
      </div>
    </div>
  );
}
