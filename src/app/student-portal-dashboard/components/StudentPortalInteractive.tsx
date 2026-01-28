'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WelcomeCard from './WelcomeCard';
import QuickActionsCard from './QuickActionsCard';
import UpcomingAppointmentsCard from './UpcomingAppointmentsCard';
import GoalProgressCard from './GoalProgressCard';
import ResourceRecommendationsCard from './ResourceRecommendationsCard';
import NotificationCenterCard from './NotificationCenterCard';
import AchievementShowcaseCard from './AchievementShowcaseCard';
import AnonymousQuestionCard from './AnonymousQuestionCard';
import PeerSupportCard from './PeerSupportCard';
import CollegeCareerPlanningCard from './CollegeCareerPlanningCard';
import { useAuth } from '@/context/AuthContext';

interface StudentData {
  name: string;
  lastLogin: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

interface Appointment {
  id: string;
  counselorName: string;
  counselorImage: string;
  counselorImageAlt: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface Resource {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  thumbnailAlt: string;
  description: string;
  readTime: string;
  rating: number;
}

interface Notification {
  id: string;
  type: 'appointment' | 'resource' | 'achievement' | 'message' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: string;
}

interface Discussion {
  id: string;
  title: string;
  category: string;
  replies: number;
  lastActivity: string;
  isActive: boolean;
}

interface PlanningTask {
  id: string;
  title: string;
  category: 'college' | 'career';
  deadline: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

const StudentPortalInteractive = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const studentData: StudentData = {
    name: user ? `${user.firstName} ${user.lastName}` : "Student",
    lastLogin: "January 12, 2026 at 3:45 PM"
  };

  const quickActions: QuickAction[] = [
  {
    id: "schedule",
    label: "Schedule Appointment",
    icon: "CalendarIcon",
    color: "bg-primary text-primary-foreground",
    description: "Book time with counselor"
  },
  {
    id: "resources",
    label: "Browse Resources",
    icon: "BookOpenIcon",
    color: "bg-accent text-accent-foreground",
    description: "Explore guidance materials"
  },
  {
    id: "messages",
    label: "Check Messages",
    icon: "ChatBubbleLeftRightIcon",
    color: "bg-secondary text-secondary-foreground",
    description: "View communications"
  },
  {
    id: "goals",
    label: "Update Goals",
    icon: "FlagIcon",
    color: "bg-warning text-warning-foreground",
    description: "Track your progress"
  }];


  const appointments: Appointment[] = [
  {
    id: "1",
    counselorName: "Dr. Sarah Martinez",
    counselorImage: "https://img.rocket.new/generatedImages/rocket_gen_img_18403c4e4-1763295192007.png",
    counselorImageAlt: "Professional headshot of Hispanic woman with long dark hair in navy blazer smiling warmly",
    date: "January 15, 2026",
    time: "2:00 PM",
    type: "College Application Review",
    status: "confirmed"
  },
  {
    id: "2",
    counselorName: "Mr. James Chen",
    counselorImage: "https://img.rocket.new/generatedImages/rocket_gen_img_137a6cab3-1763294924982.png",
    counselorImageAlt: "Professional headshot of Asian man with short black hair in gray suit with friendly smile",
    date: "January 18, 2026",
    time: "10:30 AM",
    type: "Career Exploration Session",
    status: "pending"
  }];


  const goals: Goal[] = [
  {
    id: "1",
    title: "Complete College Applications",
    category: "Academic",
    progress: 75,
    dueDate: "February 1, 2026",
    priority: "high"
  },
  {
    id: "2",
    title: "Improve Math Grade to B+",
    category: "Academic",
    progress: 60,
    dueDate: "January 31, 2026",
    priority: "high"
  },
  {
    id: "3",
    title: "Attend 3 Career Workshops",
    category: "Career",
    progress: 33,
    dueDate: "March 15, 2026",
    priority: "medium"
  }];


  const resources: Resource[] = [
  {
    id: "1",
    title: "College Essay Writing Guide",
    category: "College Prep",
    thumbnail: "https://images.unsplash.com/photo-1621610085591-3d4fba329159",
    thumbnailAlt: "Close-up of hands writing in notebook with pen on wooden desk with coffee cup",
    description: "Learn how to craft compelling personal statements that stand out to admissions officers",
    readTime: "15 min read",
    rating: 4.8
  },
  {
    id: "2",
    title: "SAT Preparation Strategies",
    category: "Test Prep",
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1775f5c10-1764852362022.png",
    thumbnailAlt: "Student studying with textbooks and laptop on desk with natural lighting",
    description: "Proven techniques to improve your SAT scores and test-taking confidence",
    readTime: "20 min read",
    rating: 4.9
  },
  {
    id: "3",
    title: "Managing Academic Stress",
    category: "Wellness",
    thumbnail: "https://images.unsplash.com/photo-1585125870798-2be228292dee",
    thumbnailAlt: "Peaceful meditation scene with person sitting cross-legged in nature with sunlight",
    description: "Practical mindfulness and time management techniques for student well-being",
    readTime: "10 min read",
    rating: 4.7
  }];


