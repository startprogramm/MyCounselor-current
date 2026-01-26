'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SkipLink from '@/components/ui/SkipLink';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Student Portal', href: '/student-portal-dashboard' },
  { label: 'Counselor Center', href: '/counselor-command-center' },
  { label: 'Resources', href: '/resource-discovery-center' },
  { label: 'Schedule', href: '/appointment-scheduling-system' },
];

const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm'
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
              <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                <Icon name="AcademicCapIcon" size={24} className="text-white" variant="solid" />
              </div>
              <span className="text-xl font-bold text-[#2D5A87] dark:text-[#7BB3D1] font-heading">
                MyCounselor
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#2D5A87] dark:hover:text-[#7BB3D1] transition-colors focus-ring rounded-md px-2 py-1"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              {!isLoading && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus-ring"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.firstName}
                    </span>
                    <Icon name="ChevronDownIcon" size={16} variant="outline" className="text-gray-500" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        {user.schoolName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.schoolName}</p>
                        )}
                      </div>
                      <Link
                        href={user.role === 'student' ? '/student/dashboard' : '/counselor/dashboard'}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name="HomeIcon" size={16} variant="outline" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={user.role === 'student' ? '/student/messages' : '/counselor/students'}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name="ChatBubbleLeftRightIcon" size={16} variant="outline" />
                        <span>Messages</span>
                      </Link>
                      <div className="border-t border-gray-200 dark:border-slate-700 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 w-full"
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
                    className="px-4 py-2 text-sm font-medium text-[#2D5A87] dark:text-[#7BB3D1] hover:text-[#4A90B8] transition-colors focus-ring rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium bg-[#2D5A87] text-white rounded-lg hover:bg-[#4A90B8] transition-all duration-300 shadow-md hover:shadow-lg focus-ring"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-2 md:hidden">
              <ThemeToggle />
              <button
                type="button"
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 focus-ring transition-colors"
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
                    className={`px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#2D5A87] dark:hover:text-[#7BB3D1] hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 focus-ring ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                      }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                {!isLoading && user ? (
                  <>
                    <div className="px-4 py-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href={user.role === 'student' ? '/student/dashboard' : '/counselor/dashboard'}
                      className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors focus-ring"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="mx-4 px-4 py-3 text-sm font-medium text-center text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors focus-ring w-auto text-left"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors focus-ring"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="mx-4 px-4 py-3 text-sm font-medium text-center bg-[#2D5A87] text-white rounded-lg hover:bg-[#4A90B8] transition-colors shadow-md focus-ring"
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

