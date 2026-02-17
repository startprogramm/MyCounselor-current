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

interface StudentChat {
  student: User;
  conversationKey: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
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

export default function CounselorMessagesPage() {
  const { user } = useAuth();
  const [studentChats, setStudentChats] = useState<StudentChat[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      setStudentChats((previous) =>
        previous.map((chat) =>
          chat.conversationKey === conversationKey ? { ...chat, unread: 0 } : chat
        )
      );
    },
    [user?.id]
  );

  const loadStudentChats = useCallback(async () => {
    if (!user?.schoolId || !user?.id) {
      setStudentChats([]);
      setLoadError(null);
      return;
    }

    const { data: studentRows, error: studentsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', user.schoolId)
      .eq('role', 'student');

    if (studentsError) {
      setLoadError('Unable to load students right now. Please refresh and try again.');
      return;
    }

    let schoolStudents = (studentRows || []).map(mapProfileToUser);
    let messageRows: MessageRow[] = [];

    if (schoolStudents.length === 0) {
      const { data: fallbackMessages, error: fallbackMessagesError } = await supabase
        .from('messages')
        .select('*')
        .ilike('conversation_key', `%${user.id}%`)
        .order('created_at', { ascending: true });

      if (fallbackMessagesError || !fallbackMessages || fallbackMessages.length === 0) {
        setStudentChats([]);
        setLoadError(null);
        return;
      }

      const fallbackStudentIds = Array.from(
        new Set(
          fallbackMessages
            .map((row) => row.conversation_key.split('__'))
            .flat()
            .filter((id) => id !== user.id)
        )
      );

      if (fallbackStudentIds.length === 0) {
        setStudentChats([]);
        setLoadError(null);
        return;
      }

      const { data: fallbackStudents, error: fallbackStudentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .in('id', fallbackStudentIds);

      if (fallbackStudentsError || !fallbackStudents || fallbackStudents.length === 0) {
        setStudentChats([]);
        setLoadError('Unable to load related student profiles. Please try again.');
        return;
      }

      schoolStudents = fallbackStudents.map(mapProfileToUser);
      messageRows = fallbackMessages;
    }

    const keys = schoolStudents.map((student) => buildConversationKey(student.id, user.id));

    let hasMessageError = false;
    if (messageRows.length === 0) {
      const { data: liveMessages, error } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_key', keys)
        .order('created_at', { ascending: true });

      messageRows = (liveMessages || []) as MessageRow[];
      hasMessageError = Boolean(error);
    }

    const { data: readRows } = await supabase
      .from('message_reads')
      .select('conversation_key,last_read_at')
      .eq('reader_id', user.id)
      .in('conversation_key', keys);

    if (hasMessageError) {
      setLoadError('Unable to load chat messages right now. Please try again.');
      return;
    }

    const grouped = new Map<string, MessageRow[]>();
    messageRows.forEach((row) => {
      const bucket = grouped.get(row.conversation_key) || [];
      bucket.push(row);
      grouped.set(row.conversation_key, bucket);
    });

    const readByConversation = new Map<string, string>();
    (readRows || []).forEach((row) => {
      readByConversation.set(row.conversation_key, row.last_read_at);
    });

    const chats: StudentChat[] = schoolStudents.map((student) => {
      const conversationKey = buildConversationKey(student.id, user.id);
      const rows = grouped.get(conversationKey) || [];
      const lastReadAt = readByConversation.get(conversationKey);
      const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;
      const messages: Message[] = rows.map((row) => ({
        id: row.id,
        sender: row.sender_role === 'counselor' ? 'counselor' : 'student',
        content: row.content,
        timestamp: formatMessageTime(row.created_at),
      }));

      const lastMessage = messages[messages.length - 1];
      const unread = rows.filter(
        (row) =>
          row.sender_role === 'student' &&
          (lastReadMs === 0 || new Date(row.created_at).getTime() > lastReadMs)
      ).length;

      return {
        student,
        conversationKey,
        messages,
        unread,
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.timestamp || '',
      };
    });

    chats.sort((a, b) => {
      const aHasMessages = a.messages.length > 0;
      const bHasMessages = b.messages.length > 0;

      if (aHasMessages && !bHasMessages) return -1;
      if (!aHasMessages && bHasMessages) return 1;

      if (aHasMessages && bHasMessages) {
        return b.messages[b.messages.length - 1].id - a.messages[a.messages.length - 1].id;
      }

      return a.student.firstName.localeCompare(b.student.firstName);
    });

    setStudentChats(chats);
    setLoadError(null);

    if (!selectedStudentId && chats.length > 0) {
      setSelectedStudentId(chats[0].student.id);
    }
  }, [user, selectedStudentId]);

  useEffect(() => {
    loadStudentChats();
  }, [loadStudentChats]);

  useEffect(() => {
    if (!user?.id) return;
    return startVisibilityAwarePolling(() => loadStudentChats(), 8000);
  }, [user?.id, loadStudentChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedStudentId, studentChats]);

  const selectedChat = studentChats.find((chat) => chat.student.id === selectedStudentId);

  useEffect(() => {
    if (!selectedChat || selectedChat.unread === 0) return;
    void markConversationAsRead(selectedChat.conversationKey);
  }, [selectedChat?.conversationKey, selectedChat?.unread, markConversationAsRead]);

  const filteredChats = studentChats.filter((chat) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const fullName = `${chat.student.firstName} ${chat.student.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      (chat.student.gradeLevel || '').toLowerCase().includes(query) ||
      chat.lastMessage.toLowerCase().includes(query)
    );
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    const messageToSend = newMessage.trim();

    const optimisticMessage: Message = {
      id: Date.now(),
      sender: 'counselor',
      content: messageToSend,
      timestamp: formatMessageTime(new Date().toISOString()),
    };

    setStudentChats((previous) =>
      previous.map((chat) => {
        if (chat.student.id === selectedChat.student.id) {
          return {
            ...chat,
            messages: [...chat.messages, optimisticMessage],
            lastMessage: optimisticMessage.content,
            timestamp: optimisticMessage.timestamp,
          };
        }
        return chat;
      })
    );

    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      conversation_key: selectedChat.conversationKey,
      sender_role: 'counselor',
      sender_id: user.id,
      content: messageToSend,
    });

    if (error) {
      await loadStudentChats();
      return;
    }

    await loadStudentChats();
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowMobileList(false);

    const openedChat = studentChats.find((chat) => chat.student.id === studentId);
    if (openedChat?.unread) {
      void markConversationAsRead(openedChat.conversationKey);
    }

    setStudentChats((previous) =>
      previous.map((chat) => {
        if (chat.student.id === studentId) {
          return { ...chat, unread: 0 };
        }
        return chat;
      })
    );
  };

  const totalUnread = studentChats.reduce((sum, chat) => sum + chat.unread, 0);

  return (
    <div className="min-h-[72vh] flex flex-col">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Private conversations with your students
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnread > 0 && (
            <div className="px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-sm text-primary font-medium">
              {totalUnread} unread
            </div>
          )}
          <div className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground">
            {studentChats.length} student{studentChats.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void loadStudentChats()}
            className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {studentChats.length === 0 ? (
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
            <p className="font-medium text-foreground text-lg">No students yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              No students have registered at your school yet. Once they join, you can message them
              here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-card rounded-xl border border-border overflow-hidden flex">
          {/* Student list panel */}
          <div
            className={`w-full md:w-[22rem] border-r border-border flex-shrink-0 flex flex-col min-h-0 bg-background/30 ${
              showMobileList ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-foreground">Students</h2>
                <span className="text-xs text-muted-foreground">{filteredChats.length}</span>
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
                  placeholder="Search student..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredChats.length === 0 && (
                <div className="p-5 text-sm text-muted-foreground">No matching students.</div>
              )}
              {filteredChats.map((chat) => (
                <button
                  key={chat.student.id}
                  onClick={() => handleSelectStudent(chat.student.id)}
                  className={`w-full p-3.5 text-left border-b border-border/60 transition-all duration-200 ${
                    selectedStudentId === chat.student.id
                      ? 'bg-primary/12 border-l-[3px] border-l-primary shadow-[inset_0_1px_0_rgba(59,130,246,0.08)]'
                      : 'hover:bg-muted/60 border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {chat.student.profileImage ? (
                        <img
                          src={chat.student.profileImage}
                          alt={`${chat.student.firstName} ${chat.student.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {chat.student.firstName[0]}
                          {chat.student.lastName[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {chat.student.firstName} {chat.student.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {chat.timestamp || '--'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        Grade {chat.student.gradeLevel || 'N/A'}
                      </p>
                      <p
                        className={`text-sm truncate mt-1 ${
                          chat.unread > 0
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {chat.lastMessage}
                      </p>
                    </div>

                    {chat.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div
            className={`flex-1 min-h-0 flex flex-col bg-background/10 ${
              showMobileList ? 'hidden md:flex' : 'flex'
            }`}
          >
            {selectedChat ? (
              <>
                {/* Chat header */}
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
                      {selectedChat.student.profileImage ? (
                        <img
                          src={selectedChat.student.profileImage}
                          alt={`${selectedChat.student.firstName} ${selectedChat.student.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {selectedChat.student.firstName[0]}
                          {selectedChat.student.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {selectedChat.student.firstName} {selectedChat.student.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        Grade {selectedChat.student.gradeLevel || 'N/A'} | {selectedChat.student.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/counselor/students"
                    className="hidden sm:inline-flex px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    View Profile
                  </Link>
                </div>

                {/* Messages area */}
                <div className="relative flex-1 min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_45%)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.04)_0%,transparent_42%,rgba(14,165,233,0.04)_100%)]"
                  />
                  <div className="relative h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 space-y-3">
                    {selectedChat.messages.length === 0 && (
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
                          <p className="text-sm mt-1">
                            Send a message to start the conversation with {selectedChat.student.firstName}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedChat.messages.map((message) => {
                      const isCounselorMessage = message.sender === 'counselor';
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2.5 ${isCounselorMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isCounselorMessage && (
                            <div className="w-8 h-8 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center mb-1 flex-shrink-0 shadow-sm">
                              {selectedChat.student.profileImage ? (
                                <img
                                  src={selectedChat.student.profileImage}
                                  alt={`${selectedChat.student.firstName} ${selectedChat.student.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-semibold text-primary">
                                  {selectedChat.student.firstName[0]}
                                  {selectedChat.student.lastName[0]}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="max-w-[84%] sm:max-w-[70%]">
                            <div
                              className={`rounded-2xl px-4 py-2.5 border ${
                                isCounselorMessage
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
                                isCounselorMessage ? 'text-right' : 'text-left'
                              }`}
                            >
                              {isCounselorMessage ? 'You' : selectedChat.student.firstName} |{' '}
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message input */}
                <form
                  onSubmit={handleSendMessage}
                  className="px-4 py-4 sm:px-5 sm:py-5 border-t border-border bg-card/95"
                >
                  <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-input bg-background/90 px-2 sm:px-3 py-2 shadow-sm">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedChat.student.firstName}...`}
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
                    Keep communication concise and professional so students get clear guidance.
                  </p>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
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
                  <p className="font-medium">Select a student to start</p>
                  <p className="text-sm mt-1">Pick a student from the list to view or start a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
