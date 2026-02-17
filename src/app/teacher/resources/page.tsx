'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  content: string;
}

export default function TeacherResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.schoolId) return;

    const loadResources = async () => {
      const { data } = await supabase
        .from('resources')
        .select('*')
        .eq('school_id', user.schoolId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      setResources(
        (data || []).map(row => ({
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category,
          type: row.type,
          content: row.content,
        }))
      );
    };

    loadResources();
  }, [user?.schoolId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Resources</h1>
        <p className="text-muted-foreground mt-1">Guidance resources shared by your school&apos;s counselors</p>
      </div>

      {resources.length === 0 ? (
        <Card className="p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="font-medium text-foreground">No resources available yet</p>
          <p className="text-sm text-muted-foreground mt-1">Resources published by counselors will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="p-0 overflow-hidden" hover>
              <button
                onClick={() => setExpandedId(expandedId === resource.id ? null : resource.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{resource.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="primary" size="sm">{resource.category}</Badge>
                    <Badge variant="accent" size="sm">{resource.type}</Badge>
                  </div>
                </div>
              </button>
              {expandedId === resource.id && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <div className="prose prose-sm text-foreground max-w-none whitespace-pre-wrap">
                    {resource.content}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
