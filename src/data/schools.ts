// List of schools available in the system
// In a real application, this would come from a database

export interface School {
  id: string;
  name: string;
  district: string;
  city: string;
  state: string;
  type: 'high_school' | 'middle_school' | 'elementary' | 'k12';
}

export const schools: School[] = [
  {
    id: 'sch_001',
    name: 'Lincoln High School',
    district: 'Lincoln Unified School District',
    city: 'Lincoln',
    state: 'CA',
    type: 'high_school',
  },
  {
    id: 'sch_002',
    name: 'Washington High School',
    district: 'Washington County Schools',
    city: 'Portland',
    state: 'OR',
    type: 'high_school',
  },
  {
    id: 'sch_003',
    name: 'Jefferson Academy',
    district: 'Metro Education District',
    city: 'Denver',
    state: 'CO',
    type: 'high_school',
  },
  {
    id: 'sch_004',
    name: 'Roosevelt High School',
    district: 'Central School District',
    city: 'Seattle',
    state: 'WA',
    type: 'high_school',
  },
  {
    id: 'sch_005',
    name: 'Kennedy Preparatory School',
    district: 'Kennedy Education Foundation',
    city: 'Boston',
    state: 'MA',
    type: 'high_school',
  },
  {
    id: 'sch_006',
    name: 'Madison High School',
    district: 'Madison Metropolitan School District',
    city: 'Madison',
    state: 'WI',
    type: 'high_school',
  },
  {
    id: 'sch_007',
    name: 'Franklin High School',
    district: 'Franklin County Schools',
    city: 'Columbus',
    state: 'OH',
    type: 'high_school',
  },
  {
    id: 'sch_008',
    name: 'Adams High School',
    district: 'Adams County School District',
    city: 'Phoenix',
    state: 'AZ',
    type: 'high_school',
  },
  {
    id: 'sch_009',
    name: 'Hamilton Academy',
    district: 'Hamilton Independent Schools',
    city: 'Austin',
    state: 'TX',
    type: 'high_school',
  },
  {
    id: 'sch_010',
    name: 'Monroe High School',
    district: 'Monroe Parish Schools',
    city: 'New Orleans',
    state: 'LA',
    type: 'high_school',
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
