'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/context/AuthContext';

// Types
interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  description: string;
}

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  tag: string;
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'deadline' | 'event' | 'news' | 'important';
  description: string;
}

interface Counselor {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: string;
  email: string;
}

interface SuccessStory {
  id: string;
  name: string;
  achievement: string;
  quote: string;
  image: string;
  year: string;
}

// Data
const quickActions: QuickAction[] = [
  {
    id: "schedule",
    label: "Schedule Meeting",
    icon: "CalendarIcon",
    href: "/appointment-scheduling-system",
    description: "Book time with a counselor"
  },
  {
    id: "resources",
    label: "Browse Resources",
    icon: "BookOpenIcon",
    href: "/resource-discovery-center",
    description: "Explore guidance materials"
  },
  {
    id: "messages",
    label: "Messages",
    icon: "ChatBubbleLeftRightIcon",
    href: "/secure-communication-hub",
    description: "Contact your counselor"
  },
  {
    id: "tools",
    label: "Career Tools",
    icon: "WrenchScrewdriverIcon",
    href: "/tools/major-finder",
    description: "Explore majors & careers"
  }
];

// Upper class slides (11th grade) - Universities
const upperClassSlides: CarouselSlide[] = [
  {
    id: "1",
    title: "Harvard University",
    subtitle: "Discover world-class education and research opportunities",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
    link: "/resources/universities/harvard",
    tag: "Ivy League"
  },
  {
    id: "2",
    title: "Stanford University",
    subtitle: "Innovation and entrepreneurship in Silicon Valley",
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80",
    link: "/resources/universities/stanford",
    tag: "Top 5 US"
  },
  {
    id: "3",
    title: "MIT",
    subtitle: "Leading the world in science and technology",
    image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80",
    link: "/resources/universities/mit",
    tag: "STEM Excellence"
  },
  {
    id: "4",
    title: "Scholarship Opportunities",
    subtitle: "Find funding for your dream university",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    link: "/resources/scholarships",
    tag: "Financial Aid"
  }
];

// Lower class slides (9th, 10th grade) - Programs
const lowerClassSlides: CarouselSlide[] = [
  {
    id: "1",
    title: "Summer STEM Programs",
    subtitle: "Hands-on science and technology camps",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
    link: "/resources/programs/stem-summer",
    tag: "Summer 2026"
  },
  {
    id: "2",
    title: "Leadership Academy",
    subtitle: "Develop your leadership skills early",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80",
    link: "/resources/programs/leadership",
    tag: "Leadership"
  },
  {
    id: "3",
    title: "Academic Enrichment",
    subtitle: "Advanced courses and skill building",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    link: "/resources/programs/enrichment",
    tag: "Academic"
  },
  {
    id: "4",
    title: "Community Service",
    subtitle: "Build your portfolio while giving back",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
    link: "/resources/programs/volunteer",
    tag: "Volunteer"
  }
];

const announcements: Announcement[] = [
  {
    id: "1",
    title: "College Application Deadline Reminder",
    date: "Feb 1, 2026",
    category: "deadline",
    description: "Regular decision applications due for most universities"
  },
  {
    id: "2",
    title: "Spring College Fair",
    date: "Feb 15, 2026",
    category: "event",
    description: "Meet representatives from 50+ universities in the gymnasium"
  },
  {
    id: "3",
    title: "SAT Registration Open",
    date: "Jan 20, 2026",
    category: "important",
    description: "Register now for the March SAT exam"
  },
  {
    id: "4",
    title: "New Scholarship Database",
    date: "Jan 18, 2026",
    category: "news",
    description: "Access our updated scholarship search tool"
  }
];

const counselors: Counselor[] = [
  {
    id: "1",
    name: "Dr. Sarah Martinez",
    role: "Head Counselor",
    specialty: "College Admissions & Applications",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    email: "s.martinez@school.edu"
  },
  {
    id: "2",
    name: "Mr. James Chen",
    role: "Career Counselor",
    specialty: "Career Exploration & Planning",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    email: "j.chen@school.edu"
  },
  {
    id: "3",
    name: "Ms. Emily Johnson",
    role: "Academic Counselor",
    specialty: "Academic Support & Study Skills",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    email: "e.johnson@school.edu"
  }
];

