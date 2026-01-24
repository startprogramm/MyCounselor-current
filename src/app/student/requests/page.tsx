'use client';

import React, { useState } from 'react';
import { ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';

const mockRequests = [
  {
    id: 1,
    title: 'College Essay Review',
    description: 'I need help reviewing my personal statement for UC applications.',
    status: 'pending',
    createdAt: 'Jan 22, 2026',
    counselor: 'Dr. Sarah Martinez',
    category: 'college',
  },
  {
    id: 2,
    title: 'SAT Prep Guidance',
    description: 'Looking for SAT preparation resources and study schedule advice.',
    status: 'in_progress',
    createdAt: 'Jan 20, 2026',
    counselor: 'Dr. Sarah Martinez',
    category: 'academic',
  },
  {
    id: 3,
    title: 'Schedule Change Request',
    description: 'I would like to switch from AP Physics to AP Chemistry.',
    status: 'completed',
    createdAt: 'Jan 18, 2026',
    counselor: 'Mr. James Chen',
    category: 'academic',
  },
  {
    id: 4,
    title: 'Letter of Recommendation',
    description: 'Requesting a letter of recommendation for Stanford application.',
    status: 'approved',
    createdAt: 'Jan 15, 2026',
    counselor: 'Dr. Sarah Martinez',
    category: 'college',
  },
];

export default function StudentRequestsPage() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filter, setFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'completed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'college':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'academic':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const filteredRequests = filter === 'all'
    ? mockRequests
    : mockRequests.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            My Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and track your counseling requests
          </p>
        </div>
        <Button onClick={() => setShowNewRequest(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Button>
      </div>

      {/* New Request Form */}
      {showNewRequest && (
        <ContentCard title="Create New Request">
          <form className="space-y-4">
            <Input
              label="Request Title"
              placeholder="Brief description of your request"
            />
            <Select
              label="Category"
              options={[
                { value: '', label: 'Select a category' },
                { value: 'academic', label: 'Academic Support' },
                { value: 'college', label: 'College Planning' },
                { value: 'career', label: 'Career Guidance' },
                { value: 'personal', label: 'Personal Support' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Textarea
              label="Description"
              placeholder="Provide details about your request..."
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </ContentCard>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'in_progress', 'approved', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                {getCategoryIcon(request.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{request.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {request.counselor}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {request.createdAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
