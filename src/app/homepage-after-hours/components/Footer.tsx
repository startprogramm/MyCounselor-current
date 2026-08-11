'use client';

import React from 'react';
import Link from 'next/link';

const FOOTER_SECTIONS = [
  {
    title: 'Platform',
    links: [
      { label: "Student's desk", href: '/auth/signup/student' },
      { label: "Counselor's desk", href: '/auth/signup/counselor' },
      { label: "Teacher's desk", href: '/auth/signup/teacher' },
      { label: "Parent's desk", href: '/auth/signup/parent' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: 'mailto:support@mycounselor.uz' },
      { label: 'What’s on the desk', href: '#features' },
      { label: 'Kept quiet', href: '#trust' },
      { label: 'Sign in', href: '/auth/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/homepage-after-hours' },
      { label: 'Terms of service', href: '/homepage-after-hours' },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="ah-ink-deep py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-5 border-b border-[var(--ah-line-dark)] pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="ah-mono text-[11px] text-[var(--ah-paper)]/50">Still open</p>
            <h2 className="mt-2 text-2xl">One school, one file, four people paying attention.</h2>
          </div>
          <Link href="/auth/signup" className="ah-btn ah-btn-lamp ah-focus w-fit">
            Create an account
          </Link>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/homepage-after-hours" className="ah-focus inline-flex items-center gap-3 rounded-sm">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ah-lamp)]/15">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ah-lamp)]" />
              </span>
              <span className="ah-mono text-[13px]">MyCounselor</span>
            </Link>
            <p className="mt-5 max-w-sm text-[15px] text-[var(--ah-paper)]/65">
              Started with one counselor at one school who agreed the process was too hard to
              carry alone. Built to stay that grounded as it grows.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="ah-mono text-[11px] text-[var(--ah-paper)]/45">{section.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="ah-link text-sm text-[var(--ah-paper)]/70 hover:text-[var(--ah-paper)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--ah-line-dark)] pt-6 text-sm text-[var(--ah-paper)]/50 md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} MyCounselor. All rights reserved.</p>
          <p className="ah-mono text-[11px]">mycounselor.uz</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
