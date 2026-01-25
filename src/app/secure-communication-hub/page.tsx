import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import CommunicationHubInteractive from './components/CommunicationHubInteractive';

export const metadata: Metadata = {
  title: 'Secure Communication Hub - MyCounselor',
  description: 'Multi-channel messaging system with priority handling, response tracking, announcements, and emergency escalation for seamless counselor-student communication.',
};

export default function SecureCommunicationHubPage() {
  return (
    <>
      <Header />
      <CommunicationHubInteractive />
    </>
  );
}