'use client';

import React, { useState, useEffect } from 'react';
import { ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface AttachedDocument {
  name: string;
  data: string;
  type: string;
  uploadedAt: string;
}

interface CounselingRequest {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'approved' | 'completed';
  createdAt: string;
  counselor: string;
  category: string;
  studentName?: string;
  studentId?: string;
  response?: string;
  documents?: AttachedDocument[];
}

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapRequest(row: {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  counselor_name: string;
  category: string;
  student_name: string;
  student_id: string;
  response: string | null;
  documents: unknown;
}): CounselingRequest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as CounselingRequest['status'],
    createdAt: formatCreatedAt(row.created_at),
    counselor: row.counselor_name,
    category: row.category,
    studentName: row.student_name,
    studentId: row.student_id,
    response: row.response || undefined,
    documents: Array.isArray(row.documents) ? (row.documents as AttachedDocument[]) : undefined,
  };
}

export default function StudentRequestsPage() {
  const { user, getSchoolCounselors } = useAuth();
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [schoolCounselors, setSchoolCounselors] = useState<User[]>([]);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    const loadRequests = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setRequests([]);
        return;
      }

      setRequests(data.map(mapRequest));
    };

    loadRequests();
  }, [user?.id]);

  // Load school counselors
  useEffect(() => {
    if (user?.schoolId) {
      setSchoolCounselors(getSchoolCounselors(user.schoolId));
    }
  }, [user?.schoolId, getSchoolCounselors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!newTitle.trim()) errors.title = 'Title is required';
    if (!newCategory) errors.category = 'Category is required';
    if (!newDescription.trim()) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!user) return;

    const availableCounselors = schoolCounselors.filter((c) => c.approved === true);
    const assignedCounselor =
      availableCounselors.length > 0
        ? availableCounselors[Math.floor(Math.random() * availableCounselors.length)]
        : null;

    const { data, error } = await supabase
      .from('requests')
      .insert({
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: 'pending',
        category: newCategory,
        counselor_name: assignedCounselor
          ? `${assignedCounselor.firstName} ${assignedCounselor.lastName}`
          : 'Unassigned',
        counselor_id: assignedCounselor?.id || null,
        student_name: `${user.firstName} ${user.lastName}`,
        student_id: user.id,
        school_id: user.schoolId,
      })
      .select('*')
      .single();

    if (error || !data) return;

    setRequests((prev) => [mapRequest(data), ...prev]);

    // Reset form
    setNewTitle('');
    setNewCategory('');
    setNewDescription('');
    setFormErrors({});
    setShowNewRequest(false);
    setSuccessMessage('Request submitted successfully! Your counselor will review it shortly.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleDelete = async (id: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id)
      .eq('student_id', user.id);

    if (error) return;
    setRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'completed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'approved': return 'Approved';
      case 'completed': return 'Completed';
      default: return status;
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
      case 'career':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'personal':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
    ? requests
    : requests.filter(r => r.status === filter);

  const filterCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

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
        <Button onClick={() => { setShowNewRequest(true); setSuccessMessage(''); }}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
          <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success font-medium">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-success hover:text-success/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* New Request Form */}
      {showNewRequest && (
        <ContentCard title="Create New Request">
          {schoolCounselors.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="font-medium text-foreground">No counselors available</p>
              <p className="text-sm text-muted-foreground mt-1">
                No counselors have registered at your school yet. Please check back later.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setShowNewRequest(false)}>
                Close
              </Button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Request Title"
              placeholder="Brief description of your request"
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); setFormErrors(prev => ({ ...prev, title: '' })); }}
              error={formErrors.title}
            />
            <Select
              label="Category"
              value={newCategory}
              onChange={(e) => { setNewCategory(e.target.value); setFormErrors(prev => ({ ...prev, category: '' })); }}
              error={formErrors.category}
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
              value={newDescription}
              onChange={(e) => { setNewDescription(e.target.value); setFormErrors(prev => ({ ...prev, description: '' })); }}
              error={formErrors.description}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => {
                setShowNewRequest(false);
                setNewTitle('');
                setNewCategory('');
                setNewDescription('');
                setFormErrors({});
              }}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
          )}
        </ContentCard>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'in_progress', 'approved', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {getStatusLabel(status === 'all' ? 'all' : status).replace('all', 'All')}
            {status === 'all' ? ' All' : ''}
            <span className="ml-1.5 opacity-70">({filterCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-muted-foreground">No requests found</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowNewRequest(true)}>
              Create your first request
            </Button>
          </div>
        ) : (
          filteredRequests.map((request) => (
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
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  {/* Counselor Response */}
                  {request.response && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                      <p className="text-xs font-medium text-primary mb-1">Counselor Response:</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{request.response}</p>
                    </div>
                  )}

                  {/* Attached Documents */}
                  {request.documents && request.documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Attached Documents:</p>
                      {request.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.data}
                          download={doc.name}
                          className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
                          </div>
                          <span className="text-xs text-primary font-medium">Download</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-xs text-destructive hover:text-destructive/80 font-medium"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
