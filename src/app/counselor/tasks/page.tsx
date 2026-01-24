'use client';

import React, { useState } from 'react';
import { ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const mockTasks = [
  {
    id: 1,
    title: 'Review College Essay',
    student: 'Alex Johnson',
    type: 'document-review',
    priority: 'high',
    deadline: 'Today',
    status: 'pending',
    createdAt: 'Jan 22, 2026',
  },
  {
    id: 2,
    title: 'Write Letter of Recommendation',
    student: 'Emily Rodriguez',
    type: 'recommendation',
    priority: 'high',
    deadline: 'Tomorrow',
    status: 'in-progress',
    createdAt: 'Jan 20, 2026',
  },
  {
    id: 3,
    title: 'Approve Schedule Change',
    student: 'James Wilson',
    type: 'approval',
    priority: 'medium',
    deadline: 'Jan 26',
    status: 'pending',
    createdAt: 'Jan 21, 2026',
  },
  {
    id: 4,
    title: 'Review SAT Prep Plan',
    student: 'Sarah Kim',
    type: 'document-review',
    priority: 'medium',
    deadline: 'Jan 27',
    status: 'pending',
    createdAt: 'Jan 19, 2026',
  },
  {
    id: 5,
    title: 'Complete Student Assessment',
    student: 'Michael Chen',
    type: 'assessment',
    priority: 'low',
    deadline: 'Jan 30',
    status: 'pending',
    createdAt: 'Jan 18, 2026',
  },
  {
    id: 6,
    title: 'Follow-up Meeting Notes',
    student: 'Lisa Park',
    type: 'follow-up',
    priority: 'low',
    deadline: 'Jan 31',
    status: 'completed',
    createdAt: 'Jan 15, 2026',
  },
];

export default function CounselorTasksPage() {
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredTasks = mockTasks.filter((task) => {
    const matchesStatus = filter === 'all' || task.status === filter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'in-progress': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document-review':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'recommendation':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'approval':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'assessment':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const taskCounts = {
    all: mockTasks.length,
    pending: mockTasks.filter(t => t.status === 'pending').length,
    'in-progress': mockTasks.filter(t => t.status === 'in-progress').length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student requests and tasks
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'in-progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All Tasks' : status.replace('-', ' ')}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === status ? 'bg-primary-foreground/20' : 'bg-background'
            }`}>
              {taskCounts[status as keyof typeof taskCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Priority Filter */}
      <div className="flex gap-2">
        <span className="text-sm text-muted-foreground self-center">Priority:</span>
        {['all', 'high', 'medium', 'low'].map((priority) => (
          <button
            key={priority}
            onClick={() => setPriorityFilter(priority)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              priorityFilter === priority
                ? priority === 'high' ? 'bg-destructive text-destructive-foreground' :
                  priority === 'medium' ? 'bg-warning text-warning-foreground' :
                  priority === 'low' ? 'bg-muted text-foreground' :
                  'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {priority === 'all' ? 'All' : priority}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-card rounded-xl border p-5 transition-all hover:shadow-md ${
              task.status === 'completed' ? 'border-border opacity-60' : 'border-border hover:border-primary/20'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                task.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
              }`}>
                {task.status === 'completed' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  getTypeIcon(task.type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`font-semibold ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {task.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {task.student}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {task.deadline}
                    </span>
                    <span>Created: {task.createdAt}</span>
                  </div>
                  {task.status !== 'completed' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Complete</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 mx-auto text-muted-foreground mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-muted-foreground">No tasks found matching your filters</p>
        </div>
      )}
    </div>
  );
}
