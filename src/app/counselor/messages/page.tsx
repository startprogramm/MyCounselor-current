'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { startVisibilityAwarePolling } from '@/lib/polling';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

interface Message {
  id: number;
  sender: 'counselor' | 'contact';
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

interface ContactChat {
  contact: User;
  conversationKey: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

interface CounselorMessagesCachePayload {
  studentChats: ContactChat[];
  teacherChats: ContactChat[];
  parentChats: ContactChat[];
  selectedStudentId: string | null;
  selectedTeacherId: string | null;
  selectedParentId: string | null;
}

type TabType = 'students' | 'teachers' | 'parents';

const COUNSELOR_MESSAGES_CACHE_TTL_MS = 2 * 60 * 1000;

function buildConversationKey(idA: string, idB: string) {
  return [idA, idB].sort().join('__');
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

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { key: TabType; label: string; role: 'student' | 'teacher' | 'parent' }[] = [
  { key: 'students', label: 'Students', role: 'student' },
  { key: 'teachers', label: 'Teachers', role: 'teacher' },
  { key: 'parents',  label: 'Parents',  role: 'parent'  },
];

export default function CounselorMessagesPage() {
  const { user } = useAuth();

  // ─── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('students');

  // ─── Per-tab chat lists ─────────────────────────────────────────────────────
  const [studentChats, setStudentChats] = useState<ContactChat[]>([]);
  const [teacherChats, setTeacherChats] = useState<ContactChat[]>([]);
  const [parentChats,  setParentChats]  = useState<ContactChat[]>([]);

  // ─── Per-tab selected contact ───────────────────────────────────────────────
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedParentId,  setSelectedParentId]  = useState<string | null>(null);

  // ─── Loading / error ────────────────────────────────────────────────────────
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [hasLoadedChats, setHasLoadedChats] = useState(false);

  // ─── Misc ───────────────────────────────────────────────────────────────────
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const loadRequestIdRef = useRef(0);
  const studentChatsRef = useRef<ContactChat[]>([]);
  const emptyChatsStreakRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('counselor-messages-v2', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  // ─── Derived active-tab helpers ─────────────────────────────────────────────
  const activeChats = useMemo(() => {
    if (activeTab === 'students') return studentChats;
    if (activeTab === 'teachers') return teacherChats;
    return parentChats;
  }, [activeTab, studentChats, teacherChats, parentChats]);

  const activeSelectedId =
    activeTab === 'students' ? selectedStudentId :
    activeTab === 'teachers' ? selectedTeacherId :
    selectedParentId;

  // ─── Cache hydration ────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!cacheKey) {
      setStudentChats([]);
      setTeacherChats([]);
      setParentChats([]);
      setSelectedStudentId(null);
      setSelectedTeacherId(null);
      setSelectedParentId(null);
      setIsLoadingChats(true);
      setHasLoadedChats(false);
      return;
    }

    setStudentChats([]);
    setTeacherChats([]);
    setParentChats([]);
    setSelectedStudentId(null);
    setSelectedTeacherId(null);
    setSelectedParentId(null);
    setIsLoadingChats(true);
    setHasLoadedChats(false);

    const cached = readCachedData<CounselorMessagesCachePayload>(
      cacheKey,
      COUNSELOR_MESSAGES_CACHE_TTL_MS
    );
    if (!cached.found || !cached.data) return;

    const { studentChats: sc = [], teacherChats: tc = [], parentChats: pc = [],
            selectedStudentId: sid = null, selectedTeacherId: tid = null, selectedParentId: pid = null } =
      cached.data;

    setStudentChats(sc);
    setTeacherChats(tc);
    setParentChats(pc);
    setSelectedStudentId(sid && sc.some(c => c.contact.id === sid) ? sid : sc[0]?.contact.id || null);
    setSelectedTeacherId(tid && tc.some(c => c.contact.id === tid) ? tid : tc[0]?.contact.id || null);
    setSelectedParentId(pid  && pc.some(c => c.contact.id === pid)  ? pid  : pc[0]?.contact.id  || null);
    setIsLoadingChats(false);
    setHasLoadedChats(true);
  }, [cacheKey]);

  useEffect(() => {
    studentChatsRef.current = studentChats;
  }, [studentChats]);

  // ─── Persist to cache when data changes ─────────────────────────────────────
  useEffect(() => {
    if (!cacheKey || !hasLoadedChats) return;
    writeCachedData<CounselorMessagesCachePayload>(cacheKey, {
      studentChats, teacherChats, parentChats,
      selectedStudentId, selectedTeacherId, selectedParentId,
    });
  }, [cacheKey, studentChats, teacherChats, parentChats,
      selectedStudentId, selectedTeacherId, selectedParentId, hasLoadedChats]);

