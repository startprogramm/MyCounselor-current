import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';

type AcademicProfileRow = Database['public']['Tables']['student_academic_profiles']['Row'];

function hasItems(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function computeCompletionPct(data: Partial<AcademicProfileRow>): number {
  const checks = [
    // Academics
    data.gpa_unweighted != null,
    data.gpa_weighted != null,
    hasItems(data.igcse_subjects) || hasItems(data.as_level_subjects) || hasItems(data.a_level_courses),
    // Tests
    data.sat_total != null || data.act_composite != null,
    !!data.english_test_type,
    // Direction
    !!data.intended_major,
    (data.career_interests?.length ?? 0) > 0,
    !!data.preferred_college_type,
    // Activities
    hasItems(data.extracurriculars),
    // Achievements
    hasItems(data.honors_awards),
    // Colleges
    hasItems(data.college_list) || (data.target_countries?.length ?? 0) > 0,
    !!data.personal_statement,
    // Background
    !!data.financial_aid_need || data.first_generation != null || !!data.additional_context,
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
