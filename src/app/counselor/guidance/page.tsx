'use client';

import React, { useState } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';

const mockResources = [
  {
    id: 1,
    title: 'College Essay Writing Guide',
    description: 'Comprehensive guide to writing compelling personal statements.',
    category: 'college',
    status: 'published',
    views: 245,
    lastUpdated: 'Jan 20, 2026',
  },
  {
    id: 2,
    title: 'SAT Preparation Strategies',
    description: 'Study techniques and test-taking strategies for SAT success.',
    category: 'college',
    status: 'published',
    views: 189,
    lastUpdated: 'Jan 15, 2026',
  },
  {
    id: 3,
    title: 'Time Management Workshop',
    description: 'Interactive guide to balancing academics and extracurriculars.',
    category: 'academic',
    status: 'draft',
    views: 0,
    lastUpdated: 'Jan 22, 2026',
  },
  {
    id: 4,
    title: 'Career Exploration Assessment',
    description: 'Self-assessment tool to discover career interests and aptitudes.',
    category: 'career',
    status: 'published',
    views: 312,
    lastUpdated: 'Jan 10, 2026',
  },
];

export default function CounselorGuidancePage() {
  const [showNewResource, setShowNewResource] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredResources = filter === 'all'
    ? mockResources
    : mockResources.filter(r => r.status === filter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'college': return 'bg-primary/10 text-primary';
      case 'career': return 'bg-secondary/10 text-secondary';
      case 'academic': return 'bg-accent/10 text-accent';
      case 'wellness': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Guidance Content
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage resources for your students
          </p>
        </div>
        <Button onClick={() => setShowNewResource(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Resource
        </Button>
      </div>

      {/* New Resource Form */}
      {showNewResource && (
        <ContentCard title="Create New Resource">
          <form className="space-y-4">
            <Input
              label="Resource Title"
              placeholder="Enter a descriptive title"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                options={[
                  { value: '', label: 'Select category' },
                  { value: 'college', label: 'College Prep' },
                  { value: 'career', label: 'Career Planning' },
                  { value: 'academic', label: 'Academic Success' },
                  { value: 'wellness', label: 'Wellness' },
                ]}
              />
              <Select
                label="Resource Type"
                options={[
                  { value: '', label: 'Select type' },
                  { value: 'guide', label: 'Guide' },
                  { value: 'article', label: 'Article' },
                  { value: 'video', label: 'Video' },
                  { value: 'assessment', label: 'Assessment' },
                  { value: 'workshop', label: 'Workshop' },
                ]}
              />
            </div>
            <Textarea
              label="Description"
              placeholder="Brief description of the resource..."
            />
            <Textarea
              label="Content"
              placeholder="Write your resource content here..."
              className="min-h-[200px]"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewResource(false)}>
                Cancel
              </Button>
              <Button variant="outline">Save as Draft</Button>
              <Button type="submit">Publish</Button>
            </div>
          </form>
        </ContentCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{mockResources.length}</p>
          <p className="text-sm text-muted-foreground">Total Resources</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{mockResources.filter(r => r.status === 'published').length}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning">{mockResources.filter(r => r.status === 'draft').length}</p>
          <p className="text-sm text-muted-foreground">Drafts</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{mockResources.reduce((acc, r) => acc + r.views, 0)}</p>
          <p className="text-sm text-muted-foreground">Total Views</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'published', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                    {resource.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    resource.status === 'published'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {resource.status}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {resource.views} views
                  </span>
                  <span>Updated: {resource.lastUpdated}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