  // ─── Mark conversation as read ───────────────────────────────────────────────
  const markConversationAsRead = useCallback(
    async (conversationKey: string, tab: TabType) => {
      if (!user?.id) return;
      const now = new Date().toISOString();
      const { error } = await supabase.from('message_reads').upsert(
        { conversation_key: conversationKey, reader_id: user.id, last_read_at: now, updated_at: now },
        { onConflict: 'conversation_key,reader_id' }
      );
      if (error) return;

      const clearUnread = (chats: ContactChat[]) =>
        chats.map(c => c.conversationKey === conversationKey ? { ...c, unread: 0 } : c);

      if (tab === 'students') setStudentChats(clearUnread);
      else if (tab === 'teachers') setTeacherChats(clearUnread);
      else setParentChats(clearUnread);
    },
    [user?.id]
  );

  // ─── Generic chat loader ─────────────────────────────────────────────────────
  const loadContactChats = useCallback(async (
    role: 'student' | 'teacher' | 'parent',
    setChats: React.Dispatch<React.SetStateAction<ContactChat[]>>,
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>,
    options?: { silent?: boolean }
  ) => {
    if (!user?.schoolId || !user?.id) return;

    const [{ data: contactRows, error: contactsError }, ] = await Promise.all([
      supabase.from('profiles').select('*').eq('school_id', user.schoolId).eq('role', role),
    ]);

    if (contactsError) return;

    const contacts = (contactRows || []).map(mapProfileToUser);
    if (contacts.length === 0) {
      setChats([]);
      return;
    }

    const keys = contacts.map(c => buildConversationKey(c.id, user.id));

    const [{ data: messageRows }, { data: readRows }] = await Promise.all([
      supabase.from('messages').select('*').in('conversation_key', keys).order('created_at', { ascending: true }),
      supabase.from('message_reads').select('conversation_key,last_read_at').eq('reader_id', user.id).in('conversation_key', keys),
    ]);

    const grouped = new Map<string, MessageRow[]>();
    (messageRows || []).forEach(row => {
      const bucket = grouped.get(row.conversation_key) || [];
      bucket.push(row as MessageRow);
      grouped.set(row.conversation_key, bucket);
    });

    const readByConversation = new Map<string, string>();
    (readRows || []).forEach(row => {
      readByConversation.set(row.conversation_key, row.last_read_at);
    });

    const chats: ContactChat[] = contacts.map(contact => {
      const conversationKey = buildConversationKey(contact.id, user.id);
      const rows = grouped.get(conversationKey) || [];
      const lastReadAt = readByConversation.get(conversationKey);
      const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;

      const messages: Message[] = rows.map(row => ({
        id: (row as MessageRow).id,
        sender: (row as MessageRow).sender_role === 'counselor' ? 'counselor' : 'contact',
        content: (row as MessageRow).content,
        timestamp: formatMessageTime((row as MessageRow).created_at),
      }));

      const lastMessage = messages[messages.length - 1];
      const unread = rows.filter(row =>
        (row as MessageRow).sender_role !== 'counselor' &&
        (lastReadMs === 0 || new Date((row as MessageRow).created_at).getTime() > lastReadMs)
      ).length;

      return {
        contact,
        conversationKey,
        messages,
        unread,
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.timestamp || '',
      };
    });

    chats.sort((a, b) => {
      const aHas = a.messages.length > 0;
      const bHas = b.messages.length > 0;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (aHas && bHas) return b.messages[b.messages.length - 1].id - a.messages[a.messages.length - 1].id;
      return a.contact.firstName.localeCompare(b.contact.firstName);
    });

    setChats(chats);
    setSelectedId(prev => (prev && chats.some(c => c.contact.id === prev)) ? prev : chats[0]?.contact.id || null);
  }, [user?.id, user?.schoolId]);

  // ─── Student-specific loader (keeps the existing robust fallback logic) ──────
  const shouldPreserveStudentChats = useCallback(() => {
    if (studentChatsRef.current.length === 0) return false;
    emptyChatsStreakRef.current += 1;
    return emptyChatsStreakRef.current < 2;
  }, []);

