'use client';

import React from 'react';
import Header from '@/components/common/Header';
import ResourceDiscoveryInteractive from './components/ResourceDiscoveryInteractive';

export default function ResourceDiscoveryCenterPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <ResourceDiscoveryInteractive />
      </main>
    </>
  );
}
