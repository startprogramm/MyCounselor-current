'use client';

import React, { useState, useEffect } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Referral {
  id: number;
  title: string;
  description: string;
  studentName: string;
  counselorName: string;
  status: string;
  category: string;
  response: string | null;
  createdAt: string;
}

export default function TeacherReferralsPage() {
  const { user, getSchoolStudents, getSchoolCounselors } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    category: 'academic',
    title: '',
    description: '',
    counselorId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const students = user?.schoolId ? getSchoolStudents(user.schoolId).filter(s => s.approved) : [];
  const counselors = user?.schoolId ? getSchoolCounselors(user.schoolId) : [];

  useEffect(() => {
    if (!user?.id || !user?.schoolId) return;

    const loadReferrals = async () => {
      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('school_id', user.schoolId)
        .eq('counselor_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals(
        (data || []).map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          studentName: r.student_name || 'Unknown',
          counselorName: r.counselor_name || '',
          status: r.status,
          category: r.category,
          response: r.response,
          createdAt: new Date(r.created_at).toLocaleDateString(),
        }))
      );
    };

    loadReferrals();
  }, [user?.id, user?.schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.title || !formData.studentName) return;

    setIsSubmitting(true);

    const selectedCounselor = counselors.find(c => c.id === formData.counselorId);
    const selectedStudent = students.find(s => `${s.firstName} ${s.lastName}` === formData.studentName);

    await supabase.from('requests').insert({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: 'pending',
      student_name: formData.studentName,
      student_id: selectedStudent?.id || user.id,
      counselor_name: selectedCounselor ? `${selectedCounselor.firstName} ${selectedCounselor.lastName}` : 'Unassigned',
      counselor_id: formData.counselorId || user.id,
      school_id: user.schoolId,
    });

    // Reload
    const { data } = await supabase
      .from('requests')
      .select('*')
      .eq('school_id', user.schoolId)
      .eq('counselor_id', user.id)
      .order('created_at', { ascending: false });

    setReferrals(
      (data || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        studentName: r.student_name || 'Unknown',
        counselorName: r.counselor_name || '',
        status: r.status,
        category: r.category,
        response: r.response,
        createdAt: new Date(r.created_at).toLocaleDateString(),
      }))
    );

    setFormData({ studentName: '', category: 'academic', title: '', description: '', counselorId: '' });
    setShowForm(false);
    setIsSubmitting(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning' as const;
      case 'in_progress': return 'primary' as const;
      case 'completed': return 'success' as const;
      case 'approved': return 'success' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Referrals</h1>
          <p className="text-muted-foreground mt-1">Submit and track student referrals to counselors</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-white hover:bg-amber-600"
        >
          {showForm ? 'Cancel' : '+ New Referral'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">New Referral</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Student</label>
                <select
                  value={formData.studentName}
                  onChange={e => setFormData(p => ({ ...p, studentName: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  required
                >
                  <option value="">Select student</option>
                  {students.map(s => (
                    <option key={s.id} value={`${s.firstName} ${s.lastName}`}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="academic">Academic</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="emotional">Emotional</option>
                  <option value="social">Social</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Concern Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Brief description of concern"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Details</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Provide additional details about the concern..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
              />
            </div>
            {counselors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Assign to Counselor</label>
                <select
                  value={formData.counselorId}
                  onChange={e => setFormData(p => ({ ...p, counselorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Auto-assign</option>
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
            )}
            <Button type="submit" isLoading={isSubmitting} className="bg-amber-500 text-white hover:bg-amber-600">
              Submit Referral
            </Button>
          </form>
        </Card>
      )}

      {referrals.length === 0 ? (
        <Card className="p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <p className="font-medium text-foreground">No referrals yet</p>
          <p className="text-sm text-muted-foreground mt-1">Submit a referral when you have a concern about a student.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {referrals.map(ref => (
            <Card key={ref.id} className="p-4" hover>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{ref.title}</p>
                    <Badge variant={getStatusVariant(ref.status)} size="sm">{ref.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Student: {ref.studentName}</p>
                  {ref.description && <p className="text-sm text-muted-foreground mt-1">{ref.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="accent" size="sm">{ref.category}</Badge>
                    <span className="text-xs text-muted-foreground">{ref.createdAt}</span>
                  </div>
                  {ref.response && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Counselor Response:</p>
                      <p className="text-sm text-foreground">{ref.response}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
