export type UserRole = 'student' | 'counselor' | 'teacher' | 'parent';

export const roleDashboardRoutes: Record<UserRole, string> = {
  student: '/student/dashboard',
  counselor: '/counselor/dashboard',
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard',
};

export const roleMessagesRoutes: Record<UserRole, string> = {
  student: '/student/messages',
  counselor: '/counselor/messages',
  teacher: '/teacher/messages',
  parent: '/parent/messages',
};

export function getDashboardRouteForRole(role?: UserRole | null) {
  if (!role) return '/auth/login';
  return roleDashboardRoutes[role];
}

export function getMessagesRouteForRole(role?: UserRole | null) {
  if (!role) return '/auth/login';
  return roleMessagesRoutes[role];
}
