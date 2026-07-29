// Cambridge International AS & A Level subjects with their official subject codes.
// Source: https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-advanced/cambridge-international-as-and-a-levels/subjects/
// This list is a starting set fetched from the syllabus page — confirm against the school's
// actually-offered subjects and adjust as needed.

export interface ALevelSubjectOption {
  code: string;
  name: string;
}

export const aLevelSubjects: ALevelSubjectOption[] = [
  { code: '9706', name: 'Accounting' },
  { code: '8679', name: 'Afrikaans' },
  { code: '9680', name: 'Arabic' },
  { code: '8680', name: 'Arabic Language' },
  { code: '9479', name: 'Art & Design' },
  { code: '9484', name: 'Biblical Studies' },
  { code: '9700', name: 'Biology' },
  { code: '9609', name: 'Business' },
  { code: '9701', name: 'Chemistry' },
  { code: '8238', name: 'Chinese Language' },
  { code: '9868', name: 'Chinese Language & Literature' },
  { code: '9274', name: 'Classical Studies' },
  { code: '9618', name: 'Computer Science' },
  { code: '9705', name: 'Design & Technology' },
  { code: '9481', name: 'Digital Media & Design' },
  { code: '9482', name: 'Drama' },
  { code: '9708', name: 'Economics' },
  { code: '8021', name: 'English General Paper' },
  { code: '9093', name: 'English Language' },
  { code: '8695', name: 'English Language and Literature' },
  { code: '9695', name: 'English Literature' },
  { code: '8291', name: 'Environmental Management' },
  { code: '9981', name: 'European History' },
  { code: '8028', name: 'French Language' },
  { code: '9898', name: 'French Language & Literature' },
  { code: '9696', name: 'Geography' },
  { code: '8027', name: 'German Language' },
  { code: '9897', name: 'German Language & Literature' },
  { code: '9239', name: 'Global Perspectives & Research' },
  { code: '9487', name: 'Hinduism' },
  { code: '9489', name: 'History' },
  { code: '9626', name: 'Information Technology' },
  { code: '9982', name: 'International History' },
  { code: '9488', name: 'Islamic Studies' },
  { code: '9084', name: 'Law' },
  { code: '9693', name: 'Marine Science' },
  { code: '9709', name: 'Mathematics' },
  { code: '9231', name: 'Further Mathematics' },
  { code: '9607', name: 'Media Studies' },
  { code: '9483', name: 'Music' },
  { code: '9702', name: 'Physics' },
  { code: '8684', name: 'Portuguese Language' },
  { code: '9718', name: 'Portuguese' },
  { code: '9990', name: 'Psychology' },
  { code: '9699', name: 'Sociology' },
  { code: '9844', name: 'Spanish Language & Literature' },
].sort((a, b) => a.name.localeCompare(b.name));

export function searchALevelSubjects(query: string): ALevelSubjectOption[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return aLevelSubjects;
  return aLevelSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(trimmed) || subject.code.includes(trimmed)
  );
}
