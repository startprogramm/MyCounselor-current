'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
  studentName?: string;
  studentId?: string;
}

function getStudentStorageKey(studentId: string) {
  return `mycounselor_student_messages_${studentId}`;
}

export default function CounselorMessagesPage() {
  const { user, getSchoolStudents } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [conversations, setConversations] = useState<{ student: User; conversation: Conversation }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const counselorName = user ? `${user.firstName} ${user.lastName}` : '';

  const loadConversations = useCallback(() => {
    if (!user?.schoolId || !user?.id) return;
    const schoolStudents = getSchoolStudents(user.schoolId);
    setStudents(schoolStudents);

    const convs: { student: User; conversation: Conversation }[] = [];
    schoolStudents.forEach(student => {
      const storageKey = getStudentStorageKey(student.id);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const studentConvs: Conversation[] = JSON.parse(stored);
          const myConv = studentConvs.find(c => c.counselorId === user.id || c.counselor === counselorName);
          if (myConv && myConv.messages.length > 0) {
            convs.push({ student, conversation: myConv });
          }
        } catch {
          // skip
        }
      }
    });
    setConversations(convs);

    // If no selection yet, pick the first
    if (!selectedStudentId && convs.length > 0) {
      setSelectedStudentId(convs[0].student.id);
    }
  }, [user?.schoolId, user?.id, counselorName, getSchoolStudents, selectedStudentId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedStudentId, conversations]);

  const selectedConv = conversations.find(c => c.student.id === selectedStudentId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !user) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const counselorMsg: Message = {
      id: Date.now(),
      sender: 'counselor',
      content: newMessage.trim(),
      timestamp: timeStr,
    };

    // Write to the student's message store
    const storageKey = getStudentStorageKey(selectedConv.student.id);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const studentConvs: Conversation[] = JSON.parse(stored);
        const updated = studentConvs.map(conv => {
          if (conv.counselorId === user.id || conv.counselor === counselorName) {
            return {
              ...conv,
              messages: [...conv.messages, counselorMsg],
              lastMessage: newMessage.trim(),
              timestamp: 'Just now',
            };
          }
          return conv;
        });
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // skip
      }
    }

    setNewMessage('');
    loadConversations();
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowMobileList(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
          Messages
        </h1>
        <p className="text-muted-foreground mt-1">
          Communicate with your students
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center">
          <div className="text-center py-12 px-4">
            <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="font-medium text-foreground text-lg">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              When students send you messages, they&apos;ll appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-r border-border flex-shrink-0 ${
            showMobileList ? 'block' : 'hidden md:block'
          }`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Student Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.map(({ student, conversation }) => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                    selectedStudentId === student.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold flex-shrink-0">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate text-foreground">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{conversation.timestamp}</span>
                    </div>
                    <p className="text-sm truncate mt-0.5 text-muted-foreground">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {selectedConv ? (
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
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold">
                    {selectedConv.student.firstName[0]}{selectedConv.student.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedConv.student.firstName} {selectedConv.student.lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Grade {selectedConv.student.gradeLevel}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConv.conversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'counselor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          msg.sender === 'counselor'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'counselor' ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a conversation to start</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
