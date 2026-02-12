'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuth, User } from '@/context/AuthContext';

interface Message {
  id: number;
  sender: 'student' | 'counselor';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  counselor: string;
  counselorId?: string;
  avatar: string;
  avatarImage?: string;
  counselorTitle?: string;
  department?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
  studentName?: string;
  studentId?: string;
}

function getStorageKey(userId: string) {
  return `mycounselor_student_messages_${userId}`;
}

function buildConversationsFromCounselors(
  counselors: User[],
  existingConversations: Conversation[],
  student: User
): Conversation[] {
  return counselors.map((c, index) => {
    const name = `${c.firstName} ${c.lastName}`;
    const initials = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();
    const existing = existingConversations.find(
      (conv) => conv.counselor === name || conv.counselorId === c.id
    );

    return {
      id: index + 1,
      counselor: name,
      counselorId: c.id,
      avatar: initials,
      avatarImage: c.profileImage || existing?.avatarImage,
      counselorTitle: c.title || existing?.counselorTitle || 'School Counselor',
      department: c.department || existing?.department || 'General',
      lastMessage: existing?.lastMessage || 'Start a conversation',
      timestamp: existing?.timestamp || '',
      unread: existing?.unread || 0,
      messages: existing?.messages || [],
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.id,
    };
  });
}

function generateAutoReply(message: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes('thank') || lower.includes('thanks')) {
    return "You're welcome. Reach out anytime if you need support.";
  }
  if (lower.includes('help') || lower.includes('question')) {
    return 'Of course. Share a bit more detail and I can guide you better.';
  }
  if (lower.includes('meeting') || lower.includes('appointment') || lower.includes('schedule')) {
    return 'Absolutely. You can book a time from the Meetings page, or I can suggest a slot.';
  }
  if (lower.includes('college') || lower.includes('university') || lower.includes('application')) {
    return 'Great question. Let us review your options together in a focused meeting.';
  }
  if (lower.includes('grade') || lower.includes('class') || lower.includes('course')) {
    return 'Understood. I can help with an academic plan based on your current classes.';
  }

  return "Thanks for your message. I'll review this and reply with next steps shortly.";
}

