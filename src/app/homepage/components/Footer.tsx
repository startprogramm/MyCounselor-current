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

interface FooterProps {
  className?: string;
}

const Footer = ({ className = '' }: FooterProps) => {
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
        { label: 'Privacy Policy', href: '/homepage' },
        { label: 'Terms of Service', href: '/homepage' },
        { label: 'FERPA Commitment', href: '/homepage' },
        { label: 'Accessibility', href: '/homepage' },
      ],
    },
  ];

  const contactItems = [
    {
      icon: 'EnvelopeIcon',
      label: 'support@mycounselor.org',
      href: 'mailto:support@mycounselor.org',
    },
    {
      icon: 'PhoneIcon',
      label: '+1 (800) 555-0148',
      href: 'tel:+18005550148',
    },
    {
      icon: 'MapPinIcon',
      label: 'District Partnerships Nationwide',
      href: '/homepage',
    },
  ];

  const resourceBadges = [
    { icon: 'GlobeAltIcon', label: 'Implementation Guides', href: '/resource-discovery-center' },
    { icon: 'BookOpenIcon', label: 'Training Materials', href: '/resource-discovery-center' },
    { icon: 'MegaphoneIcon', label: 'Platform Updates', href: '/secure-communication-hub' },
  ];

  return (
    <footer className={`bg-[var(--lt-ink)] py-16 text-white ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-white/15 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="lt-mono text-[11px] text-white/50">Return address</p>
            <h2 className="mt-2 text-2xl">Support That Scales With Your School Community</h2>
          </div>
          <Link href="/auth/signup" className="lt-btn lt-btn-solid lt-focus w-fit">
            Create an Account
          </Link>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/homepage" className="lt-focus inline-flex items-center gap-3 rounded-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                <Icon name="AcademicCapIcon" size={20} variant="solid" className="text-white" />
              </span>
              <span className="text-lg font-semibold">MyCounselor</span>
            </Link>

            <p className="mt-5 max-w-sm text-[15px] text-white/70">
              Empowering student success through structured guidance, counselor efficiency, and
              secure communication.
            </p>

            <div className="mt-6 space-y-2.5">
              {contactItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="lt-link flex w-fit items-center gap-3 text-sm text-white/75 hover:text-white"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Icon name={item.icon} size={16} variant="outline" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="lt-mono text-[11px] text-white/50">{section.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="lt-link text-sm text-white/75 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {resourceBadges.map((badge) => (
            <Link
              key={badge.label}
              href={badge.href}
              className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Icon name={badge.icon} size={18} variant="outline" />
              <span>{badge.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/15 pt-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} MyCounselor. All rights reserved.</p>
          <div className="lt-mono flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
            <span>FERPA-aligned</span>
            <span>Encrypted platform</span>
            <span>Monitored uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
