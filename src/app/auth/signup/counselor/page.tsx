'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { schools, getSchoolDisplayName, getSchoolById } from '@/data/schools';
import { useAuth } from '@/context/AuthContext';

export default function CounselorSignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    department: '',
    title: '',
    inviteCode: '',
    bio: '',
    specializations: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.school) newErrors.school = 'School is required';
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.inviteCode) newErrors.inviteCode = 'Admin invite code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get school name for display
    const school = getSchoolById(formData.school);

    // Save user data
    register({
      id: `counselor_${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: 'counselor',
      schoolId: formData.school,
      schoolName: school?.name || '',
      title: formData.title,
      department: formData.department,
    });

    router.push('/counselor/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-secondary-foreground"
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
            <span className="text-2xl font-bold text-foreground font-heading">
              MyCounselor
            </span>
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className={`flex-1 h-1 rounded-full ${
                step >= 1 ? 'bg-secondary' : 'bg-muted'
              }`}
            />
            <div
              className={`flex-1 h-1 rounded-full ${
                step >= 2 ? 'bg-secondary' : 'bg-muted'
              }`}
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground font-heading">
              {step === 1 ? 'Create your account' : 'Professional information'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {step === 1
                ? 'Step 1: Enter your personal details'
                : 'Step 2: School and credentials'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    name="firstName"
                    placeholder="Sarah"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    placeholder="Martinez"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                  />
                </div>

                <Input
                  label="Professional email"
                  type="email"
                  name="email"
                  placeholder="you@school.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  hint="Must be at least 8 characters"
                />

                <Input
                  label="Confirm password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                />

                <Button
                  type="button"
                  fullWidth
                  onClick={handleNext}
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Select
                  label="School"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  error={errors.school}
                  options={[
                    { value: '', label: 'Select your school' },
                    ...schools.map(school => ({
                      value: school.id,
                      label: getSchoolDisplayName(school),
                    })),
                  ]}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select department' },
                      { value: 'academic', label: 'Academic Counseling' },
                      { value: 'college', label: 'College & Career' },
                      { value: 'personal', label: 'Personal Counseling' },
                      { value: 'general', label: 'General' },
                    ]}
                  />
                  <Input
                    label="Title"
                    name="title"
                    placeholder="School Counselor"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={errors.title}
                  />
                </div>

                <Input
                  label="Admin invite code"
                  name="inviteCode"
                  placeholder="Enter code from school admin"
                  value={formData.inviteCode}
                  onChange={handleInputChange}
                  error={errors.inviteCode}
                  hint="Contact your school admin if you don't have a code"
                />

                <Textarea
                  label="Bio (optional)"
                  name="bio"
                  placeholder="Tell students about yourself and your areas of expertise..."
                  value={formData.bio}
                  onChange={handleInputChange}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    Create account
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-secondary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-secondary hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-secondary hover:text-secondary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary to-secondary/80 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <svg
              className="w-32 h-32 mx-auto text-secondary-foreground/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
            Empower your students
          </h2>
          <p className="text-secondary-foreground/80">
            Streamline your workflow, track student progress, and make a bigger
            impact with tools designed for modern counselors.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 bg-secondary-foreground/10 rounded-lg p-4">
              <div className="w-10 h-10 bg-secondary-foreground/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-secondary-foreground">Save time</p>
                <p className="text-xs text-secondary-foreground/70">Automated scheduling & reminders</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-secondary-foreground/10 rounded-lg p-4">
              <div className="w-10 h-10 bg-secondary-foreground/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-secondary-foreground">Track progress</p>
                <p className="text-xs text-secondary-foreground/70">Student goals & milestones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
