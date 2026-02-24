'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { startVisibilityAwarePolling } from '@/lib/polling';

interface Message {
  id: number;
  sender: 'me' | 'counselor';
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

interface CounselorChat {
  counselor: User;
  conversationKey: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

function buildConversationKey(idA: string, idB: string) {
  return [idA, idB].sort().join('__');
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
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

export default function TeacherMessagesPage() {
  const { user } = useAuth();
  const [counselorChats, setCounselorChats] = useState<CounselorChat[]>([]);
  const [selectedCounselorId, setSelectedCounselorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fetchIdRef = useRef(0);

  const loadChats = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;
    const fetchId = ++fetchIdRef.current;

    const { data: counselorRows, error } = await supabase
      .from('profiles').select('*').eq('school_id', user.schoolId).eq('role', 'counselor');

    if (error || fetchIdRef.current !== fetchId) {
      setLoadError('Unable to load counselors.');
      setIsLoading(false);
      return;
    }

    const counselors = (counselorRows || []).map(mapProfileToUser);
    if (counselors.length === 0) { setCounselorChats([]); setIsLoading(false); return; }

    const keys = counselors.map(c => buildConversationKey(c.id, user.id));

    const [{ data: messageRows }, { data: readRows }] = await Promise.all([
      supabase.from('messages').select('*').in('conversation_key', keys).order('created_at', { ascending: true }),
      supabase.from('message_reads').select('conversation_key,last_read_at').eq('reader_id', user.id).in('conversation_key', keys),
    ]);

    if (fetchIdRef.current !== fetchId) return;

    const grouped = new Map<string, MessageRow[]>();
    (messageRows || []).forEach(row => {
      const bucket = grouped.get(row.conversation_key) || [];
      bucket.push(row as MessageRow);
      grouped.set(row.conversation_key, bucket);
    });

    const readMap = new Map<string, string>();
    (readRows || []).forEach(row => readMap.set(row.conversation_key, row.last_read_at));

    const chats: CounselorChat[] = counselors.map(counselor => {
      const conversationKey = buildConversationKey(counselor.id, user.id);
      const rows = grouped.get(conversationKey) || [];
      const lastReadMs = readMap.has(conversationKey) ? new Date(readMap.get(conversationKey)!).getTime() : 0;

      const messages: Message[] = rows.map(row => ({
        id: (row as MessageRow).id,
        sender: (row as MessageRow).sender_role === 'teacher' ? 'me' : 'counselor',
        content: (row as MessageRow).content,
        timestamp: formatMessageTime((row as MessageRow).created_at),
      }));

      const lastMessage = messages[messages.length - 1];
      const unread = rows.filter(row =>
        (row as MessageRow).sender_role === 'counselor' &&
        (lastReadMs === 0 || new Date((row as MessageRow).created_at).getTime() > lastReadMs)
      ).length;

      return { counselor, conversationKey, messages, unread,
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.timestamp || '' };
    });

    chats.sort((a, b) => {
      const aHas = a.messages.length > 0, bHas = b.messages.length > 0;
      if (aHas && !bHas) return -1; if (!aHas && bHas) return 1;
      if (aHas && bHas) return b.messages[b.messages.length - 1].id - a.messages[a.messages.length - 1].id;
      return a.counselor.firstName.localeCompare(b.counselor.firstName);
    });

    setCounselorChats(chats);
    setSelectedCounselorId(prev =>
      (prev && chats.some(c => c.counselor.id === prev)) ? prev : chats[0]?.counselor.id || null
    );
    setLoadError(null);
    setIsLoading(false);
  }, [user?.id, user?.schoolId]);

  useEffect(() => { loadChats(); }, [loadChats]);

  useEffect(() => {
    if (!user?.id) return;
    return startVisibilityAwarePolling(() => loadChats(), 12000);
  }, [user?.id, loadChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedCounselorId, counselorChats]);

  const selectedChat = counselorChats.find(c => c.counselor.id === selectedCounselorId);

  useEffect(() => {
    if (!selectedChat || selectedChat.unread === 0 || !user?.id) return;
    const now = new Date().toISOString();
    void supabase.from('message_reads').upsert(
      { conversation_key: selectedChat.conversationKey, reader_id: user.id, last_read_at: now, updated_at: now },
      { onConflict: 'conversation_key,reader_id' }
    );
    setCounselorChats(prev => prev.map(c =>
      c.counselor.id === selectedCounselorId ? { ...c, unread: 0 } : c
    ));
  }, [selectedChat?.conversationKey, selectedChat?.unread, user?.id, selectedCounselorId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;
    const text = newMessage.trim();
    const optimistic: Message = { id: Date.now(), sender: 'me', content: text, timestamp: formatMessageTime(new Date().toISOString()) };

    setCounselorChats(prev => prev.map(c =>
      c.counselor.id === selectedChat.counselor.id
        ? { ...c, messages: [...c.messages, optimistic], lastMessage: text, timestamp: optimistic.timestamp }
        : c
    ));
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      conversation_key: selectedChat.conversationKey,
      sender_role: 'teacher',
      sender_id: user.id,
      content: text,
    });

    await loadChats();
    if (error) return;
  };

