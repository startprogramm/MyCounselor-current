// Structured detail for academic support requests — what kind of help and
// which subject, so a counselor can triage at a glance instead of parsing
// free text every time.

export interface AcademicSupportDetails {
  helpType: string;
  subject: string;
}

export const EMPTY_ACADEMIC_SUPPORT_DETAILS: AcademicSupportDetails = {
  helpType: '',
  subject: '',
};

export const ACADEMIC_HELP_TYPES = [
  { value: 'tutoring', label: 'Extra help / tutoring in a subject' },
  { value: 'subject_change', label: 'Changing a subject or course' },
  { value: 'retake', label: 'Retaking a subject' },
  { value: 'study_skills', label: 'Study skills or time management' },
  { value: 'other', label: 'Other academic support' },
];

export function getAcademicHelpTypeLabel(value: string): string {
  return ACADEMIC_HELP_TYPES.find((t) => t.value === value)?.label || value;
}

export function parseAcademicSupportDetails(value: unknown): AcademicSupportDetails | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Partial<AcademicSupportDetails>;

  if (!raw.helpType && !raw.subject) return undefined;

  return {
    helpType: raw.helpType || '',
    subject: raw.subject || '',
  };
}
