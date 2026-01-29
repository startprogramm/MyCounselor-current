'use client';

import React, { useState, useEffect } from 'react';
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

  // Determine if upper class (11th grade) or lower class
  const isUpperClass = user?.gradeLevel && parseInt(user.gradeLevel) >= 11;
  const slides = isUpperClass ? upperClassSlides : lowerClassSlides;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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

        {/* Image Carousel - Universities/Programs */}
        <div className="bg-white dark:bg-[#292929] rounded-2xl overflow-hidden shadow-sm border border-[#DADCE0] dark:border-[#3C4043]">
          <div className="p-4 md:p-6 border-b border-[#DADCE0] dark:border-[#3C4043]">
            <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED]">
              {isUpperClass ? 'Explore Universities' : 'Recommended Programs'}
            </h2>
            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
              {isUpperClass
                ? 'Discover top universities and scholarship opportunities'
                : 'Programs to build your skills and experience'}
            </p>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="relative h-[300px] md:h-[400px] overflow-hidden">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="relative h-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <span className="inline-block px-3 py-1 bg-[#1A73E8] text-white text-xs font-medium rounded-full mb-3">
                        {slide.tag}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {slide.title}
                      </h3>
                      <p className="text-white/90 mb-4 max-w-xl">
                        {slide.subtitle}
                      </p>
                      <Link
                        href={slide.link}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1A73E8] font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Learn More
                        <Icon name="ArrowRightIcon" size={16} variant="outline" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#292929]/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#292929] transition-colors"
              aria-label="Previous slide"
            >
              <Icon name="ChevronLeftIcon" size={20} variant="outline" className="text-[#202124] dark:text-[#E8EAED]" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#292929]/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-[#292929] transition-colors"
              aria-label="Next slide"
            >
              <Icon name="ChevronRightIcon" size={20} variant="outline" className="text-[#202124] dark:text-[#E8EAED]" />
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-white'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
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
