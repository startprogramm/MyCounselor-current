import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient, missingKeyResponse } from '@/lib/gemini';
import { getStudentSnapshot } from '@/lib/student-context';
import { getSchoolKnowledge } from '@/lib/school-knowledge';

const ESSAY_COACH_SYSTEM = `You are an expert college admissions essay coach with 15+ years of experience helping students gain admission to top universities. You provide detailed, honest, constructive feedback that genuinely improves essays.

Your feedback must be structured, specific, and actionable. Analyze essays for:
- Authenticity and uniqueness of voice
- Clarity and organization
- Compelling storytelling
- Grammar and mechanics
- Relevance to the prompt
- Impact and memorability

Always be encouraging but honest. Point out specific lines or sentences when giving feedback.
When student context is provided (intended major, career interests, target countries, goals), weigh whether the essay's themes actually connect to what this specific student is pursuing — call it out if the essay feels disconnected from their stated direction.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    overallScore: { type: 'NUMBER', description: '1-10 with one decimal' },
    summary: { type: 'STRING', description: '2-3 sentence overall assessment' },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    improvements: { type: 'ARRAY', items: { type: 'STRING' } },
    rewriteSuggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          original: { type: 'STRING' },
          suggested: { type: 'STRING' },
          reason: { type: 'STRING' },
        },
        required: ['original', 'suggested', 'reason'],
      },
    },
    scoreBreakdown: {
      type: 'OBJECT',
      properties: {
        voice: { type: 'NUMBER' },
        structure: { type: 'NUMBER' },
        impact: { type: 'NUMBER' },
        grammar: { type: 'NUMBER' },
      },
      required: ['voice', 'structure', 'impact', 'grammar'],
    },
  },
  required: [
    'overallScore',
    'summary',
    'strengths',
    'improvements',
    'rewriteSuggestions',
    'scoreBreakdown',
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

  try {
    const body = await request.json();
    essay = body.essay;
    essayPrompt = body.essayPrompt;
    studentId = body.studentId;
    gradeLevel = body.gradeLevel;
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

  const userMessage = `Essay Prompt: "${essayPrompt || 'Common App personal statement'}"

Essay (${essay.trim().split(/\s+/).length} words):
---
${essay.trim()}
---
${contextBlock}

Please analyze this college essay.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const feedback = JSON.parse(response.text ?? '');
    return NextResponse.json({ feedback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
