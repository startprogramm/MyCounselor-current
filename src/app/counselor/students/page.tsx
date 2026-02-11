'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuth, User } from '@/context/AuthContext';

export default function CounselorStudentsPage() {
  const { user, getSchoolStudents } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');

  useEffect(() => {
    if (user?.schoolId) {
      setStudents(getSchoolStudents(user.schoolId));
    }
  }, [user?.schoolId, getSchoolStudents]);

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || student.gradeLevel === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const uniqueGrades = [...new Set(students.map(s => s.gradeLevel).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Students registered at your school
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{students.length}</p>
          <p className="text-sm text-muted-foreground">Total Students</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{uniqueGrades.length}</p>
          <p className="text-sm text-muted-foreground">Grade Levels</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{filteredStudents.length}</p>
          <p className="text-sm text-muted-foreground">Showing</p>
        </Card>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {student.firstName[0]}{student.lastName[0]}
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
          <p className="text-muted-foreground">No students registered at your school yet</p>
          <p className="text-sm text-muted-foreground mt-1">Students will appear here once they sign up with your school code</p>
        </div>
      )}
    </div>
  );
}