  const handleSelect = (id: string) => {
    setSelectedCounselorId(id);
    setShowMobileList(false);
    setCounselorChats(prev => prev.map(c => c.counselor.id === id ? { ...c, unread: 0 } : c));
  };

  const totalUnread = counselorChats.reduce((s, c) => s + c.unread, 0);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[72vh] flex flex-col">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Messages</h1>
          <p className="text-muted-foreground mt-1">Chat with your school counselor</p>
        </div>
        {totalUnread > 0 && (
          <div className="px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-sm text-primary font-medium">
            {totalUnread} unread
          </div>
        )}
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={() => void loadChats()} className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-medium text-foreground">Loading messages...</p>
          </div>
        </div>
      ) : counselorChats.length === 0 ? (
        <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center">
          <div className="text-center py-12 px-4">
            <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="font-medium text-foreground text-lg">No counselors found</p>
            <p className="text-sm text-muted-foreground mt-2">No school counselors have been added to your school yet.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-card rounded-xl border border-border overflow-hidden flex">

          {/* Sidebar */}
          <div className={`w-full md:w-72 border-r border-border flex-shrink-0 flex flex-col min-h-0 bg-background/30 ${showMobileList ? 'block' : 'hidden md:block'}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">School Counselors</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{counselorChats.length} counselor{counselorChats.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {counselorChats.map(chat => (
                <button key={chat.counselor.id} onClick={() => handleSelect(chat.counselor.id)}
                  className={`w-full p-3.5 text-left border-b border-border/60 transition-all duration-200 ${
                    selectedCounselorId === chat.counselor.id
                      ? 'bg-primary/12 border-l-[3px] border-l-primary'
                      : 'hover:bg-muted/60 border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {chat.counselor.profileImage
                        ? <img src={chat.counselor.profileImage} alt="" className="w-full h-full object-cover" />
                        : <span className="text-sm font-semibold text-primary">{chat.counselor.firstName[0]}{chat.counselor.lastName[0]}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground truncate">{chat.counselor.firstName} {chat.counselor.lastName}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.timestamp || '--'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">School Counselor</p>
                      <p className={`text-sm truncate mt-1 ${chat.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
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
          <div className={`flex-1 min-h-0 flex flex-col bg-background/10 ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-border bg-card/90 flex items-center gap-3">
                  <button type="button" className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg" onClick={() => setShowMobileList(true)}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                    {selectedChat.counselor.profileImage
                      ? <img src={selectedChat.counselor.profileImage} alt="" className="w-full h-full object-cover" />
                      : <span className="text-sm font-semibold text-primary">{selectedChat.counselor.firstName[0]}{selectedChat.counselor.lastName[0]}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{selectedChat.counselor.firstName} {selectedChat.counselor.lastName}</h3>
                    <p className="text-xs text-muted-foreground">School Counselor | {selectedChat.counselor.email}</p>
                  </div>
                </div>

                <div className="relative flex-1 min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_45%)]">
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.04)_0%,transparent_42%,rgba(14,165,233,0.04)_100%)]" />
                  <div className="relative h-full overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 space-y-3">
                    {selectedChat.messages.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <p className="font-medium">No messages yet</p>
                          <p className="text-sm mt-1">Send a message to {selectedChat.counselor.firstName} to get started</p>
                        </div>
                      </div>
                    )}
                    {selectedChat.messages.map(message => {
                      const isMine = message.sender === 'me';
                      return (
                        <div key={message.id} className={`flex items-end gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          {!isMine && (
                            <div className="w-8 h-8 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center mb-1 flex-shrink-0 shadow-sm">
                              {selectedChat.counselor.profileImage
                                ? <img src={selectedChat.counselor.profileImage} alt="" className="w-full h-full object-cover" />
                                : <span className="text-xs font-semibold text-primary">{selectedChat.counselor.firstName[0]}{selectedChat.counselor.lastName[0]}</span>
                              }
                            </div>
                          )}
                          <div className="max-w-[84%] sm:max-w-[70%]">
                            <div className={`rounded-2xl px-4 py-2.5 border ${
                              isMine
                                ? 'bg-sky-500 text-white border-sky-600/40 rounded-br-md shadow-[0_8px_18px_-10px_rgba(14,165,233,0.9)]'
                                : 'bg-card/95 text-foreground border-border rounded-bl-md shadow-sm'
                            }`}>
                              <p className="text-sm leading-6 whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            <p className={`text-[11px] text-muted-foreground mt-1.5 ${isMine ? 'text-right' : 'text-left'}`}>
                              {isMine ? 'You' : selectedChat.counselor.firstName} | {message.timestamp}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="px-4 py-4 sm:px-5 sm:py-5 border-t border-border bg-card/95">
                  <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-input bg-background/90 px-2 sm:px-3 py-2 shadow-sm">
                    <input
                      type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedChat.counselor.firstName}...`}
                      className="flex-1 bg-transparent px-2 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button type="submit" size="sm" disabled={!newMessage.trim()} className="rounded-full px-3.5 py-2" aria-label="Send">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Select a counselor to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
