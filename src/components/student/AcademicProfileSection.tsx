'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { searchALevelSubjects, type ALevelSubjectOption } from '@/data/aLevelSubjects';

/* ─── Types ────────────────────────────────────────────────────── */
interface Extracurricular {
  name: string;
  role: string;
  leadershipPosition: string;
  years: string;
  hoursPerWeek: string;
  weeksPerYear: string;
  gradeLevels: string[];
  description: string;
}

interface HonorAward {
  title: string;
  year: string;
  level: 'School' | 'Regional' | 'State' | 'National' | 'International';
}

interface CourseGrade {
  subjectCode: string;
  subjectName: string;
  grade: string;
  status: 'predicted' | 'final';
}

interface CollegeApplication {
  name: string;
  applicationType: string;
}

export interface AcademicProfile {
  // Academics
  gpa_weighted: string;
  gpa_unweighted: string;
  class_rank: string;
  class_size: string;
  igcse_subjects: CourseGrade[];
  as_level_subjects: CourseGrade[];
  a_level_courses: CourseGrade[];
  ap_courses_taken: string[];
  // Tests
  sat_total: string;
  sat_math: string;
  sat_ebrw: string;
  act_composite: string;
  english_test_type: string;
  english_test_score: string;
  english_test_date: string;
  // Direction
  intended_major: string;
  career_interests: string[];
  preferred_college_type: string;
  // Activities & Awards
  extracurriculars: Extracurricular[];
  honors_awards: HonorAward[];
  // Colleges
  target_countries: string[];
  college_list: CollegeApplication[];
  personal_statement: string;
  // Background
  first_generation: string; // '' | 'yes' | 'no'
  financial_aid_need: string; // '' | 'yes' | 'no' | 'not_sure'
  additional_context: string;
  // Meta
  completion_pct: number;
}

const EMPTY_PROFILE: AcademicProfile = {
  gpa_weighted: '',
  gpa_unweighted: '',
  class_rank: '',
  class_size: '',
  igcse_subjects: [],
  as_level_subjects: [],
  a_level_courses: [],
  ap_courses_taken: [],
  sat_total: '',
  sat_math: '',
  sat_ebrw: '',
  act_composite: '',
  english_test_type: '',
  english_test_score: '',
  english_test_date: '',
  intended_major: '',
  career_interests: [],
  preferred_college_type: '',
  extracurriculars: [],
  honors_awards: [],
  target_countries: [],
  college_list: [],
  personal_statement: '',
  first_generation: '',
  financial_aid_need: '',
  additional_context: '',
  completion_pct: 0,
};

const CAREER_INTERESTS_OPTIONS = [
  'Medicine', 'Engineering', 'Law', 'Business', 'Education',
  'Arts & Design', 'Computer Science', 'Research', 'Social Work',
  'Psychology', 'Journalism', 'Architecture', 'Finance', 'Nursing',
  'Environmental Science', 'Political Science', 'Film & Media',
];

const COLLEGE_TYPE_OPTIONS = [
  { value: 'large_research', label: 'Large Research University' },
  { value: 'liberal_arts', label: 'Liberal Arts College' },
  { value: 'technical', label: 'Technical / STEM Focused' },
  { value: 'community', label: 'Community College' },
  { value: 'hbcu', label: 'HBCU' },
  { value: 'online', label: 'Online University' },
  { value: 'no_preference', label: 'No Preference' },
];

const TARGET_COUNTRY_OPTIONS = [
  'United States', 'United Kingdom', 'Canada', 'Uzbekistan', 'Turkey',
  'Germany', 'Netherlands', 'South Korea', 'UAE', 'Other',
];

const APPLICATION_TYPE_OPTIONS = [
  'Early Decision', 'Early Action', 'Regular Decision', 'Rolling', 'Not sure yet',
];

const ENGLISH_TEST_OPTIONS = [
  { value: '', label: 'Not taken yet' },
  { value: 'IELTS', label: 'IELTS' },
  { value: 'TOEFL', label: 'TOEFL iBT' },
  { value: 'PTE', label: 'PTE Academic' },
  { value: 'Duolingo', label: 'Duolingo English Test' },
];

const GRADE_SCALES = {
  igcse: ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
  as: ['a', 'b', 'c', 'd', 'e'],
  a: ['A*', 'A', 'B', 'C', 'D', 'E'],
} as const;

type StageKey = keyof typeof GRADE_SCALES;

