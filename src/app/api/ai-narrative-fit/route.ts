import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient, missingKeyResponse } from '@/lib/gemini';
import { getStudentSnapshot } from '@/lib/student-context';
import { getSchoolKnowledge } from '@/lib/school-knowledge';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const NARRATIVE_FIT_SYSTEM = `You are a senior admissions reader at a highly selective university, doing the specific pass experienced readers do after checking a file for completeness: reading for the throughline — the thread that makes an applicant read as one coherent, memorable person instead of a stack of unrelated credentials.

Core evaluation philosophy:
- A throughline is not a job title or a single activity. "Wants to be a doctor" is not a throughline; "drawn to understanding how systems fail, and to fixing them carefully" is — it can show up as ER shadowing AND robotics AND a personal essay about repairing something as a kid. Look for the underlying curiosity, value, or way of engaging with the world that connects the pieces, not a narrow label.
- A real throughline can be broad. Don't force-fit a narrow box just to make the pieces match. If the honest read is "this student is a genuine polymath with no single thread yet," say that plainly via throughlineConfidence rather than inventing a thread that isn't there.
- Genuine breadth is not a flaw. Selective admissions readers value activities outside a student's main interest — it shows range and normal teenage life, not a scattered application. An activity that doesn't reinforce the throughline should read as "doesn't build this particular story," never as "this is bad" or "cut this." Never recommend dropping an activity.
- Ground every verdict in specifics. Never write "this seems consistent" without naming which activity, award, or essay theme you're pointing at and why. A vague verdict is worse than no verdict.
- If the data is thin (one activity, no essay yet), say so via throughlineConfidence: "Unclear" rather than overclaiming a confident throughline from a single data point.
- Zero tolerance for AI-cliché language in your own writing: no "testament," "tapestry," "multifaceted," "well-rounded," "shines through," "speaks volumes," or similar. Write like a specific, busy human who read this file closely, not like a form letter.

You will be given a student's intended major/career interests, their extracurricular activities, honors and awards, and their personal statement (if written). Some of these may be empty — evaluate only what's actually there.`;

const PIECE_VERDICT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    verdict: {
      type: 'STRING',
      enum: ['aligned', 'off_theme', 'not_enough_data'],
      description: "'not_enough_data' if this section is empty or too thin to judge",
    },
    reasoning: {
      type: 'STRING',
      description:
        '1-2 sentences, grounded in specific named activities/awards/essay content. If off_theme, frame it as not building this particular throughline, never as a flaw.',
    },
  },
  required: ['verdict', 'reasoning'],
};

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    throughline: {
      type: 'STRING',
      description:
        "1-2 sentence description of the coherent identity this profile currently tells, grounded in specifics. If there isn't one yet, describe what's there honestly instead of inventing one.",
    },
    throughlineConfidence: {
      type: 'STRING',
      enum: ['Clear', 'Emerging', 'Unclear'],
    },
    pieces: {
      type: 'OBJECT',
      properties: {
        extracurriculars: PIECE_VERDICT_SCHEMA,
        honors: PIECE_VERDICT_SCHEMA,
        essay: PIECE_VERDICT_SCHEMA,
      },
      required: ['extracurriculars', 'honors', 'essay'],
    },
  },
  required: ['throughline', 'throughlineConfidence', 'pieces'],
};

interface ExtracurricularInput {
  name?: string;
  role?: string;
  leadershipPosition?: string;
  years?: string;
  hoursPerWeek?: string;
  weeksPerYear?: string;
  description?: string;
}

interface HonorInput {
  title?: string;
  level?: string;
  year?: string;
}

function formatExtracurriculars(list: unknown): string {
  const items = (list as ExtracurricularInput[] | null | undefined) ?? [];
  if (items.length === 0) return 'None listed';
  return items
    .map((a) => {
      const role = a.leadershipPosition || a.role || 'Member';
      const commitment =
        a.hoursPerWeek || a.weeksPerYear
          ? ` (${a.hoursPerWeek || '?'} hrs/wk, ${a.weeksPerYear || '?'} wks/yr, ${a.years || '?'} yrs)`
          : '';
      const desc = a.description ? ` — ${a.description}` : '';
      return `- ${a.name || 'Untitled activity'}: ${role}${commitment}${desc}`;
    })
    .join('\n');
}

function formatHonors(list: unknown): string {
  const items = (list as HonorInput[] | null | undefined) ?? [];
  if (items.length === 0) return 'None listed';
  return items.map((h) => `- ${h.title || 'Untitled award'} (${h.level || 'Level not specified'})`).join('\n');
}

export async function POST(request: NextRequest) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(missingKeyResponse('AI features'), { status: 503 });
  }

  let studentId: string;
  try {
    const body = await request.json();
    studentId = body.studentId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!studentId || typeof studentId !== 'string') {
    return NextResponse.json({ error: 'studentId is required.' }, { status: 400 });
  }

  const snapshot = await getStudentSnapshot(studentId);
  const p = snapshot.academicProfile;

  const hasActivities = Array.isArray(p?.extracurriculars) && p.extracurriculars.length > 0;
  const hasHonors = Array.isArray(p?.honors_awards) && p.honors_awards.length > 0;
  const hasEssay = !!p?.personal_statement && p.personal_statement.trim().length >= 50;
  const hasDirection = !!p?.intended_major;

  const missing: string[] = [];
  if (!hasDirection) missing.push('Intended major');
  if (!hasActivities) missing.push('At least one extracurricular activity');
  if (!hasHonors) missing.push('At least one honor or award');
  if (!hasEssay) missing.push('Your personal statement');

  if (missing.length > 0) {
    return NextResponse.json({
      result: null,
      reason: 'Fill in the rest of your Academic Profile before evaluating your story.',
      missing,
    });
  }

  const profileSummary = `
Intended Major: ${p?.intended_major ?? 'Not specified'}
Career Interests: ${p?.career_interests?.join(', ') || 'Not specified'}

Extracurricular Activities:
${formatExtracurriculars(p?.extracurriculars)}

Honors & Awards:
${formatHonors(p?.honors_awards)}

Personal Statement:
${hasEssay ? p!.personal_statement : 'Not written yet'}
`.trim();

  const schoolKnowledge = getSchoolKnowledge(snapshot.profile?.school_id);
  const systemInstruction = schoolKnowledge
    ? `${NARRATIVE_FIT_SYSTEM}\n\nFacts specific to this student's school:\n${schoolKnowledge}`
    : NARRATIVE_FIT_SYSTEM;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Here is the student's profile. Identify the throughline and evaluate whether the extracurriculars, honors, and essay each reinforce it.\n\n${profileSummary}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        maxOutputTokens: 1536,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const result = JSON.parse(response.text ?? '');

    await getSupabaseAdmin()
      .from('student_academic_profiles')
      .update({ narrative_fit: { ...result, computedAt: new Date().toISOString() } })
      .eq('student_id', studentId)
      .then(({ error }) => {
        if (error) console.error('Failed to persist narrative fit:', error.message);
      });

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
