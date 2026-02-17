'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function ParentMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Messages</h1>
        <p className="text-muted-foreground mt-1">Communicate with your child&apos;s counselors</p>
      </div>

      <Card className="p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="font-medium text-foreground text-lg">Messaging Coming Soon</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Parent-counselor messaging is being set up. You&apos;ll be able to communicate directly with your child&apos;s school counselors here.
        </p>
      </Card>
    </div>
  );
}