const TABS = [
  { id: 'academics', label: 'Academics' },
  { id: 'tests', label: 'Test Scores' },
  { id: 'direction', label: 'Direction' },
  { id: 'activities', label: 'Activities' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'colleges', label: 'Colleges' },
  { id: 'background', label: 'Background' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Helpers ───────────────────────────────────────────────────── */
function isTabFilled(tab: TabId, p: AcademicProfile): boolean {
  switch (tab) {
    case 'academics':
      return (
        !!(p.gpa_unweighted || p.gpa_weighted) &&
        (p.igcse_subjects.length > 0 || p.as_level_subjects.length > 0 || p.a_level_courses.length > 0)
      );
    case 'tests':
      return !!(p.sat_total || p.act_composite || p.english_test_type);
    case 'direction':
      return !!(p.intended_major || p.career_interests.length > 0);
    case 'activities':
      return p.extracurriculars.length > 0;
    case 'achievements':
      return p.honors_awards.length > 0;
    case 'colleges':
      return p.college_list.length > 0 || p.target_countries.length > 0 || !!p.personal_statement;
    case 'background':
      return !!(p.first_generation || p.financial_aid_need || p.additional_context);
    default:
      return false;
  }
}

// Backfills fields added after some students already had extracurriculars
// saved, so older records never crash the renderer that expects them.
function normalizeExtracurriculars(value: unknown): Extracurricular[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const e = (entry ?? {}) as Partial<Extracurricular>;
    return {
      name: e.name ?? '',
      role: e.role ?? '',
      leadershipPosition: e.leadershipPosition ?? '',
      years: e.years ?? '',
      hoursPerWeek: e.hoursPerWeek ?? '',
      weeksPerYear: e.weeksPerYear ?? '',
      gradeLevels: e.gradeLevels ?? [],
      description: e.description ?? '',
    };
  });
}

function profileToApiPayload(p: AcademicProfile, studentId: string, schoolId: string) {
  return {
    studentId,
    schoolId,
    gpa_weighted: p.gpa_weighted ? parseFloat(p.gpa_weighted) : null,
    gpa_unweighted: p.gpa_unweighted ? parseFloat(p.gpa_unweighted) : null,
    class_rank: p.class_rank ? parseInt(p.class_rank) : null,
    class_size: p.class_size ? parseInt(p.class_size) : null,
    igcse_subjects: p.igcse_subjects,
    as_level_subjects: p.as_level_subjects,
    a_level_courses: p.a_level_courses,
    ap_courses_taken: p.ap_courses_taken,
    sat_total: p.sat_total ? parseInt(p.sat_total) : null,
    sat_math: p.sat_math ? parseInt(p.sat_math) : null,
    sat_ebrw: p.sat_ebrw ? parseInt(p.sat_ebrw) : null,
    act_composite: p.act_composite ? parseInt(p.act_composite) : null,
    english_test_type: p.english_test_type || null,
    english_test_score: p.english_test_score || null,
    english_test_date: p.english_test_date || null,
    intended_major: p.intended_major || null,
    career_interests: p.career_interests,
    preferred_college_type: p.preferred_college_type || null,
    extracurriculars: p.extracurriculars,
    honors_awards: p.honors_awards,
    target_countries: p.target_countries,
    college_list: p.college_list,
    personal_statement: p.personal_statement || null,
    first_generation: p.first_generation === '' ? null : p.first_generation === 'yes',
    financial_aid_need: p.financial_aid_need || null,
    additional_context: p.additional_context || null,
  };
}

/* ─── Subcomponents ─────────────────────────────────────────────── */
function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
      {children}
      {optional && <span className="ml-1 normal-case font-normal">(optional)</span>}
    </label>
  );
}

function TextInput({
  value, onChange, onBlur, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; onBlur?: () => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
        placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40
        focus:border-primary transition-colors"
    />
  );
}

