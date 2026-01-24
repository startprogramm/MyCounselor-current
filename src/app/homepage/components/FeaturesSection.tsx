import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

interface FeaturesSectionProps {
  className?: string;
}

const FeaturesSection = ({ className = '' }: FeaturesSectionProps) => {
  const features: Feature[] = [
    {
      id: 1,
      title: "Intelligent Scheduling",
      description: "Smart appointment booking with automated reminders and conflict detection ensures efficient time management.",
      icon: "CalendarDaysIcon",
      benefits: ["Automated reminders", "Conflict detection", "Calendar integration"]
    },
    {
      id: 2,
      title: "Secure Communication",
      description: "FERPA-compliant messaging system with priority handling keeps all conversations private and organized.",
      icon: "ChatBubbleLeftRightIcon",
      benefits: ["End-to-end encryption", "Priority messaging", "Document sharing"]
    },
    {
      id: 3,
      title: "Resource Library",
      description: "Comprehensive collection of guidance materials with personalized recommendations based on student needs.",
      icon: "BookOpenIcon",
      benefits: ["Searchable content", "Smart recommendations", "Mobile access"]
    },
    {
      id: 4,
      title: "Progress Tracking",
      description: "Visual goal-setting and achievement monitoring helps students stay on track toward their objectives.",
      icon: "ChartBarIcon",
      benefits: ["Goal visualization", "Milestone tracking", "Achievement badges"]
    },
    {
      id: 5,
      title: "Crisis Support",
      description: "Immediate access to emergency resources and intervention protocols ensures help is always available.",
      icon: "ShieldCheckIcon",
      benefits: ["24/7 availability", "Quick response", "Professional support"]
    },
    {
      id: 6,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into counseling effectiveness and student outcomes support data-driven decisions.",
      icon: "PresentationChartLineIcon",
      benefits: ["Usage metrics", "Outcome tracking", "Custom reports"]
    }
  ];

  return (
    <section className={`py-16 lg:py-24 bg-muted/30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 text-sm font-medium text-primary mb-4">
            <Icon name="SparklesIcon" size={16} variant="solid" />
            <span>Powerful Features</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Technology That Amplifies Connection
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            CounselConnect provides counselors with efficient tools to make meaningful impact while giving students accessible guidance when they need it most.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-card rounded-2xl p-6 shadow-md hover:shadow-brand-lg transition-all duration-300 border border-border group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon name={feature.icon as any} size={28} variant="solid" className="text-white" />
              </div>
              
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm text-muted-foreground">
                    <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-accent mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;