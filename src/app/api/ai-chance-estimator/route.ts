import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const CHANCE_ESTIMATOR_SYSTEM = `You are a college admissions expert with deep knowledge of global university admissions — US, UK/UCAS, Canada, and Europe — including how Cambridge IGCSE/AS/A Level qualifications are evaluated by admissions offices, alongside US-style GPA and SAT/ACT. You analyze student profiles and estimate admission chances at specific colleges.

Be realistic and data-driven. Base your estimates on:
- Published acceptance rates for the college
- Typical GPA ranges for admitted students, or equivalent A Level / IGCSE grade profiles if the student is on the Cambridge Pathway
- Test score ranges (SAT/ACT) and, for international applicants, whether their English proficiency score meets the college's typical threshold
- Extracurricular strength — weigh depth and time commitment (years, hours/week, weeks/year, leadership role) over a long list of shallow involvements
- The student's intended major and college fit
- Whether grades are predicted (not yet final) — treat predicted grades as a reasonable but less certain signal than final results, and say so explicitly when relevant
- If the student indicated they will need financial aid, factor in that many US colleges are need-aware for international applicants, and note this honestly in your assessment rather than ignoring it

Tier definitions:
- "Safety": 70%+ chance of admission
- "Match": 30–70% chance
- "Reach": 10–30% chance  
- "Stretch": below 10% chance

Respond ONLY with valid JSON matching this exact schema:
{
  "collegeName": "<normalized official college name>",
  "chancePercent": <number 0-100>,
  "tier": "Safety" | "Match" | "Reach" | "Stretch",
  "acceptanceRate": "<published acceptance rate, e.g. '4%' or 'N/A'>",
  "summary": "<2-3 sentence honest assessment>",
  "strengths": ["<specific strength vs. this college>", ...],
  "weaknesses": ["<specific weakness vs. this college>", ...],
  "actions": [
    {
      "action": "<specific thing to do>",
      "impact": "High" | "Medium" | "Low"
    }
  ],
  "averageProfile": {
    "gpa": "<typical GPA range for admitted students>",
    "sat": "<typical SAT range or N/A>",
    "act": "<typical ACT range or N/A>"
  }
}`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    return NextResponse.json(
      { error: 'AI features are not configured. Add ANTHROPIC_API_KEY to your .env file.' },
      { status: 503 }
    );
  }

  let targetCollege: string;
  let studentProfile: Record<string, unknown>;

  try {
    const body = await request.json();
    targetCollege = body.targetCollege;
    studentProfile = body.studentProfile;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!targetCollege || typeof targetCollege !== 'string') {
    return NextResponse.json({ error: 'targetCollege is required.' }, { status: 400 });
  }

  if (!studentProfile || typeof studentProfile !== 'object') {
    return NextResponse.json({ error: 'studentProfile is required.' }, { status: 400 });
  }

  type CourseGrade = { subjectName: string; grade?: string; status?: string };
  const formatCourses = (courses: unknown) =>
    (courses as CourseGrade[] | undefined)
      ?.map((c) => `${c.subjectName}${c.grade ? ` (${c.grade}${c.status === 'predicted' ? ', predicted' : ''})` : ''}`)
      .join(', ') || 'None listed';

  const profileSummary = `
Student Academic Profile:
- GPA (Weighted): ${studentProfile.gpa_weighted ?? 'Not provided'}
- GPA (Unweighted): ${studentProfile.gpa_unweighted ?? 'Not provided'}
- Class Rank: ${studentProfile.class_rank ? `${studentProfile.class_rank} of ${studentProfile.class_size ?? '?'}` : 'Not provided'}
- IGCSE Subjects: ${formatCourses(studentProfile.igcse_subjects)}
- AS Level Subjects: ${formatCourses(studentProfile.as_level_subjects)}
- A Level Subjects: ${formatCourses(studentProfile.a_level_courses)}
- AP/IB Courses: ${(studentProfile.ap_courses_taken as string[] | undefined)?.join(', ') || 'None listed'}
- SAT Total: ${studentProfile.sat_total ?? 'Not provided'}
- SAT Math: ${studentProfile.sat_math ?? 'Not provided'}
- SAT EBRW: ${studentProfile.sat_ebrw ?? 'Not provided'}
- ACT Composite: ${studentProfile.act_composite ?? 'Not provided'}
- English Proficiency: ${studentProfile.english_test_type ? `${studentProfile.english_test_type} ${studentProfile.english_test_score ?? ''}`.trim() : 'Not provided'}
- Intended Major: ${studentProfile.intended_major ?? 'Undecided'}
- Career Interests: ${(studentProfile.career_interests as string[] | undefined)?.join(', ') || 'Not specified'}
- Preferred College Type: ${studentProfile.preferred_college_type ?? 'Not specified'}
- Target Countries: ${(studentProfile.target_countries as string[] | undefined)?.join(', ') || 'Not specified'}
- Extracurriculars (with time commitment): ${studentProfile.extracurriculars ? JSON.stringify(studentProfile.extracurriculars) : 'None listed'}
- Honors & Awards: ${studentProfile.honors_awards ? JSON.stringify(studentProfile.honors_awards) : 'None listed'}
- First-Generation College Student: ${studentProfile.first_generation === true ? 'Yes' : studentProfile.first_generation === false ? 'No' : 'Not specified'}
- Likely Needs Financial Aid: ${studentProfile.financial_aid_need === 'yes' ? 'Yes' : studentProfile.financial_aid_need === 'no' ? 'No' : 'Not specified'}
- Additional Context: ${studentProfile.additional_context || 'None provided'}
`.trim();

  const userMessage = `Target College: ${targetCollege}

${profileSummary}

Please estimate this student's admissions chances at ${targetCollege} and provide detailed JSON analysis.`;

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1536,
      system: CHANCE_ESTIMATOR_SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    });

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
