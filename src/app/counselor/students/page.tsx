'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth, User } from '@/context/AuthContext';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

interface CounselorStudentsCachePayload {
  students: User[];
}

const COUNSELOR_STUDENTS_CACHE_TTL_MS = 2 * 60 * 1000;

export default function CounselorStudentsPage() {
  const { user, getSchoolStudents, updateRegisteredUser, removeRegisteredUser, refreshSchoolUsers } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('counselor-students', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setStudents([]);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<CounselorStudentsCachePayload>(
      cacheKey,
      COUNSELOR_STUDENTS_CACHE_TTL_MS
    );
    if (cached.found && cached.data) {
      setStudents(cached.data.students || []);
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

    writeCachedData<CounselorStudentsCachePayload>(cacheKey, { students });
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, students]);

  const loadStudents = useCallback(() => {
    if (user?.schoolId) {
      setStudents(getSchoolStudents(user.schoolId));
      setHasLoadedFromServer(true);
    }
  }, [user?.schoolId, getSchoolStudents]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    loadStudents();
  }, [isCacheHydrated, loadStudents]);

  const pendingCount = students.filter(s => s.approved !== true).length;
  const approvedCount = students.filter(s => s.approved === true).length;

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || student.gradeLevel === filterGrade;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'pending' && student.approved !== true) ||
      (filterStatus === 'approved' && student.approved === true);
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const uniqueGrades = [...new Set(students.map(s => s.gradeLevel).filter(Boolean))].sort();

  const handleApprove = async (studentId: string) => {
    await updateRegisteredUser(studentId, { approved: true });
    await refreshSchoolUsers();
    loadStudents();
  };

  const handleReject = async (studentId: string) => {
    await removeRegisteredUser(studentId);
    await refreshSchoolUsers();
    loadStudents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage students registered at your school
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{students.length}</p>
          <p className="text-sm text-muted-foreground">Total Students</p>
        </Card>
        <Card className="p-4 text-center border-warning/30">
          <p className="text-3xl font-bold text-warning">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending Approval</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{approvedCount}</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{uniqueGrades.length}</p>
          <p className="text-sm text-muted-foreground">Grade Levels</p>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? status === 'pending'
                  ? 'bg-warning/10 text-warning border border-warning/20'
                  : status === 'approved'
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
            }`}
          >
            {status === 'all' ? `All (${students.length})` : status === 'pending' ? `Pending (${pendingCount})` : `Approved (${approvedCount})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-input bg-card text-foreground"
        >
          <option value="all">All Grades</option>
          {uniqueGrades.map(grade => (
            <option key={grade} value={grade}>Grade {grade}</option>
          ))}
        </select>
      </div>

      {/* Students List */}
      {filteredStudents.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Grade</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {student.profileImage ? (
                            <img
                              src={student.profileImage}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-semibold">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-foreground">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Grade {student.gradeLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={student.approved === true ? 'success' : 'warning'}>
                        {student.approved === true ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {student.approved !== true ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(student.id)}
                            className="bg-success hover:bg-success/90 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(student.id)}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">--</span>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-muted-foreground">
            {filterStatus !== 'all' ? `No ${filterStatus} students found` : 'No students registered at your school yet'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Students will appear here once they sign up with your school code</p>
        </div>
      )}
    </div>
  );
}