function NumericInput({
  value, onChange, onBlur, placeholder, min, max, step,
}: {
  value: string; onChange: (v: string) => void; onBlur?: () => void;
  placeholder?: string; min?: number; max?: number; step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
        placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40
        focus:border-primary transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

/* ─── Qualification (IGCSE / AS Level / A Level) section ─────────── */
function QualificationSection({
  title,
  gradeHint,
  scaleKey,
  courses,
  onAdd,
  onUpdate,
  onRemove,
  defaultOpen,
}: {
  title: string;
  gradeHint: string;
  scaleKey: StageKey;
  courses: CourseGrade[];
  onAdd: (course: CourseGrade) => void;
  onUpdate: (index: number, updates: Partial<CourseGrade>) => void;
  onRemove: (index: number) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<ALevelSubjectOption | null>(null);
  const [showResults, setShowResults] = useState(false);
  const grades = GRADE_SCALES[scaleKey];

  const results = searchALevelSubjects(query).slice(0, 8);

  const handleAdd = () => {
    if (!selectedSubject) return;
    if (courses.some((c) => c.subjectCode === selectedSubject.code)) return;
    onAdd({ subjectCode: selectedSubject.code, subjectName: selectedSubject.name, grade: '', status: 'predicted' });
    setSelectedSubject(null);
    setQuery('');
  };

  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors ${open ? 'rounded-t-xl' : 'rounded-xl'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground truncate">
            {courses.length > 0 ? `${courses.length} subject${courses.length === 1 ? '' : 's'} added` : 'Not started yet'}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="p-4 space-y-3 border-t border-border">
          {courses.map((course, i) => (
            <div
              key={`${course.subjectCode}-${i}`}
              className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border"
            >
              <span className="flex-1 min-w-[110px] text-sm font-medium text-foreground">{course.subjectName}</span>
              <select
                value={course.grade}
                onChange={(e) => onUpdate(i, { grade: e.target.value })}
                className="px-2 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Grade</option>
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select
                value={course.status}
                onChange={(e) => onUpdate(i, { status: e.target.value as CourseGrade['status'] })}
                className="px-2 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="predicted">Predicted</option>
                <option value="final">Final</option>
              </select>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                aria-label={`Remove ${course.subjectName}`}
              >
                ✕
              </button>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={selectedSubject ? selectedSubject.name : query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedSubject(null);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                placeholder="Search subject name or code"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
                  placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40
                  focus:border-primary transition-colors"
              />
              {showResults && (
                <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-border bg-card shadow-lg [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent]">
                  {results.length > 0 ? (
                    results.map((subject) => (
                      <button
                        key={subject.code}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedSubject(subject);
                          setQuery(subject.name);
                          setShowResults(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                      >
                        <span className="text-foreground">{subject.name}</span>
                        <span className="text-xs text-muted-foreground">{subject.code}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No matching subject.</p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedSubject}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">Grade scale: {gradeHint}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Tab Content Components ────────────────────────────────────── */
function AcademicsTab({
  profile, setProfile, save, gradeLevel,
}: {
  profile: AcademicProfile;
  setProfile: React.Dispatch<React.SetStateAction<AcademicProfile>>;
  save: () => void;
  gradeLevel?: string;
}) {
  const apInput = useRef('');
  const activeStage: StageKey | null = gradeLevel === '9' ? 'igcse' : gradeLevel === '10' ? 'as' : gradeLevel === '11' ? 'a' : null;

  const makeSectionHandlers = (key: 'igcse_subjects' | 'as_level_subjects' | 'a_level_courses') => ({
    onAdd: (course: CourseGrade) => {
      setProfile((p) => ({ ...p, [key]: [...p[key], course] }));
      setTimeout(save, 0);
    },
    onUpdate: (index: number, updates: Partial<CourseGrade>) => {
      setProfile((p) => ({
        ...p,
        [key]: p[key].map((c, i) => (i === index ? { ...c, ...updates } : c)),
      }));
      setTimeout(save, 0);
    },
    onRemove: (index: number) => {
      setProfile((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== index) }));
      setTimeout(save, 0);
    },
  });

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>GPA (Unweighted)</FieldLabel>
          <NumericInput
            value={profile.gpa_unweighted}
            onChange={(v) => setProfile(p => ({ ...p, gpa_unweighted: v }))}
            onBlur={save}
            placeholder="e.g. 3.85"
            min={0} max={4.0} step={0.01}
          />
          <p className="text-xs text-muted-foreground mt-1">On a 4.0 scale</p>
        </div>
        <div>
          <FieldLabel optional>GPA (Weighted)</FieldLabel>
          <NumericInput
            value={profile.gpa_weighted}
            onChange={(v) => setProfile(p => ({ ...p, gpa_weighted: v }))}
            onBlur={save}
            placeholder="e.g. 4.20"
            min={0} max={5.0} step={0.01}
          />
          <p className="text-xs text-muted-foreground mt-1">On a 5.0 scale</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Class Rank</FieldLabel>
          <NumericInput
            value={profile.class_rank}
            onChange={(v) => setProfile(p => ({ ...p, class_rank: v }))}
            onBlur={save}
            placeholder="e.g. 12"
            min={1}
          />
        </div>
        <div>
          <FieldLabel optional>Class Size</FieldLabel>
          <NumericInput
            value={profile.class_size}
            onChange={(v) => setProfile(p => ({ ...p, class_size: v }))}
            onBlur={save}
            placeholder="e.g. 350"
            min={1}
          />
        </div>
      </div>

      <div className="space-y-3">
        <QualificationSection
          title="IGCSE Subjects (Grade 9)"
          gradeHint="A* · A · B · C · D · E · F · G"
          scaleKey="igcse"
          courses={profile.igcse_subjects}
          defaultOpen={activeStage === 'igcse' || activeStage === null}
          {...makeSectionHandlers('igcse_subjects')}
        />
        <QualificationSection
          title="AS Level Subjects (Grade 10)"
          gradeHint="a · b · c · d · e"
          scaleKey="as"
          courses={profile.as_level_subjects}
          defaultOpen={activeStage === 'as' || activeStage === null}
          {...makeSectionHandlers('as_level_subjects')}
        />
        <QualificationSection
          title="A Level Subjects (Grade 11)"
          gradeHint="A* · A · B · C · D · E"
          scaleKey="a"
          courses={profile.a_level_courses}
          defaultOpen={activeStage === 'a' || activeStage === null}
          {...makeSectionHandlers('a_level_courses')}
        />
      </div>

      <div>
        <FieldLabel optional>AP / IB Courses Taken</FieldLabel>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. AP Calculus BC"
            onChange={(e) => { apInput.current = e.target.value; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val && !profile.ap_courses_taken.includes(val)) {
                  setProfile(p => ({ ...p, ap_courses_taken: [...p.ap_courses_taken, val] }));
                  (e.target as HTMLInputElement).value = '';
                  apInput.current = '';
                  setTimeout(save, 0);
                }
              }
            }}
            className="flex-1 px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
              placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40
              focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={() => {
              const val = apInput.current.trim();
              if (val && !profile.ap_courses_taken.includes(val)) {
                setProfile(p => ({ ...p, ap_courses_taken: [...p.ap_courses_taken, val] }));
                apInput.current = '';
                setTimeout(save, 0);
              }
            }}
            className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">For students coming from a US/IB curriculum background — press Enter or click Add</p>
        {profile.ap_courses_taken.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.ap_courses_taken.map((course, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {course}
                <button
                  type="button"
                  onClick={() => {
                    setProfile(p => ({ ...p, ap_courses_taken: p.ap_courses_taken.filter((_, j) => j !== i) }));
                    setTimeout(save, 0);
                  }}
                  className="hover:text-primary/60 transition-colors"
                >✕</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TestScoresTab({ profile, setProfile, save }: { profile: AcademicProfile; setProfile: React.Dispatch<React.SetStateAction<AcademicProfile>>; save: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-600 text-xs font-bold">E</span>
          English Proficiency
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel optional>Test</FieldLabel>
            <select
              value={profile.english_test_type}
              onChange={(e) => {
                setProfile(p => ({ ...p, english_test_type: e.target.value }));
                setTimeout(save, 0);
              }}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            >
              {ENGLISH_TEST_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel optional>Score</FieldLabel>
            <TextInput
              value={profile.english_test_score}
              onChange={(v) => setProfile(p => ({ ...p, english_test_score: v }))}
              onBlur={save}
              placeholder="e.g. 7.5"
            />
          </div>
          <div>
            <FieldLabel optional>Test Date</FieldLabel>
            <input
              type="month"
              value={profile.english_test_date}
              onChange={(e) => setProfile(p => ({ ...p, english_test_date: e.target.value }))}
              onBlur={save}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Required by nearly every English-taught university for international applicants — worth adding even if you're planning to test later.
        </p>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs font-bold">S</span>
          SAT Scores
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel optional>Total Score</FieldLabel>
            <NumericInput value={profile.sat_total} onChange={(v) => setProfile(p => ({ ...p, sat_total: v }))} onBlur={save} placeholder="400–1600" min={400} max={1600} />
          </div>
          <div>
            <FieldLabel optional>Math</FieldLabel>
            <NumericInput value={profile.sat_math} onChange={(v) => setProfile(p => ({ ...p, sat_math: v }))} onBlur={save} placeholder="200–800" min={200} max={800} />
          </div>
          <div>
            <FieldLabel optional>EBRW</FieldLabel>
            <NumericInput value={profile.sat_ebrw} onChange={(v) => setProfile(p => ({ ...p, sat_ebrw: v }))} onBlur={save} placeholder="200–800" min={200} max={800} />
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center text-green-600 text-xs font-bold">A</span>
          ACT Score
        </p>
        <div className="max-w-[200px]">
          <FieldLabel optional>Composite</FieldLabel>
          <NumericInput value={profile.act_composite} onChange={(v) => setProfile(p => ({ ...p, act_composite: v }))} onBlur={save} placeholder="1–36" min={1} max={36} />
        </div>
      </div>
      <div className="rounded-xl bg-muted/60 border border-border p-4">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> You only need to fill in tests you've taken or plan to take. SAT/ACT aren't required by many international universities — many are now test-optional.
        </p>
      </div>
    </div>
  );
}

function DirectionTab({ profile, setProfile, save }: { profile: AcademicProfile; setProfile: React.Dispatch<React.SetStateAction<AcademicProfile>>; save: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Intended Major</FieldLabel>
        <TextInput
          value={profile.intended_major}
          onChange={(v) => setProfile(p => ({ ...p, intended_major: v }))}
          onBlur={save}
          placeholder="e.g. Computer Science, Biomedical Engineering, Undecided"
        />
      </div>
      <div>
        <FieldLabel>Career Interests</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {CAREER_INTERESTS_OPTIONS.map((opt) => {
            const selected = profile.career_interests.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setProfile(p => ({
                    ...p,
                    career_interests: selected
                      ? p.career_interests.filter(c => c !== opt)
                      : [...p.career_interests, opt],
                  }));
                  setTimeout(save, 0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <FieldLabel>Preferred College Type</FieldLabel>
        <div className="grid sm:grid-cols-2 gap-2">
          {COLLEGE_TYPE_OPTIONS.map((opt) => {
            const selected = profile.preferred_college_type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setProfile(p => ({ ...p, preferred_college_type: selected ? '' : opt.value }));
                  setTimeout(save, 0);
                }}
                className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all ${
                  selected
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActivitiesTab({ profile, setProfile, save }: { profile: AcademicProfile; setProfile: React.Dispatch<React.SetStateAction<AcademicProfile>>; save: () => void }) {
  const [adding, setAdding] = useState(false);
  const emptyDraft: Extracurricular = {
    name: '', role: '', leadershipPosition: '', years: '', hoursPerWeek: '', weeksPerYear: '', gradeLevels: [], description: '',
  };
  const [draft, setDraft] = useState<Extracurricular>(emptyDraft);

  return (
    <div className="space-y-4">
      {profile.extracurriculars.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-border bg-muted/50 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground font-medium">No activities added yet</p>
          <p className="text-xs text-muted-foreground mt-1">Sports, clubs, volunteering, jobs — add them here</p>
        </div>
      )}

      {profile.extracurriculars.map((act, i) => (
        <div key={i} className="rounded-xl border border-border bg-muted/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{act.name}</p>
              <p className="text-xs text-muted-foreground">
                {act.leadershipPosition || act.role} · {act.years} {act.years === '1' ? 'year' : 'years'}
                {(act.hoursPerWeek || act.weeksPerYear) && (
                  <> · {act.hoursPerWeek || '?'} hrs/wk, {act.weeksPerYear || '?'} wks/yr</>
                )}
              </p>
              {(act.gradeLevels?.length ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">Grades: {act.gradeLevels.join(', ')}</p>
              )}
              {act.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{act.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => {
                setProfile(p => ({ ...p, extracurriculars: p.extracurriculars.filter((_, j) => j !== i) }));
                setTimeout(save, 0);
              }}
              className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Add Activity</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Activity Name</FieldLabel>
              <TextInput value={draft.name} onChange={(v) => setDraft(d => ({ ...d, name: v }))} placeholder="e.g. Varsity Soccer" />
            </div>
            <div>
              <FieldLabel>Your Role</FieldLabel>
              <TextInput value={draft.role} onChange={(v) => setDraft(d => ({ ...d, role: v }))} placeholder="e.g. Member" />
            </div>
          </div>
          <div>
            <FieldLabel optional>Leadership Position</FieldLabel>
            <TextInput value={draft.leadershipPosition} onChange={(v) => setDraft(d => ({ ...d, leadershipPosition: v }))} placeholder="e.g. Team Captain, President" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel>Years Involved</FieldLabel>
              <TextInput value={draft.years} onChange={(v) => setDraft(d => ({ ...d, years: v }))} placeholder="e.g. 3" />
            </div>
            <div>
              <FieldLabel optional>Hours / Week</FieldLabel>
              <TextInput value={draft.hoursPerWeek} onChange={(v) => setDraft(d => ({ ...d, hoursPerWeek: v }))} placeholder="e.g. 6" />
            </div>
            <div>
              <FieldLabel optional>Weeks / Year</FieldLabel>
              <TextInput value={draft.weeksPerYear} onChange={(v) => setDraft(d => ({ ...d, weeksPerYear: v }))} placeholder="e.g. 30" />
            </div>
          </div>
          <div>
            <FieldLabel optional>Grade Levels Participated</FieldLabel>
            <div className="flex gap-2">
              {['9', '10', '11'].map((g) => {
                const selected = draft.gradeLevels.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setDraft(d => ({
                      ...d,
                      gradeLevels: selected ? d.gradeLevels.filter(x => x !== g) : [...d.gradeLevels, g],
                    }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary'
                    }`}
                  >
                    Grade {g}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <FieldLabel optional>Brief Description</FieldLabel>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))}
              placeholder="What did you accomplish? Any leadership or impact?"
              rows={2}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!draft.name.trim()) return;
                setProfile(p => ({ ...p, extracurriculars: [...p.extracurriculars, { ...draft }] }));
                setDraft(emptyDraft);
                setAdding(false);
                setTimeout(save, 0);
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Save Activity
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setDraft(emptyDraft); }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full py-3 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Activity
        </button>
      )}
    </div>
  );
}

function AchievementsTab({ profile, setProfile, save }: { profile: AcademicProfile; setProfile: React.Dispatch<React.SetStateAction<AcademicProfile>>; save: () => void }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<HonorAward>({ title: '', year: '', level: 'School' });

  return (
    <div className="space-y-4">
      {profile.honors_awards.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-border bg-muted/50 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground font-medium">No achievements added yet</p>
          <p className="text-xs text-muted-foreground mt-1">Academic awards, competitions, recognitions</p>
        </div>
      )}

      {profile.honors_awards.map((award, i) => (
        <div key={i} className="rounded-xl border border-border bg-muted/50 p-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground text-sm">{award.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{award.year}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                award.level === 'National' || award.level === 'International'
                  ? 'bg-amber-500/10 text-amber-600'
                  : award.level === 'State'
                  ? 'bg-blue-500/10 text-blue-600'
                  : 'bg-muted text-muted-foreground'
              }`}>{award.level}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setProfile(p => ({ ...p, honors_awards: p.honors_awards.filter((_, j) => j !== i) }));
              setTimeout(save, 0);
            }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}

      {adding ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Add Achievement</p>
          <div>
            <FieldLabel>Award / Honor Title</FieldLabel>
            <TextInput value={draft.title} onChange={(v) => setDraft(d => ({ ...d, title: v }))} placeholder="e.g. National Merit Semifinalist" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Year</FieldLabel>
              <TextInput value={draft.year} onChange={(v) => setDraft(d => ({ ...d, year: v }))} placeholder="e.g. 2024" />
            </div>
            <div>
              <FieldLabel>Level</FieldLabel>
              <select
                value={draft.level}
                onChange={(e) => setDraft(d => ({ ...d, level: e.target.value as HonorAward['level'] }))}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              >
                {['School', 'Regional', 'State', 'National', 'International'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!draft.title.trim()) return;
                setProfile(p => ({ ...p, honors_awards: [...p.honors_awards, { ...draft }] }));
                setDraft({ title: '', year: '', level: 'School' });
                setAdding(false);
                setTimeout(save, 0);
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Save Achievement
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full py-3 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Achievement
        </button>
      )}
    </div>
  );
}

function CollegesTab({ profile, setProfile, save }: { profile: AcademicProfile; setProfile: React.Dispatch<React.SetStateAction<AcademicProfile>>; save: () => void }) {
  const collegeInput = useRef('');

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Target Countries / Regions</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {TARGET_COUNTRY_OPTIONS.map((opt) => {
            const selected = profile.target_countries.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setProfile(p => ({
                    ...p,
                    target_countries: selected
                      ? p.target_countries.filter(c => c !== opt)
                      : [...p.target_countries, opt],
                  }));
                  setTimeout(save, 0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Different countries mean different application systems, deadlines, and requirements.</p>
      </div>

      <div>
        <FieldLabel>Target Colleges</FieldLabel>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. MIT, UCLA, University of Michigan"
            onChange={(e) => { collegeInput.current = e.target.value; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val && !profile.college_list.some(c => c.name === val)) {
                  setProfile(p => ({ ...p, college_list: [...p.college_list, { name: val, applicationType: '' }] }));
                  (e.target as HTMLInputElement).value = '';
                  collegeInput.current = '';
                  setTimeout(save, 0);
                }
              }
            }}
            className="flex-1 px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
              placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40
              focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={() => {
              const val = collegeInput.current.trim();
              if (val && !profile.college_list.some(c => c.name === val)) {
                setProfile(p => ({ ...p, college_list: [...p.college_list, { name: val, applicationType: '' }] }));
                collegeInput.current = '';
                setTimeout(save, 0);
              }
            }}
            className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
        {profile.college_list.length > 0 && (
          <div className="space-y-2 mt-3">
            {profile.college_list.map((college, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                <span className="flex-1 min-w-[120px] text-sm font-medium text-foreground">🎓 {college.name}</span>
                <select
                  value={college.applicationType}
                  onChange={(e) => {
                    setProfile(p => ({
                      ...p,
                      college_list: p.college_list.map((c, j) => (j === i ? { ...c, applicationType: e.target.value } : c)),
                    }));
                    setTimeout(save, 0);
                  }}
                  className="px-2 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Application type</option>
                  {APPLICATION_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setProfile(p => ({ ...p, college_list: p.college_list.filter((_, j) => j !== i) }));
                    setTimeout(save, 0);
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >✕</button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">Early Decision/Action can meaningfully raise acceptance odds at some schools — worth marking if you know your plan.</p>
      </div>

      <div>
        <FieldLabel optional>Personal Statement Draft</FieldLabel>
        <textarea
          value={profile.personal_statement}
          onChange={(e) => setProfile(p => ({ ...p, personal_statement: e.target.value }))}
          onBlur={save}
          placeholder="Paste your personal statement or essay draft here. This will be used by the AI Essay Coach to provide personalized feedback..."
          rows={8}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
            placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40
            focus:border-primary transition-colors resize-y"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">Used by the AI Essay Coach for feedback</p>
          <p className="text-xs text-muted-foreground">
            {profile.personal_statement.trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      </div>
    </div>
  );
}

function BackgroundTab({ profile, setProfile, save }: { profile: AcademicProfile; setProfile: React.Dispatch<React.SetStateAction<AcademicProfile>>; save: () => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted/60 border border-border p-4">
        <p className="text-xs text-muted-foreground">
          This section is only visible to your counselor, not other students — it helps them understand your full situation, not just your grades.
        </p>
      </div>

      <div>
        <FieldLabel optional>First-Generation College Student</FieldLabel>
        <div className="flex gap-2">
          {[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }].map((opt) => {
            const selected = profile.first_generation === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => {
                  setProfile(p => ({ ...p, first_generation: selected ? '' : opt.v }));
                  setTimeout(save, 0);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/50'
                }`}
              >
                {opt.l}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Neither of your parents/guardians completed a 4-year university degree.</p>
      </div>

      <div>
        <FieldLabel optional>Financial Aid / Scholarship Need</FieldLabel>
        <select
          value={profile.financial_aid_need}
          onChange={(e) => {
            setProfile(p => ({ ...p, financial_aid_need: e.target.value }));
            setTimeout(save, 0);
          }}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        >
          <option value="">Prefer not to say</option>
          <option value="yes">Yes, I'll likely need financial aid or scholarships</option>
          <option value="no">No, I can cover costs without aid</option>
          <option value="not_sure">Not sure yet</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Many universities are &quot;need-aware&quot; for international applicants — this shapes which schools are realistic targets, so your counselor can guide you honestly.
        </p>
      </div>

      <div>
        <FieldLabel optional>Additional Context</FieldLabel>
        <textarea
          value={profile.additional_context}
          onChange={(e) => setProfile(p => ({ ...p, additional_context: e.target.value }))}
          onBlur={save}
          placeholder="Anything that would help your counselor understand your situation — significant challenges, personal circumstances, or context behind your academic record that grades alone don't show."
          rows={5}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
            placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40
            focus:border-primary transition-colors resize-y"
        />
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function AcademicProfileSection() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AcademicProfile>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<TabId>('academics');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load profile on mount
  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    fetch(`/api/student-profile?studentId=${user.id}`)
      .then(r => r.json())
      .then(({ profile: data }) => {
        if (data) {
          setProfile({
            gpa_weighted: data.gpa_weighted?.toString() ?? '',
            gpa_unweighted: data.gpa_unweighted?.toString() ?? '',
            class_rank: data.class_rank?.toString() ?? '',
            class_size: data.class_size?.toString() ?? '',
            igcse_subjects: data.igcse_subjects ?? [],
            as_level_subjects: data.as_level_subjects ?? [],
            a_level_courses: data.a_level_courses ?? [],
            ap_courses_taken: data.ap_courses_taken ?? [],
            sat_total: data.sat_total?.toString() ?? '',
            sat_math: data.sat_math?.toString() ?? '',
            sat_ebrw: data.sat_ebrw?.toString() ?? '',
            act_composite: data.act_composite?.toString() ?? '',
            english_test_type: data.english_test_type ?? '',
            english_test_score: data.english_test_score ?? '',
            english_test_date: data.english_test_date ?? '',
            intended_major: data.intended_major ?? '',
            career_interests: data.career_interests ?? [],
            preferred_college_type: data.preferred_college_type ?? '',
            extracurriculars: normalizeExtracurriculars(data.extracurriculars),
            honors_awards: data.honors_awards ?? [],
            target_countries: data.target_countries ?? [],
            college_list: data.college_list ?? [],
            personal_statement: data.personal_statement ?? '',
            first_generation: data.first_generation === true ? 'yes' : data.first_generation === false ? 'no' : '',
            financial_aid_need: data.financial_aid_need ?? '',
            additional_context: data.additional_context ?? '',
            completion_pct: data.completion_pct ?? 0,
          });
          // Auto-collapse if profile is complete enough
          if ((data.completion_pct ?? 0) >= 80) {
            setIsCollapsed(true);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const save = useCallback(() => {
    if (!user?.id || !user?.schoolId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const payload = profileToApiPayload(profile, user.id, user.schoolId);
        const res = await fetch('/api/student-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(p => ({ ...p, completion_pct: data.completion_pct ?? p.completion_pct }));
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
        }
      } catch {
        setSaveStatus('error');
      }
    }, 800);
  }, [user?.id, user?.schoolId, profile]);

  const completionPct = profile.completion_pct;

  const progressColor =
    completionPct >= 80 ? '#16A34A' :
    completionPct >= 50 ? '#2563EB' :
    completionPct >= 25 ? '#F97316' : '#EF4444';

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-48" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div
        className="flex items-start justify-between gap-4 p-6 cursor-pointer select-none"
        onClick={() => setIsCollapsed(c => !c)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Academic Profile</h2>
              <p className="text-xs text-muted-foreground">Used by your counselor and AI tools for personalized analysis</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {completionPct === 100
                  ? 'Profile complete ✓'
                  : completionPct >= 50
                  ? 'AI tools unlocked — keep going!'
                  : 'Complete 50% to unlock AI Essay Coach & Chance Estimator'}
              </p>
              <span className="text-xs font-semibold" style={{ color: progressColor }}>
                {completionPct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%`, backgroundColor: progressColor }}
              />
            </div>
            <div className="flex gap-1">
              {TABS.map((tab) => {
                const filled = isTabFilled(tab.id, profile);
                return (
                  <div
                    key={tab.id}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{ backgroundColor: filled ? progressColor : undefined }}
                    title={`${tab.label}: ${filled ? 'filled' : 'empty'}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {saveStatus === 'saving' && (
            <span className="text-xs text-muted-foreground">Saving…</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-success font-medium">Saved ✓</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-destructive font-medium">Error saving</span>
          )}
          <div className={`w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Collapsed state — show tab summary dots */}
      {isCollapsed && (
        <div className="px-6 pb-5">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const filled = isTabFilled(tab.id, profile);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsCollapsed(false); setActiveTab(tab.id); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
                  style={{
                    borderColor: filled ? progressColor : undefined,
                    color: filled ? progressColor : undefined,
                    backgroundColor: filled ? `${progressColor}15` : undefined,
                  }}
                >
                  {filled ? '✓' : '○'} {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Expanded state */}
      {!isCollapsed && (
        <>
          {/* Tabs row */}
          <div className="flex border-t border-border overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            {TABS.map((tab) => {
              const filled = isTabFilled(tab.id, profile);
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${filled ? '' : 'bg-muted-foreground/30'}`}
                    style={filled ? { backgroundColor: progressColor } : {}} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6 border-t border-border" onClick={(e) => e.stopPropagation()}>
            {activeTab === 'academics' && <AcademicsTab profile={profile} setProfile={setProfile} save={save} gradeLevel={user?.gradeLevel} />}
            {activeTab === 'tests' && <TestScoresTab profile={profile} setProfile={setProfile} save={save} />}
            {activeTab === 'direction' && <DirectionTab profile={profile} setProfile={setProfile} save={save} />}
            {activeTab === 'activities' && <ActivitiesTab profile={profile} setProfile={setProfile} save={save} />}
            {activeTab === 'achievements' && <AchievementsTab profile={profile} setProfile={setProfile} save={save} />}
            {activeTab === 'colleges' && <CollegesTab profile={profile} setProfile={setProfile} save={save} />}
            {activeTab === 'background' && <BackgroundTab profile={profile} setProfile={setProfile} save={save} />}
          </div>

          {/* Footer CTA */}
          {completionPct < 50 && (
            <div className="px-6 pb-5 pt-0" onClick={(e) => e.stopPropagation()}>
              <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Unlock AI Tools</p>
                  <p className="text-xs text-muted-foreground">Complete {50 - completionPct}% more to unlock the AI Essay Coach & Admissions Chance Estimator</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
