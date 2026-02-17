'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { majors, riasecDescriptions, type RIASECCode, type Major } from '../data/majors';

interface AssessmentQuestion {
  id: number;
  text: string;
  code: RIASECCode;
}

const assessmentQuestions: AssessmentQuestion[] = [
  // Realistic (R)
  { id: 1, text: 'I enjoy working with tools, machines, or building things.', code: 'R' },
  { id: 2, text: 'I like being outdoors and doing physical activities.', code: 'R' },
  { id: 3, text: 'I prefer hands-on tasks over theoretical discussions.', code: 'R' },
  // Investigative (I)
  { id: 4, text: 'I enjoy researching and learning about how things work.', code: 'I' },
  { id: 5, text: 'I like solving complex problems and puzzles.', code: 'I' },
  { id: 6, text: 'I enjoy conducting experiments or analyzing data.', code: 'I' },
  // Artistic (A)
  { id: 7, text: 'I enjoy creative activities like writing, painting, or music.', code: 'A' },
  { id: 8, text: 'I value originality and self-expression.', code: 'A' },
  { id: 9, text: 'I prefer working in flexible, unstructured environments.', code: 'A' },
  // Social (S)
  { id: 10, text: 'I enjoy helping, teaching, or counseling other people.', code: 'S' },
  { id: 11, text: 'I am good at understanding other people\'s feelings.', code: 'S' },
  { id: 12, text: 'I like working in teams and collaborating with others.', code: 'S' },
  // Enterprising (E)
  { id: 13, text: 'I enjoy leading, persuading, and motivating people.', code: 'E' },
  { id: 14, text: 'I like taking risks and starting new projects.', code: 'E' },
  { id: 15, text: 'I enjoy debating ideas and influencing decisions.', code: 'E' },
  // Conventional (C)
  { id: 16, text: 'I enjoy organizing information and keeping records.', code: 'C' },
  { id: 17, text: 'I like following clear procedures and instructions.', code: 'C' },
  { id: 18, text: 'I pay close attention to details and accuracy.', code: 'C' },
];

const ratingLabels = ['1', '2', '3', '4', '5'];

function calculateRIASEC(answers: Record<number, number>) {
  const scores: Record<RIASECCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const q of assessmentQuestions) {
    scores[q.code] += answers[q.id] ?? 3;
  }

  const sorted = (Object.entries(scores) as [RIASECCode, number][])
    .sort((a, b) => b[1] - a[1]);

  return { scores, topCodes: sorted.slice(0, 3).map(([code]) => code) };
}

function getMatchingMajors(topCodes: RIASECCode[]): { major: Major; matchCount: number }[] {
  const scored = majors.map((major) => {
    const matchCount = major.riasecCodes.filter((c) => topCodes.includes(c)).length;
    return { major, matchCount };
  });

  return scored
    .filter((s) => s.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 8);
}

const codeColors: Record<RIASECCode, string> = {
  R: '#D93025',
  I: '#1A73E8',
  A: '#AB47BC',
  S: '#1E8E3E',
  E: '#EA8600',
  C: '#5F6368',
};

