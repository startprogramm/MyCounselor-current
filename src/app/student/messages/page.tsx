'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

const conversations = [
  {
    id: 1,
    counselor: 'Dr. Sarah Martinez',
    avatar: 'SM',
    lastMessage: 'Great progress on your essay! Let me know if you have questions.',
    timestamp: '2 hours ago',
    unread: 2,
  },
  {
    id: 2,
    counselor: 'Mr. James Chen',
    avatar: 'JC',
    lastMessage: 'Your schedule change has been approved.',
    timestamp: 'Yesterday',
    unread: 0,
  },
];

const mockMessages = [
  {
    id: 1,
    sender: 'counselor',
    content: 'Hi Alex! I reviewed your college essay draft. You have a strong opening, but I think we can make the conclusion more impactful.',
    timestamp: '10:30 AM',
  },
  {
    id: 2,
    sender: 'student',
    content: 'Thank you for reviewing it! What changes would you suggest for the conclusion?',
    timestamp: '10:45 AM',
  },
  {
    id: 3,
    sender: 'counselor',
    content: 'I would recommend tying your conclusion back to the opening anecdote. This creates a nice narrative arc. Also, try to end with forward-looking statements about your goals.',
    timestamp: '11:00 AM',
  },
  {
    id: 4,
    sender: 'counselor',
    content: 'Great progress on your essay! Let me know if you have questions about implementing these changes.',
    timestamp: '11:05 AM',
  },
];

export default function StudentMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    // Handle message send
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
          Messages
        </h1>
        <p className="text-muted-foreground mt-1">
          Communicate securely with your counselors
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r border-border flex-shrink-0 ${
          showMobileList ? 'block' : 'hidden md:block'
        }`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv);
                  setShowMobileList(false);
                }}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedConversation.id === conv.id ? 'bg-muted/50' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground truncate">{conv.counselor}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{conv.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <button
              className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
              onClick={() => setShowMobileList(true)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {selectedConversation.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{selectedConversation.counselor}</h3>
              <p className="text-xs text-muted-foreground">College & Career Counselor</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'student'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'student' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
