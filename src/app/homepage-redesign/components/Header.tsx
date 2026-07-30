'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const NAV_LINKS = [
  { label: 'Roles', href: '#roles' },
  { label: 'Inside the File', href: '#features' },
  { label: 'Case Notes', href: '#stories' },
  { label: 'Trust', href: '#trust' },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b rd-hairline bg-[rgba(251,249,244,0.95)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/homepage-redesign" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--rd-ink)] text-[var(--rd-seal-bright)] rd-display text-base font-semibold">
            MC
          </div>
          <div className="leading-tight">
            <p className="rd-display text-lg font-semibold text-[var(--rd-ink)]">MyCounselor</p>
            <p className="rd-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(20,33,61,0.5)]">
              Gulistan Pilot Program
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rd-mono text-xs uppercase tracking-[0.14em] text-[rgba(20,33,61,0.6)] transition-colors hover:text-[var(--rd-ink)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/auth/login"
            className="hidden rounded-full border rd-hairline px-4 py-2 text-sm font-medium text-[var(--rd-ink)] transition-colors hover:bg-[rgba(20,33,61,0.05)] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup/student"
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--rd-seal)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--rd-seal-bright)]"
          >
            <Icon name="FolderPlusIcon" size={16} variant="solid" />
            Open a file
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
