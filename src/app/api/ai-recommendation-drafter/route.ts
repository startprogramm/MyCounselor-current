import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient, missingKeyResponse } from '@/lib/gemini';
import { getStudentSnapshot } from '@/lib/student-context';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { parseRecommendationDetails, type RecommendationDetails } from '@/lib/recommendation-details';

type Angle = 'academic' | 'leadership' | 'challenge' | 'well_rounded';
type SectionKey = 'opening' | 'body1' | 'body2' | 'closing';

const ANGLE_GUIDANCE: Record<Angle, string> = {
  academic:
    'Lean into academic rigor, intellectual curiosity, and habits of mind. Anchor every claim in the specific course, project, or lesson provided rather than generic praise.',
  leadership:
    'Lean into initiative, responsibility, and how the student influences or guides the people around them. Favor moments of self-directed action over passive good behavior.',
  challenge:
    "Lean into honest growth: a real limitation, self-doubt, or setback the student mentioned, and how they worked through it anyway. Don't manufacture a struggle that wasn't given — use what's actually there, even if it's small.",
  well_rounded:
    'Balance academic strength, personal character, and outside interests evenly — no single dimension should dominate the letter.',
};

const SECTION_GUIDANCE: Record<SectionKey, string> = {
  opening:
    "Write ONLY the opening (3-5 sentences): who you are, your subject/role, how and how long you've known the student, and one strong overall impression.",
  body1:
    'Write ONLY body paragraph 1 (4-8 sentences): academic ability and habits of mind in your class, anchored in the specific course and, if given, the project or lesson mentioned.',
  body2:
    'Write ONLY body paragraph 2 (4-8 sentences): personal character, using the specific qualities the student chose and the story they told to support them.',
  closing:
    'Write ONLY the closing (2-4 sentences): a clear, confident endorsement and an offer to provide more information. If a target college or major was given, you may naturally note fit.',
};

const BASE_SYSTEM = `You are helping a teacher get a running start on a college recommendation letter for a student. You are drafting on the teacher's behalf, in their voice as the student's teacher.

This is a FIRST DRAFT ONLY, meant to be read, fact-checked, and rewritten by the teacher before it goes anywhere. Never mention AI assistance within the letter itself.

Ground every specific claim in the details provided below. Do not invent grades, awards, dates, or anecdotes that were not given to you. Where a section has little information, keep that part brief and general rather than fabricating specifics.

Write in formal but warm prose, first person, as the teacher. No headers, bullet points, salutation ("Dear...") or signature block — those are added separately. Return only the requested paragraph(s).`;

function buildDetailLines(
  details: RecommendationDetails,
  description: string | null
): string {
  return [
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
    description && `What the student said this letter is for: ${description}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function POST(request: NextRequest) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(missingKeyResponse('AI features'), { status: 503 });
  }

  let requestId: number;
  let teacherName: string | undefined;
  let angle: Angle;
  let mode: 'section' | 'full';
  let section: SectionKey | undefined;
  let otherSections: Partial<Record<SectionKey, string>> | undefined;

  try {
    const body = await request.json();
    requestId = body.requestId;
    teacherName = body.teacherName;
    angle = body.angle;
    mode = body.mode;
    section = body.section;
    otherSections = body.otherSections;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!requestId || typeof requestId !== 'number') {
    return NextResponse.json({ error: 'requestId is required.' }, { status: 400 });
  }
  if (!angle || !ANGLE_GUIDANCE[angle]) {
    return NextResponse.json({ error: 'A valid angle is required.' }, { status: 400 });
  }
  if (mode !== 'section' && mode !== 'full') {
    return NextResponse.json({ error: 'mode must be "section" or "full".' }, { status: 400 });
  }
  if (mode === 'section' && (!section || !SECTION_GUIDANCE[section])) {
    return NextResponse.json({ error: 'A valid section is required for mode "section".' }, { status: 400 });
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

  const detailLines = buildDetailLines(details, reqRow.description);

  const sectionOrder: SectionKey[] = ['opening', 'body1', 'body2', 'closing'];
  const writtenSoFar = sectionOrder
    .filter((key) => otherSections?.[key]?.trim())
    .map((key) => `[${key}]: ${otherSections![key]}`)
    .join('\n\n');
  const otherSectionsBlock = writtenSoFar
    ? `\n\nAlready written in other parts of this letter (do not repeat this content or phrasing):\n${writtenSoFar}`
    : '';

  const instruction =
    mode === 'section'
      ? SECTION_GUIDANCE[section as SectionKey]
      : 'Write the full letter as four separate parts (opening, body1, body2, closing), following the standard structure: opening establishes relationship and overall impression, body1 covers academic strengths, body2 covers personal character, closing is a clear endorsement.';

  const userMessage = `Student: ${reqRow.student_name || 'the student'}
Teacher writing the letter: ${teacherName || reqRow.teacher_name || 'the teacher'}

Angle for this letter: ${ANGLE_GUIDANCE[angle]}

Details the student provided:
${detailLines || 'No details provided — keep the letter general and note where specifics would strengthen it.'}
${academicContext}
${otherSectionsBlock}

${instruction}`;

  const responseSchema =
    mode === 'section'
      ? {
          type: 'OBJECT',
          properties: {
            content: { type: 'STRING', description: 'The requested paragraph(s), ready to read over and personalize.' },
          },
          required: ['content'],
        }
      : {
          type: 'OBJECT',
          properties: {
            opening: { type: 'STRING' },
            body1: { type: 'STRING' },
            body2: { type: 'STRING' },
            closing: { type: 'STRING' },
          },
          required: ['opening', 'body1', 'body2', 'closing'],
        };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: BASE_SYSTEM,
        maxOutputTokens: mode === 'section' ? 1536 : 4096,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const result = JSON.parse(response.text ?? '{}');
    if (mode === 'section') {
      return NextResponse.json({ content: result.content as string });
    }
    return NextResponse.json({
      sections: {
        opening: result.opening as string,
        body1: result.body1 as string,
        body2: result.body2 as string,
        closing: result.closing as string,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
