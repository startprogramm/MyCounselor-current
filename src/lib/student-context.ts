import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AcademicProfile = Database['public']['Tables']['student_academic_profiles']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];
type Resource = Database['public']['Tables']['resources']['Row'];

export interface StudentSnapshot {
  profile: Pick<Profile, 'first_name' | 'grade_level' | 'school_name' | 'school_id'> | null;
  academicProfile: AcademicProfile | null;
  activeGoals: Pick<Goal, 'title' | 'progress' | 'deadline' | 'priority'>[];
  resources: Pick<Resource, 'title' | 'description' | 'category' | 'type'>[];
}

export async function getStudentSnapshot(studentId: string): Promise<StudentSnapshot> {
  const supabase = getSupabaseAdmin();

  const [profileRes, academicRes, goalsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, grade_level, school_name, school_id')
      .eq('id', studentId)
      .maybeSingle(),
    supabase
      .from('student_academic_profiles')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle(),
    supabase
      .from('goals')
      .select('title, progress, deadline, priority')
      .eq('student_id', studentId)
      .lt('progress', 100)
      .order('deadline', { ascending: true })
      .limit(5),
  ]);

  const schoolId = profileRes.data?.school_id;
  const resourcesRes = schoolId
    ? await supabase
        .from('resources')
        .select('title, description, category, type')
        .eq('school_id', schoolId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(8)
    : null;

  return {
    profile: profileRes.data ?? null,
    academicProfile: academicRes.data ?? null,
    activeGoals: goalsRes.data ?? [],
    resources: resourcesRes?.data ?? [],
  };
}
