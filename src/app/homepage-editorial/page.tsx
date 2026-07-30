import type { Metadata } from 'next';
import './editorial.css';
import { archivo, manrope } from './fonts';
import HomepageEditorialInteractive from './components/HomepageEditorialInteractive';

export const metadata: Metadata = {
  title: 'Homepage Editorial Concept - MyCounselor',
  description: 'Internal design concept preview — not the live homepage.',
  robots: { index: false, follow: false },
};

export default function HomepageEditorialPage() {
  return (
    <main className={`homepage-editorial min-h-screen ${archivo.variable} ${manrope.variable}`}>
      <HomepageEditorialInteractive />
    </main>
  );
}
