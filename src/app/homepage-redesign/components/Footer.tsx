'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
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
        { label: 'Privacy Policy', href: '/homepage-redesign' },
        { label: 'Terms of Service', href: '/homepage-redesign' },
        { label: 'FERPA Commitment', href: '/homepage-redesign' },
        { label: 'Accessibility', href: '/homepage-redesign' },
      ],
    },
  ];

  const contactItems = [
    { icon: 'EnvelopeIcon', label: 'support@mycounselor.org', href: 'mailto:support@mycounselor.org' },
    { icon: 'PhoneIcon', label: '+1 (800) 555-0148', href: 'tel:+18005550148' },
    { icon: 'MapPinIcon', label: 'Gulistan, Uzbekistan', href: '/homepage-redesign' },
  ];

  return (
    <footer className="relative overflow-hidden bg-[var(--rd-ink)] text-[var(--rd-paper)]">
      <div className="rd-grain opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 rounded-2xl border border-dashed rd-hairline-light p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            <p className="rd-mono mb-2 text-xs uppercase tracking-[0.16em] text-[rgba(251,249,244,0.6)]">
              School counseling platform
            </p>
            <h2 className="rd-display text-2xl font-semibold">Support that scales with your school</h2>
          </div>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--rd-seal)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--rd-seal-bright)] focus-ring"
          >
            Create an account
            <Icon name="ArrowRightIcon" size={16} variant="outline" />
          </Link>
        </div>

        <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/homepage-redesign" className="mb-4 inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(185,134,46,0.2)] text-[var(--rd-seal-bright)] rd-display text-sm font-semibold">
                MC
              </div>
              <span className="rd-display text-xl font-semibold">MyCounselor</span>
            </Link>
            <p className="mb-6 max-w-md text-sm text-[rgba(251,249,244,0.7)]">
              Empowering student success through structured guidance, counselor efficiency, and
              secure communication.
            </p>
            <div className="space-y-2.5">
              {contactItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 text-sm text-[rgba(251,249,244,0.75)] transition-colors hover:text-[var(--rd-paper)]"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Icon name={item.icon} size={16} variant="outline" />
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="rd-mono mb-4 text-xs uppercase tracking-[0.12em] text-[rgba(251,249,244,0.5)]">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[rgba(251,249,244,0.75)] transition-colors hover:text-[var(--rd-paper)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t rd-hairline-light pt-6 text-xs text-[rgba(251,249,244,0.55)] md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} MyCounselor. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 rd-mono uppercase tracking-[0.06em]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="ShieldCheckIcon" size={14} variant="solid" className="text-[var(--rd-cambridge)]" />
              FERPA-aligned
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="LockClosedIcon" size={14} variant="solid" className="text-[var(--rd-cambridge)]" />
              Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
