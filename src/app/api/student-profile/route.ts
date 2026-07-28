import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';

type AcademicProfileRow = Database['public']['Tables']['student_academic_profiles']['Row'];

function computeCompletionPct(data: Partial<AcademicProfileRow>): number {
  const checks = [
    // Academics (each counts as 1)
    data.gpa_unweighted != null,
    data.gpa_weighted != null,
    // Tests
    data.sat_total != null || data.act_composite != null,
    (data.ap_courses_taken?.length ?? 0) > 0,
    // Direction
    !!data.intended_major,
    (data.career_interests?.length ?? 0) > 0,
    !!data.preferred_college_type,
    // Activities
    (data.extracurriculars as unknown[] | null)?.length != null &&
      (data.extracurriculars as unknown[]).length > 0,
    // Achievements
    (data.honors_awards as unknown[] | null)?.length != null &&
      (data.honors_awards as unknown[]).length > 0,
    // Colleges
    (data.target_colleges?.length ?? 0) > 0,
    !!data.personal_statement,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase env vars missing');
  }
  return createClient<Database>(url, serviceKey);
}

// GET /api/student-profile?studentId=<uuid>
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('student_academic_profiles')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/student-profile
// Body: { studentId, schoolId, ...fields }
export async function PUT(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { studentId, schoolId, ...fields } = body;

  if (!studentId || !schoolId) {
    return NextResponse.json({ error: 'studentId and schoolId are required' }, { status: 400 });
  }

  const completion_pct = computeCompletionPct(fields as Partial<AcademicProfileRow>);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('student_academic_profiles')
      .upsert(
        {
          student_id: studentId as string,
          school_id: schoolId as string,
          ...(fields as object),
          completion_pct,
        },
        { onConflict: 'student_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data, completion_pct });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
