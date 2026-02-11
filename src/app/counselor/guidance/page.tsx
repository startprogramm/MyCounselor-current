'use client';

import React, { useState, useEffect } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';

interface GuidanceResource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  content: string;
  status: 'published' | 'draft';
  createdAt: string;
}

const STORAGE_KEY = 'mycounselor_counselor_resources';

export default function CounselorGuidancePage() {
  const [resources, setResources] = useState<GuidanceResource[]>([]);
  const [showNewResource, setShowNewResource] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState('');
  const [newContent, setNewContent] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setResources(JSON.parse(stored));
      } catch {
        setResources([]);
      }
    }
  }, []);

  const saveResources = (updated: GuidanceResource[]) => {
    setResources(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (status: 'published' | 'draft') => {
    const errors: Record<string, string> = {};
    if (!newTitle.trim()) errors.title = 'Title is required';
    if (!newCategory) errors.category = 'Category is required';
    if (!newDescription.trim()) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newResource: GuidanceResource = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      type: newType || 'guide',
      content: newContent.trim(),
      status,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    saveResources([newResource, ...resources]);
    resetForm();
    setSuccessMessage(status === 'published' ? 'Resource published!' : 'Draft saved!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewCategory('');
    setNewType('');
    setNewContent('');
    setFormErrors({});
    setShowNewResource(false);
  };

  const handleDelete = (id: number) => {
    saveResources(resources.filter(r => r.id !== id));
  };

  const filteredResources = filter === 'all'
    ? resources
    : resources.filter(r => r.status === filter);

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

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
          <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success font-medium">{successMessage}</p>
        </div>
      )}

      {/* New Resource Form */}
      {showNewResource && (
        <ContentCard title="Create New Resource">
          <div className="space-y-4">
            <Input
              label="Resource Title"
              placeholder="Enter a descriptive title"
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); setFormErrors(prev => ({ ...prev, title: '' })); }}
              error={formErrors.title}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={newCategory}
                onChange={(e) => { setNewCategory(e.target.value); setFormErrors(prev => ({ ...prev, category: '' })); }}
                error={formErrors.category}
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
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
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
              value={newDescription}
              onChange={(e) => { setNewDescription(e.target.value); setFormErrors(prev => ({ ...prev, description: '' })); }}
              error={formErrors.description}
            />
            <Textarea
              label="Content"
              placeholder="Write your resource content here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="outline" type="button" onClick={() => handleSubmit('draft')}>
                Save as Draft
              </Button>
              <Button type="button" onClick={() => handleSubmit('published')}>
                Publish
              </Button>
            </div>
          </div>
        </ContentCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{resources.length}</p>
          <p className="text-sm text-muted-foreground">Total Resources</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{resources.filter(r => r.status === 'published').length}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning">{resources.filter(r => r.status === 'draft').length}</p>
          <p className="text-sm text-muted-foreground">Drafts</p>
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
      {filteredResources.length > 0 ? (
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
                    {resource.type && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {resource.type}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                  <div className="text-sm text-muted-foreground">
                    Created: {resource.createdAt}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-muted-foreground">No resources yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first guidance resource</p>
          <Button className="mt-4" onClick={() => setShowNewResource(true)}>
            Create Resource
          </Button>
        </div>
      )}
    </div>
  );
}
