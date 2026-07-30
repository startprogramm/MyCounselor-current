'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const NAV_LINKS = [
  { label: 'Roles', href: '#roles' },
  { label: 'Programs', href: '#features' },
  { label: 'Stories', href: '#stories' },
  { label: 'Trust', href: '#trust' },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-[var(--ed-paper)]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-6 lg:px-10">
        <Link href="/homepage-editorial" className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" className="flex-shrink-0">
            <polygon points="13,1 25,13 13,25 1,13" fill="none" stroke="#111110" strokeWidth="1.6" />
            <polygon points="13,7 19,13 13,19 7,13" fill="#111110" />
          </svg>
          <span className="ed-display text-xl font-bold">MyCounselor</span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-[var(--ed-ink)] transition-opacity hover:opacity-60"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/auth/signup/student"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--ed-ink)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--ed-ink)] hover:text-[var(--ed-paper)] focus-ring"
        >
          Join Now
          <Icon name="ArrowUpRightIcon" size={15} variant="outline" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
