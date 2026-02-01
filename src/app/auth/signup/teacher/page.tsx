'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { schools, getSchoolDisplayName, getSchoolById } from '@/data/schools';
import { useAuth } from '@/context/AuthContext';

export default function TeacherSignupPage() {
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
    subject: '',
    department: '',
    inviteCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.inviteCode) newErrors.inviteCode = 'School invite code is required';
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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const school = getSchoolById(formData.school);

    register({
      id: `teacher_${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: 'teacher',
      schoolId: formData.school,
      schoolName: school?.name || '',
      subject: formData.subject,
      department: formData.department,
    });

    router.push('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
                step >= 1 ? 'bg-amber-500' : 'bg-muted'
              }`}
            />
            <div
              className={`flex-1 h-1 rounded-full ${
                step >= 2 ? 'bg-amber-500' : 'bg-muted'
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
                : 'Step 2: School and teaching details'}
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
                    placeholder="Michael"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    placeholder="Johnson"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                  />
                </div>

                <Input
                  label="School email"
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
                  className="bg-amber-500 text-white hover:bg-amber-600"
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
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    error={errors.subject}
                    options={[
                      { value: '', label: 'Select subject' },
                      { value: 'math', label: 'Mathematics' },
                      { value: 'english', label: 'English' },
                      { value: 'science', label: 'Science' },
                      { value: 'history', label: 'History' },
                      { value: 'art', label: 'Art' },
                      { value: 'music', label: 'Music' },
                      { value: 'pe', label: 'Physical Education' },
                      { value: 'cs', label: 'Computer Science' },
                      { value: 'foreign_lang', label: 'Foreign Language' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                  <Select
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select department' },
                      { value: 'stem', label: 'STEM' },
                      { value: 'humanities', label: 'Humanities' },
                      { value: 'arts', label: 'Arts' },
                      { value: 'athletics', label: 'Athletics' },
                      { value: 'general', label: 'General' },
                    ]}
                  />
                </div>

                <Input
                  label="School invite code"
                  name="inviteCode"
                  placeholder="Enter code from school admin"
                  value={formData.inviteCode}
                  onChange={handleInputChange}
                  error={errors.inviteCode}
                  hint="Contact your school admin if you don't have a code"
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
                    className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
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
            <Link href="/terms" className="text-amber-500 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-amber-500 hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-amber-500 hover:text-amber-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-500 to-amber-600 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <svg
              className="w-32 h-32 mx-auto text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Support student success
          </h2>
          <p className="text-white/80">
            Collaborate with counselors, connect with parents, and help your
            students achieve their full potential.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Team collaboration</p>
                <p className="text-xs text-white/70">Work with counselors & parents</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Track progress</p>
                <p className="text-xs text-white/70">Monitor student development</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
