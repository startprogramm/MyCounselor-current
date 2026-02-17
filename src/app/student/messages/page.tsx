'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { startVisibilityAwarePolling } from '@/lib/polling';

interface Message {
  id: number;
  sender: 'student' | 'counselor';
  content: string;
  timestamp: string;
}

interface MessageRow {
  id: number;
  conversation_key: string;
  sender_role: string;
  content: string;
  created_at: string;
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface Conversation {
  id: number;
  conversationKey: string;
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

function buildConversationKey(studentId: string, counselorId: string) {
  return [studentId, counselorId].sort().join('__');
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function buildConversationsFromCounselors(
  counselors: User[],
  rows: MessageRow[],
  readByConversation: Map<string, string>,
  student: User
): Conversation[] {
  const rowsByKey = new Map<string, typeof rows>();

  rows.forEach((row) => {
    const bucket = rowsByKey.get(row.conversation_key) || [];
    bucket.push(row);
    rowsByKey.set(row.conversation_key, bucket);
  });

  return counselors.map((c, index) => {
    const key = buildConversationKey(student.id, c.id);
    const groupedRows = rowsByKey.get(key) || [];
    const lastReadAt = readByConversation.get(key);
    const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;
    const mappedMessages: Message[] = groupedRows.map((row) => ({
      id: row.id,
      sender: row.sender_role === 'counselor' ? 'counselor' : 'student',
      content: row.content,
      timestamp: formatMessageTime(row.created_at),
    }));

    const lastMessage = mappedMessages[mappedMessages.length - 1];
    const unread = groupedRows.filter(
      (row) =>
        row.sender_role === 'counselor' &&
        (lastReadMs === 0 || new Date(row.created_at).getTime() > lastReadMs)
    ).length;

    const name = `${c.firstName} ${c.lastName}`;
    const initials = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();

    return {
      id: index + 1,
      conversationKey: key,
      counselor: name,
      counselorId: c.id,
      avatar: initials,
      avatarImage: c.profileImage,
      counselorTitle: c.title || 'School Counselor',
      department: c.department || 'General',
      lastMessage: lastMessage?.content || 'Start a conversation',
      timestamp: lastMessage?.timestamp || '',
      unread,
      messages: mappedMessages,
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.id,
    };
  });
}

function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    role: profile.role,
    schoolId: profile.school_id,
    schoolName: profile.school_name || undefined,
    gradeLevel: profile.grade_level || undefined,
    title: profile.title || undefined,
    department: profile.department || undefined,
    profileImage: profile.profile_image || undefined,
    approved: profile.approved,
    subject: profile.subject || undefined,
    childrenNames: profile.children_names || undefined,
    relationship: profile.relationship || undefined,
  };
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
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  const markConversationAsRead = useCallback(
    async (conversationKey?: string) => {
      if (!conversationKey || !user?.id) return;

      const now = new Date().toISOString();
      const { error } = await supabase.from('message_reads').upsert(
        {
          conversation_key: conversationKey,
          reader_id: user.id,
          last_read_at: now,
          updated_at: now,
        },
        { onConflict: 'conversation_key,reader_id' }
      );

      if (error) return;

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.conversationKey === conversationKey
            ? { ...conversation, unread: 0 }
            : conversation
        )
      );
    },
    [user?.id]
  );

  const loadConversations = useCallback(async () => {
    if (!user?.schoolId || !user?.id) {
      setConversations([]);
      setSelectedConvId(0);
      setLoadError(null);
      return;
    }

    const { data: counselorRows, error: counselorsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', user.schoolId)
      .eq('role', 'counselor')
      .eq('approved', true);

    if (counselorsError) {
      setLoadError('Unable to load counselor list. Please refresh and try again.');
      return;
    }

    const counselors = (counselorRows || []).map(mapProfileToUser);

    if (counselors.length === 0) {
      setConversations([]);
      setSelectedConvId(0);
      setLoadError(null);
      return;
    }

    const keys = counselors.map((c) => buildConversationKey(user.id, c.id));

    const [{ data: messageRows, error: messageError }, { data: readRows }] = await Promise.all([
      supabase
        .from('messages')
        .select('*')
        .in('conversation_key', keys)
        .order('created_at', { ascending: true }),
      supabase
        .from('message_reads')
        .select('conversation_key,last_read_at')
        .eq('reader_id', user.id)
        .in('conversation_key', keys),
    ]);

    if (messageError) {
      setLoadError('Unable to load messages right now. Please try again.');
      return;
    }

    const readByConversation = new Map<string, string>();
    (readRows || []).forEach((row) => {
      readByConversation.set(row.conversation_key, row.last_read_at);
    });

    const merged = buildConversationsFromCounselors(
      counselors,
      messageRows || [],
      readByConversation,
      user
    );
    setLoadError(null);
    setConversations(merged);
    setSelectedConvId((prev) =>
      merged.some((conversation) => conversation.id === prev) ? prev : merged[0]?.id || 0
    );
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!user?.id) return;
    return startVisibilityAwarePolling(() => loadConversations(), 8000);
  }, [user?.id, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, conversations]);

  useEffect(() => {
    if (!selectedConversation || selectedConversation.unread === 0) return;
    void markConversationAsRead(selectedConversation.conversationKey);
  }, [selectedConversation?.conversationKey, selectedConversation?.unread, markConversationAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const messageToSend = newMessage.trim();

    const optimisticMessage: Message = {
      id: Date.now(),
      sender: 'student',
      content: messageToSend,
      timestamp: formatMessageTime(new Date().toISOString()),
    };

    setConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id === selectedConversation.id) {
          return {
            ...conversation,
            messages: [...conversation.messages, optimisticMessage],
            lastMessage: optimisticMessage.content,
            timestamp: optimisticMessage.timestamp,
          };
        }
        return conversation;
      })
    );

    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      conversation_key: selectedConversation.conversationKey,
      sender_role: 'student',
      sender_id: user.id,
      content: messageToSend,
    });

    if (error) {
      await loadConversations();
      return;
    }

    setTimeout(async () => {
      const reply = generateAutoReply(messageToSend);
      if (!reply || !selectedConversation.counselorId) return;

      await supabase.from('messages').insert({
        conversation_key: selectedConversation.conversationKey,
        sender_role: 'counselor',
        sender_id: selectedConversation.counselorId,
        content: reply,
      });

      await loadConversations();
    }, 1500);
  };

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConvId(conversationId);
    setShowMobileList(false);

    const openedConversation = conversations.find((conversation) => conversation.id === conversationId);
    if (openedConversation?.unread) {
      void markConversationAsRead(openedConversation.conversationKey);
    }

    setConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id === conversationId) {
          return { ...conversation, unread: 0 };
        }
        return conversation;
      })
    );
  };

  return (
    <div className="min-h-[72vh] flex flex-col">
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

      {loadError && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void loadConversations()}
            className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors"
          >
            Retry
          </button>
        </div>
      )}

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
        <div className="flex-1 min-h-0 bg-card rounded-xl border border-border overflow-hidden flex">
          <div
            className={`w-full md:w-[22rem] border-r border-border flex-shrink-0 flex flex-col min-h-0 bg-background/30 ${
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

            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredConversations.length === 0 && (
                <div className="p-5 text-sm text-muted-foreground">No matching conversations.</div>
              )}
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`w-full p-3.5 text-left border-b border-border/60 transition-all duration-200 ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-primary/12 border-l-[3px] border-l-primary shadow-[inset_0_1px_0_rgba(59,130,246,0.08)]'
                      : 'hover:bg-muted/60 border-l-[3px] border-l-transparent'
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
                        {conversation.counselorTitle || 'School Counselor'} |{' '}
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

          <div
            className={`flex-1 min-h-0 flex flex-col bg-background/10 ${
              showMobileList ? 'hidden md:flex' : 'flex'
            }`}
          >
            {selectedConversation && (
              <>
                <div className="p-4 border-b border-border bg-card/90 flex items-center justify-between gap-3">
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
                        {selectedConversation.counselorTitle || 'School Counselor'} |{' '}
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

                <div className="relative flex-1 min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_45%)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.04)_0%,transparent_42%,rgba(14,165,233,0.04)_100%)]"
                  />
                  <div className="relative h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 space-y-3">
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
                          className={`flex items-end gap-2.5 ${isStudentMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isStudentMessage && (
                            <div className="w-8 h-8 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center mb-1 flex-shrink-0 shadow-sm">
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

                          <div className="max-w-[84%] sm:max-w-[70%]">
                            <div
                              className={`rounded-2xl px-4 py-2.5 border ${
                                isStudentMessage
                                  ? 'bg-sky-500 text-white border-sky-600/40 rounded-br-md shadow-[0_8px_18px_-10px_rgba(14,165,233,0.9)]'
                                  : 'bg-card/95 text-foreground border-border rounded-bl-md shadow-sm backdrop-blur-[1px]'
                              }`}
                            >
                              <p className="text-sm leading-6 whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                            <p
                              className={`text-[11px] text-muted-foreground mt-1.5 ${
                                isStudentMessage ? 'text-right' : 'text-left'
                              }`}
                            >
                              {isStudentMessage ? 'You' : 'Counselor'} | {message.timestamp}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="px-4 py-4 sm:px-5 sm:py-5 border-t border-border bg-card/95"
                >
                  <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-input bg-background/90 px-2 sm:px-3 py-2 shadow-sm">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Write a message..."
                      className="flex-1 bg-transparent px-2 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newMessage.trim()}
                      className="rounded-full px-3.5 py-2"
                      aria-label="Send message"
                    >
                      <svg
                        className="w-4 h-4"
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
                  <p className="text-[11px] text-muted-foreground mt-2.5 px-1">
                    Your chat is private and only visible to approved counselors at your school.
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
