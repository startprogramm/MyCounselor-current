'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

interface ChildGoal {
  id: number;
  title: string;
  progress: number;
  deadline: string;
  priority: string;
  studentId: string;
}

interface ChildRequest {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  studentId: string;
}

interface ParentChildrenCachePayload {
  children: User[];
  goals: ChildGoal[];
  requests: ChildRequest[];
}

const PARENT_CHILDREN_CACHE_TTL_MS = 2 * 60 * 1000;

export default function ParentChildrenPage() {
  const { user, getSchoolStudents } = useAuth();
  const [children, setChildren] = useState<User[]>([]);
  const [goals, setGoals] = useState<ChildGoal[]>([]);
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('parent-children', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setChildren([]);
      setGoals([]);
      setRequests([]);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<ParentChildrenCachePayload>(cacheKey, PARENT_CHILDREN_CACHE_TTL_MS);
    if (cached.found && cached.data) {
      setChildren(cached.data.children || []);
      setGoals(cached.data.goals || []);
      setRequests(cached.data.requests || []);
      setHasWarmCache(true);
      setIsCacheHydrated(true);
      return;
    }

    setHasWarmCache(false);
    setIsCacheHydrated(true);
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey || !isCacheHydrated) return;
    if (!hasWarmCache && !hasLoadedFromServer) return;

    writeCachedData<ParentChildrenCachePayload>(cacheKey, { children, goals, requests });
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, children, goals, requests]);

  const loadData = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    const allStudents = getSchoolStudents(user.schoolId);
    const linked: User[] = [];

    if (user.childrenNames && user.childrenNames.length > 0) {
      for (const childName of user.childrenNames) {
        const match = allStudents.find(
          (s) => `${s.firstName} ${s.lastName}`.toLowerCase() === childName.toLowerCase().trim()
        );
        if (match) linked.push(match);
      }
    }

    setChildren(linked);

    if (linked.length === 0) {
      setGoals([]);
      setRequests([]);
      setHasLoadedFromServer(true);
      return;
    }

    const childIds = linked.map((c) => c.id);

    const [goalsResult, requestsResult] = await Promise.all([
      supabase.from('goals').select('*').in('student_id', childIds).order('created_at', { ascending: false }),
      supabase.from('requests').select('*').in('student_id', childIds).order('created_at', { ascending: false }),
    ]);

    if (!goalsResult.error && goalsResult.data) {
      setGoals(
        goalsResult.data.map((r) => ({
          id: r.id,
          title: r.title,
          progress: r.progress,
          deadline: r.deadline,
          priority: r.priority,
          studentId: r.student_id,
        }))
      );
    }

    if (!requestsResult.error && requestsResult.data) {
      setRequests(
        requestsResult.data.map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          createdAt: new Date(r.created_at).toLocaleDateString(),
          studentId: r.student_id,
        }))
      );
    }

    setHasLoadedFromServer(true);
  }, [user?.id, user?.schoolId, user?.childrenNames, getSchoolStudents]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadData();
  }, [isCacheHydrated, loadData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">My Children</h1>
        <p className="text-muted-foreground mt-1">View your children&apos;s profiles and progress</p>
      </div>

      {children.length === 0 ? (
        <Card className="p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-medium text-foreground">No children linked yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.childrenNames?.length
              ? `Waiting for ${user.childrenNames.join(', ')} to register at your school.`
              : 'Your children will appear here once they register.'}
          </p>
        </Card>
      ) : (
        children.map((child) => {
          const childGoals = goals.filter(g => g.studentId === child.id);
          const childRequests = requests.filter(r => r.studentId === child.id);

          return (
            <ContentCard
              key={child.id}
              title={`${child.firstName} ${child.lastName}`}
              description={`Grade ${child.gradeLevel || 'N/A'} • ${child.email}`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 rounded-full border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
                    {child.profileImage ? (
                      <img src={child.profileImage} alt={`${child.firstName}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-rose-500">{child.firstName[0]}{child.lastName[0]}</span>
                    )}
                  </div>
                  <Badge variant={child.approved ? 'success' : 'warning'}>
                    {child.approved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </div>

                {childGoals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Goals ({childGoals.length})</h4>
                    <div className="space-y-2">
                      {childGoals.map(goal => (
                        <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-foreground">{goal.title}</p>
                            <p className="text-xs text-muted-foreground">Due: {goal.deadline}</p>
                          </div>
                          <span className="text-sm font-semibold text-rose-500">{goal.progress}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {childRequests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Requests ({childRequests.length})</h4>
                    <div className="space-y-2">
                      {childRequests.slice(0, 5).map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-foreground">{req.title}</p>
                            <p className="text-xs text-muted-foreground">{req.createdAt}</p>
                          </div>
                          <Badge variant={req.status === 'pending' ? 'warning' : req.status === 'completed' ? 'success' : 'primary'} size="sm">
                            {req.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {childGoals.length === 0 && childRequests.length === 0 && (
                  <p className="text-sm text-muted-foreground">No goals or requests yet for this student.</p>
                )}
              </div>
            </ContentCard>
          );
        })
      )}
    </div>
  );
}