  const [notifications, setNotifications] = useState<Notification[]>([
  {
    id: "1",
    type: "appointment",
    title: "Appointment Confirmed",
    message: "Your meeting with Dr. Martinez on January 15 at 2:00 PM has been confirmed",
    timestamp: "2 hours ago",
    isRead: false
  },
  {
    id: "2",
    type: "achievement",
    title: "New Achievement Unlocked!",
    message: "You've earned the 'Goal Getter' badge for completing 5 goals this month",
    timestamp: "5 hours ago",
    isRead: false
  },
  {
    id: "3",
    type: "resource",
    title: "New Resource Available",
    message: "Check out the latest guide on scholarship applications",
    timestamp: "1 day ago",
    isRead: false
  },
  {
    id: "4",
    type: "message",
    title: "Message from Dr. Martinez",
    message: "Please bring your college application drafts to our next meeting",
    timestamp: "1 day ago",
    isRead: true
  },
  {
    id: "5",
    type: "reminder",
    title: "Deadline Approaching",
    message: "Your college application goal is due in 19 days",
    timestamp: "2 days ago",
    isRead: true
  }]
  );

  const achievements: Achievement[] = [
  {
    id: "1",
    title: "Goal Getter",
    description: "Completed 5 goals in one month",
    icon: "TrophyIcon",
    earnedDate: "January 12, 2026",
    category: "Progress"
  },
  {
    id: "2",
    title: "Resource Explorer",
    description: "Accessed 10 different resources",
    icon: "BookOpenIcon",
    earnedDate: "January 10, 2026",
    category: "Learning"
  },
  {
    id: "3",
    title: "Community Contributor",
    description: "Helped 3 peers in discussions",
    icon: "UserGroupIcon",
    earnedDate: "January 8, 2026",
    category: "Community"
  }];


  const discussions: Discussion[] = [
  {
    id: "1",
    title: "Tips for Managing College Application Stress",
    category: "College Prep",
    replies: 24,
    lastActivity: "2 hours ago",
    isActive: true
  },
  {
    id: "2",
    title: "Best Study Techniques for Finals",
    category: "Academic",
    replies: 18,
    lastActivity: "5 hours ago",
    isActive: true
  },
  {
    id: "3",
    title: "Career Exploration: STEM Fields",
    category: "Career",
    replies: 12,
    lastActivity: "1 day ago",
    isActive: false
  }];


  const planningTasks: PlanningTask[] = [
  {
    id: "1",
    title: "Submit Common App Essay",
    category: "college",
    deadline: "January 20, 2026",
    completed: false,
    priority: "high"
  },
  {
    id: "2",
    title: "Request Letters of Recommendation",
    category: "college",
    deadline: "January 25, 2026",
    completed: true,
    priority: "high"
  },
  {
    id: "3",
    title: "Complete Career Interest Assessment",
    category: "career",
    deadline: "February 5, 2026",
    completed: false,
    priority: "medium"
  },
  {
    id: "4",
    title: "Research Scholarship Opportunities",
    category: "college",
    deadline: "February 10, 2026",
    completed: false,
    priority: "medium"
  }];


  const handleActionClick = (actionId: string) => {
    if (!isHydrated) return;

    switch (actionId) {
      case 'schedule':router.push('/appointment-scheduling-system');
        break;
      case 'resources':router.push('/resource-discovery-center');
        break;
      case 'messages':router.push('/secure-communication-hub');
        break;
      case 'goals':
        break;
      default:
        break;
    }
  };

  const handleViewAllAppointments = () => {
    if (!isHydrated) return;
    router.push('/appointment-scheduling-system');
  };

  const handleViewAllGoals = () => {
    if (!isHydrated) return;
  };

  const handleResourceClick = (resourceId: string) => {
    if (!isHydrated) return;
    router.push('/resource-discovery-center');
  };

  const handleViewAllResources = () => {
    if (!isHydrated) return;
    router.push('/resource-discovery-center');
  };

  const handleNotificationClick = (notificationId: string) => {
    if (!isHydrated) return;

    setNotifications((prev) =>
    prev.map((notif) =>
    notif.id === notificationId ? { ...notif, isRead: true } : notif
    )
    );
  };

  const handleMarkAllRead = () => {
    if (!isHydrated) return;

    setNotifications((prev) =>
    prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const handleViewAllAchievements = () => {
    if (!isHydrated) return;
  };

  const handleSubmitQuestion = () => {
    if (!isHydrated) return;
  };

  const handleDiscussionClick = (discussionId: string) => {
    if (!isHydrated) return;
  };

  const handleViewAllDiscussions = () => {
    if (!isHydrated) return;
  };

  const handleTaskClick = (taskId: string) => {
    if (!isHydrated) return;
  };

  const handleViewAllTasks = () => {
    if (!isHydrated) return;
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-muted rounded-xl" />
              <div className="h-64 bg-muted rounded-xl" />
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <WelcomeCard
          studentName={studentData.name}
          lastLogin={studentData.lastLogin} />


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <QuickActionsCard
              actions={quickActions}
              onActionClick={handleActionClick} />


            <UpcomingAppointmentsCard
              appointments={appointments}
              onViewAll={handleViewAllAppointments} />


            <GoalProgressCard
              goals={goals}
              onViewAll={handleViewAllGoals} />


            <CollegeCareerPlanningCard
              tasks={planningTasks}
              onTaskClick={handleTaskClick}
              onViewAll={handleViewAllTasks} />


            <PeerSupportCard
              discussions={discussions}
              onDiscussionClick={handleDiscussionClick}
              onViewAll={handleViewAllDiscussions} />

          </div>

          <div className="space-y-6">
            <NotificationCenterCard
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllRead={handleMarkAllRead} />


            <ResourceRecommendationsCard
              resources={resources}
              onResourceClick={handleResourceClick}
              onViewAll={handleViewAllResources} />


            <AchievementShowcaseCard
              achievements={achievements}
              totalPoints={1250}
              onViewAll={handleViewAllAchievements} />


            <AnonymousQuestionCard
              onSubmitQuestion={handleSubmitQuestion} />

          </div>
        </div>
      </div>
    </div>);

};

export default StudentPortalInteractive;