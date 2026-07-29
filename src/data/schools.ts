// List of schools available in the system
// In a real application, this would come from a database

export interface School {
  id: string;
  name: string;
  district: string;
  city: string;
  state: string;
  type: 'high_school' | 'middle_school' | 'elementary' | 'k12';
  code?: string; // School verification code
}

export const schools: School[] = [
  {
    id: 'sch_presidential',
    name: 'Presidential School in Gulistan',
    district: 'Presidential Schools',
    city: 'Gulistan',
    state: 'Uzbekistan',
    type: 'k12',
    code: 'esb2021g',
  },
];

// Helper function to get school by ID
export const getSchoolById = (id: string): School | undefined => {
  return schools.find(school => school.id === id);
};

// Helper function to get school display name with location
export const getSchoolDisplayName = (school: School): string => {
  return `${school.name} - ${school.city}, ${school.state}`;
};

// Helper function to search schools
export const searchSchools = (query: string): School[] => {
  const lowerQuery = query.toLowerCase();
  return schools.filter(
    school =>
      school.name.toLowerCase().includes(lowerQuery) ||
      school.city.toLowerCase().includes(lowerQuery) ||
      school.district.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to validate school code
export const validateSchoolCode = (schoolId: string, code: string): boolean => {
  const school = getSchoolById(schoolId);
  if (!school || !school.code) return false;
  return school.code.toLowerCase() === code.toLowerCase();
};

// Helper function to check if school requires a code
export const schoolRequiresCode = (schoolId: string): boolean => {
  const school = getSchoolById(schoolId);
  return school?.code !== undefined;
};
