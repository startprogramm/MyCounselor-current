'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Desks', href: '#desks' },
  { label: 'On the desk', href: '#features' },
  { label: 'Kept quiet', href: '#trust' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ah-line-dark)] bg-[var(--ah-night)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/homepage-after-hours" className="ah-focus flex items-center gap-3 rounded-sm">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ah-lamp)]/15">
            <span className="h-2 w-2 rounded-full bg-[var(--ah-lamp)]" />
            <span className="absolute inset-0 rounded-full bg-[var(--ah-lamp)]/20 blur-[6px]" />
          </span>
          <span className="ah-mono text-[13px] leading-none text-[var(--ah-paper)]">MyCounselor</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="ah-link ah-focus rounded-sm text-[15px] text-[var(--ah-paper)]/75 hover:text-[var(--ah-paper)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="ah-focus ah-link rounded-sm px-2 py-2 text-[15px] font-medium text-[var(--ah-paper)]"
          >
            Log in
          </Link>
          <Link href="/auth/signup" className="ah-btn ah-btn-lamp ah-focus">
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="ah-focus flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--ah-line-dark)] text-[var(--ah-paper)] md:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          <span className="ah-mono text-xs">{isMenuOpen ? 'X' : '≡'}</span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[var(--ah-line-dark)] px-6 py-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[15px] text-[var(--ah-paper)]/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <Link href="/auth/login" className="text-[15px] font-medium text-[var(--ah-paper)]">
                Log in
              </Link>
              <Link href="/auth/signup" className="ah-btn ah-btn-lamp ah-focus w-fit">
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
