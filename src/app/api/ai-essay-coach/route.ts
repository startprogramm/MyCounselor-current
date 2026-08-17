import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient, missingKeyResponse } from '@/lib/gemini';
import { getStudentSnapshot } from '@/lib/student-context';
import { getSchoolKnowledge } from '@/lib/school-knowledge';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const ESSAY_COACH_SYSTEM = `You are the Lead Admissions Counselor and Senior Essay Strategist for MyCounselor. You evaluate university personal statements and supplemental essays with the exact rigor, nuance, and critical eye used by senior admissions officers at top-tier universities.

Core evaluation philosophy:
- Authenticity over polish: admissions committees reject essays that sound AI-written or overly sanitized. Flag over-edited, overly academic, or generic prose, and protect the student's natural teenage voice.
- Reflection over resume-dumping: an essay must reveal how the applicant thinks and grows, not just what they achieved. Flag any paragraph that reads like a list of accomplishments.
- Specificity is memorable: vague statements (e.g. "I learned the value of hard work") are forgettable. Push for concrete anchor scenes, sensory detail, and specific moments.
- Zero tolerance for AI clichés: flag words and phrases like "tapestry," "testament," "beacon," "delve," "multifaceted," "plethora," "embark," "transformative journey," or similar generic AI-voice language, wherever they appear.

Evaluate the essay across 4 dimensions: Authenticity & Voice, Reflection & Growth, Narrative Structure & Hook, and Prompt Alignment.

Give actionable, sentence-level feedback that explains why an admissions officer would hesitate at a specific line and how to fix it. Never write the essay for the student — give directional guidance (what to add, cut, or reframe) so they keep ownership of their story. Do not produce a polished replacement sentence for them to paste in.

Always be encouraging but honest, and always ground feedback in specific lines or moments from the essay, not generic advice.
When student context is provided (intended major, career interests, target countries, target university, goals), weigh whether the essay's themes actually connect to what this specific student is pursuing — call it out if the essay feels disconnected from their stated direction.`;

const DIMENSION_SCORE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    score: { type: 'NUMBER', description: 'Integer 1-100 for this dimension' },
    verdict: { type: 'STRING', description: 'One-sentence verdict on performance in this dimension' },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    areasForGrowth: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['score', 'verdict', 'strengths', 'areasForGrowth'],
};

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    overallReadinessScore: { type: 'NUMBER', description: 'Composite integer score 1-100' },
    admissionsVerdict: {
      type: 'STRING',
      description: "Headline verdict, e.g. 'Competitive for Top 20', 'Needs Structural Overhaul'",
    },
    executiveSummary: { type: 'STRING', description: "2-3 sentence overview of the essay's overall impact" },
    dimensionBreakdown: {
      type: 'OBJECT',
      properties: {
        authenticityAndVoice: DIMENSION_SCORE_SCHEMA,
        reflectionAndGrowth: DIMENSION_SCORE_SCHEMA,
        narrativeStructureAndHook: DIMENSION_SCORE_SCHEMA,
        promptAlignment: DIMENSION_SCORE_SCHEMA,
      },
      required: [
        'authenticityAndVoice',
        'reflectionAndGrowth',
        'narrativeStructureAndHook',
        'promptAlignment',
      ],
    },
    lineItemCritiques: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          originalText: { type: 'STRING', description: 'Exact sentence or snippet quoted from the essay' },
          issueType: {
            type: 'STRING',
            enum: ['AI Voice Risk', 'Generic Cliché', 'Resume Dumping', 'Vague Reflection', 'Weak Transition'],
          },
          admissionsOfficerReaction: {
            type: 'STRING',
            description: "The reader's internal reaction or concern at this line",
          },
          actionableFix: {
            type: 'STRING',
            description: 'Directional guidance for how to improve this section, not a rewritten replacement',
          },
        },
        required: ['originalText', 'issueType', 'admissionsOfficerReaction', 'actionableFix'],
      },
    },
    topPrioritiesToFix: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: '3-5 prioritized steps the student should take before submitting',
    },
  },
  required: [
    'overallReadinessScore',
    'admissionsVerdict',
    'executiveSummary',
    'dimensionBreakdown',
    'lineItemCritiques',
    'topPrioritiesToFix',
  ],
};

export async function POST(request: NextRequest) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(missingKeyResponse('AI features'), { status: 503 });
  }

  let essay: string;
  let essayPrompt: string;
  let studentId: string | undefined;
  let gradeLevel: string | undefined;
  let targetUniversity: string | undefined;
  let wordLimit: number | undefined;

  try {
    const body = await request.json();
    essay = body.essay;
    essayPrompt = body.essayPrompt;
    studentId = body.studentId;
    gradeLevel = body.gradeLevel;
    targetUniversity = body.targetUniversity;
    wordLimit = Number.isFinite(body.wordLimit) ? body.wordLimit : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!essay || typeof essay !== 'string' || essay.trim().length < 50) {
    return NextResponse.json({ error: 'Essay must be at least 50 characters.' }, { status: 400 });
  }

  let contextBlock = '';
  let schoolKnowledge = '';
  if (studentId) {
    try {
      const snapshot = await getStudentSnapshot(studentId);
      const ap = snapshot.academicProfile;
      if (ap) {
        contextBlock = `\n\nStudent context:\n- Intended major: ${ap.intended_major || 'Not specified'}\n- Grade: ${gradeLevel || snapshot.profile?.grade_level || 'Not specified'}\n- Career interests: ${ap.career_interests?.join(', ') || 'Not specified'}\n- Target countries: ${ap.target_countries?.join(', ') || 'Not specified'}\n- Additional personal context: ${ap.additional_context || 'None provided'}`;
      }
      schoolKnowledge = getSchoolKnowledge(snapshot.profile?.school_id);
    } catch {
      // Missing context shouldn't block essay feedback.
    }
  }

  const systemInstruction = schoolKnowledge
    ? `${ESSAY_COACH_SYSTEM}\n\nFacts specific to this student's school:\n${schoolKnowledge}`
    : ESSAY_COACH_SYSTEM;

  const userMessage = `Target University: ${targetUniversity?.trim() || 'Not specified'}
Essay Prompt: "${essayPrompt || 'Common App personal statement'}"
Word Limit: ${wordLimit || 650} words

Essay (${essay.trim().split(/\s+/).length} words):
---
${essay.trim()}
---
${contextBlock}

Please evaluate this essay according to your system instruction guidelines.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction,
        maxOutputTokens: 3072,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const feedback = JSON.parse(response.text ?? '');

    if (studentId && Number.isFinite(feedback?.overallReadinessScore)) {
      // Best-effort: the puzzle piece on the dashboard reads this cached
      // score so it doesn't need to re-run Gemini on every page load. A
      // failure here shouldn't block the feedback the student is waiting on.
      await getSupabaseAdmin()
        .from('student_academic_profiles')
        .update({
          essay_readiness_score: Math.round(feedback.overallReadinessScore),
          essay_readiness_computed_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .then(({ error }) => {
          if (error) console.error('Failed to persist essay readiness score:', error.message);
        });
    }

    return NextResponse.json({ feedback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
