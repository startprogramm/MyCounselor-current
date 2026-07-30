// Structured "brag sheet" style detail collected for recommendation-letter
// requests, modeled on Common App's teacher brag sheet questionnaire —
// concrete, specific detail is what turns a generic letter into a strong one.

export interface RecommendationDetails {
  courses: string;
  reasonForChoosing: string;
  adjectives: string[];
  proudProject: string;
  favoriteLesson: string;
  attributes: string[];
  attributeStory: string;
  somethingTheyDontKnow: string;
  targetColleges: string;
  intendedMajor: string;
  deadline: string;
  preferredName: string;
  additionalInfo: string;
}

export const EMPTY_RECOMMENDATION_DETAILS: RecommendationDetails = {
  courses: '',
  reasonForChoosing: '',
  adjectives: ['', '', ''],
  proudProject: '',
  favoriteLesson: '',
  attributes: [],
  attributeStory: '',
  somethingTheyDontKnow: '',
  targetColleges: '',
  intendedMajor: '',
  deadline: '',
  preferredName: '',
  additionalInfo: '',
};

// The attributes admissions offices commonly ask recommenders to speak to —
// straight from Common App's teacher brag sheet.
export const RECOMMENDATION_ATTRIBUTES = [
  'Academic achievement',
  'Intellectual promise',
  'Quality of writing',
  'Creative and original thought',
  'Productive class discussion',
  'Respect accorded by faculty',
  'Disciplined work habits',
  'Maturity',
  'Motivation',
  'Leadership',
  'Integrity',
  'Reaction to setbacks',
  'Concern for others',
  'Self-confidence',
  'Initiative',
  'Independence',
];

export const MAX_RECOMMENDATION_ATTRIBUTES = 2;

export function parseRecommendationDetails(value: unknown): RecommendationDetails | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Partial<RecommendationDetails>;

  const hasAnyContent =
    raw.courses ||
    raw.reasonForChoosing ||
    (raw.adjectives && raw.adjectives.some(Boolean)) ||
    raw.proudProject ||
    raw.favoriteLesson ||
    (raw.attributes && raw.attributes.length > 0) ||
    raw.attributeStory ||
    raw.somethingTheyDontKnow ||
    raw.targetColleges ||
    raw.intendedMajor ||
    raw.deadline ||
    raw.additionalInfo;

  if (!hasAnyContent) return undefined;

  return {
    courses: raw.courses || '',
    reasonForChoosing: raw.reasonForChoosing || '',
    adjectives: Array.isArray(raw.adjectives) ? raw.adjectives.filter(Boolean) : [],
    proudProject: raw.proudProject || '',
    favoriteLesson: raw.favoriteLesson || '',
    attributes: Array.isArray(raw.attributes) ? raw.attributes : [],
    attributeStory: raw.attributeStory || '',
    somethingTheyDontKnow: raw.somethingTheyDontKnow || '',
    targetColleges: raw.targetColleges || '',
    intendedMajor: raw.intendedMajor || '',
    deadline: raw.deadline || '',
    preferredName: raw.preferredName || '',
    additionalInfo: raw.additionalInfo || '',
  };
}
