import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface CTASectionProps {
  className?: string;
}

const CTASection = ({ className = '' }: CTASectionProps) => {
  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-[#2D5A87] via-[#4A90B8] to-[#7BB3D1] text-white ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
          <Icon name="RocketLaunchIcon" size={16} variant="solid" />
          <span>Start Your Journey Today</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
          Ready to Transform Your Counseling Experience?
        </h2>
        
        <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join thousands of students and counselors who have discovered the power of organized, accessible guidance. Your path to success starts here.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            href="/student-portal-dashboard"
            className="inline-flex items-center justify-center space-x-2 bg-white text-[#2D5A87] px-8 py-4 rounded-lg font-heading font-semibold text-base hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <Icon name="AcademicCapIcon" size={20} variant="solid" />
            <span>Get Started as Student</span>
          </Link>
          
          <Link
            href="/counselor-command-center"
            className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-lg font-heading font-semibold text-base hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
          >
            <Icon name="UserGroupIcon" size={20} variant="outline" />
            <span>Counselor Access</span>
          </Link>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>FERPA compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="ClockIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>24/7 support available</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;