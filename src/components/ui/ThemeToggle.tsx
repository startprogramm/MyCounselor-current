'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <button
                className="p-2 rounded-lg hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors"
                aria-label="Toggle theme"
            >
                <div className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-all duration-300 focus-ring group"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative w-5 h-5 overflow-hidden">
                {/* Sun Icon */}
                <div
                    className={`absolute inset-0 transition-all duration-500 ${isDark ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                        }`}
                >
                    <Icon name="SunIcon" size={20} variant="solid" className="text-amber-500" />
                </div>

                {/* Moon Icon */}
                <div
                    className={`absolute inset-0 transition-all duration-500 ${isDark ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                        }`}
                >
                    <Icon name="MoonIcon" size={20} variant="solid" className="text-blue-400" />
                </div>
            </div>
        </button>
    );
};

export default ThemeToggle;
