'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ZoomControl from '@/components/ui/ZoomControl';
import SkipLink from '@/components/ui/SkipLink';
import { useAuth } from '@/context/AuthContext';

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

  return (
    <>
      <SkipLink />
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-md'
          : 'bg-[#DDDEDE]/95 dark:bg-[#1a1919]/95 backdrop-blur-sm'
          } border-b border-border`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/homepage"
              className="flex items-center space-x-2 focus-ring rounded-lg"
              aria-label="MyCounselor Home"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#7BA4A8] to-[#5d8a8e] rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                <Icon name="AcademicCapIcon" size={24} className="text-white" variant="solid" />
              </div>
              <span className="text-xl font-bold text-[#232122] dark:text-[#e8e8e8] font-heading">
                MyCounselor
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#232122] dark:text-gray-300 hover:text-[#7BA4A8] dark:hover:text-[#8fc4c8] transition-colors focus-ring rounded-md px-2 py-1"
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
                  className="flex items-center space-x-1 text-sm font-medium text-[#232122] dark:text-gray-300 hover:text-[#7BA4A8] dark:hover:text-[#8fc4c8] transition-colors focus-ring rounded-md px-2 py-1"
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
                  className={`absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#2a2929] rounded-xl shadow-lg border border-[#b8b9b9] dark:border-[#4a4949] py-2 transition-all duration-200 ${
                    isToolsDropdownOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                  {toolsDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-start space-x-3 px-4 py-3 hover:bg-[#DDDEDE] dark:hover:bg-[#3d3c3c] transition-colors"
                      onClick={() => setIsToolsDropdownOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#7BA4A8] to-[#5d8a8e] rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <Icon name={item.icon} size={20} variant="outline" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#232122] dark:text-white">{item.label}</p>
                        <p className="text-xs text-[#5a5758] dark:text-gray-400">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Zoom, Theme Toggle & Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <ZoomControl />
              <div className="w-px h-6 bg-[#b8b9b9] dark:bg-[#4a4949]" />
              <ThemeToggle />
              {!isLoading && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[#c9caca] dark:hover:bg-[#3d3c3c] transition-colors focus-ring"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#7BA4A8] to-[#5d8a8e] rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-[#232122] dark:text-gray-300">
                      {user.firstName}
                    </span>
                    <Icon name="ChevronDownIcon" size={16} variant="outline" className="text-[#5a5758]" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#2a2929] rounded-lg shadow-lg border border-[#b8b9b9] dark:border-[#4a4949] py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#b8b9b9] dark:border-[#4a4949]">
                        <p className="text-sm font-medium text-[#232122] dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-[#5a5758] dark:text-gray-400">{user.email}</p>
                        {user.schoolName && (
                          <p className="text-xs text-[#5a5758] dark:text-gray-400 mt-1">{user.schoolName}</p>
                        )}
                      </div>
                      <Link
                        href={user.role === 'student' ? '/student/dashboard' : '/counselor/dashboard'}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-[#232122] dark:text-gray-300 hover:bg-[#DDDEDE] dark:hover:bg-[#3d3c3c]"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name="HomeIcon" size={16} variant="outline" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={user.role === 'student' ? '/student/messages' : '/counselor/students'}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-[#232122] dark:text-gray-300 hover:bg-[#DDDEDE] dark:hover:bg-[#3d3c3c]"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name="ChatBubbleLeftRightIcon" size={16} variant="outline" />
                        <span>Messages</span>
                      </Link>
                      <div className="border-t border-[#b8b9b9] dark:border-[#4a4949] my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-[#c44536] dark:text-red-400 hover:bg-[#DDDEDE] dark:hover:bg-[#3d3c3c] w-full"
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
                    className="px-4 py-2 text-sm font-medium text-[#232122] dark:text-[#8fc4c8] hover:text-[#7BA4A8] transition-colors focus-ring rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium bg-[#7BA4A8] text-white rounded-lg hover:bg-[#5d8a8e] transition-all duration-300 shadow-md hover:shadow-lg focus-ring"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-2 md:hidden">
              <ZoomControl />
              <ThemeToggle />
              <button
                type="button"
                className="p-2 rounded-lg text-[#232122] dark:text-gray-300 hover:bg-[#c9caca] dark:hover:bg-[#3d3c3c] focus-ring transition-colors"
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
            <div className="py-4 border-t border-border">
              <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 text-sm font-medium text-[#232122] dark:text-gray-300 hover:text-[#7BA4A8] dark:hover:text-[#8fc4c8] hover:bg-[#c9caca] dark:hover:bg-[#3d3c3c] rounded-lg transition-all duration-200 focus-ring ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
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
                    className="w-full px-4 py-3 text-sm font-medium text-[#232122] dark:text-gray-300 hover:text-[#7BA4A8] dark:hover:text-[#8fc4c8] hover:bg-[#c9caca] dark:hover:bg-[#3d3c3c] rounded-lg transition-all duration-200 focus-ring flex items-center justify-between"
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
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-[#232122] dark:text-gray-300 hover:text-[#7BA4A8] dark:hover:text-[#8fc4c8] hover:bg-[#c9caca] dark:hover:bg-[#3d3c3c] rounded-lg transition-colors"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsMobileToolsOpen(false);
                          }}
                        >
                          <Icon name={item.icon} size={18} variant="outline" className="text-[#7BA4A8] dark:text-[#8fc4c8]" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border my-2" />
                {!isLoading && user ? (
                  <>
                    <div className="px-4 py-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#7BA4A8] to-[#5d8a8e] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#232122] dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-[#5a5758] dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href={user.role === 'student' ? '/student/dashboard' : '/counselor/dashboard'}
                      className="px-4 py-3 text-sm font-medium text-[#232122] dark:text-gray-300 hover:bg-[#c9caca] dark:hover:bg-[#3d3c3c] rounded-lg transition-colors focus-ring"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="mx-4 px-4 py-3 text-sm font-medium text-center text-[#c44536] dark:text-red-400 hover:bg-[#c9caca] dark:hover:bg-[#3d3c3c] rounded-lg transition-colors focus-ring w-auto text-left"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-4 py-3 text-sm font-medium text-[#232122] dark:text-gray-300 hover:bg-[#c9caca] dark:hover:bg-[#3d3c3c] rounded-lg transition-colors focus-ring"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="mx-4 px-4 py-3 text-sm font-medium text-center bg-[#7BA4A8] text-white rounded-lg hover:bg-[#5d8a8e] transition-colors shadow-md focus-ring"
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

