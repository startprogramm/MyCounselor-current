import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const ESSAY_COACH_SYSTEM = `You are an expert college admissions essay coach with 15+ years of experience helping students gain admission to top universities. You provide detailed, honest, constructive feedback that genuinely improves essays.

Your feedback must be structured, specific, and actionable. Analyze essays for:
- Authenticity and uniqueness of voice
- Clarity and organization
- Compelling storytelling
- Grammar and mechanics
- Relevance to the prompt
- Impact and memorability

Always be encouraging but honest. Point out specific lines or sentences when giving feedback.
Respond ONLY with valid JSON matching this exact schema:
{
  "overallScore": <number 1-10 with one decimal>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "rewriteSuggestions": [
    {
      "original": "<quoted sentence or phrase from the essay>",
      "suggested": "<improved version>",
      "reason": "<why this change helps>"
    }
  ],
  "scoreBreakdown": {
    "voice": <number 1-10>,
    "structure": <number 1-10>,
    "impact": <number 1-10>,
    "grammar": <number 1-10>
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

  let essay: string;
  let essayPrompt: string;
  let studentContext: Record<string, unknown> | undefined;

  try {
    const body = await request.json();
    essay = body.essay;
    essayPrompt = body.essayPrompt;
    studentContext = body.studentContext;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!essay || typeof essay !== 'string' || essay.trim().length < 50) {
    return NextResponse.json(
      { error: 'Essay must be at least 50 characters.' },
      { status: 400 }
    );
  }

  const contextBlock = studentContext
    ? `\n\nStudent context:\n- Intended major: ${studentContext.intended_major || 'Not specified'}\n- Grade: ${studentContext.gradeLevel || 'Not specified'}\n- Career interests: ${(studentContext.career_interests as string[] | undefined)?.join(', ') || 'Not specified'}`
    : '';

  const userMessage = `Essay Prompt: "${essayPrompt || 'Common App personal statement'}"

Essay (${essay.trim().split(/\s+/).length} words):
---
${essay.trim()}
---
${contextBlock}

Please analyze this college essay and provide structured JSON feedback.`;

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: ESSAY_COACH_SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    });

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 500 }
      );
    }

    const feedback = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ feedback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
