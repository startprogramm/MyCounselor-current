import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient, missingKeyResponse } from '@/lib/gemini';
import { getStudentSnapshot } from '@/lib/student-context';
import { getSchoolKnowledge } from '@/lib/school-knowledge';

const BASE_SYSTEM_PROMPT = `You are the AI Counselor for MyCounselor, a school counseling platform. You are warm, empathetic, professional, and knowledgeable about:

- Academic planning and course selection
- College preparation, applications, and essay guidance
- Career exploration and planning
- Social-emotional support and coping strategies
- Study skills, time management, and organization
- Managing stress, anxiety, and academic pressure
- Scholarship and financial aid guidance
- Extracurricular activities and leadership opportunities
- Major and career path exploration

Guidelines:
- Be supportive, encouraging, and non-judgmental at all times
- Give practical, actionable advice appropriate for high school students
- Keep responses clear and focused — not overly long
- Use a friendly but professional tone
- If a student mentions a serious concern (mental health crisis, self-harm, abuse, safety), always prioritize their wellbeing. Encourage them to speak with their human school counselor or a trusted adult immediately, and provide crisis resources (988 Suicide & Crisis Lifeline: call or text 988)
- You complement but do not replace the student's human school counselor — regularly remind them their counselor is available for deeper, personalized support
- When you don't know something specific to their school or situation, say so and suggest they ask their counselor
- When you already know something about this student from the context below (their goals, intended major, grade), use it naturally to make advice specific to them — don't ask them to repeat information you already have`;

interface MessageParam {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  firstName?: string;
  gradeLevel?: string;
}

async function buildSystemPrompt(studentId: string | undefined, fallback: UserContext | undefined) {
  if (!studentId) {
    return fallback?.firstName
      ? `${BASE_SYSTEM_PROMPT}\n\nYou are currently speaking with ${fallback.firstName}${fallback.gradeLevel ? `, a ${fallback.gradeLevel} student` : ''}.`
      : BASE_SYSTEM_PROMPT;
  }

  try {
    const snapshot = await getStudentSnapshot(studentId);
    const lines: string[] = [];

    if (snapshot.profile?.first_name) {
      lines.push(
        `Name: ${snapshot.profile.first_name}${snapshot.profile.grade_level ? ` (${snapshot.profile.grade_level})` : ''}${snapshot.profile.school_name ? ` at ${snapshot.profile.school_name}` : ''}`
      );
    }

    const ap = snapshot.academicProfile;
    if (ap?.intended_major) lines.push(`Intended major: ${ap.intended_major}`);
    if (ap?.career_interests?.length)
      lines.push(`Career interests: ${ap.career_interests.join(', ')}`);
    if (ap?.target_countries?.length)
      lines.push(`Target countries for college: ${ap.target_countries.join(', ')}`);
    if (ap?.preferred_college_type)
      lines.push(`Preferred college type: ${ap.preferred_college_type}`);

    if (snapshot.activeGoals.length) {
      const goalLines = snapshot.activeGoals
        .map(
          (g) => `"${g.title}" (${g.progress}% done, due ${g.deadline}, priority: ${g.priority})`
        )
        .join('; ');
      lines.push(`Active goals they're tracking: ${goalLines}`);
    }

    const schoolKnowledge = getSchoolKnowledge(snapshot.profile?.school_id);

    let resourcesBlock = '';
    if (snapshot.resources.length) {
      const resourceLines = snapshot.resources
        .map((r) => `- "${r.title}" (${r.category}): ${r.description}`)
        .join('\n');
      resourcesBlock = `\n\nResources this school's counselors have published (point students to specific ones by name when relevant, and mention they can find the full list at /student/guidance — don't invent resources that aren't listed here):\n${resourceLines}`;
    }

    if (lines.length === 0 && !schoolKnowledge && !resourcesBlock) {
      return fallback?.firstName
        ? `${BASE_SYSTEM_PROMPT}\n\nYou are currently speaking with ${fallback.firstName}${fallback.gradeLevel ? `, a ${fallback.gradeLevel} student` : ''}.`
        : BASE_SYSTEM_PROMPT;
    }

    const studentBlock = lines.length
      ? `\n\nWhat you know about the student you're speaking with:\n${lines.map((l) => `- ${l}`).join('\n')}`
      : '';
    const schoolBlock = schoolKnowledge ? `\n\nFacts specific to this student's school:\n${schoolKnowledge}` : '';

    return `${BASE_SYSTEM_PROMPT}${studentBlock}${schoolBlock}${resourcesBlock}`;
  } catch {
    // Student lookup is a nice-to-have — never block the chat on it failing.
    return fallback?.firstName
      ? `${BASE_SYSTEM_PROMPT}\n\nYou are currently speaking with ${fallback.firstName}${fallback.gradeLevel ? `, a ${fallback.gradeLevel} student` : ''}.`
      : BASE_SYSTEM_PROMPT;
  }
}

export async function POST(request: NextRequest) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(missingKeyResponse('AI Counselor'), { status: 503 });
  }

  let messages: MessageParam[];
  let userContext: UserContext | undefined;
  let studentId: string | undefined;

  try {
    const body = await request.json();
    messages = body.messages;
    userContext = body.userContext;
    studentId = body.studentId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
  }

  const systemInstruction = await buildSystemPrompt(studentId, userContext);

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.content }],
  }));

  try {
    const stream = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 1024,
      },
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
