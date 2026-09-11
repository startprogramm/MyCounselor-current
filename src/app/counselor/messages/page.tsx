'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { startVisibilityAwarePolling } from '@/lib/polling';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';
import { isSameCalendarDay } from '@/lib/chat-date';
import ChatDateDivider from '@/components/messaging/ChatDateDivider';
import MessageComposer from '@/components/messaging/MessageComposer';
import ChatMessageBubble, { ChatMessageItemData, MessageAttachment } from '@/components/messaging/ChatMessageBubble';

interface Message {
  id: number;
  sender: 'counselor' | 'contact';
  content: string;
  timestamp: string;
  createdAt: string;
  attachments?: MessageAttachment[];
  isEdited?: boolean;
  isDeleted?: boolean;
}

interface MessageRow {
  id: number;
  conversation_key: string;
  sender_role: string;
  content: string;
  created_at: string;
  attachments?: MessageAttachment[];
  is_edited?: boolean;
  is_deleted?: boolean;
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

const TABS: { key: TabType; label: string; role: 'student' | 'teacher' | 'parent' }[] = [
  { key: 'students', label: 'Students', role: 'student' },
  { key: 'teachers', label: 'Teachers', role: 'teacher' },
  { key: 'parents', label: 'Parents', role: 'parent' },
];

export default function CounselorMessagesPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('students');

  const [studentChats, setStudentChats] = useState<ContactChat[]>([]);
  const [teacherChats, setTeacherChats] = useState<ContactChat[]>([]);
  const [parentChats, setParentChats] = useState<ContactChat[]>([]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [hasLoadedStudents, setHasLoadedStudents] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ id: number; content: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);

  const loadRequestIdRef = useRef(0);
  const selectedStudentIdRef = useRef<string | null>(null);
  const studentChatsRef = useRef<ContactChat[]>([]);
  const emptyChatsStreakRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('counselor-messages', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useEffect(() => {
    selectedStudentIdRef.current = selectedStudentId;
  }, [selectedStudentId]);

  useEffect(() => {
    studentChatsRef.current = studentChats;
  }, [studentChats]);

  useLayoutEffect(() => {
    if (!cacheKey) {
      setStudentChats([]);
      setTeacherChats([]);
      setParentChats([]);
      setSelectedStudentId(null);
      setSelectedTeacherId(null);
      setSelectedParentId(null);
      setIsLoadingStudents(true);
      setHasLoadedStudents(false);
      return;
    }

    setStudentChats([]);
    setTeacherChats([]);
    setParentChats([]);
    setSelectedStudentId(null);
    setSelectedTeacherId(null);
    setSelectedParentId(null);
    setIsLoadingStudents(true);
    setHasLoadedStudents(false);

    const cached = readCachedData<CounselorMessagesCachePayload>(
      cacheKey,
      COUNSELOR_MESSAGES_CACHE_TTL_MS
    );

    if (!cached.found || !cached.data) return;

    const cStudents = cached.data.studentChats || [];
    const cTeachers = cached.data.teacherChats || [];
    const cParents = cached.data.parentChats || [];

    setStudentChats(cStudents);
    setTeacherChats(cTeachers);
    setParentChats(cParents);

    const sId = cached.data.selectedStudentId;
    const tId = cached.data.selectedTeacherId;
    const pId = cached.data.selectedParentId;

    setSelectedStudentId(sId && cStudents.some((c) => c.contact.id === sId) ? sId : cStudents[0]?.contact.id || null);
    setSelectedTeacherId(tId && cTeachers.some((c) => c.contact.id === tId) ? tId : cTeachers[0]?.contact.id || null);
    setSelectedParentId(pId && cParents.some((c) => c.contact.id === pId) ? pId : cParents[0]?.contact.id || null);

    setIsLoadingStudents(false);
    setHasLoadedStudents(true);
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey || !hasLoadedStudents) return;

    writeCachedData<CounselorMessagesCachePayload>(cacheKey, {
      studentChats,
      teacherChats,
      parentChats,
      selectedStudentId,
      selectedTeacherId,
      selectedParentId,
    });
  }, [
    cacheKey,
    studentChats,
    teacherChats,
    parentChats,
    selectedStudentId,
    selectedTeacherId,
    selectedParentId,
    hasLoadedStudents,
  ]);

