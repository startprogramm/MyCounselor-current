'use client';

import React, { useState } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const mockStudents = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.j@school.edu',
    grade: '11th',
    status: 'active',
    lastActivity: '2 hours ago',
    goalsProgress: 75,
    upcomingMeeting: 'Jan 25, 2:00 PM',
  },
  {
    id: 2,
    name: 'Emily Rodriguez',
    email: 'emily.r@school.edu',
    grade: '12th',
    status: 'active',
    lastActivity: '1 day ago',
    goalsProgress: 90,
    upcomingMeeting: 'Jan 26, 10:00 AM',
  },
  {
    id: 3,
    name: 'James Wilson',
    email: 'james.w@school.edu',
    grade: '10th',
    status: 'needs-attention',
    lastActivity: '5 days ago',
    goalsProgress: 45,
    upcomingMeeting: null,
  },
  {
    id: 4,
    name: 'Sarah Kim',
    email: 'sarah.k@school.edu',
    grade: '11th',
    status: 'active',
    lastActivity: '3 hours ago',
    goalsProgress: 60,
    upcomingMeeting: 'Jan 27, 3:00 PM',
  },
  {
    id: 5,
    name: 'Michael Chen',
    email: 'michael.c@school.edu',
    grade: '12th',
    status: 'active',
    lastActivity: '1 hour ago',
    goalsProgress: 85,
    upcomingMeeting: 'Jan 25, 4:30 PM',
  },
  {
    id: 6,
    name: 'Lisa Park',
    email: 'lisa.p@school.edu',
    grade: '9th',
    status: 'new',
    lastActivity: 'Never',
    goalsProgress: 0,
    upcomingMeeting: null,
  },
];

export default function CounselorStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'needs-attention': return 'bg-warning/10 text-warning';
      case 'new': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your students
          </p>
        </div>
        <Button>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Student
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{mockStudents.length}</p>
          <p className="text-sm text-muted-foreground">Total Students</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{mockStudents.filter(s => s.status === 'active').length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning">{mockStudents.filter(s => s.status === 'needs-attention').length}</p>
          <p className="text-sm text-muted-foreground">Need Attention</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{mockStudents.filter(s => s.status === 'new').length}</p>
          <p className="text-sm text-muted-foreground">New</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-input bg-card text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="needs-attention">Needs Attention</option>
            <option value="new">New</option>
          </select>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-input bg-card text-foreground"
          >
            <option value="all">All Grades</option>
            <option value="9th">9th Grade</option>
            <option value="10th">10th Grade</option>
            <option value="11th">11th Grade</option>
            <option value="12th">12th Grade</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Grade</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Goals</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Next Meeting</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">{student.grade}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                      {student.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${student.goalsProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{student.goalsProgress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {student.upcomingMeeting || 'Not scheduled'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Message</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
