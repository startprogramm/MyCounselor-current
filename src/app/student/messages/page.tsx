'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: number;
  sender: 'student' | 'counselor';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  counselor: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

const STORAGE_KEY = 'mycounselor_student_messages';

function getDefaultConversations(firstName: string): Conversation[] {
  return [
    {
      id: 1,
      counselor: 'Dr. Sarah Martinez',
      avatar: 'SM',
      lastMessage: 'Great progress on your essay! Let me know if you have questions.',
      timestamp: 'Today',
      unread: 2,
      messages: [
        {
          id: 1,
          sender: 'counselor',
          content: `Hi ${firstName}! I reviewed your college essay draft. You have a strong opening, but I think we can make the conclusion more impactful.`,
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
      ],
    },
    {
      id: 2,
      counselor: 'Mr. James Chen',
      avatar: 'JC',
      lastMessage: 'Your schedule change has been approved.',
      timestamp: 'Yesterday',
      unread: 0,
      messages: [
        {
          id: 1,
          sender: 'student',
          content: 'Hi Mr. Chen, I submitted a request to switch from AP Physics to AP Chemistry. Is that still possible?',
          timestamp: '2:15 PM',
        },
        {
          id: 2,
          sender: 'counselor',
          content: `Hi ${firstName}! Yes, I checked and there's still an open spot in AP Chemistry Period 3. I'll process the change for you.`,
          timestamp: '3:30 PM',
        },
        {
          id: 3,
          sender: 'student',
          content: 'That would be great, thank you!',
          timestamp: '3:45 PM',
        },
        {
          id: 4,
          sender: 'counselor',
          content: 'Your schedule change has been approved. The new schedule will take effect next Monday. Let me know if you need anything else!',
          timestamp: '4:00 PM',
        },
      ],
    },
  ];
}

// Auto-reply templates based on keywords
function generateAutoReply(message: string, counselorName: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes('thank') || lower.includes('thanks')) {
    return "You're welcome! Don't hesitate to reach out if you need anything else.";
  }
  if (lower.includes('help') || lower.includes('question')) {
    return "Of course! I'm here to help. Could you provide a bit more detail about what you need assistance with?";
  }
  if (lower.includes('meeting') || lower.includes('appointment') || lower.includes('schedule')) {
    return "Sure! You can book a meeting with me directly from the Meetings page, or I can suggest a time. What works best for you this week?";
  }
  if (lower.includes('college') || lower.includes('university') || lower.includes('application')) {
    return "Great question about your college journey! Let's discuss this in more detail. Would you like to set up a meeting to go over your options?";
  }
  if (lower.includes('grade') || lower.includes('class') || lower.includes('course')) {
    return "I understand your concern about your academics. Let me look into this and get back to you with some options.";
  }
  // Generic reply for anything else
  return "Thanks for your message! I'll review this and get back to you shortly. If it's urgent, feel free to book a meeting with me.";
}

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number>(1);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConvId) || conversations[0];

  // Load conversations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setConversations(JSON.parse(stored));
    } else {
      const defaults = getDefaultConversations(user?.firstName || 'there');
      setConversations(defaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
  }, [user?.firstName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const saveConversations = (updated: Conversation[]) => {
    setConversations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const studentMsg: Message = {
      id: Date.now(),
      sender: 'student',
      content: newMessage.trim(),
      timestamp: timeStr,
    };

    const updated = conversations.map(conv => {
      if (conv.id === selectedConvId) {
        return {
          ...conv,
          messages: [...conv.messages, studentMsg],
          lastMessage: newMessage.trim(),
          timestamp: 'Just now',
        };
      }
      return conv;
    });

    saveConversations(updated);
    const sentMessage = newMessage.trim();
    setNewMessage('');

    // Auto-reply after a short delay
    setTimeout(() => {
      const reply = generateAutoReply(sentMessage, selectedConversation.counselor);
      if (reply) {
        const replyTime = new Date();
        replyTime.setMinutes(replyTime.getMinutes() + 1);
        const replyTimeStr = replyTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        const replyMsg: Message = {
          id: Date.now() + 1,
          sender: 'counselor',
          content: reply,
          timestamp: replyTimeStr,
        };

        setConversations(prev => {
          const withReply = prev.map(conv => {
            if (conv.id === selectedConvId) {
              return {
                ...conv,
                messages: [...conv.messages, replyMsg],
                lastMessage: reply,
                timestamp: 'Just now',
              };
            }
            return conv;
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(withReply));
          return withReply;
        });
      }
    }, 1500);
  };

  const handleSelectConversation = (convId: number) => {
    setSelectedConvId(convId);
    setShowMobileList(false);

    // Mark as read
    const updated = conversations.map(conv => {
      if (conv.id === convId) {
        return { ...conv, unread: 0 };
      }
      return conv;
    });
    saveConversations(updated);
  };

  if (conversations.length === 0) return null;

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
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedConvId === conv.id ? 'bg-muted/50' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-medium truncate ${conv.unread > 0 ? 'text-foreground' : 'text-foreground'}`}>
                      {conv.counselor}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{conv.timestamp}</span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${conv.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.lastMessage}
                  </p>
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
          {selectedConversation && (
            <>
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
                  <p className="text-xs text-success">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg) => (
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
                <div ref={messagesEndRef} />
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
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