const successStories: SuccessStory[] = [
  {
    id: "1",
    name: "Alex Thompson",
    achievement: "Accepted to MIT",
    quote: "The counseling team helped me craft the perfect application. I couldn't have done it without their guidance!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    year: "Class of 2025"
  },
  {
    id: "2",
    name: "Maria Garcia",
    achievement: "Full Scholarship to Stanford",
    quote: "They helped me find scholarships I never knew existed. Now I'm attending my dream school debt-free.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    year: "Class of 2025"
  },
  {
    id: "3",
    name: "David Kim",
    achievement: "Internship at Google",
    quote: "The career counseling sessions opened my eyes to opportunities in tech. I landed my dream internship!",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    year: "Class of 2024"
  }
];

const StudentPortalInteractive = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Drag state for carousel
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if upper class (11th grade) or lower class
  const isUpperClass = user?.gradeLevel && parseInt(user.gradeLevel) >= 11;
  const slides = isUpperClass ? upperClassSlides : lowerClassSlides;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Auto-advance carousel (pause when dragging)
  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slides.length]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Determine if we should change slide (threshold of 50px)
    if (dragOffset > 50) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (dragOffset < -50) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }

    setDragOffset(0);
    startAutoPlay();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Prevent link clicks when dragging
  const handleLinkClick = (e: React.MouseEvent) => {
    if (Math.abs(dragOffset) > 10) {
      e.preventDefault();
    }
  };

  const getCategoryStyle = (category: Announcement['category']) => {
    switch (category) {
      case 'deadline':
        return 'bg-[#D93025]/10 text-[#D93025]';
      case 'event':
        return 'bg-[#1A73E8]/10 text-[#1A73E8]';
      case 'important':
        return 'bg-[#F9AB00]/10 text-[#F9AB00]';
      case 'news':
        return 'bg-[#1E8E3E]/10 text-[#1E8E3E]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#F1F3F4] dark:bg-[#1F1F1F] pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white dark:bg-[#292929] rounded-xl" />
            <div className="h-80 bg-white dark:bg-[#292929] rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-white dark:bg-[#292929] rounded-xl" />
              <div className="h-64 bg-white dark:bg-[#292929] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4] dark:bg-[#1F1F1F] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Welcome Section */}
        <div className="bg-white dark:bg-[#292929] rounded-2xl p-6 md:p-8 shadow-sm border border-[#DADCE0] dark:border-[#3C4043]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#202124] dark:text-[#E8EAED]">
                Welcome to Student Portal
              </h1>
              <p className="text-[#5F6368] dark:text-[#9AA0A6] mt-1">
                Your gateway to academic success and career planning
              </p>
            </div>
            {!user && (
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1A73E8] text-white font-medium rounded-lg hover:bg-[#185ABC] transition-colors shadow-sm"
              >
                Sign In to Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="bg-white dark:bg-[#292929] rounded-xl p-5 border border-[#DADCE0] dark:border-[#3C4043] hover:border-[#1A73E8] dark:hover:border-[#8AB4F8] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-[#E8F0FE] dark:bg-[#1A73E8]/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#1A73E8] transition-colors">
                <Icon
                  name={action.icon}
                  size={24}
                  variant="outline"
                  className="text-[#1A73E8] dark:text-[#8AB4F8] group-hover:text-white transition-colors"
                />
              </div>
              <h3 className="font-semibold text-[#202124] dark:text-[#E8EAED] mb-1">
                {action.label}
              </h3>
              <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Creative Image Carousel - Universities/Programs */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A73E8] via-[#4285F4] to-[#1E8E3E] p-1">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#1E8E3E]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative bg-white/95 dark:bg-[#1F1F1F]/95 backdrop-blur-sm rounded-[22px] overflow-hidden">
            {/* Section Header */}
            <div className="relative z-10 px-6 py-5 md:px-8 md:py-6 border-b border-[#DADCE0]/50 dark:border-[#3C4043]/50 bg-gradient-to-r from-white via-white to-[#F1F3F4] dark:from-[#292929] dark:via-[#292929] dark:to-[#1F1F1F]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1A73E8] to-[#4285F4] flex items-center justify-center shadow-lg">
                    <Icon name={isUpperClass ? "AcademicCapIcon" : "RocketLaunchIcon"} size={24} className="text-white" variant="solid" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
                      {isUpperClass ? 'Explore Universities' : 'Recommended Programs'}
                    </h2>
                    <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                      {isUpperClass
                        ? 'Your path to higher education starts here'
                        : 'Build skills that shape your future'}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  <span>{currentSlide + 1} / {slides.length}</span>
                </div>
              </div>
            </div>

            {/* Carousel Content */}
            <div
              ref={carouselRef}
              className={`relative min-h-[420px] md:min-h-[380px] overflow-hidden select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 ${
                    isDragging ? '' : 'transition-all duration-700 ease-out'
                  } ${
                    index === currentSlide
                      ? 'opacity-100'
                      : index < currentSlide
                        ? 'opacity-0'
                        : 'opacity-0'
                  }`}
                  style={{
                    transform: index === currentSlide
                      ? `translateX(${dragOffset}px)`
                      : index < currentSlide
                        ? `translateX(calc(-100% + ${dragOffset}px))`
                        : `translateX(calc(100% + ${dragOffset}px))`,
                  }}
                >
                  <div className="h-full flex flex-col md:flex-row">
                    {/* Content Side */}
                    <div className="flex-1 p-6 md:p-10 flex flex-col justify-center order-2 md:order-1">
                      <div className="max-w-lg">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#1A73E8]/10 to-[#1E8E3E]/10 text-[#1A73E8] dark:text-[#8AB4F8] text-sm font-semibold rounded-full mb-4 border border-[#1A73E8]/20">
                          <span className="w-2 h-2 rounded-full bg-[#1E8E3E] animate-pulse" />
                          {slide.tag}
                        </span>
                        <h3 className="text-3xl md:text-4xl font-bold text-[#202124] dark:text-[#E8EAED] mb-4 leading-tight">
                          {slide.title}
                        </h3>
                        <p className="text-[#5F6368] dark:text-[#9AA0A6] text-lg mb-6 leading-relaxed">
                          {slide.subtitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={slide.link}
                            onClick={handleLinkClick}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A73E8] text-white font-semibold rounded-xl hover:bg-[#185ABC] transition-all duration-300 shadow-lg shadow-[#1A73E8]/25 hover:shadow-xl hover:shadow-[#1A73E8]/30 hover:-translate-y-0.5 select-none"
                          >
                            Explore Now
                            <Icon name="ArrowRightIcon" size={18} variant="outline" />
                          </Link>
                          <button
                            onClick={handleLinkClick}
                            className="inline-flex items-center gap-2 px-6 py-3 text-[#1A73E8] dark:text-[#8AB4F8] font-semibold rounded-xl border-2 border-[#1A73E8]/20 hover:border-[#1A73E8]/40 hover:bg-[#1A73E8]/5 transition-all duration-300 select-none"
                          >
                            <Icon name="BookmarkIcon" size={18} variant="outline" />
                            Save for Later
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Image Side */}
                    <div className="relative w-full md:w-[45%] h-48 md:h-auto order-1 md:order-2">
                      {/* Decorative Shape Behind Image */}
                      <div className="absolute inset-0 md:inset-4">
                        <div className="absolute -inset-4 bg-gradient-to-br from-[#1A73E8]/20 to-[#1E8E3E]/20 rounded-[2rem] md:rounded-[3rem] transform rotate-3" />
                        <div className="absolute -inset-2 bg-gradient-to-br from-[#4285F4]/30 to-[#81C995]/30 rounded-[1.5rem] md:rounded-[2.5rem] transform -rotate-2" />
                      </div>

                      {/* Main Image Container */}
                      <div className="relative h-full md:m-6 overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-white/10" />

                        {/* Floating Stats Badge */}
                        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white/90 dark:bg-[#292929]/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1E8E3E] to-[#34A853] flex items-center justify-center">
                              <Icon name="StarIcon" size={20} className="text-white" variant="solid" />
                            </div>
                            <div>
                              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">Highly Rated</p>
                              <p className="font-bold text-[#202124] dark:text-[#E8EAED]">Top Choice</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Drag Hint */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6] text-sm bg-white/80 dark:bg-[#292929]/80 backdrop-blur-sm px-4 py-2 rounded-full select-none pointer-events-none md:hidden">
                <Icon name="ArrowsRightLeftIcon" size={16} variant="outline" />
                <span>Swipe to explore</span>
              </div>

              {/* Indicators - visible on larger screens at bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 bg-white/80 dark:bg-[#292929]/80 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] select-none">
                  <Icon name="HandRaisedIcon" size={14} variant="outline" className="inline mr-1" />
                  Drag to explore
                </span>
                <div className="flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(index);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'w-8 bg-[#1A73E8]'
                          : 'w-2 bg-[#DADCE0] dark:bg-[#3C4043] hover:bg-[#1A73E8]/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* School Announcements */}
          <div className="bg-white dark:bg-[#292929] rounded-2xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043]">
            <div className="p-4 md:p-6 border-b border-[#DADCE0] dark:border-[#3C4043] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">
                  Announcements
                </h2>
                <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  Important dates and updates
                </p>
              </div>
              <Icon name="MegaphoneIcon" size={24} className="text-[#1A73E8]" variant="outline" />
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-lg hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors cursor-pointer"
                >
                  <div className={`px-2 py-1 rounded text-xs font-medium capitalize h-fit ${getCategoryStyle(item.category)}`}>
                    {item.category}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] mt-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-2">
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meet Your Counselors */}
          <div className="bg-white dark:bg-[#292929] rounded-2xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043]">
            <div className="p-4 md:p-6 border-b border-[#DADCE0] dark:border-[#3C4043] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">
                  Meet Your Counselors
                </h2>
                <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  Here to help you succeed
                </p>
              </div>
              <Icon name="UserGroupIcon" size={24} className="text-[#1E8E3E]" variant="outline" />
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {counselors.map((counselor) => (
                <div
                  key={counselor.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors"
                >
                  <img
                    src={counselor.image}
                    alt={counselor.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {counselor.name}
                    </h4>
                    <p className="text-sm text-[#1A73E8] dark:text-[#8AB4F8]">
                      {counselor.role}
                    </p>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                      {counselor.specialty}
                    </p>
                  </div>
                  <Link
                    href={`mailto:${counselor.email}`}
                    className="p-2 rounded-full hover:bg-[#E8F0FE] dark:hover:bg-[#1A73E8]/20 transition-colors"
                    title={`Email ${counselor.name}`}
                  >
                    <Icon name="EnvelopeIcon" size={20} className="text-[#1A73E8] dark:text-[#8AB4F8]" variant="outline" />
                  </Link>
                </div>
              ))}
              <Link
                href="/appointment-scheduling-system"
                className="block w-full text-center py-3 border border-[#1A73E8] text-[#1A73E8] dark:text-[#8AB4F8] dark:border-[#8AB4F8] rounded-lg hover:bg-[#E8F0FE] dark:hover:bg-[#1A73E8]/10 transition-colors font-medium"
              >
                Schedule a Meeting
              </Link>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-white dark:bg-[#292929] rounded-2xl shadow-sm border border-[#DADCE0] dark:border-[#3C4043]">
          <div className="p-4 md:p-6 border-b border-[#DADCE0] dark:border-[#3C4043]">
            <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">
              Success Stories
            </h2>
            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
              See what our students have achieved
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-[#F1F3F4] dark:bg-[#3C4043] rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-[#202124] dark:text-[#E8EAED]">
                        {story.name}
                      </h4>
                      <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                        {story.year}
                      </p>
                    </div>
                  </div>
                  <div className="inline-block px-3 py-1 bg-[#1E8E3E]/10 text-[#1E8E3E] dark:text-[#81C995] text-sm font-medium rounded-full mb-3">
                    {story.achievement}
                  </div>
                  <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm italic">
                    "{story.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentPortalInteractive;