  const loadStudentChats = useCallback(async (options?: { silent?: boolean }) => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (!options?.silent) setIsLoadingChats(true);

    const finish = () => {
      if (loadRequestIdRef.current !== requestId) return;
      setIsLoadingChats(false);
      setHasLoadedChats(true);
    };

    if (!user?.schoolId || !user?.id) {
      if (loadRequestIdRef.current === requestId) {
        setStudentChats([]);
        setSelectedStudentId(null);
        setLoadError(null);
      }
      finish();
      return;
    }

    const { data: studentRows, error: studentsError } = await supabase
      .from('profiles').select('*').eq('school_id', user.schoolId).eq('role', 'student');

    if (studentsError) {
      if (loadRequestIdRef.current === requestId)
        setLoadError('Unable to load students right now. Please refresh and try again.');
      finish();
      return;
    }

    let schoolStudents = (studentRows || []).map(mapProfileToUser);
    let messageRows: MessageRow[] = [];

    if (schoolStudents.length === 0) {
      const { data: fallbackMessages, error: fallbackError } = await supabase
        .from('messages').select('*').ilike('conversation_key', `%${user.id}%`).order('created_at', { ascending: true });

      if (fallbackError || !fallbackMessages || fallbackMessages.length === 0) {
        if (shouldPreserveStudentChats()) { finish(); return; }
        if (loadRequestIdRef.current === requestId) { setStudentChats([]); setLoadError(null); }
        finish();
        return;
      }

      const fallbackIds = Array.from(new Set(
        fallbackMessages.map(r => r.conversation_key.split('__')).flat().filter(id => id !== user.id)
      ));

      if (fallbackIds.length === 0) {
        if (shouldPreserveStudentChats()) { finish(); return; }
        if (loadRequestIdRef.current === requestId) { setStudentChats([]); setLoadError(null); }
        finish();
        return;
      }

      const { data: fallbackStudents, error: fallbackStudentsError } = await supabase
        .from('profiles').select('*').eq('role', 'student').in('id', fallbackIds);

      if (fallbackStudentsError || !fallbackStudents || fallbackStudents.length === 0) {
        if (loadRequestIdRef.current === requestId)
          setStudentChats([]);
        finish();
        return;
      }

      schoolStudents = fallbackStudents.map(mapProfileToUser);
      messageRows = fallbackMessages as MessageRow[];
    }

    emptyChatsStreakRef.current = 0;
    const keys = schoolStudents.map(s => buildConversationKey(s.id, user.id));

    let hasMessageError = false;
    if (messageRows.length === 0) {
      const { data: liveMessages, error } = await supabase
        .from('messages').select('*').in('conversation_key', keys).order('created_at', { ascending: true });
      messageRows = (liveMessages || []) as MessageRow[];
      hasMessageError = Boolean(error);
    }

    const { data: readRows } = await supabase
      .from('message_reads').select('conversation_key,last_read_at').eq('reader_id', user.id).in('conversation_key', keys);

    if (hasMessageError) {
      if (loadRequestIdRef.current === requestId)
        setLoadError('Unable to load chat messages right now. Please try again.');
      finish();
      return;
    }

    const grouped = new Map<string, MessageRow[]>();
    messageRows.forEach(row => {
      const bucket = grouped.get(row.conversation_key) || [];
      bucket.push(row);
      grouped.set(row.conversation_key, bucket);
    });

    const readByConversation = new Map<string, string>();
    (readRows || []).forEach(row => readByConversation.set(row.conversation_key, row.last_read_at));

    const chats: ContactChat[] = schoolStudents.map(student => {
      const conversationKey = buildConversationKey(student.id, user.id);
      const rows = grouped.get(conversationKey) || [];
      const lastReadAt = readByConversation.get(conversationKey);
      const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;

      const messages: Message[] = rows.map(row => ({
        id: row.id,
        sender: row.sender_role === 'counselor' ? 'counselor' : 'contact',
        content: row.content,
        timestamp: formatMessageTime(row.created_at),
      }));

      const lastMessage = messages[messages.length - 1];
      const unread = rows.filter(row =>
        row.sender_role === 'student' &&
        (lastReadMs === 0 || new Date(row.created_at).getTime() > lastReadMs)
      ).length;

      return {
        contact: student,
        conversationKey,
        messages,
        unread,
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.timestamp || '',
      };
    });

    chats.sort((a, b) => {
      const aHas = a.messages.length > 0, bHas = b.messages.length > 0;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (aHas && bHas) return b.messages[b.messages.length - 1].id - a.messages[a.messages.length - 1].id;
      return a.contact.firstName.localeCompare(b.contact.firstName);
    });

    if (loadRequestIdRef.current === requestId) {
      setStudentChats(chats);
      setLoadError(null);
      setSelectedStudentId(prev =>
        (prev && chats.some(c => c.contact.id === prev)) ? prev : chats[0]?.contact.id || null
      );
    }
    finish();
  }, [user, shouldPreserveStudentChats]);

  // ─── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadStudentChats();
    loadContactChats('teacher', setTeacherChats, setSelectedTeacherId);
    loadContactChats('parent',  setParentChats,  setSelectedParentId);
  }, [loadStudentChats, loadContactChats]);

  // ─── Polling (all tabs) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    return startVisibilityAwarePolling(() => {
      void loadStudentChats({ silent: true });
      void loadContactChats('teacher', setTeacherChats, setSelectedTeacherId, { silent: true });
      void loadContactChats('parent',  setParentChats,  setSelectedParentId,  { silent: true });
    }, 12000);
  }, [user?.id, loadStudentChats, loadContactChats]);

  // ─── Scroll to bottom on message change ─────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSelectedId, studentChats, teacherChats, parentChats]);

  // ─── Auto-mark as read when opening a chat ───────────────────────────────────
  const selectedChat = activeChats.find(c => c.contact.id === activeSelectedId);

  useEffect(() => {
    if (!selectedChat || selectedChat.unread === 0) return;
    void markConversationAsRead(selectedChat.conversationKey, activeTab);
  }, [selectedChat?.conversationKey, selectedChat?.unread, markConversationAsRead, activeTab]);

  // ─── Search filter ───────────────────────────────────────────────────────────
  const filteredChats = activeChats.filter(chat => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const fullName = `${chat.contact.firstName} ${chat.contact.lastName}`.toLowerCase();
    return fullName.includes(query) || chat.lastMessage.toLowerCase().includes(query);
  });

  // ─── Send message ────────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    const messageToSend = newMessage.trim();
    const optimistic: Message = {
      id: Date.now(),
      sender: 'counselor',
      content: messageToSend,
      timestamp: formatMessageTime(new Date().toISOString()),
    };

    const appendMessage = (prev: ContactChat[]) =>
      prev.map(c =>
        c.contact.id === selectedChat.contact.id
          ? { ...c, messages: [...c.messages, optimistic], lastMessage: messageToSend, timestamp: optimistic.timestamp }
          : c
      );

    if (activeTab === 'students') setStudentChats(appendMessage);
    else if (activeTab === 'teachers') setTeacherChats(appendMessage);
    else setParentChats(appendMessage);

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

    // Reload the active tab
    if (activeTab === 'students') await loadStudentChats();
    else if (activeTab === 'teachers') await loadContactChats('teacher', setTeacherChats, setSelectedTeacherId);
    else await loadContactChats('parent', setParentChats, setSelectedParentId);
  };

  // ─── Select contact ──────────────────────────────────────────────────────────
  const handleSelectContact = (contactId: string) => {
    if (activeTab === 'students') setSelectedStudentId(contactId);
    else if (activeTab === 'teachers') setSelectedTeacherId(contactId);
    else setSelectedParentId(contactId);

    setShowMobileList(false);

    const chat = activeChats.find(c => c.contact.id === contactId);
    if (chat?.unread) void markConversationAsRead(chat.conversationKey, activeTab);

    const clearUnread = (prev: ContactChat[]) =>
      prev.map(c => c.contact.id === contactId ? { ...c, unread: 0 } : c);

    if (activeTab === 'students') setStudentChats(clearUnread);
    else if (activeTab === 'teachers') setTeacherChats(clearUnread);
    else setParentChats(clearUnread);
  };

  // ─── Unread totals ───────────────────────────────────────────────────────────
  const unreadStudents = studentChats.reduce((s, c) => s + c.unread, 0);
  const unreadTeachers = teacherChats.reduce((s, c) => s + c.unread, 0);
  const unreadParents  = parentChats.reduce((s, c)  => s + c.unread, 0);
  const totalUnread = unreadStudents + unreadTeachers + unreadParents;

  // ─── Contact subtitle (shown under name in chat header) ─────────────────────
  const contactSubtitle = (contact: User) => {
    if (contact.role === 'student') return `Grade ${contact.gradeLevel || 'N/A'} | ${contact.email}`;
    if (contact.role === 'teacher') return `${contact.subject || contact.department || 'Teacher'} | ${contact.email}`;
    if (contact.role === 'parent') return `Parent${contact.relationship ? ` (${contact.relationship})` : ''} | ${contact.email}`;
    return contact.email;
  };

  // ─── Contact sub-label in list (shown under name) ────────────────────────────
  const contactListSublabel = (contact: User) => {
    if (contact.role === 'student') return `Grade ${contact.gradeLevel || 'N/A'}`;
    if (contact.role === 'teacher') return contact.subject || contact.department || 'Teacher';
    if (contact.role === 'parent') return contact.relationship || 'Parent';
    return '';
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[72vh] flex flex-col">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Conversations with students, teachers, and parents
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {totalUnread > 0 && (
            <div className="px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-sm text-primary font-medium">
              {totalUnread} unread
            </div>
          )}
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

      {isLoadingChats && !hasLoadedChats ? (
        <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center">
          <div className="text-center py-12 px-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-medium text-foreground text-lg">Loading conversations...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-card rounded-xl border border-border overflow-hidden flex">

          {/* ─── Sidebar (list panel) ─── */}
          <div
            className={`w-full md:w-[22rem] border-r border-border flex-shrink-0 flex flex-col min-h-0 bg-background/30 ${
              showMobileList ? 'block' : 'hidden md:block'
            }`}
          >
            {/* Tab switcher */}
            <div className="flex border-b border-border flex-shrink-0">
              {TABS.map(tab => {
                const unread = tab.key === 'students' ? unreadStudents : tab.key === 'teachers' ? unreadTeachers : unreadParents;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { setActiveTab(tab.key); setSearchQuery(''); setShowMobileList(true); }}
                    className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                      activeTab === tab.key
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {tab.label}
                    {unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="p-3 border-b border-border flex-shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground text-center mt-4">
                  {activeChats.length === 0 ? `No ${activeTab} yet` : 'No matches found'}
                </div>
              ) : (
                filteredChats.map(chat => (
                  <button
                    key={chat.contact.id}
                    onClick={() => handleSelectContact(chat.contact.id)}
                    className={`w-full p-3.5 text-left border-b border-border/60 transition-all duration-200 ${
                      activeSelectedId === chat.contact.id
                        ? 'bg-primary/12 border-l-[3px] border-l-primary'
                        : 'hover:bg-muted/60 border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                        {chat.contact.profileImage ? (
                          <img src={chat.contact.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-primary">
                            {chat.contact.firstName[0]}{chat.contact.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {chat.contact.firstName} {chat.contact.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.timestamp || '--'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {contactListSublabel(chat.contact)}
                        </p>
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
                ))
              )}
            </div>
          </div>

          {/* ─── Chat area ─── */}
          <div className={`flex-1 min-h-0 flex flex-col bg-background/10 ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-border bg-card/90 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button type="button" className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg" onClick={() => setShowMobileList(true)}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {selectedChat.contact.profileImage ? (
                        <img src={selectedChat.contact.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {selectedChat.contact.firstName[0]}{selectedChat.contact.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {selectedChat.contact.firstName} {selectedChat.contact.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {contactSubtitle(selectedChat.contact)}
                      </p>
                    </div>
                  </div>
                  {activeTab === 'students' && (
                    <Link
                      href="/counselor/students"
                      className="hidden sm:inline-flex px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      View Profile
                    </Link>
                  )}
                </div>

                {/* Messages */}
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
                          <p className="text-sm mt-1">Start the conversation with {selectedChat.contact.firstName}</p>
                        </div>
                      </div>
                    )}

                    {selectedChat.messages.map(message => {
                      const isMine = message.sender === 'counselor';
                      return (
                        <div key={message.id} className={`flex items-end gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          {!isMine && (
                            <div className="w-8 h-8 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center mb-1 flex-shrink-0 shadow-sm">
                              {selectedChat.contact.profileImage ? (
                                <img src={selectedChat.contact.profileImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-semibold text-primary">
                                  {selectedChat.contact.firstName[0]}{selectedChat.contact.lastName[0]}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="max-w-[84%] sm:max-w-[70%]">
                            <div className={`rounded-2xl px-4 py-2.5 border ${
                              isMine
                                ? 'bg-sky-500 text-white border-sky-600/40 rounded-br-md shadow-[0_8px_18px_-10px_rgba(14,165,233,0.9)]'
                                : 'bg-card/95 text-foreground border-border rounded-bl-md shadow-sm backdrop-blur-[1px]'
                            }`}>
                              <p className="text-sm leading-6 whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            <p className={`text-[11px] text-muted-foreground mt-1.5 ${isMine ? 'text-right' : 'text-left'}`}>
                              {isMine ? 'You' : selectedChat.contact.firstName} | {message.timestamp}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="px-4 py-4 sm:px-5 sm:py-5 border-t border-border bg-card/95">
                  <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-input bg-background/90 px-2 sm:px-3 py-2 shadow-sm">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedChat.contact.firstName}...`}
                      className="flex-1 bg-transparent px-2 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button type="submit" size="sm" disabled={!newMessage.trim()} className="rounded-full px-3.5 py-2" aria-label="Send message">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2.5 px-1">
                    Keep communication professional and supportive.
                  </p>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm mt-1">Pick someone from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
