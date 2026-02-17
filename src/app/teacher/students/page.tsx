'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth, User } from '@/context/AuthContext';

export default function TeacherStudentsPage() {
  const { user, getSchoolStudents } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.schoolId) return;
    const all = getSchoolStudents(user.schoolId);
    setStudents(all.filter(s => s.approved));
  }, [user?.schoolId, getSchoolStudents]);

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">My Students</h1>
        <p className="text-muted-foreground mt-1">Students registered at your school</p>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="font-medium text-foreground">{search ? 'No students match your search' : 'No students registered yet'}</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(student => (
            <Card key={student.id} className="p-4" hover>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                  {student.profileImage ? (
                    <img src={student.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    `${student.firstName[0]}${student.lastName[0]}`
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{student.firstName} {student.lastName}</p>
                  <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                  {student.gradeLevel && (
                    <Badge variant="secondary" size="sm" className="mt-1">Grade {student.gradeLevel}</Badge>
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
