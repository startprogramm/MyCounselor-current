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
        { label: 'Resource Discovery', href: '/resource-discovery-center' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/resource-discovery-center' },
        { label: 'Secure Messaging', href: '/secure-communication-hub' },
        { label: 'Academic Guidance', href: '/student/guidance' },
        { label: 'Counselor Tasks', href: '/counselor/tasks' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/homepage' },
        { label: 'Terms of Service', href: '/homepage' },
        { label: 'FERPA Commitment', href: '/homepage' },
        { label: 'Accessibility', href: '/homepage' }
      ]
    }
  ];

  const contactItems = [
    {
      icon: 'EnvelopeIcon',
      label: 'support@mycounselor.org',
      href: 'mailto:support@mycounselor.org'
    },
    {
      icon: 'PhoneIcon',
      label: '+1 (800) 555-0148',
      href: 'tel:+18005550148'
    },
    {
      icon: 'MapPinIcon',
      label: 'District Partnerships Nationwide',
      href: '/homepage'
    }
  ];

  const resourceBadges = [
    { icon: 'GlobeAltIcon', label: 'Implementation Guides', href: '/resource-discovery-center' },
    { icon: 'BookOpenIcon', label: 'Training Materials', href: '/resource-discovery-center' },
    { icon: 'MegaphoneIcon', label: 'Platform Updates', href: '/secure-communication-hub' }
  ];

  return (
    <footer className={`relative overflow-hidden text-white ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#10283F] via-[#124872] to-[#1A73E8]" />
      <div className="absolute inset-0 bg-campus-grid opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">School Counseling Platform</p>
              <h2 className="text-2xl font-heading font-bold">Support That Scales with Your School Community</h2>
            </div>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-heading font-semibold text-[#124872] transition-colors hover:bg-white/90 focus-ring"
            >
              <span>Create an Account</span>
              <Icon name="ArrowRightIcon" size={18} variant="outline" />
            </Link>
          </div>
        </div>

        <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/homepage" className="mb-4 inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20">
                <Icon name="AcademicCapIcon" size={24} variant="solid" className="text-white" />
              </div>
              <span className="text-2xl font-heading font-bold">MyCounselor</span>
            </Link>

            <p className="mb-6 max-w-md text-white/80">
              Empowering student success through structured guidance, counselor efficiency, and secure communication.
            </p>

            <div className="space-y-3">
              {contactItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 text-sm text-white/85 transition-colors hover:text-white"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                    <Icon name={item.icon} size={18} variant="outline" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-base font-heading font-semibold text-white">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
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
              className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <Icon name={badge.icon} size={18} variant="outline" />
              <span>{badge.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/20 pt-6 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>(c) {currentYear} MyCounselor. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <Icon name="ShieldCheckIcon" size={16} variant="solid" className="text-[#81C995]" />
              FERPA-aligned
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="LockClosedIcon" size={16} variant="solid" className="text-[#81C995]" />
              Encrypted platform
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="ServerStackIcon" size={16} variant="solid" className="text-[#81C995]" />
              Monitored uptime
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
