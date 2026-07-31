// Structured detail for college planning requests — what kind of help and
// which colleges, so a counselor can triage at a glance instead of parsing
// free text every time.

export interface CollegePlanningDetails {
  helpType: string;
  colleges: string;
}

export const EMPTY_COLLEGE_PLANNING_DETAILS: CollegePlanningDetails = {
  helpType: '',
  colleges: '',
};

export const COLLEGE_HELP_TYPES = [
  { value: 'build_list', label: 'Build my college list' },
  { value: 'essay_review', label: 'Review my essay' },
  { value: 'application_status', label: 'Check my application status' },
  { value: 'financial_aid', label: 'Financial aid guidance' },
  { value: 'other', label: 'Other college planning help' },
];

export function getCollegeHelpTypeLabel(value: string): string {
  return COLLEGE_HELP_TYPES.find((t) => t.value === value)?.label || value;
}

export function parseCollegePlanningDetails(value: unknown): CollegePlanningDetails | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Partial<CollegePlanningDetails>;

  if (!raw.helpType && !raw.colleges) return undefined;

  return {
    helpType: raw.helpType || '',
    colleges: raw.colleges || '',
  };
}
