import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient, missingKeyResponse } from '@/lib/gemini';
import { getStudentSnapshot } from '@/lib/student-context';
import { getSchoolKnowledge } from '@/lib/school-knowledge';

const CHANCE_ESTIMATOR_SYSTEM = `You are a college admissions expert with deep knowledge of global university admissions — US, UK/UCAS, Canada, and Europe — including how Cambridge IGCSE/AS/A Level qualifications are evaluated by admissions offices, alongside US-style GPA and SAT/ACT. You analyze student profiles and estimate admission chances at specific colleges.

Be realistic and data-driven. Base your estimates on:
- Published acceptance rates for the college
- Typical GPA ranges for admitted students, or equivalent A Level / IGCSE grade profiles if the student is on the Cambridge Pathway
- Test score ranges (SAT/ACT) and, for international applicants, whether their English proficiency score meets the college's typical threshold
- Extracurricular strength — weigh depth and time commitment (years, hours/week, weeks/year, leadership role) over a long list of shallow involvements
- The student's intended major and college fit
- Whether grades are predicted (not yet final) — treat predicted grades as a reasonable but less certain signal than final results, and say so explicitly when relevant
- If the student indicated they will need financial aid, factor in that many US colleges are need-aware for international applicants, and note this honestly in your assessment rather than ignoring it
- Any goals the student is actively working toward (e.g. a test retake or new activity) — factor in that their profile may improve before they apply, and say so if relevant

Tier definitions:
- "Safety": 70%+ chance of admission
- "Match": 30–70% chance
- "Reach": 10–30% chance
- "Stretch": below 10% chance`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    collegeName: { type: 'STRING', description: 'normalized official college name' },
    chancePercent: { type: 'NUMBER' },
    tier: { type: 'STRING', enum: ['Safety', 'Match', 'Reach', 'Stretch'] },
    acceptanceRate: {
      type: 'STRING',
      description: "published acceptance rate, e.g. '4%' or 'N/A'",
    },
    summary: { type: 'STRING', description: '2-3 sentence honest assessment' },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
    actions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          action: { type: 'STRING' },
          impact: { type: 'STRING', enum: ['High', 'Medium', 'Low'] },
        },
        required: ['action', 'impact'],
      },
    },
    averageProfile: {
      type: 'OBJECT',
      properties: {
        gpa: { type: 'STRING' },
        sat: { type: 'STRING' },
        act: { type: 'STRING' },
      },
      required: ['gpa', 'sat', 'act'],
    },
  },
  required: [
    'collegeName',
    'chancePercent',
    'tier',
    'acceptanceRate',
    'summary',
    'strengths',
    'weaknesses',
    'actions',
    'averageProfile',
  ],
};

type CourseGrade = { subjectName: string; grade?: string; status?: string };

function formatCourses(courses: unknown) {
  return (
    (courses as CourseGrade[] | undefined)
      ?.map(
        (c) =>
          `${c.subjectName}${c.grade ? ` (${c.grade}${c.status === 'predicted' ? ', predicted' : ''})` : ''}`
      )
      .join(', ') || 'None listed'
  );
}

export async function POST(request: NextRequest) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(missingKeyResponse('AI features'), { status: 503 });
  }

  let targetCollege: string;
  let studentId: string;

  try {
    const body = await request.json();
    targetCollege = body.targetCollege;
    studentId = body.studentId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!targetCollege || typeof targetCollege !== 'string') {
    return NextResponse.json({ error: 'targetCollege is required.' }, { status: 400 });
  }

  if (!studentId || typeof studentId !== 'string') {
    return NextResponse.json({ error: 'studentId is required.' }, { status: 400 });
  }

  const snapshot = await getStudentSnapshot(studentId);
  const p = snapshot.academicProfile;

  const goalsSummary = snapshot.activeGoals.length
    ? snapshot.activeGoals
        .map((g) => `"${g.title}" (${g.progress}% done, due ${g.deadline})`)
        .join('; ')
    : 'None currently tracked';

  const profileSummary = `
Student Academic Profile:
- Grade Level: ${snapshot.profile?.grade_level ?? 'Not provided'}
- GPA (Weighted): ${p?.gpa_weighted ?? 'Not provided'}
- GPA (Unweighted): ${p?.gpa_unweighted ?? 'Not provided'}
- Class Rank: ${p?.class_rank ? `${p.class_rank} of ${p.class_size ?? '?'}` : 'Not provided'}
- IGCSE Subjects: ${formatCourses(p?.igcse_subjects)}
- AS Level Subjects: ${formatCourses(p?.as_level_subjects)}
- A Level Subjects: ${formatCourses(p?.a_level_courses)}
- AP/IB Courses: ${p?.ap_courses_taken?.join(', ') || 'None listed'}
- SAT Total: ${p?.sat_total ?? 'Not provided'}
- SAT Math: ${p?.sat_math ?? 'Not provided'}
- SAT EBRW: ${p?.sat_ebrw ?? 'Not provided'}
- ACT Composite: ${p?.act_composite ?? 'Not provided'}
- English Proficiency: ${p?.english_test_type ? `${p.english_test_type} ${p.english_test_score ?? ''}`.trim() : 'Not provided'}
- Intended Major: ${p?.intended_major ?? 'Undecided'}
- Career Interests: ${p?.career_interests?.join(', ') || 'Not specified'}
- Preferred College Type: ${p?.preferred_college_type ?? 'Not specified'}
- Target Countries: ${p?.target_countries?.join(', ') || 'Not specified'}
- Extracurriculars (with time commitment): ${p?.extracurriculars ? JSON.stringify(p.extracurriculars) : 'None listed'}
- Honors & Awards: ${p?.honors_awards ? JSON.stringify(p.honors_awards) : 'None listed'}
- First-Generation College Student: ${p?.first_generation === true ? 'Yes' : p?.first_generation === false ? 'No' : 'Not specified'}
- Likely Needs Financial Aid: ${p?.financial_aid_need === 'yes' ? 'Yes' : p?.financial_aid_need === 'no' ? 'No' : 'Not specified'}
- Additional Context: ${p?.additional_context || 'None provided'}
- Active Goals: ${goalsSummary}
`.trim();

  const userMessage = `Target College: ${targetCollege}

${profileSummary}

Please estimate this student's admissions chances at ${targetCollege}.`;

  const schoolKnowledge = getSchoolKnowledge(snapshot.profile?.school_id);
  const systemInstruction = schoolKnowledge
    ? `${CHANCE_ESTIMATOR_SYSTEM}\n\nFacts specific to this student's school:\n${schoolKnowledge}`
    : CHANCE_ESTIMATOR_SYSTEM;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction,
        maxOutputTokens: 1536,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const result = JSON.parse(response.text ?? '');
    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
