'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth, User } from '@/context/AuthContext';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

interface CounselorParentsCachePayload {
  parents: User[];
}

const COUNSELOR_PARENTS_CACHE_TTL_MS = 2 * 60 * 1000;

export default function CounselorParentsPage() {
  const { user, getSchoolParents, updateRegisteredUser, removeRegisteredUser, refreshSchoolUsers } = useAuth();
  const [parents, setParents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'awaiting_student' | 'pending' | 'approved'>('all');
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('counselor-parents', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setParents([]);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<CounselorParentsCachePayload>(cacheKey, COUNSELOR_PARENTS_CACHE_TTL_MS);
    if (cached.found && cached.data) {
      setParents(cached.data.parents || []);
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

    writeCachedData<CounselorParentsCachePayload>(cacheKey, { parents });
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, parents]);

  const loadParents = useCallback(() => {
    if (user?.schoolId) {
      setParents(getSchoolParents(user.schoolId));
      setHasLoadedFromServer(true);
    }
  }, [user?.schoolId, getSchoolParents]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    loadParents();
  }, [isCacheHydrated, loadParents]);

  const awaitingStudentCount = parents.filter(p => p.studentConfirmed !== true).length;
  const pendingCount = parents.filter(p => p.studentConfirmed === true && p.approved !== true).length;
  const approvedCount = parents.filter(p => p.approved === true).length;

  const filteredParents = parents.filter((parent) => {
    const fullName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         parent.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'awaiting_student' && parent.studentConfirmed !== true) ||
      (filterStatus === 'pending' && parent.studentConfirmed === true && parent.approved !== true) ||
      (filterStatus === 'approved' && parent.approved === true);
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (parentId: string) => {
    await updateRegisteredUser(parentId, { approved: true });
    await refreshSchoolUsers();
    loadParents();
  };

  const handleReject = async (parentId: string) => {
    await removeRegisteredUser(parentId);
    await refreshSchoolUsers();
    loadParents();
  };

  const getStatusBadge = (parent: User) => {
    if (parent.approved === true) {
      return <Badge variant="success">Approved</Badge>;
    }
    if (parent.studentConfirmed === true) {
      return <Badge variant="warning">Pending Approval</Badge>;
    }
    return <Badge variant="secondary">Awaiting Student</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Parents
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage parent accounts linked to your school&apos;s students
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{parents.length}</p>
          <p className="text-sm text-muted-foreground">Total Parents</p>
        </Card>
        <Card className="p-4 text-center border-muted-foreground/20">
          <p className="text-3xl font-bold text-muted-foreground">{awaitingStudentCount}</p>
          <p className="text-sm text-muted-foreground">Awaiting Student</p>
        </Card>
        <Card className="p-4 text-center border-warning/30">
          <p className="text-3xl font-bold text-warning">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending Approval</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{approvedCount}</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all' as const, label: `All (${parents.length})`, activeClass: 'bg-primary/10 text-primary border-primary/20' },
          { key: 'awaiting_student' as const, label: `Awaiting Student (${awaitingStudentCount})`, activeClass: 'bg-muted text-muted-foreground border-border' },
          { key: 'pending' as const, label: `Pending (${pendingCount})`, activeClass: 'bg-warning/10 text-warning border-warning/20' },
          { key: 'approved' as const, label: `Approved (${approvedCount})`, activeClass: 'bg-success/10 text-success border-success/20' },
        ]).map((status) => (
          <button
            key={status.key}
            onClick={() => setFilterStatus(status.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status.key
                ? `${status.activeClass} border`
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1">
        <Input
          placeholder="Search parents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Parents List */}
      {filteredParents.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Parent</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Children</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Relationship</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {parent.profileImage ? (
                            <img
                              src={parent.profileImage}
                              alt={`${parent.firstName} ${parent.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-rose-500 font-semibold">
                              {parent.firstName[0]}{parent.lastName[0]}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-foreground">
                          {parent.firstName} {parent.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{parent.email}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {parent.childrenNames?.join(', ') || 'None specified'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground capitalize">
                      {parent.relationship || 'Parent'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(parent)}
                    </td>
                    <td className="px-6 py-4">
                      {parent.approved === true ? (
                        <span className="text-sm text-muted-foreground">--</span>
                      ) : parent.studentConfirmed === true ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(parent.id)}
                            className="bg-success hover:bg-success/90 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(parent.id)}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Needs student confirmation first
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-muted-foreground">
            {filterStatus !== 'all' ? `No ${filterStatus === 'awaiting_student' ? 'parents awaiting student confirmation' : filterStatus} parents found` : 'No parents registered at your school yet'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Parents will appear here once they sign up and link to students</p>
        </div>
      )}
    </div>
  );
}
