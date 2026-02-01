'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface SidebarProps {
  items: SidebarItem[];
  userType: 'student' | 'counselor' | 'teacher' | 'parent';
  userName: string;
  userEmail?: string;
  userAvatar?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  userType,
  userName,
  userEmail,
  userAvatar,
}) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-card rounded-lg shadow-md border border-border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              {!isCollapsed && (
                <span className="text-lg font-bold text-foreground font-heading">
                  MyCounselor
                </span>
              )}
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-muted-foreground truncate">
                      {userEmail}
                    </p>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      userType === 'student'
                        ? 'bg-primary/10 text-primary'
                        : userType === 'teacher'
                        ? 'bg-amber-500/10 text-amber-600'
                        : userType === 'parent'
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-secondary/10 text-secondary'
                    }`}
                  >
                    {userType === 'student' ? 'Student' : userType === 'teacher' ? 'Teacher' : userType === 'parent' ? 'Parent' : 'Counselor'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                        ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`
                                px-2 py-0.5 rounded-full text-xs font-medium
                                ${
                                  isActive
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'bg-primary/10 text-primary'
                                }
                              `}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button
              type="button"
              className="hidden lg:flex items-center gap-3 w-full px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
              {!isCollapsed && (
                <span className="text-sm font-medium">Collapse</span>
              )}
            </button>
            <Link
              href="/auth/login"
              className="flex items-center gap-3 w-full px-3 py-2 mt-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
