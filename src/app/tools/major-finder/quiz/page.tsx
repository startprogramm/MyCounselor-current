'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { majors, type InterestTag, type RIASECCode, type Major } from '../data/majors';

interface QuizQuestion {
  id: number;
  text: string;
  interestTags: InterestTag[];
  riasecCodes: RIASECCode[];
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    text: 'I enjoy solving puzzles, brain teasers, or logic problems.',
    interestTags: ['analytical', 'problem-solving'],
    riasecCodes: ['I'],
  },
  {
    id: 2,
    text: 'I like building or fixing things with my hands.',
    interestTags: ['hands-on', 'engineering'],
    riasecCodes: ['R'],
  },
  {
    id: 3,
    text: 'I enjoy expressing myself through art, music, or writing.',
    interestTags: ['creative', 'design', 'writing'],
    riasecCodes: ['A'],
  },
  {
    id: 4,
    text: 'I feel fulfilled when I help others with their problems.',
    interestTags: ['helping-people', 'healthcare'],
    riasecCodes: ['S'],
  },
  {
    id: 5,
    text: 'I like working with computers and technology.',
    interestTags: ['technology', 'data'],
    riasecCodes: ['I', 'R'],
  },
  {
    id: 6,
    text: 'I enjoy leading group projects or organizing events.',
    interestTags: ['leadership', 'business'],
    riasecCodes: ['E'],
  },
  {
    id: 7,
    text: 'I\'m fascinated by how the human body or nature works.',
    interestTags: ['science', 'research', 'environment'],
    riasecCodes: ['I'],
  },
  {
    id: 8,
    text: 'I enjoy working with numbers, spreadsheets, or data.',
    interestTags: ['math', 'data', 'analytical'],
    riasecCodes: ['C', 'I'],
  },
  {
    id: 9,
    text: 'I care deeply about social issues and fairness.',
    interestTags: ['social-justice', 'helping-people', 'communication'],
    riasecCodes: ['S', 'E'],
  },
  {
    id: 10,
    text: 'I enjoy presenting ideas and persuading others.',
    interestTags: ['communication', 'leadership', 'business'],
    riasecCodes: ['E', 'A'],
  },
];

const answerOptions = [
  { label: 'Strongly Agree', value: 5 },
  { label: 'Agree', value: 4 },
  { label: 'Neutral', value: 3 },
  { label: 'Disagree', value: 2 },
  { label: 'Strongly Disagree', value: 1 },
];

function calculateResults(answers: Record<number, number>): { major: Major; score: number }[] {
  const tagScores: Partial<Record<InterestTag, number>> = {};
  const riasecScores: Partial<Record<RIASECCode, number>> = {};

  for (const q of questions) {
    const answer = answers[q.id] ?? 3;
    for (const tag of q.interestTags) {
      tagScores[tag] = (tagScores[tag] || 0) + answer;
    }
    for (const code of q.riasecCodes) {
      riasecScores[code] = (riasecScores[code] || 0) + answer;
    }
  }

  const scored = majors.map((major) => {
    let score = 0;
    let maxPossible = 0;

    for (const tag of major.interestTags) {
      score += tagScores[tag] || 0;
      maxPossible += 25;
    }
    for (const code of major.riasecCodes) {
      score += (riasecScores[code] || 0) * 2;
      maxPossible += 50;
    }

    const percentage = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
    return { major, score: Math.min(percentage, 99) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion) / questions.length) * 100;
  const question = questions[currentQuestion];
  const results = showResults ? calculateResults(answers) : [];

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

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
          {/* Back link */}
          <Link
            href="/tools/major-finder"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <Icon name="ArrowLeftIcon" size={18} variant="outline" />
            Back to Major Finder
          </Link>

          {!showResults ? (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-foreground font-heading">Quick Quiz</h1>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A73E8] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                <p className="text-xl font-medium text-foreground mb-8 text-center">
                  {question.text}
                </p>

                <div className="flex flex-col gap-3">
                  {answerOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full px-6 py-4 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
                        answers[question.id] === option.value
                          ? 'border-[#1A73E8] bg-[#1A73E8]/10 text-[#1A73E8]'
                          : 'border-border hover:border-[#1A73E8]/50 hover:bg-[#1A73E8]/5 text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {currentQuestion > 0 && (
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
              {/* Results */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#1E8E3E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckIcon" size={32} className="text-white" variant="solid" />
                </div>
                <h1 className="text-3xl font-bold text-foreground font-heading mb-2">Your Top Matches</h1>
                <p className="text-muted-foreground">
                  Based on your answers, here are the majors that best fit your interests.
                </p>
              </div>

              <div className="space-y-4">
                {results.map(({ major, score }, index) => (
                  <div
                    key={major.id}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-[#1A73E8] text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{major.name}</h3>
                          <span className="text-sm text-muted-foreground">{major.field}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#1A73E8]">{score}%</span>
                        <p className="text-xs text-muted-foreground">match</p>
                      </div>
                    </div>

                    {/* Match bar */}
                    <div className="w-full h-2 bg-muted rounded-full mb-4">
                      <div
                        className="h-full bg-[#1A73E8] rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{major.description}</p>

                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground mb-1">Careers</p>
                        <p className="text-muted-foreground">{major.careers.slice(0, 3).join(', ')}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">Salary Range</p>
                        <p className="text-muted-foreground">{major.salaryRange}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">Growth</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${growthColor(major.growthOutlook)}`}>
                          {major.growthOutlook}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
                <button
                  onClick={handleRetake}
                  className="px-6 py-3 rounded-xl border-2 border-[#1A73E8] text-[#1A73E8] font-medium hover:bg-[#1A73E8]/5 transition-colors"
                >
                  Retake Quiz
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
