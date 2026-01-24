import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className = '' }: HeroSectionProps) => {
  return (
    <section className={`relative bg-gradient-to-br from-[#2D5A87] via-[#4A90B8] to-[#7BB3D1] text-white overflow-hidden ${className}`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <Icon name="SparklesIcon" size={16} variant="solid" />
              <span>Empowering Student Success Through Connection</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight">
              Every Student's Path <span className="text-[#F4A261]">Matters</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Transform the overwhelming nature of school counseling into an organized, hopeful journey. CounselConnect bridges student needs with counselor expertise through technology that amplifies human connection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/student-portal-dashboard"
                className="inline-flex items-center justify-center space-x-2 bg-white text-[#2D5A87] px-8 py-4 rounded-lg font-heading font-semibold text-base hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Icon name="AcademicCapIcon" size={20} variant="solid" />
                <span>Student Portal</span>
              </Link>
              
              <Link
                href="/counselor-command-center"
                className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-lg font-heading font-semibold text-base hover:bg-white/20 transition-all duration-300"
              >
                <Icon name="UserGroupIcon" size={20} variant="outline" />
                <span>Counselor Login</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
                <span className="text-sm font-medium">FERPA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
                <span className="text-sm font-medium">SSL Secured</span>
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Icon name="UserCircleIcon" size={32} variant="solid" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/30 rounded w-3/4"></div>
                      <div className="h-3 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-white/20 rounded-lg p-4 space-y-2">
                        <div className="h-3 bg-white/30 rounded w-full"></div>
                        <div className="h-3 bg-white/20 rounded w-4/5"></div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-1 h-12 bg-white/30 rounded-lg"></div>
                    <div className="flex-1 h-12 bg-white/30 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;