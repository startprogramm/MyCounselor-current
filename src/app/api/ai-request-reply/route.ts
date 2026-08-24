import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient, missingKeyResponse } from '@/lib/gemini';
import { getStudentSnapshot } from '@/lib/student-context';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { parseDocumentRequestDetails, getDocumentTypeLabel } from '@/lib/document-request-details';
import {
  parseAcademicSupportDetails,
  getAcademicHelpTypeLabel,
} from '@/lib/academic-support-details';
import {
  parseCollegePlanningDetails,
  getCollegeHelpTypeLabel,
} from '@/lib/college-planning-details';

const DOCUMENT_REQUEST_CATEGORY = 'document_request';
const ACADEMIC_CATEGORY = 'academic';
const COLLEGE_CATEGORY = 'college';

const SUPPORTED_CATEGORIES = [
  DOCUMENT_REQUEST_CATEGORY,
  ACADEMIC_CATEGORY,
  COLLEGE_CATEGORY,
] as const;
type SupportedCategory = (typeof SUPPORTED_CATEGORIES)[number];

const BASE_SYSTEM = `You are helping a school counselor get a running start on a reply to a student's request. You are drafting on the counselor's behalf, in their voice.

This is a FIRST DRAFT ONLY, meant to be read and edited by the counselor before it's sent. Never mention AI assistance in the reply itself.

Write a short, warm, specific reply (2-5 sentences) that a busy counselor could send almost as-is. Reference the concrete details of what the student asked for rather than writing something generic. Do not invent facts, dates, or commitments that weren't given to you — where information is missing, ask the student for it or note that you'll confirm it, rather than making something up. No greeting/salutation or sign-off — those are added separately by the UI. Return only the reply body.`;

function buildCategoryPrompt(
  category: SupportedCategory,
  reqRow: { title: string; description: string | null },
  detailLines: string
): string {
  const categoryGuidance: Record<SupportedCategory, string> = {
    [DOCUMENT_REQUEST_CATEGORY]:
      "This is a document/transcript request. Confirm what you understood they need and where it's going, and give a realistic next step (e.g. when they can expect it, or what you need from them first).",
    [ACADEMIC_CATEGORY]:
      'This is an academic support request. Acknowledge the specific subject/help type, and propose a concrete next step (e.g. a meeting time, a resource, or who else to loop in).',
    [COLLEGE_CATEGORY]:
      'This is a college-planning request. Acknowledge what they asked for and propose a concrete next step (e.g. a meeting, a resource, or what you need from them first).',
  };

  return `Request title: ${reqRow.title}
${reqRow.description ? `Student's message: ${reqRow.description}` : ''}

${detailLines || 'No additional structured details were provided.'}

${categoryGuidance[category]}`;
}

export async function POST(request: NextRequest) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(missingKeyResponse('AI features'), { status: 503 });
  }

  let requestId: number;

  try {
    const body = await request.json();
    requestId = body.requestId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!requestId || typeof requestId !== 'number') {
    return NextResponse.json({ error: 'requestId is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: reqRow, error: reqError } = await supabase
    .from('requests')
    .select(
      'id, title, description, category, student_id, document_request_details, academic_support_details, college_planning_details'
    )
    .eq('id', requestId)
    .maybeSingle();

  if (reqError || !reqRow) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  }

  if (!SUPPORTED_CATEGORIES.includes(reqRow.category as SupportedCategory)) {
    return NextResponse.json(
      { error: 'AI drafting is not available for this request category.' },
      { status: 400 }
    );
  }
  const category = reqRow.category as SupportedCategory;

  let detailLines = '';
  if (category === DOCUMENT_REQUEST_CATEGORY) {
    const details = parseDocumentRequestDetails(reqRow.document_request_details);
    detailLines = details
      ? [
          details.documentType && `Document type: ${getDocumentTypeLabel(details.documentType)}`,
          details.destination && `Where it's going: ${details.destination}`,
          details.deadline && `Deadline: ${details.deadline}`,
          details.additionalInfo && `Additional info: ${details.additionalInfo}`,
        ]
          .filter(Boolean)
          .join('\n')
      : '';
  } else if (category === ACADEMIC_CATEGORY) {
    const details = parseAcademicSupportDetails(reqRow.academic_support_details);
    detailLines = details
      ? [
          details.helpType && `Type of help: ${getAcademicHelpTypeLabel(details.helpType)}`,
          details.subject && `Subject: ${details.subject}`,
        ]
          .filter(Boolean)
          .join('\n')
      : '';
  } else {
    const details = parseCollegePlanningDetails(reqRow.college_planning_details);
    detailLines = details
      ? [
          details.helpType && `Type of help: ${getCollegeHelpTypeLabel(details.helpType)}`,
          details.colleges && `Colleges mentioned: ${details.colleges}`,
        ]
          .filter(Boolean)
          .join('\n')
      : '';
  }

  let studentContext = '';
  try {
    const snapshot = await getStudentSnapshot(reqRow.student_id);
    if (snapshot.profile) {
      studentContext = `\n\nStudent: ${snapshot.profile.first_name || 'the student'}, grade ${snapshot.profile.grade_level || 'not specified'}.`;
    }
  } catch {
    // Non-critical context; proceed without it.
  }

  const userMessage = `${buildCategoryPrompt(category, reqRow, detailLines)}${studentContext}`;

  const responseSchema = {
    type: 'OBJECT',
    properties: {
      content: { type: 'STRING', description: 'The drafted reply body, ready to review and send.' },
    },
    required: ['content'],
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: BASE_SYSTEM,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const result = JSON.parse(response.text ?? '{}');
    return NextResponse.json({ content: result.content as string });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
