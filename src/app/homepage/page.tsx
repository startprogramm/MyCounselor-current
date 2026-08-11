import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import HomepageInteractive from './components/HomepageInteractive';
import './letter.css';
import { sourceSerif, sourceSans, jetbrainsMono, caveat } from './fonts';

export const metadata: Metadata = {
  title: 'Homepage - MyCounselor',
  description: 'Transform school counseling into an organized, hopeful journey. MyCounselor bridges student needs with counselor expertise through technology that amplifies human connection. Access student portal, counselor center, and academic resources.',
};

export default function Homepage() {
  return (
    <main
      className={`min-h-screen bg-background ${sourceSerif.variable} ${sourceSans.variable} ${jetbrainsMono.variable} ${caveat.variable}`}
    >
      <Header />
      <div className="letter-page pt-16">
        <HomepageInteractive />
      </div>
    </main>
  );
}