export default function AssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = (currentIndex / assessmentQuestions.length) * 100;
  const question = assessmentQuestions[currentIndex];

  const handleRate = (value: number) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < assessmentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const { scores, topCodes } = showResults ? calculateRIASEC(answers) : { scores: {} as Record<RIASECCode, number>, topCodes: [] as RIASECCode[] };
  const matchingMajors = showResults ? getMatchingMajors(topCodes) : [];
  const maxScore = 15; // 3 questions * max 5

  const growthColor = (outlook: string) => {
    if (outlook === 'High') return 'text-[#1E8E3E] bg-[#1E8E3E]/10';
    if (outlook === 'Medium') return 'text-[#EA8600] bg-[#EA8600]/10';
    return 'text-[#5F6368] bg-[#5F6368]/10';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/tools/major-finder"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <Icon name="ArrowLeftIcon" size={18} variant="outline" />
            Back to Major Finder
          </Link>

          {!showResults ? (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-foreground font-heading">Personality Assessment</h1>
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {assessmentQuestions.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#EA8600] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                <p className="text-xl font-medium text-foreground mb-8 text-center">
                  {question.text}
                </p>

                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Rate from 1 (Not at all) to 5 (Very much)
                  </p>
                  <div className="flex gap-3">
                    {ratingLabels.map((label, i) => {
                      const value = i + 1;
                      const isSelected = answers[question.id] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => handleRate(value)}
                          className={`w-14 h-14 rounded-xl border-2 text-lg font-bold transition-all duration-200 ${
                            isSelected
                              ? 'border-[#EA8600] bg-[#EA8600] text-white scale-110'
                              : 'border-border hover:border-[#EA8600]/50 hover:bg-[#EA8600]/5 text-foreground'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between w-full max-w-[310px] mt-1">
                    <span className="text-xs text-muted-foreground">Not at all</span>
                    <span className="text-xs text-muted-foreground">Very much</span>
                  </div>
                </div>

                {currentIndex > 0 && (
                  <button
                    onClick={handleBack}
                    className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Icon name="ArrowLeftIcon" size={14} variant="outline" />
                    Previous question
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Personality Code */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#EA8600] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="UserCircleIcon" size={32} className="text-white" variant="solid" />
                </div>
                <h1 className="text-3xl font-bold text-foreground font-heading mb-2">Your Personality Code</h1>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {topCodes.map((code) => (
                    <span
                      key={code}
                      className="px-4 py-2 rounded-xl text-white font-bold text-lg"
                      style={{ backgroundColor: codeColors[code] }}
                    >
                      {code}
                    </span>
                  ))}
                </div>
                <p className="text-lg font-medium text-foreground mb-1">
                  {topCodes.map((c) => riasecDescriptions[c].name).join(' - ')}
                </p>
              </div>

              {/* RIASEC Breakdown */}
              <div className="bg-card rounded-2xl border border-border p-6 mb-8">
                <h2 className="font-bold text-foreground mb-4">Score Breakdown</h2>
                <div className="space-y-3">
                  {(Object.entries(scores) as [RIASECCode, number][])
                    .sort((a, b) => b[1] - a[1])
                    .map(([code, score]) => (
                      <div key={code} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium text-foreground">
                          {riasecDescriptions[code].name}
                        </span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(score / maxScore) * 100}%`,
                              backgroundColor: codeColors[code],
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground w-10 text-right">
                          {score}/{maxScore}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top Code Descriptions */}
              <div className="grid gap-3 mb-8">
                {topCodes.map((code) => (
                  <div key={code} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: codeColors[code] }}
                    >
                      {code}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{riasecDescriptions[code].name}</p>
                      <p className="text-sm text-muted-foreground">{riasecDescriptions[code].description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Majors */}
              <h2 className="text-xl font-bold text-foreground mb-4">Recommended Majors</h2>
              <div className="space-y-3 mb-8">
                {matchingMajors.map(({ major }) => (
                  <div key={major.id} className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-foreground">{major.name}</h3>
                        <span className="text-xs text-muted-foreground">{major.field}</span>
                      </div>
                      <div className="flex gap-1">
                        {major.riasecCodes.map((c) => (
                          <span
                            key={c}
                            className="w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center"
                            style={{ backgroundColor: codeColors[c] }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{major.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{major.salaryRange}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${growthColor(major.growthOutlook)}`}>
                        {major.growthOutlook} growth
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRetake}
                  className="px-6 py-3 rounded-xl border-2 border-[#EA8600] text-[#EA8600] font-medium hover:bg-[#EA8600]/5 transition-colors"
                >
                  Retake Assessment
                </button>
                <Link
                  href="/tools/major-finder/browse"
                  className="px-6 py-3 rounded-xl bg-[#1A73E8] text-white font-medium hover:bg-[#185ABC] transition-colors text-center"
                >
                  Browse All Majors
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
