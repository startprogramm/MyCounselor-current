import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  image: string;
  alt: string;
  rating: number;
}

interface TestimonialsSectionProps {
  className?: string;
}

const TestimonialsSection = ({ className = '' }: TestimonialsSectionProps) => {
  const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "High School Senior",
    content: "CounselConnect made college applications so much less stressful. I could schedule appointments easily and access resources whenever I needed them. My counselor was always just a message away!",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f9595025-1767185860161.png",
    alt: "Young woman with long brown hair smiling at camera wearing casual blue sweater",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "School Counselor",
    content: "This platform has transformed how I work with students. I can manage my caseload efficiently, track student progress, and maintain meaningful connections without feeling overwhelmed. It's a game-changer.",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c3671659-1763299671587.png",
    alt: "Professional Asian man in navy blazer with short black hair smiling confidently",
    rating: 5
  },
  {
    id: 3,
    name: "Jennifer Martinez",
    role: "Parent",
    content: "As a parent, I love being able to see my daughter's progress and communicate with her counselor. The platform keeps me informed and involved in her academic journey. Highly recommend!",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_11bdfc8f0-1763296614484.png",
    alt: "Hispanic woman with shoulder-length dark hair in professional attire smiling warmly",
    rating: 5
  }];


  return (
    <section className={`py-16 lg:py-24 bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent/10 rounded-full px-4 py-2 text-sm font-medium text-accent mb-4">
            <Icon name="StarIcon" size={16} variant="solid" />
            <span>Success Stories</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Hear From Our Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from students, counselors, and parents who have transformed their counseling journey with CounselConnect.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) =>
          <div
            key={testimonial.id}
            className="bg-card rounded-2xl p-6 shadow-md hover:shadow-brand-lg transition-all duration-300 border border-border">

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, index) =>
              <Icon
                key={index}
                name="StarIcon"
                size={20}
                variant="solid"
                className="text-amber-400" />

              )}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <AppImage
                  src={testimonial.image}
                  alt={testimonial.alt}
                  className="w-full h-full object-cover" />

                </div>
                
                <div>
                  <div className="font-heading font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

};

export default TestimonialsSection;