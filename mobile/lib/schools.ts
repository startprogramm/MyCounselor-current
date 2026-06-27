export interface School {
  id: string;
  name: string;
  district: string;
  city: string;
  state: string;
  type: 'high_school' | 'middle_school' | 'elementary' | 'k12';
  code?: string;
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

export const getSchoolById = (id: string): School | undefined =>
  schools.find(s => s.id === id);

export const getSchoolDisplayName = (school: School): string =>
  `${school.name} - ${school.city}, ${school.state}`;

export const validateSchoolCode = (schoolId: string, code: string): boolean => {
  const school = getSchoolById(schoolId);
  if (!school || !school.code) return false;
  return school.code.toLowerCase() === code.toLowerCase();
};

export const schoolRequiresCode = (schoolId: string): boolean => {
  const school = getSchoolById(schoolId);
  return school?.code !== undefined;
};
