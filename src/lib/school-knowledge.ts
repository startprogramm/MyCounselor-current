import { aLevelSubjects } from '@/data/aLevelSubjects';

// Static institutional knowledge, keyed by school_id, for grounding AI features in
// facts a general model would get wrong or wouldn't know. Add a new school's block
// here as MyCounselor expands past the pilot school.

const PRESIDENTIAL_SCHOOL_KNOWLEDGE = `School: Presidential School in Gulistan, Uzbekistan (Cambridge Pathway, K-12, ends at Grade 11 — there is no Grade 12 here).

Because the school ends at Grade 11, its Cambridge timeline is compressed one year earlier than the international norm most sources describe (IGCSE~Grade 10, AS~Grade 11, A Level~Grade 12 elsewhere). At THIS school:
- Grade 9 = IGCSE year
- Grade 10 = AS Level year
- Grade 11 = A Level year — this is the student's FINAL year, not a "sophomore/junior" year. A Grade 10 or 11 student here is much closer to applying than the numeral alone would suggest under the generic mapping — do not assume they have extra years to improve.

Grading scales: IGCSE is A*–G. Standalone AS Level is lowercase a–e. Full A Level is A*–E.

Predicted grades: final A Level results are published after most university application deadlines, so Grade 11 students apply with a "predicted grade" (issued by the school, not self-reported) rather than a final one. Treat a predicted grade as a real, standard part of this school's applications — not a caveat or a sign of an incomplete profile.

Subjects actually offered at this school (don't suggest others as if the student could take them here): ${aLevelSubjects.map((s) => `${s.name} (${s.code})`).join(', ')}.

Context: students are based in Uzbekistan and typically apply internationally (US, UK/UCAS, Canada, Europe), so English is usually not their first language — an English proficiency test score (IELTS/TOEFL/Duolingo) is a real, load-bearing part of their profile, not an afterthought.`;

const SCHOOL_KNOWLEDGE: Record<string, string> = {
  sch_presidential: PRESIDENTIAL_SCHOOL_KNOWLEDGE,
};

export function getSchoolKnowledge(schoolId: string | null | undefined): string {
  if (!schoolId) return '';
  return SCHOOL_KNOWLEDGE[schoolId] ?? '';
}