export default function StudentMessagesPage() {
  const { user, getSchoolCounselors } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number>(0);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConvId) || conversations[0];

  const filteredConversations = conversations.filter((conversation) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      conversation.counselor.toLowerCase().includes(query) ||
      (conversation.department || '').toLowerCase().includes(query) ||
      (conversation.lastMessage || '').toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (!user?.schoolId || !user?.id) return;

    const counselors = getSchoolCounselors(user.schoolId);
    const storageKey = getStorageKey(user.id);
    const stored = localStorage.getItem(storageKey);
    let existingConversations: Conversation[] = [];

    if (stored) {
      try {
        existingConversations = JSON.parse(stored);
      } catch {
        existingConversations = [];
      }
    }

    if (existingConversations.length === 0) {
      const oldStored = localStorage.getItem('mycounselor_student_messages');
      if (oldStored) {
        try {
          existingConversations = JSON.parse(oldStored);
        } catch {
          existingConversations = [];
        }
      }
    }

    if (counselors.length > 0) {
      const merged = buildConversationsFromCounselors(counselors, existingConversations, user);
      setConversations(merged);
      setSelectedConvId((prev) =>
        merged.some((conversation) => conversation.id === prev) ? prev : merged[0].id
      );
      localStorage.setItem(storageKey, JSON.stringify(merged));
      return;
    }

    setConversations([]);
    setSelectedConvId(0);
  }, [user?.schoolId, user?.id, getSchoolCounselors, user]);

  // Refresh conversations periodically to catch new counselor messages
  useEffect(() => {
    if (!user?.schoolId || !user?.id) return;
    const interval = setInterval(() => {
      const storageKey = getStorageKey(user.id);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const latest: Conversation[] = JSON.parse(stored);
          setConversations(latest);
        } catch {
          // skip
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user?.schoolId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, conversations]);

  const saveConversations = (updated: Conversation[]) => {
    setConversations(updated);
    if (user?.id) {
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(updated));
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const currentConvId = selectedConversation.id;
    const messageToSend = newMessage.trim();

    const studentMessage: Message = {
      id: Date.now(),
      sender: 'student',
      content: messageToSend,
      timestamp: timeStr,
    };

    const updated = conversations.map((conversation) => {
      if (conversation.id === currentConvId) {
        return {
          ...conversation,
          messages: [...conversation.messages, studentMessage],
          lastMessage: messageToSend,
          timestamp: 'Just now',
        };
      }
      return conversation;
    });

    saveConversations(updated);
    setNewMessage('');

    setTimeout(() => {
      const reply = generateAutoReply(messageToSend);
      if (!reply) return;

      const replyTime = new Date();
      replyTime.setMinutes(replyTime.getMinutes() + 1);
      const replyTimeStr = replyTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const replyMessage: Message = {
        id: Date.now() + 1,
        sender: 'counselor',
        content: reply,
        timestamp: replyTimeStr,
      };

      setConversations((previous) => {
        const withReply = previous.map((conversation) => {
          if (conversation.id === currentConvId) {
            return {
              ...conversation,
              messages: [...conversation.messages, replyMessage],
              lastMessage: reply,
              timestamp: 'Just now',
            };
          }
          return conversation;
        });
        if (user?.id) {
          localStorage.setItem(getStorageKey(user.id), JSON.stringify(withReply));
        }
        return withReply;
      });
    }, 1500);
  };

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConvId(conversationId);
    setShowMobileList(false);

    const updated = conversations.map((conversation) => {
      if (conversation.id === conversationId) {
        return { ...conversation, unread: 0 };
      }
      return conversation;
    });
    saveConversations(updated);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Clear, private conversations with your counselors
          </p>
        </div>
        <div className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground">
          {conversations.length} active conversation{conversations.length === 1 ? '' : 's'}
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center">
          <div className="text-center py-12 px-4">
            <svg
              className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="font-medium text-foreground text-lg">No counselors available yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              No counselors have registered at your school yet. Once they join, messaging will
              appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex">
          <div
            className={`w-full md:w-[22rem] border-r border-border flex-shrink-0 ${
              showMobileList ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-foreground">Conversations</h2>
                <span className="text-xs text-muted-foreground">
                  {filteredConversations.length}
                </span>
              </div>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search counselor..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-full">
              {filteredConversations.length === 0 && (
                <div className="p-5 text-sm text-muted-foreground">No matching conversations.</div>
              )}
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`w-full p-3.5 text-left border-b border-border/60 transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-primary/5'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {conversation.avatarImage ? (
                        <img
                          src={conversation.avatarImage}
                          alt={conversation.counselor}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {conversation.avatar}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {conversation.counselor}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {conversation.timestamp || '--'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {conversation.counselorTitle || 'School Counselor'} •{' '}
                        {conversation.department || 'General'}
                      </p>
                      <p
                        className={`text-sm truncate mt-1 ${
                          conversation.unread > 0
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {conversation.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`flex-1 flex flex-col ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation && (
              <>
                <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                      onClick={() => setShowMobileList(true)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {selectedConversation.avatarImage ? (
                        <img
                          src={selectedConversation.avatarImage}
                          alt={selectedConversation.counselor}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {selectedConversation.avatar}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {selectedConversation.counselor}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedConversation.counselorTitle || 'School Counselor'} •{' '}
                        {selectedConversation.department || 'General'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/student/meetings"
                    className="hidden sm:inline-flex px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Book Meeting
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-muted/10">
                  {selectedConversation.messages.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 opacity-50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm mt-1">Send a message to start the conversation</p>
                      </div>
                    </div>
                  )}

                  {selectedConversation.messages.map((message) => {
                    const isStudentMessage = message.sender === 'student';
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${isStudentMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isStudentMessage && (
                          <div className="w-8 h-8 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center mt-0.5 flex-shrink-0">
                            {selectedConversation.avatarImage ? (
                              <img
                                src={selectedConversation.avatarImage}
                                alt={selectedConversation.counselor}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-primary">
                                {selectedConversation.avatar}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="max-w-[85%]">
                          <div
                            className={`rounded-2xl px-4 py-3 border shadow-sm ${
                              isStudentMessage
                                ? 'bg-primary text-primary-foreground border-primary/30 rounded-br-md'
                                : 'bg-card text-foreground border-border rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <p
                            className={`text-[11px] text-muted-foreground mt-1 ${
                              isStudentMessage ? 'text-right' : 'text-left'
                            }`}
                          >
                            {isStudentMessage ? 'You' : 'Counselor'} • {message.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Private messaging for your counseling support workflow.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
