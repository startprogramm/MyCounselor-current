'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { schools, getSchoolDisplayName, getSchoolById } from '@/data/schools';
import { useAuth } from '@/context/AuthContext';

export default function ParentSignupPage() {
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
    childFirstName: '',
    childLastName: '',
    childGrade: '',
    relationship: '',
    parentCode: '',
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
    if (!formData.childFirstName) newErrors.childFirstName = 'Child\'s first name is required';
    if (!formData.childLastName) newErrors.childLastName = 'Child\'s last name is required';
    if (!formData.childGrade) newErrors.childGrade = 'Child\'s grade is required';
    if (!formData.relationship) newErrors.relationship = 'Relationship is required';
    if (!formData.parentCode) newErrors.parentCode = 'Parent verification code is required';
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
      id: `parent_${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: 'parent',
      schoolId: formData.school,
      schoolName: school?.name || '',
      relationship: formData.relationship,
      childrenNames: [`${formData.childFirstName} ${formData.childLastName}`],
    });

    router.push('/parent/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
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
                step >= 1 ? 'bg-rose-500' : 'bg-muted'
              }`}
            />
            <div
              className={`flex-1 h-1 rounded-full ${
                step >= 2 ? 'bg-rose-500' : 'bg-muted'
              }`}
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground font-heading">
              {step === 1 ? 'Create your account' : 'Link your child'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {step === 1
                ? 'Step 1: Enter your personal details'
                : 'Step 2: Connect with your child\'s school'}
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
                    placeholder="Jennifer"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                  />
                </div>

                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
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
                  className="bg-rose-500 text-white hover:bg-rose-600"
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Select
                  label="Child's school"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  error={errors.school}
                  options={[
                    { value: '', label: 'Select school' },
                    ...schools.map(school => ({
                      value: school.id,
                      label: getSchoolDisplayName(school),
                    })),
                  ]}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Child's first name"
                    name="childFirstName"
                    placeholder="Alex"
                    value={formData.childFirstName}
                    onChange={handleInputChange}
                    error={errors.childFirstName}
                  />
                  <Input
                    label="Child's last name"
                    name="childLastName"
                    placeholder="Smith"
                    value={formData.childLastName}
                    onChange={handleInputChange}
                    error={errors.childLastName}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Child's grade"
                    name="childGrade"
                    value={formData.childGrade}
                    onChange={handleInputChange}
                    error={errors.childGrade}
                    options={[
                      { value: '', label: 'Select grade' },
                      { value: '9', label: '9th Grade' },
                      { value: '10', label: '10th Grade' },
                      { value: '11', label: '11th Grade' },
                    ]}
                  />
                  <Select
                    label="Relationship"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    error={errors.relationship}
                    options={[
                      { value: '', label: 'Select relationship' },
                      { value: 'mother', label: 'Mother' },
                      { value: 'father', label: 'Father' },
                      { value: 'guardian', label: 'Guardian' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </div>

                <Input
                  label="Parent verification code"
                  name="parentCode"
                  placeholder="Enter code from school"
                  value={formData.parentCode}
                  onChange={handleInputChange}
                  error={errors.parentCode}
                  hint="Your child's school will provide this code"
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
                    className="flex-1 bg-rose-500 text-white hover:bg-rose-600"
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
            <Link href="/terms" className="text-rose-500 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-rose-500 hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-rose-500 hover:text-rose-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-rose-500 to-rose-600 items-center justify-center p-12">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay connected with your child&apos;s education
          </h2>
          <p className="text-white/80">
            Monitor progress, communicate with counselors and teachers, and
            support your child&apos;s journey to success.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Real-time updates</p>
                <p className="text-xs text-white/70">Stay informed about your child</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Direct communication</p>
                <p className="text-xs text-white/70">Message counselors & teachers</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Track milestones</p>
                <p className="text-xs text-white/70">Celebrate achievements together</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
