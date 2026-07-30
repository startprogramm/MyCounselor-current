'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections: FooterSection[] = [
    {
      title: 'Platform',
      links: [
        { label: 'Student Portal', href: '/student-portal-dashboard' },
        { label: 'Counselor Center', href: '/counselor-command-center' },
        { label: 'Appointments', href: '/appointment-scheduling-system' },
        { label: 'Resource Discovery', href: '/resource-discovery-center' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/resource-discovery-center' },
        { label: 'Secure Messaging', href: '/secure-communication-hub' },
        { label: 'Academic Guidance', href: '/student/guidance' },
        { label: 'Counselor Tasks', href: '/counselor/tasks' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/homepage-editorial' },
        { label: 'Terms of Service', href: '/homepage-editorial' },
        { label: 'FERPA Commitment', href: '/homepage-editorial' },
        { label: 'Accessibility', href: '/homepage-editorial' },
      ],
    },
  ];

  return (
    <footer className="relative bg-[var(--ed-ink)] text-[var(--ed-paper)]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <div className="mb-12 flex flex-col gap-6 border-b border-[rgba(239,236,228,0.16)] pb-12 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="ed-display max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
            Support that scales with your school
          </h2>
          <Link
            href="/auth/signup"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-[var(--ed-orange)] px-6 py-3.5 text-sm font-semibold text-[var(--ed-paper)] transition-opacity hover:opacity-85"
          >
            Create an account
            <Icon name="ArrowUpRightIcon" size={16} variant="outline" />
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/homepage-editorial" className="mb-4 flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 26 26" className="flex-shrink-0">
                <polygon points="13,1 25,13 13,25 1,13" fill="none" stroke="#efece4" strokeWidth="1.6" />
                <polygon points="13,7 19,13 13,19 7,13" fill="#efece4" />
              </svg>
              <span className="ed-display text-xl font-bold">MyCounselor</span>
            </Link>
            <p className="max-w-md text-sm text-[rgba(239,236,228,0.7)]">
              Empowering student success through structured guidance, counselor efficiency, and
              secure communication.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[rgba(239,236,228,0.5)]">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[rgba(239,236,228,0.8)] transition-colors hover:text-[var(--ed-orange)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[rgba(239,236,228,0.16)] pt-6 text-xs text-[rgba(239,236,228,0.55)] md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} MyCounselor. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 uppercase tracking-wide">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="ShieldCheckIcon" size={14} variant="solid" className="text-[var(--ed-orange)]" />
              FERPA-aligned
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="LockClosedIcon" size={14} variant="solid" className="text-[var(--ed-orange)]" />
              Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
