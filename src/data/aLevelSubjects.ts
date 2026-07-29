// Cambridge International AS & A Level subjects actually offered at Presidential School,
// Gulistan (the pilot school). Update this list if the school adds/changes subjects.

export interface ALevelSubjectOption {
  code: string;
  name: string;
}

export const aLevelSubjects: ALevelSubjectOption[] = [
  { code: '9700', name: 'Biology' },
  { code: '9609', name: 'Business' },
  { code: '9701', name: 'Chemistry' },
  { code: '9618', name: 'Computer Science' },
  { code: '9708', name: 'Economics' },
  { code: '9709', name: 'Mathematics' },
  { code: '9702', name: 'Physics' },
].sort((a, b) => a.name.localeCompare(b.name));

export function searchALevelSubjects(query: string): ALevelSubjectOption[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return aLevelSubjects;
  return aLevelSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(trimmed) || subject.code.includes(trimmed)
  );
}
