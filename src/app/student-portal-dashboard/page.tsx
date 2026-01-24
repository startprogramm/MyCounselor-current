import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import StudentPortalInteractive from './components/StudentPortalInteractive';

export const metadata: Metadata = {
  title: 'Student Portal Dashboard - CounselConnect',
  description: 'Access your personalized student portal with appointments, resources, goals, achievements, and peer support community. Your centralized hub for academic guidance and college/career planning.',
};

export default function StudentPortalDashboardPage() {
  return (
    <>
      <Header />
      <StudentPortalInteractive />
    </>
  );
}