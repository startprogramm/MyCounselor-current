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
      title: "Platform",
      links: [
        { label: "Student Portal", href: "/student-portal-dashboard" },
        { label: "Counselor Center", href: "/counselor-command-center" },
        { label: "Appointments", href: "/appointment-scheduling-system" },
        { label: "Resources", href: "/resource-discovery-center" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/resource-discovery-center" },
        { label: "Contact Us", href: "/secure-communication-hub" },
        { label: "Academic Support", href: "/secure-communication-hub" },
        { label: "FAQs", href: "/resource-discovery-center" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/homepage" },
        { label: "Terms of Service", href: "/homepage" },
        { label: "FERPA Compliance", href: "/homepage" },
        { label: "Accessibility", href: "/homepage" }
      ]
    }
  ];

  const socialLinks = [
    { icon: "facebook", href: "#", label: "Facebook" },
    { icon: "twitter", href: "#", label: "Twitter" },
    { icon: "linkedin", href: "#", label: "LinkedIn" },
    { icon: "instagram", href: "#", label: "Instagram" }
  ];

  return (
    <footer className={`bg-[#1f2937] text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link href="/homepage" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-heading font-bold">MyCounselor</span>
            </Link>

            <p className="text-white/70 mb-6 leading-relaxed max-w-md">
              Empowering student success through organized, accessible counseling support. Technology that amplifies human connection.
            </p>

            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"
                >
                  <Icon name="ShareIcon" size={20} variant="outline" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-heading font-semibold mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm">
              © {currentYear} MyCounselor. All rights reserved.
            </p>

            <div className="flex items-center space-x-6 text-sm text-white/60">
              <div className="flex items-center space-x-2">
                <Icon name="ShieldCheckIcon" size={16} variant="solid" className="text-accent" />
                <span>FERPA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="LockClosedIcon" size={16} variant="solid" className="text-accent" />
                <span>SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;