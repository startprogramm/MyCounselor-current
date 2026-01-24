import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface AccessCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  href: string;
  bgColor: string;
  iconColor: string;
  userType: string;
}

interface QuickAccessCardsProps {
  className?: string;
}

const QuickAccessCards = ({ className = '' }: QuickAccessCardsProps) => {
  const accessCards: AccessCard[] = [
    {
      id: 1,
      title: "Student Portal",
      description: "Access your personalized dashboard, schedule appointments, and explore resources tailored to your goals.",
      icon: "AcademicCapIcon",
      href: "/student-portal-dashboard",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      userType: "For Students"
    },
    {
      id: 2,
      title: "Counselor Center",
      description: "Manage student interactions, schedule appointments, and access comprehensive counseling tools efficiently.",
      icon: "UserGroupIcon",
      href: "/counselor-command-center",
      bgColor: "bg-gradient-to-br from-violet-50 to-violet-100",
      iconColor: "text-violet-600",
      userType: "For Counselors"
    },
    {
      id: 3,
      title: "Parent Resources",
      description: "Stay informed about your child's progress, access guidance materials, and connect with counselors.",
      icon: "HomeIcon",
      href: "/resource-discovery-center",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconColor: "text-emerald-600",
      userType: "For Parents"
    },
    {
      id: 4,
      title: "Emergency Support",
      description: "Immediate access to crisis resources, mental health support, and urgent intervention protocols.",
      icon: "ExclamationTriangleIcon",
      href: "/secure-communication-hub",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      iconColor: "text-red-600",
      userType: "24/7 Available"
    }
  ];

  return (
    <section className={`py-16 lg:py-24 bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the portal that matches your role to access personalized tools and resources designed for your needs.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group relative bg-card rounded-2xl p-6 shadow-md hover:shadow-brand-lg transition-all duration-300 border border-border hover:border-primary/30"
            >
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {card.userType}
                </span>
              </div>
              
              <div className={`w-16 h-16 rounded-xl ${card.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={card.icon as any} size={32} variant="solid" className={card.iconColor} />
              </div>
              
              <h3 className="text-xl font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {card.description}
              </p>
              
              <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                <span>Access Portal</span>
                <Icon name="ArrowRightIcon" size={16} variant="outline" className="ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessCards;