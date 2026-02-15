'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Message {
  id: number;
  sender: 'student' | 'counselor';
  content: string;
  timestamp: string;
}

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

export default function CounselorMessagesPage() {
  const { user, getSchoolStudents } = useAuth();
  const [studentChats, setStudentChats] = useState<StudentChat[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadStudentChats = useCallback(async () => {
    if (!user?.schoolId || !user?.id) {
      setStudentChats([]);
      return;
    }

    const schoolStudents = getSchoolStudents(user.schoolId).filter((student) => student.approved === true);

    if (schoolStudents.length === 0) {
      setStudentChats([]);
      return;
    }

    const keys = schoolStudents.map((student) => buildConversationKey(student.id, user.id));
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_key', keys)
      .order('created_at', { ascending: true });

    if (error) {
      setStudentChats([]);
      return;
    }

    const grouped = new Map<string, typeof data>();
    (data || []).forEach((row) => {
      const bucket = grouped.get(row.conversation_key) || [];
      bucket.push(row);
      grouped.set(row.conversation_key, bucket);
    });

    const chats: StudentChat[] = schoolStudents.map((student) => {
      const conversationKey = buildConversationKey(student.id, user.id);
      const rows = grouped.get(conversationKey) || [];
      const messages: Message[] = rows.map((row) => ({
        id: row.id,
        sender: row.sender_role === 'counselor' ? 'counselor' : 'student',
        content: row.content,
        timestamp: formatMessageTime(row.created_at),
      }));

      const lastMessage = messages[messages.length - 1];
      const lastCounselorIdx = [...messages]
        .reverse()
        .findIndex((message) => message.sender === 'counselor');

      let unread = 0;
      if (lastCounselorIdx === -1) {
        unread = messages.filter((message) => message.sender === 'student').length;
      } else {
        unread = lastCounselorIdx;
      }

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

    if (!selectedStudentId && chats.length > 0) {
      setSelectedStudentId(chats[0].student.id);
    }
  }, [user, getSchoolStudents, selectedStudentId]);

  useEffect(() => {
    loadStudentChats();
  }, [loadStudentChats]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadStudentChats();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadStudentChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedStudentId, studentChats]);

  const selectedChat = studentChats.find((chat) => chat.student.id === selectedStudentId);

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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
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
        <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex">
          {/* Student list panel */}
          <div
            className={`w-full md:w-[22rem] border-r border-border flex-shrink-0 ${
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

            <div className="overflow-y-auto h-full">
              {filteredChats.length === 0 && (
                <div className="p-5 text-sm text-muted-foreground">No matching students.</div>
              )}
              {filteredChats.map((chat) => (
                <button
                  key={chat.student.id}
                  onClick={() => handleSelectStudent(chat.student.id)}
                  className={`w-full p-3.5 text-left border-b border-border/60 transition-all ${
                    selectedStudentId === chat.student.id
                      ? 'bg-primary/10 border-l-[3px] border-l-primary'
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
          <div className={`flex-1 flex flex-col ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
              <>
                {/* Chat header */}
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
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-muted/10">
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
                        className={`flex gap-2 ${isCounselorMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCounselorMessage && (
                          <div className="w-8 h-8 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center mt-0.5 flex-shrink-0">
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

                        <div className="max-w-[85%]">
                          <div
                            className={`rounded-2xl px-4 py-3 border shadow-sm ${
                              isCounselorMessage
                                ? 'bg-primary text-primary-foreground border-primary/30 rounded-br-md'
                                : 'bg-card text-foreground border-border rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <p
                            className={`text-[11px] text-muted-foreground mt-1 ${
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

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedChat.student.firstName}...`}
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
                    Private messaging for student counseling support.
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
