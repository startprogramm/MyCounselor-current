import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient, missingKeyResponse } from '@/lib/gemini';
import { getStudentSnapshot } from '@/lib/student-context';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { parseRecommendationDetails } from '@/lib/recommendation-details';

const RECOMMENDATION_DRAFTER_SYSTEM = `You are helping a teacher get a running start on a college recommendation letter for a student. You are drafting on the teacher's behalf, in their voice as the student's teacher.

This is a FIRST DRAFT ONLY, meant to be read, fact-checked, and rewritten by the teacher before it goes anywhere. Never mention AI assistance within the letter itself.

Ground every specific claim in the details provided below — the course, the project, the lesson, the qualities and story, the "something you might not know" detail. Do not invent grades, awards, dates, or anecdotes that were not given to you. Where a section has little information, keep that part brief and general rather than fabricating specifics.

Follow this structure:
1. Opening (3-5 sentences): who you are, your subject/role, how and how long you've known the student, and a strong one-line overall impression.
2. Body paragraph 1: academic ability and habits of mind in your class, anchored in the specific course and, if given, the project or lesson mentioned.
3. Body paragraph 2: personal character — using the specific qualities the student chose and the story they told to support them, plus the "three words" and the "something you might not know" detail if it adds color.
4. Closing (2-4 sentences): a clear, confident endorsement, and an offer to provide more information. If a target college or intended major was given, you may naturally note fit.

Write in formal but warm prose, first person, as the teacher. No headers or bullet points — this is a letter. Target 350-500 words.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    draft: { type: 'STRING', description: 'The full recommendation letter draft, ready to read over and personalize.' },
  },
  required: ['draft'],
};

export async function POST(request: NextRequest) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(missingKeyResponse('AI features'), { status: 503 });
  }

  let requestId: number;
  let teacherName: string | undefined;

  try {
    const body = await request.json();
    requestId = body.requestId;
    teacherName = body.teacherName;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!requestId || typeof requestId !== 'number') {
    return NextResponse.json({ error: 'requestId is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: reqRow, error: reqError } = await supabase
    .from('requests')
    .select('id, category, student_id, student_name, teacher_name, description, recommendation_details')
    .eq('id', requestId)
    .maybeSingle();

  if (reqError || !reqRow) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  }

  if (reqRow.category !== 'recommendation') {
    return NextResponse.json({ error: 'This request is not a recommendation letter request.' }, { status: 400 });
  }

  const details = parseRecommendationDetails(reqRow.recommendation_details);
  if (!details) {
    return NextResponse.json(
      { error: 'The student has not filled in any details for this letter yet.' },
      { status: 400 }
    );
  }

  let academicContext = '';
  try {
    const snapshot = await getStudentSnapshot(reqRow.student_id);
    const ap = snapshot.academicProfile;
    if (ap) {
      academicContext = `\n\nAdditional academic context (for fit/relevance only — do not quote statistics in the letter):\n- Grade level: ${snapshot.profile?.grade_level ?? 'Not provided'}\n- Intended major: ${ap.intended_major ?? 'Not specified'}\n- Target countries: ${ap.target_countries?.join(', ') || 'Not specified'}`;
    }
  } catch {
    // Non-critical context; proceed without it.
  }

  const detailLines = [
    details.courses && `Course(s) taken with the teacher: ${details.courses}`,
    details.reasonForChoosing && `Why the student asked this teacher specifically: ${details.reasonForChoosing}`,
    details.adjectives.length > 0 &&
      `Three words the student used to describe themselves: ${details.adjectives.join(', ')}`,
    details.proudProject && `A project/piece of work they're proud of: ${details.proudProject}`,
    details.favoriteLesson && `A lesson/moment in class they enjoyed: ${details.favoriteLesson}`,
    details.attributes.length > 0 && `Qualities the student wants highlighted: ${details.attributes.join(', ')}`,
    details.attributeStory && `Supporting story for those qualities: ${details.attributeStory}`,
    details.somethingTheyDontKnow &&
      `Something the student thinks the teacher might not know: ${details.somethingTheyDontKnow}`,
    details.targetColleges && `Colleges/programs this letter is for: ${details.targetColleges}`,
    details.intendedMajor && `Intended major: ${details.intendedMajor}`,
    details.additionalInfo && `Anything else from the student: ${details.additionalInfo}`,
    reqRow.description && `What the student said this letter is for: ${reqRow.description}`,
  ]
    .filter(Boolean)
    .join('\n');

  const userMessage = `Student: ${reqRow.student_name || 'the student'}
Teacher writing the letter: ${teacherName || reqRow.teacher_name || 'the teacher'}

Details the student provided:
${detailLines || 'No details provided — keep the letter general and note where specifics would strengthen it.'}
${academicContext}

Please draft the recommendation letter.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: RECOMMENDATION_DRAFTER_SYSTEM,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const result = JSON.parse(response.text ?? '');
    return NextResponse.json({ draft: result.draft as string });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