  const activeChats = useMemo(() => {
    if (activeTab === 'students') return studentChats;
    if (activeTab === 'teachers') return teacherChats;
    return parentChats;
  }, [activeTab, studentChats, teacherChats, parentChats]);

  const selectedContactId = useMemo(() => {
    if (activeTab === 'students') return selectedStudentId;
    if (activeTab === 'teachers') return selectedTeacherId;
    return selectedParentId;
  }, [activeTab, selectedStudentId, selectedTeacherId, selectedParentId]);

  const selectedChat = useMemo(() => {
    if (!selectedContactId) return null;
    return activeChats.find((c) => c.contact.id === selectedContactId) || null;
  }, [activeChats, selectedContactId]);

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeChats;
    return activeChats.filter((c) => {
      const fullName = `${c.contact.firstName} ${c.contact.lastName}`.toLowerCase();
      const email = c.contact.email.toLowerCase();
      const lastMsg = c.lastMessage.toLowerCase();
      return fullName.includes(q) || email.includes(q) || lastMsg.includes(q);
    });
  }, [activeChats, searchQuery]);

  const markConversationAsRead = useCallback(
    async (conversationKey: string, tab: TabType) => {
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

      const clearUnread = (prev: ContactChat[]) =>
        prev.map((c) => (c.conversationKey === conversationKey ? { ...c, unread: 0 } : c));

      if (tab === 'students') setStudentChats(clearUnread);
      else if (tab === 'teachers') setTeacherChats(clearUnread);
      else setParentChats(clearUnread);
    },
    [user?.id]
  );

  const loadContactChats = useCallback(
    async (
      contactRole: 'teacher' | 'parent',
      setChats: React.Dispatch<React.SetStateAction<ContactChat[]>>,
      setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
      if (!user?.id || !user?.schoolId) return;

      const { data: contactRows } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', user.schoolId)
        .eq('role', contactRole)
        .eq('approved', true);

      const contacts = (contactRows || []).map(mapProfileToUser);
      if (contacts.length === 0) {
        setChats([]);
        setSelectedId(null);
        return;
      }

      const keys = contacts.map((c) => buildConversationKey(c.id, user.id));

      const [{ data: messageRows }, { data: readRows }] = await Promise.all([
        supabase.from('messages').select('*').in('conversation_key', keys).order('created_at', { ascending: true }),
        supabase.from('message_reads').select('conversation_key,last_read_at').eq('reader_id', user.id).in('conversation_key', keys),
      ]);

      const grouped = new Map<string, MessageRow[]>();
      (messageRows || []).forEach((row) => {
        const bucket = grouped.get(row.conversation_key) || [];
        bucket.push(row as unknown as MessageRow);
        grouped.set(row.conversation_key, bucket);
      });

      const readMap = new Map<string, string>();
      (readRows || []).forEach((row) => readMap.set(row.conversation_key, row.last_read_at));

      const chats: ContactChat[] = contacts.map((contact) => {
        const conversationKey = buildConversationKey(contact.id, user.id);
        const rows = grouped.get(conversationKey) || [];
        const lastReadAt = readMap.get(conversationKey);
        const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;

        const messages: Message[] = rows.map((row) => ({
          id: row.id,
          sender: row.sender_role === 'counselor' ? 'counselor' : 'contact',
          content: row.content,
          timestamp: formatMessageTime(row.created_at),
          createdAt: row.created_at,
          attachments: (row.attachments as unknown as MessageAttachment[]) || [],
          isEdited: Boolean(row.is_edited),
          isDeleted: Boolean(row.is_deleted),
        }));

        const activeMessages = messages.filter((m) => !m.isDeleted);
        const lastMessage = activeMessages[activeMessages.length - 1] || messages[messages.length - 1];
        const unread = rows.filter(
          (row) =>
            row.sender_role !== 'counselor' &&
            (lastReadMs === 0 || new Date(row.created_at).getTime() > lastReadMs)
        ).length;

        let lastText = 'No messages yet';
        if (lastMessage) {
          if (lastMessage.isDeleted) {
            lastText = 'This message was deleted';
          } else if (lastMessage.content) {
            lastText = lastMessage.content;
          } else if (lastMessage.attachments?.length) {
            lastText = '[Attachment]';
          }
        }

        return {
          contact,
          conversationKey,
          messages,
          unread,
          lastMessage: lastText,
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
      setSelectedId((prev) => (prev && chats.some((c) => c.contact.id === prev) ? prev : chats[0]?.contact.id || null));
    },
    [user?.id, user?.schoolId]
  );

  const shouldPreserveStudentChats = useCallback(() => {
    if (studentChatsRef.current.length === 0) return false;
    emptyChatsStreakRef.current += 1;
    return emptyChatsStreakRef.current < 2;
  }, []);

  const loadStudentChats = useCallback(
    async (options?: { silent?: boolean }) => {
      const requestId = loadRequestIdRef.current + 1;
      loadRequestIdRef.current = requestId;

      const silent = options?.silent === true;
      if (!silent) setIsLoadingStudents(true);

      const finishLoad = () => {
        if (loadRequestIdRef.current !== requestId) return;
        setIsLoadingStudents(false);
        setHasLoadedStudents(true);
      };

      if (!user?.schoolId || !user?.id) {
        if (loadRequestIdRef.current === requestId) {
          setStudentChats([]);
          setSelectedStudentId(null);
          setLoadError(null);
        }
        finishLoad();
        return;
      }

      let students: User[] = [];
      let prefetchedMessageRows: MessageRow[] | null = null;

      const { data: studentRows, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', user.schoolId)
        .eq('role', 'student')
        .eq('approved', true);

      if (studentsError) {
        if (loadRequestIdRef.current === requestId) {
          setLoadError('Unable to load student list.');
        }
        finishLoad();
        return;
      }

      students = (studentRows || []).map(mapProfileToUser);

      if (students.length === 0) {
        const { data: fallbackRows, error: fallbackRowsError } = await supabase
          .from('messages')
          .select('*')
          .ilike('conversation_key', `%${user.id}%`)
          .order('created_at', { ascending: true });

        if (!fallbackRowsError && fallbackRows && fallbackRows.length > 0) {
          const fallbackStudentIds = Array.from(
            new Set(
              fallbackRows
                .map((row) => row.conversation_key.split('__'))
                .flat()
                .filter((id) => id !== user.id)
            )
          );

          if (fallbackStudentIds.length > 0) {
            const { data: fallbackStudentRows, error: fallbackStudentsError } = await supabase
              .from('profiles')
              .select('*')
              .eq('school_id', user.schoolId)
              .eq('role', 'student')
              .eq('approved', true)
              .in('id', fallbackStudentIds);

            if (!fallbackStudentsError && fallbackStudentRows && fallbackStudentRows.length > 0) {
              students = fallbackStudentRows.map(mapProfileToUser);
              prefetchedMessageRows = fallbackRows as unknown as MessageRow[];
            }
          }
        }
      }

      if (students.length === 0) {
        if (shouldPreserveStudentChats()) {
          if (loadRequestIdRef.current === requestId) setLoadError(null);
          finishLoad();
          return;
        }

        if (loadRequestIdRef.current === requestId) {
          setStudentChats([]);
          setSelectedStudentId(null);
          setLoadError(null);
        }
        finishLoad();
        return;
      }

      emptyChatsStreakRef.current = 0;

      const keys = students.map((s) => buildConversationKey(s.id, user.id));

      let messageRows = prefetchedMessageRows;
      let messageError: string | null = null;

      if (!messageRows) {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_key', keys)
          .order('created_at', { ascending: true });

        messageRows = (data || []) as unknown as MessageRow[];
        if (error) messageError = error.message || 'Unable to load messages.';
      }

      const { data: readRows } = await supabase
        .from('message_reads')
        .select('conversation_key,last_read_at')
        .eq('reader_id', user.id)
        .in('conversation_key', keys);

      if (messageError) {
        if (loadRequestIdRef.current === requestId) setLoadError(messageError);
        finishLoad();
        return;
      }

      const readByConversation = new Map<string, string>();
      (readRows || []).forEach((row) => readByConversation.set(row.conversation_key, row.last_read_at));

      const grouped = new Map<string, MessageRow[]>();
      (messageRows || []).forEach((row) => {
        const bucket = grouped.get(row.conversation_key) || [];
        bucket.push(row);
        grouped.set(row.conversation_key, bucket);
      });

      const chats: ContactChat[] = students.map((student) => {
        const conversationKey = buildConversationKey(student.id, user.id);
        const rows = grouped.get(conversationKey) || [];
        const lastReadAt = readByConversation.get(conversationKey);
        const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;

        const messages: Message[] = rows.map((row) => ({
          id: row.id,
          sender: row.sender_role === 'counselor' ? 'counselor' : 'contact',
          content: row.content,
          timestamp: formatMessageTime(row.created_at),
          createdAt: row.created_at,
          attachments: (row.attachments as unknown as MessageAttachment[]) || [],
          isEdited: Boolean(row.is_edited),
          isDeleted: Boolean(row.is_deleted),
        }));

        const activeMessages = messages.filter((m) => !m.isDeleted);
        const lastMessage = activeMessages[activeMessages.length - 1] || messages[messages.length - 1];
        const unread = rows.filter(
          (row) =>
            row.sender_role !== 'counselor' &&
            (lastReadMs === 0 || new Date(row.created_at).getTime() > lastReadMs)
        ).length;

        let lastText = 'No messages yet';
        if (lastMessage) {
          if (lastMessage.isDeleted) {
            lastText = 'This message was deleted';
          } else if (lastMessage.content) {
            lastText = lastMessage.content;
          } else if (lastMessage.attachments?.length) {
            lastText = '[Attachment]';
          }
        }

        return {
          contact: student,
          conversationKey,
          messages,
          unread,
          lastMessage: lastText,
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

      if (loadRequestIdRef.current === requestId) {
        setLoadError(null);
        setStudentChats(chats);
        const nextSel = chats.some((c) => c.contact.id === selectedStudentIdRef.current)
          ? selectedStudentIdRef.current
          : chats[0]?.contact.id || null;
        setSelectedStudentId(nextSel);
      }

      finishLoad();
    },
    [user, shouldPreserveStudentChats]
  );

  useEffect(() => {
    loadStudentChats();
  }, [loadStudentChats]);

  useEffect(() => {
    if (!user?.id) return;
    return startVisibilityAwarePolling(() => {
      void loadStudentChats({ silent: true });
      if (teacherChats.length > 0) loadContactChats('teacher', setTeacherChats, setSelectedTeacherId);
      if (parentChats.length > 0) loadContactChats('parent', setParentChats, setSelectedParentId);
    }, 12000);
  }, [user?.id, loadStudentChats, teacherChats.length, parentChats.length, loadContactChats]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setShowMobileList(true);
    setSearchQuery('');
    setSendError(null);
    setEditingMessage(null);
    setNewMessage('');

    if (tab === 'teachers' && teacherChats.length === 0 && !isLoadingTeachers) {
      setIsLoadingTeachers(true);
      loadContactChats('teacher', setTeacherChats, setSelectedTeacherId).finally(() =>
        setIsLoadingTeachers(false)
      );
    } else if (tab === 'parents' && parentChats.length === 0 && !isLoadingParents) {
      setIsLoadingParents(true);
      loadContactChats('parent', setParentChats, setSelectedParentId).finally(() =>
        setIsLoadingParents(false)
      );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContactId, activeChats]);

  useEffect(() => {
    if (!selectedChat || selectedChat.unread === 0) return;
    void markConversationAsRead(selectedChat.conversationKey, activeTab);
  }, [selectedChat?.conversationKey, selectedChat?.unread, activeTab, markConversationAsRead]);

  const handleSendMessage = async (text: string, attachments: MessageAttachment[]) => {
    if ((!text.trim() && attachments.length === 0) || !selectedChat || !user) return;

    if (editingMessage) {
      const updatedContent = text.trim();
      setEditingMessage(null);
      setNewMessage('');
      setSendError(null);

      const updateMessage = (prev: ContactChat[]) =>
        prev.map((c) =>
          c.contact.id === selectedChat.contact.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === editingMessage.id ? { ...m, content: updatedContent, isEdited: true } : m
                ),
              }
            : c
        );

      if (activeTab === 'students') setStudentChats(updateMessage);
      else if (activeTab === 'teachers') setTeacherChats(updateMessage);
      else setParentChats(updateMessage);

      const editPayload: Database['public']['Tables']['messages']['Update'] = {
        content: updatedContent,
        is_edited: true,
        edited_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('messages')
        .update(editPayload)
        .eq('id', editingMessage.id);

      if (error) {
        setSendError('Failed to save message edit.');
      }
      return;
    }

    const optimisticId = Date.now();
    const nowIso = new Date().toISOString();
    const optimistic: Message = {
      id: optimisticId,
      sender: 'counselor',
      content: text,
      timestamp: formatMessageTime(nowIso),
      createdAt: nowIso,
      attachments,
    };

    const appendMessage = (prev: ContactChat[]) =>
      prev.map((c) =>
        c.contact.id === selectedChat.contact.id
          ? {
              ...c,
              messages: [...c.messages, optimistic],
              lastMessage: text || (attachments.length ? '[Attachment]' : ''),
              timestamp: optimistic.timestamp,
            }
          : c
      );

    if (activeTab === 'students') setStudentChats(appendMessage);
    else if (activeTab === 'teachers') setTeacherChats(appendMessage);
    else setParentChats(appendMessage);

    setNewMessage('');
    setSendError(null);

    const { error } = await supabase.from('messages').insert({
      conversation_key: selectedChat.conversationKey,
      sender_role: 'counselor',
      sender_id: user.id,
      content: text,
      attachments: attachments as unknown as Database['public']['Tables']['messages']['Insert']['attachments'],
    });

    if (error) {
      const removeMessage = (prev: ContactChat[]) =>
        prev.map((c) =>
          c.contact.id === selectedChat.contact.id
            ? { ...c, messages: c.messages.filter((m) => m.id !== optimisticId) }
            : c
        );

      if (activeTab === 'students') setStudentChats(removeMessage);
      else if (activeTab === 'teachers') setTeacherChats(removeMessage);
      else setParentChats(removeMessage);

      setNewMessage(text);
      setSendError('Message failed to send. Please try again.');
      return;
    }
  };

  const handleStartEdit = (msg: ChatMessageItemData) => {
    setEditingMessage({ id: msg.id, content: msg.content });
    setNewMessage(msg.content);
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!selectedChat) return;

    // Save original messages for rollback
    const originalMessages = selectedChat.messages;

    const applyDelete = (prev: ContactChat[]) =>
      prev.map((c) =>
        c.contact.id === selectedChat.contact.id
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, isDeleted: true } : m
              ),
            }
          : c
      );

    const revert = (prev: ContactChat[]) =>
      prev.map((c) =>
        c.contact.id === selectedChat.contact.id
          ? { ...c, messages: originalMessages }
          : c
      );

    // Optimistic update
    if (activeTab === 'students') setStudentChats(applyDelete);
    else if (activeTab === 'teachers') setTeacherChats(applyDelete);
    else setParentChats(applyDelete);
    setSendError(null);

    // Try soft-delete first (requires migration)
    const deletePayload: Database['public']['Tables']['messages']['Update'] = { is_deleted: true };
    const { error: softError } = await supabase
      .from('messages')
      .update(deletePayload)
      .eq('id', messageId);

    if (!softError) return;

    // Fallback: hard DELETE for messages before migration was applied
    const { error: hardError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (hardError) {
      // Both failed — revert optimistic update
      if (activeTab === 'students') setStudentChats(revert);
      else if (activeTab === 'teachers') setTeacherChats(revert);
      else setParentChats(revert);
      setSendError('Failed to delete message. Please try again.');
    }
  };


  const handleSelectContact = (contactId: string) => {
    if (activeTab === 'students') setSelectedStudentId(contactId);
    else if (activeTab === 'teachers') setSelectedTeacherId(contactId);
    else setSelectedParentId(contactId);

    setShowMobileList(false);
    setEditingMessage(null);
    setNewMessage('');
    setSendError(null);

    const chat = activeChats.find((c) => c.contact.id === contactId);
    if (chat?.unread) void markConversationAsRead(chat.conversationKey, activeTab);

    const clearUnread = (prev: ContactChat[]) =>
      prev.map((c) => (c.contact.id === contactId ? { ...c, unread: 0 } : c));

    if (activeTab === 'students') setStudentChats(clearUnread);
    else if (activeTab === 'teachers') setTeacherChats(clearUnread);
    else setParentChats(clearUnread);
  };

  const unreadStudents = studentChats.reduce((s, c) => s + c.unread, 0);
  const unreadTeachers = teacherChats.reduce((s, c) => s + c.unread, 0);
  const unreadParents = parentChats.reduce((s, c) => s + c.unread, 0);
  const totalUnread = unreadStudents + unreadTeachers + unreadParents;

  const contactSubtitle = (contact: User) => {
    if (contact.role === 'student') return `Grade ${contact.gradeLevel || 'N/A'} | ${contact.email}`;
    if (contact.role === 'teacher') return `${contact.subject || contact.department || 'Teacher'} | ${contact.email}`;
    if (contact.role === 'parent')
      return `Parent${contact.relationship ? ` (${contact.relationship})` : ''} | ${contact.email}`;
    return contact.email;
  };

  const contactListSublabel = (contact: User) => {
    if (contact.role === 'student') return `Grade ${contact.gradeLevel || 'N/A'}`;
    if (contact.role === 'teacher') return contact.subject || contact.department || 'Teacher';
    if (contact.role === 'parent') return contact.relationship || 'Parent';
    return '';
  };

  const isLoadingTab =
    (activeTab === 'students' && isLoadingStudents && !hasLoadedStudents) ||
    (activeTab === 'teachers' && isLoadingTeachers) ||
    (activeTab === 'parents' && isLoadingParents);

  return (
    <div className="h-dvh min-h-0 flex flex-col overflow-hidden">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Direct communication with students, teachers, and parents at your school
          </p>
        </div>
        {totalUnread > 0 && (
          <div className="px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-sm text-primary font-medium">
            {totalUnread} total unread
          </div>
        )}
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

      {/* Role Tabs */}
      <div className="flex border-b border-border mb-4 gap-1">
        {TABS.map((tab) => {
          const count =
            tab.key === 'students'
              ? studentChats.length
              : tab.key === 'teachers'
              ? teacherChats.length
              : parentChats.length;
          const unread =
            tab.key === 'students' ? unreadStudents : tab.key === 'teachers' ? unreadTeachers : unreadParents;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs ${
                    unread > 0 ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {unread > 0 ? unread : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoadingTab ? (
        <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-medium text-foreground">Loading {activeTab}...</p>
          </div>
        </div>
      ) : activeChats.length === 0 ? (
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
            <p className="font-medium text-foreground text-lg">No {activeTab} found</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              No approved {activeTab} have joined your school yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-card rounded-xl border border-border overflow-hidden flex">
          {/* Sidebar */}
          <div
            className={`w-full md:w-[22rem] border-r border-border flex-shrink-0 flex flex-col min-h-0 bg-background/30 ${
              showMobileList ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-foreground text-sm capitalize">{activeTab}</h2>
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
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredChats.length === 0 && (
                <div className="p-5 text-sm text-muted-foreground">No matching contacts.</div>
              )}
              {filteredChats.map((chat) => (
                <button
                  key={chat.contact.id}
                  onClick={() => handleSelectContact(chat.contact.id)}
                  className={`w-full p-3.5 text-left border-b border-border/60 transition-all duration-200 ${
                    selectedContactId === chat.contact.id
                      ? 'bg-primary/12 border-l-[3px] border-l-primary shadow-[inset_0_1px_0_rgba(59,130,246,0.08)]'
                      : 'hover:bg-muted/60 border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {chat.contact.profileImage ? (
                        <img src={chat.contact.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {chat.contact.firstName[0]}
                          {chat.contact.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {chat.contact.firstName} {chat.contact.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {chat.timestamp || '--'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {contactListSublabel(chat.contact)}
                      </p>
                      <p
                        className={`text-sm truncate mt-1 ${
                          chat.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
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
                <div className="p-4 border-b border-border bg-card/90 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                      onClick={() => setShowMobileList(true)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="w-11 h-11 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {selectedChat.contact.profileImage ? (
                        <img src={selectedChat.contact.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {selectedChat.contact.firstName[0]}
                          {selectedChat.contact.lastName[0]}
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
                      href={`/counselor/guidance?studentId=${selectedChat.contact.id}`}
                      className="hidden sm:inline-flex px-3 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      View Academic Profile
                    </Link>
                  )}
                </div>

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
                            Send a message to {selectedChat.contact.firstName} to start chatting
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedChat.messages.map((message, index) => {
                      const isMine = message.sender === 'counselor';
                      const previousMessage = selectedChat.messages[index - 1];
                      const showDateDivider =
                        !previousMessage || !isSameCalendarDay(previousMessage.createdAt, message.createdAt);
                      return (
                        <React.Fragment key={message.id}>
                          {showDateDivider && <ChatDateDivider iso={message.createdAt} />}
                          <ChatMessageBubble
                            message={{
                              id: message.id,
                              senderRole: 'counselor',
                              isOwnMessage: isMine,
                              content: message.content,
                              timestamp: message.timestamp,
                              createdAt: message.createdAt,
                              attachments: message.attachments,
                              isEdited: message.isEdited,
                              isDeleted: message.isDeleted,
                              senderName: isMine ? 'You' : selectedChat.contact.firstName,
                              senderAvatar: isMine ? undefined : selectedChat.contact.profileImage,
                              senderInitials: isMine
                                ? undefined
                                : `${selectedChat.contact.firstName[0]}${selectedChat.contact.lastName[0]}`,
                            }}
                            onEdit={handleStartEdit}
                            onDelete={handleDeleteMessage}
                          />
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <MessageComposer
                  value={newMessage}
                  onChange={setNewMessage}
                  onSend={handleSendMessage}
                  placeholder={`Message ${selectedChat.contact.firstName}...`}
                  error={sendError}
                  editingMessage={editingMessage}
                  onCancelEdit={() => {
                    setEditingMessage(null);
                    setNewMessage('');
                  }}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Select a contact to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
