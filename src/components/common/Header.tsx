'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ZoomControl from '@/components/ui/ZoomControl';
import SkipLink from '@/components/ui/SkipLink';
import { useAuth } from '@/context/AuthContext';
import { getDashboardRouteForRole, getMessagesRouteForRole } from '@/lib/role-routes';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
];

interface NavItem {
  label: string;
  href: string;
}

interface DropdownItem {
  label: string;
  href: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  { label: 'Student Portal', href: '/student-portal-dashboard' },
  { label: 'Counselor Center', href: '/counselor-command-center' },
  { label: 'Resources', href: '/resource-discovery-center' },
];

const toolsDropdownItems: DropdownItem[] = [
  {
    label: 'AI Counselor',
    href: '/tools/ai-counselor',
    icon: 'SparklesIcon',
    description: 'Get AI-powered guidance and advice'
  },
  {
    label: 'Major Finder',
    href: '/tools/major-finder',
    icon: 'AcademicCapIcon',
    description: 'Discover your ideal college major'
  },
  {
    label: 'Schedule',
    href: '/appointment-scheduling-system',
    icon: 'CalendarIcon',
    description: 'Book appointments with counselors'
  },
];

const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mycounselor_language') || 'en';
    }
    return 'en';
  });

  const currentLangData = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  const selectLanguage = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem('mycounselor_language', code);
    setIsLangMenuOpen(false);
  };

  const dashboardRoute = getDashboardRouteForRole(user?.role);
  const primaryActionRoute = getMessagesRouteForRole(user?.role);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    router.push('/homepage');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  // Close language menu when clicking outside
  useEffect(() => {
    if (!isLangMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangMenuOpen]);

  return (
    <>
      <SkipLink />
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 dark:bg-[#292929]/95 backdrop-blur-md shadow-sm'
          : 'bg-white/90 dark:bg-[#1F1F1F]/90 backdrop-blur-sm'
          } border-b border-[#DADCE0] dark:border-[#3C4043]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/homepage"
              className="flex items-center space-x-2 focus-ring rounded-lg"
              aria-label="MyCounselor Home"
            >
              <div className="w-10 h-10 bg-[#1A73E8] rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Icon name="AcademicCapIcon" size={24} className="text-white" variant="solid" />
              </div>
              <span className="text-xl font-bold text-[#202124] dark:text-[#E8EAED] font-heading">
                MyCounselor
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors focus-ring rounded-md px-2 py-1"
                >
                  {item.label}
                </Link>
              ))}

              {/* Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsToolsDropdownOpen(true)}
                onMouseLeave={() => setIsToolsDropdownOpen(false)}
              >
                <button
                  className="flex items-center space-x-1 text-sm font-medium text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors focus-ring rounded-md px-2 py-1"
                  aria-expanded={isToolsDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Tools</span>
                  <Icon
                    name="ChevronDownIcon"
                    size={16}
                    variant="outline"
                    className={`transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#292929] rounded-xl shadow-lg border border-[#DADCE0] dark:border-[#3C4043] py-2 transition-all duration-200 ${
                    isToolsDropdownOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                  {toolsDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-start space-x-3 px-4 py-3 hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors"
                      onClick={() => setIsToolsDropdownOpen(false)}
                    >
                      <div className="w-10 h-10 bg-[#1A73E8] rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <Icon name={item.icon} size={20} variant="outline" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#202124] dark:text-[#E8EAED]">{item.label}</p>
                        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Zoom, Theme Toggle & Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Language Selector */}
              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1 px-2 py-1.5 rounded-lg text-sm font-medium text-[#5F6368] dark:text-[#9AA0A6] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors focus-ring"
                  aria-label="Select language"
                  aria-expanded={isLangMenuOpen ? 'true' : 'false'}
                  aria-haspopup="listbox"
                >
                  <span className="text-base leading-none">{currentLangData.flag}</span>
                  <span className="uppercase">{currentLangData.code}</span>
                  <Icon
                    name="ChevronDownIcon"
                    size={14}
                    variant="outline"
                    className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`absolute top-full right-0 mt-2 w-40 bg-white dark:bg-[#292929] rounded-lg shadow-lg border border-[#DADCE0] dark:border-[#3C4043] py-1 z-50 transition-all duration-200 ${
                    isLangMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                  role="listbox"
                  aria-label="Language options"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={currentLang === lang.code ? 'true' : 'false'}
                      onClick={() => selectLanguage(lang.code)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors ${
                        currentLang === lang.code
                          ? 'bg-[#E8F0FE] dark:bg-[#1A3A5C] text-[#1A73E8] dark:text-[#8AB4F8] font-medium'
                          : 'text-[#202124] dark:text-[#E8EAED] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043]'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-px h-6 bg-[#DADCE0] dark:bg-[#3C4043]" />
              <ZoomControl />
              <div className="w-px h-6 bg-[#DADCE0] dark:bg-[#3C4043]" />
              <ThemeToggle />
              {!isLoading && user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors focus-ring"
                  >
                    <div className="w-8 h-8 bg-[#1A73E8] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-[#202124] dark:text-[#E8EAED]">
                      {user.firstName}
                    </span>
                    <Icon name="ChevronDownIcon" size={16} variant="outline" className="text-[#5F6368]" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#292929] rounded-lg shadow-lg border border-[#DADCE0] dark:border-[#3C4043] py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#DADCE0] dark:border-[#3C4043]">
                        <p className="text-sm font-medium text-[#202124] dark:text-[#E8EAED]">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{user.email}</p>
                        {user.schoolName && (
                          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-1">{user.schoolName}</p>
                        )}
                      </div>
                      <Link
                        href={dashboardRoute}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-[#202124] dark:text-[#E8EAED] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043]"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name="HomeIcon" size={16} variant="outline" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={primaryActionRoute}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-[#202124] dark:text-[#E8EAED] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043]"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name="ChatBubbleLeftRightIcon" size={16} variant="outline" />
                        <span>Messages</span>
                      </Link>
                      <div className="border-t border-[#DADCE0] dark:border-[#3C4043] my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-[#D93025] dark:text-[#F28B82] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] w-full"
                      >
                        <Icon name="ArrowRightOnRectangleIcon" size={16} variant="outline" />
                        <span>Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-[#1A73E8] dark:text-[#8AB4F8] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors focus-ring rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium bg-[#1A73E8] text-white rounded-lg hover:bg-[#185ABC] transition-all duration-300 shadow-sm hover:shadow-md focus-ring"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-2 md:hidden">
              {/* Language selector (compact) */}
              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1 px-2 py-1.5 rounded-lg text-sm font-medium text-[#5F6368] dark:text-[#9AA0A6] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors"
                  aria-label="Select language"
                  aria-expanded={isLangMenuOpen ? 'true' : 'false'}
                  aria-haspopup="listbox"
                >
                  <span className="text-base leading-none">{currentLangData.flag}</span>
                </button>
                <div
                  className={`absolute top-full right-0 mt-2 w-40 bg-white dark:bg-[#292929] rounded-lg shadow-lg border border-[#DADCE0] dark:border-[#3C4043] py-1 z-50 transition-all duration-200 ${
                    isLangMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                  role="listbox"
                  aria-label="Language options"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={currentLang === lang.code ? 'true' : 'false'}
                      onClick={() => selectLanguage(lang.code)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors ${
                        currentLang === lang.code
                          ? 'bg-[#E8F0FE] dark:bg-[#1A3A5C] text-[#1A73E8] dark:text-[#8AB4F8] font-medium'
                          : 'text-[#202124] dark:text-[#E8EAED] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043]'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <ThemeToggle />
              <button
                type="button"
                className="p-2 rounded-lg text-[#5F6368] dark:text-[#9AA0A6] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] focus-ring transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <Icon
                  name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
                  size={24}
                  variant="outline"
                />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            id="mobile-menu"
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="py-4 border-t border-[#DADCE0] dark:border-[#3C4043]">
              <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 text-sm font-medium text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] rounded-lg transition-all duration-200 focus-ring ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                      }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Tools Section */}
                <div className={`transition-all duration-200 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                  style={{ transitionDelay: `${navItems.length * 50}ms` }}
                >
                  <button
                    onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                    className="w-full px-4 py-3 text-sm font-medium text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] rounded-lg transition-all duration-200 focus-ring flex items-center justify-between"
                  >
                    <span>Tools</span>
                    <Icon
                      name="ChevronDownIcon"
                      size={16}
                      variant="outline"
                      className={`transition-transform duration-200 ${isMobileToolsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isMobileToolsOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="pl-4 space-y-1 py-2">
                      {toolsDropdownItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] rounded-lg transition-colors"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsMobileToolsOpen(false);
                          }}
                        >
                          <Icon name={item.icon} size={18} variant="outline" className="text-[#1A73E8] dark:text-[#8AB4F8]" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#DADCE0] dark:border-[#3C4043] my-2" />
                {!isLoading && user ? (
                  <>
                    <div className="px-4 py-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#202124] dark:text-[#E8EAED]">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href={dashboardRoute}
                      className="px-4 py-3 text-sm font-medium text-[#202124] dark:text-[#E8EAED] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] rounded-lg transition-colors focus-ring"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="mx-4 px-4 py-3 text-sm font-medium text-center text-[#D93025] dark:text-[#F28B82] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] rounded-lg transition-colors focus-ring w-auto text-left"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-4 py-3 text-sm font-medium text-[#1A73E8] dark:text-[#8AB4F8] hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] rounded-lg transition-colors focus-ring"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="mx-4 px-4 py-3 text-sm font-medium text-center bg-[#1A73E8] text-white rounded-lg hover:bg-[#185ABC] transition-colors shadow-sm focus-ring"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;

