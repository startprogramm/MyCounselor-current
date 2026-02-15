'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';

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

function formatDate(value: string) {
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
    createdAt: formatDate(row.created_at),
    counselor: row.counselor_name,
    category: row.category,
    studentName: row.student_name,
    studentId: row.student_id,
    response: row.response || undefined,
    documents: Array.isArray(row.documents) ? (row.documents as AttachedDocument[]) : undefined,
  };
}

export default function CounselorTasksPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [pendingDocs, setPendingDocs] = useState<AttachedDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadRequests = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('counselor_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setRequests([]);
        return;
      }

      setRequests(data.map(mapRequest));
    };

    loadRequests();
  }, [user?.id]);

  const updateRequest = async (id: number, updates: Partial<CounselingRequest>) => {
    const payload: { status?: string; response?: string | null; documents?: Json | null } = {};

    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.response !== undefined) payload.response = updates.response || null;
    if (updates.documents !== undefined) payload.documents = updates.documents as unknown as Json;

    const { error } = await supabase.from('requests').update(payload).eq('id', id);
    if (error) return;

    setRequests((prev) => prev.map((request) => (request.id === id ? { ...request, ...updates } : request)));
  };

  const handleExpand = (request: CounselingRequest) => {
    if (expandedId === request.id) {
      setExpandedId(null);
      setResponseText('');
      setPendingDocs([]);
    } else {
      setExpandedId(request.id);
      setResponseText(request.response || '');
      setPendingDocs(request.documents || []);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const doc: AttachedDocument = {
          name: file.name,
          data: reader.result as string,
          type: file.type,
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
        setPendingDocs(prev => [...prev, doc]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingDoc = (index: number) => {
    setPendingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveResponse = async (id: number) => {
    await updateRequest(id, {
      response: responseText.trim(),
      documents: pendingDocs,
    });
    setExpandedId(null);
    setResponseText('');
    setPendingDocs([]);
  };

  const handleStatusChange = async (id: number, newStatus: CounselingRequest['status']) => {
    await updateRequest(id, { status: newStatus });
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    return '📎';
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const taskCounts = {
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
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student requests and tasks
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'in_progress', 'approved', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All Tasks' : getStatusLabel(status)}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === status ? 'bg-primary-foreground/20' : 'bg-background'
            }`}>
              {taskCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className={`bg-card rounded-xl border p-5 transition-all ${
              request.status === 'completed' ? 'border-border opacity-60' : 'border-border hover:border-primary/20 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                request.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
              }`}>
                {request.status === 'completed' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  getCategoryIcon(request.category)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`font-semibold ${request.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {request.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {request.studentName || 'Unknown Student'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                {/* Saved response preview (when not expanded) */}
                {request.response && expandedId !== request.id && (
                  <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                    <p className="text-xs font-medium text-primary mb-1">Your Response:</p>
                    <p className="text-sm text-foreground line-clamp-2">{request.response}</p>
                    {request.documents && request.documents.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {request.documents.length} document{request.documents.length > 1 ? 's' : ''} attached
                      </p>
                    )}
                  </div>
                )}

                {/* Expanded response area */}
                {expandedId === request.id && (
                  <div className="mt-4 space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="block text-sm font-medium text-foreground">
                      Write your response
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response to this request..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y text-sm"
                    />

                    {/* Attached documents */}
                    {pendingDocs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Attached Documents</p>
                        {pendingDocs.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2.5 bg-card rounded-lg border border-border"
                          >
                            <span className="text-lg">{getFileIcon(doc.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
                            </div>
                            <button
                              onClick={() => removePendingDoc(index)}
                              className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          Attach File
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => { setExpandedId(null); setResponseText(''); setPendingDocs([]); }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSaveResponse(request.id)}
                          disabled={!responseText.trim() && pendingDocs.length === 0}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Save Response
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {request.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {request.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status !== 'completed' && expandedId !== request.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExpand(request)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {request.response ? 'Edit Response' : 'Respond'}
                      </Button>
                    )}
                    {request.status === 'pending' && (
                      <Button size="sm" onClick={() => handleStatusChange(request.id, 'in_progress')}>
                        Start
                      </Button>
                    )}
                    {request.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleStatusChange(request.id, 'approved')}>
                        Approve
                      </Button>
                    )}
                    {request.status === 'approved' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(request.id, 'completed')}>
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <svg
            className="w-12 h-12 mx-auto text-muted-foreground mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-muted-foreground">No student requests yet</p>
          <p className="text-sm text-muted-foreground mt-1">Student requests assigned to you will appear here</p>
        </div>
      )}
    </div>
  );
}
