import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import HomepageInteractive from './components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'Homepage - MyCounselor',
  description: 'Transform school counseling into an organized, hopeful journey. MyCounselor bridges student needs with counselor expertise through technology that amplifies human connection. Access student portal, counselor center, and academic resources.',
};

export default function Homepage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <HomepageInteractive />
      </div>
    </main>
  );
}