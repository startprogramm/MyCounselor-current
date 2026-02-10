'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import MessageComposer from './MessageComposer';
import AnnouncementCard from './AnnouncementCard';
import QuickResponseTemplates from './QuickResponseTemplates';
import EmergencyEscalation from './EmergencyEscalation';

interface Conversation {
  id: string;
  participantName: string;
  participantRole: 'student' | 'counselor' | 'parent';
  participantAvatar: string;
  participantAvatarAlt: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  priority: 'urgent' | 'high' | 'normal';
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'counselor' | 'parent';
  senderAvatar: string;
  senderAvatarAlt: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
  }>;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  priority: 'urgent' | 'high' | 'normal';
  category: string;
  isRead: boolean;
}

interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  availability: string;
}

const CommunicationHubInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participantName: 'Emily Rodriguez',
    participantRole: 'student',
    participantAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e82f9239-1763294934312.png",
    participantAvatarAlt: 'Young Hispanic female student with long dark hair wearing blue sweater smiling at camera',
    lastMessage: 'Thank you for helping me with my college application!',
    lastMessageTime: '2 min ago',
    unreadCount: 0,
    priority: 'normal',
    isOnline: true
  },
  {
    id: 'conv-2',
    participantName: 'Marcus Johnson',
    participantRole: 'student',
    participantAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17392bd70-1763295812950.png",
    participantAvatarAlt: 'African American male student with short hair and glasses in casual attire',
    lastMessage: 'I need urgent help with my schedule conflict',
    lastMessageTime: '5 min ago',
    unreadCount: 3,
    priority: 'urgent',
    isOnline: true
  },
  {
    id: 'conv-3',
    participantName: 'Sarah Chen',
    participantRole: 'parent',
    participantAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3469705-1763296398658.png",
    participantAvatarAlt: 'Asian woman with shoulder-length black hair in professional attire',
    lastMessage: 'Can we schedule a meeting to discuss my daughter\'s progress?',
    lastMessageTime: '15 min ago',
    unreadCount: 1,
    priority: 'high',
    isOnline: false
  },
  {
    id: 'conv-4',
    participantName: 'David Thompson',
    participantRole: 'student',
    participantAvatar: "https://images.unsplash.com/photo-1586953620693-54c3249107ad",
    participantAvatarAlt: 'Caucasian male student with brown hair wearing red hoodie outdoors',
    lastMessage: 'Thanks for the career resources you shared',
    lastMessageTime: '1 hour ago',
    unreadCount: 0,
    priority: 'normal',
    isOnline: false
  }];


  const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'counselor-1',
    senderName: 'Ms. Anderson',
    senderRole: 'counselor',
    senderAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a3fe8b61-1763294293825.png",
    senderAvatarAlt: 'Professional woman counselor with blonde hair in business attire',
    content: 'Hi Emily! I\'m glad you reached out. Let\'s review your college application checklist together.',
    timestamp: '10:30 AM',
    isRead: true
  },
  {
    id: 'msg-2',
    senderId: 'conv-1',
    senderName: 'Emily Rodriguez',
    senderRole: 'student',
    senderAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e82f9239-1763294934312.png",
    senderAvatarAlt: 'Young Hispanic female student with long dark hair wearing blue sweater smiling at camera',
    content: 'Thank you so much! I\'m working on my personal statement and would love your feedback on the draft I\'ve written.',
    timestamp: '10:32 AM',
    isRead: true,
    attachments: [
    {
      id: 'att-1',
      name: 'Personal_Statement_Draft.docx',
      size: '24 KB',
      type: 'document'
    }]

  },
  {
    id: 'msg-3',
    senderId: 'counselor-1',
    senderName: 'Ms. Anderson',
    senderRole: 'counselor',
    senderAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a3fe8b61-1763294293825.png",
    senderAvatarAlt: 'Professional woman counselor with blonde hair in business attire',
    content: 'Perfect! I\'ll review your draft and provide detailed feedback by tomorrow afternoon. In the meantime, make sure you\'re also working on your supplemental essays.',
    timestamp: '10:35 AM',
    isRead: true
  },
  {
    id: 'msg-4',
    senderId: 'conv-1',
    senderName: 'Emily Rodriguez',
    senderRole: 'student',
    senderAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e82f9239-1763294934312.png",
    senderAvatarAlt: 'Young Hispanic female student with long dark hair wearing blue sweater smiling at camera',
    content: 'Thank you for helping me with my college application!',
    timestamp: '10:37 AM',
    isRead: false
  }];


  const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'College Application Deadline Reminder',
    content: 'Early Action deadlines for most colleges are November 1st. Make sure all your materials are submitted at least 48 hours before the deadline to avoid technical issues.',
    author: 'Ms. Anderson',
    timestamp: '2 hours ago',
    priority: 'urgent',
    category: 'College Planning',
    isRead: false
  },
  {
    id: 'ann-2',
    title: 'Mental Health Awareness Week',
    content: 'Join us next week for Mental Health Awareness activities. We\'ll have daily workshops on stress management, mindfulness, and building resilience. Sign up through the student portal.',
    author: 'Counseling Department',
    timestamp: '5 hours ago',
    priority: 'high',
    category: 'Wellness',
    isRead: true
  },
  {
    id: 'ann-3',
    title: 'Career Fair Registration Open',
    content: 'Our annual Career Exploration Fair is scheduled for next month. Over 50 professionals from various industries will be available to answer your questions. Register now to secure your spot!',
    author: 'Career Services',
    timestamp: '1 day ago',
    priority: 'normal',
    category: 'Career Development',
    isRead: true
  }];


  const mockTemplates: Template[] = [
  {
    id: 'temp-1',
    title: 'Appointment Confirmation',
    content: 'Thank you for scheduling an appointment. I\'ve confirmed your meeting for [DATE] at [TIME]. Please bring any relevant documents or questions you\'d like to discuss.',
    category: 'Scheduling'
  },
  {
    id: 'temp-2',
    title: 'Resource Sharing',
    content: 'I\'ve found some helpful resources that might assist you with [TOPIC]. I\'ll share the links in our next meeting. In the meantime, feel free to reach out if you have any questions.',
    category: 'Resources'
  },
  {
    id: 'temp-3',
    title: 'Follow-up Check-in',
    content: 'I wanted to follow up on our last conversation about [TOPIC]. How are things progressing? Let me know if you need any additional support or guidance.',
    category: 'Follow-up'
  }];


  const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: 'emergency-1',
    name: 'Dr. Sarah Mitchell',
    role: 'School Psychologist',
    phone: '(555) 123-4567',
    availability: 'Available Now'
  },
  {
    id: 'emergency-2',
    name: 'Principal Johnson',
    role: 'School Principal',
    phone: '(555) 234-5678',
    availability: 'Available Now'
  },
  {
    id: 'emergency-3',
    name: 'Crisis Counselor',
    role: 'Emergency Support',
    phone: '(555) 345-6789',
    availability: '24/7'
  }];


  const currentUserId = 'counselor-1';

  const handleSendMessage = (content: string, attachments: File[]) => {
    console.log('Sending message:', content, attachments);
  };

  const handleMarkAsRead = (id: string) => {
    console.log('Marking announcement as read:', id);
  };

  const handleSelectTemplate = (content: string) => {
    console.log('Selected template:', content);
    setShowTemplates(false);
  };

  const handleEscalate = (contactId: string) => {
    console.log('Escalating to contact:', contactId);
  };

  const filteredConversations = mockConversations.filter((conv) =>
  conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Communication Hub</h1>
          <p className="text-muted-foreground">
            Secure messaging, announcements, and emergency support in one place
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'messages' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70'}`
            }>

            <Icon name="ChatBubbleLeftRightIcon" size={20} variant={activeTab === 'messages' ? 'solid' : 'outline'} />
            Messages
            {mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0) > 0 &&
            <span className="ml-2 px-2 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs font-bold">
                {mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
              </span>
            }
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'announcements' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70'}`
            }>

            <Icon name="MegaphoneIcon" size={20} variant={activeTab === 'announcements' ? 'solid' : 'outline'} />
            Announcements
            {mockAnnouncements.filter((ann) => !ann.isRead).length > 0 &&
            <span className="ml-2 px-2 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs font-bold">
                {mockAnnouncements.filter((ann) => !ann.isRead).length}
              </span>
            }
          </button>
        </div>

        {activeTab === 'messages' ?
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-card rounded-lg shadow-brand overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Icon
                  name="MagnifyingGlassIcon"
                  size={20}
                  variant="outline"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

                  <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />

                </div>
              </div>

              <ConversationList
              conversations={filteredConversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId} />

            </div>

            <div className="lg:col-span-8 bg-card rounded-lg shadow-brand overflow-hidden flex flex-col h-[600px]">
              {selectedConversationId ?
            <>
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="UserCircleIcon" size={24} variant="solid" className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {mockConversations.find((c) => c.id === selectedConversationId)?.participantName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {mockConversations.find((c) => c.id === selectedConversationId)?.isOnline ?
                      'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Quick Templates">

                        <Icon name="BoltIcon" size={20} variant="outline" className="text-muted-foreground" />
                      </button>

                      <button
                    onClick={() => setShowEmergency(!showEmergency)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Emergency Escalation">

                        <Icon name="ExclamationTriangleIcon" size={20} variant="outline" className="text-destructive" />
                      </button>

                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Icon name="VideoCameraIcon" size={20} variant="outline" className="text-muted-foreground" />
                      </button>

                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Icon name="EllipsisVerticalIcon" size={20} variant="outline" className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {showTemplates &&
              <div className="p-4 bg-muted/50 border-b border-border">
                      <QuickResponseTemplates templates={mockTemplates} onSelectTemplate={handleSelectTemplate} />
                    </div>
              }

                  {showEmergency &&
              <div className="p-4 bg-muted/50 border-b border-border">
                      <EmergencyEscalation contacts={mockEmergencyContacts} onEscalate={handleEscalate} />
                    </div>
              }

                  <MessageThread messages={mockMessages} currentUserId={currentUserId} />

                  <MessageComposer onSendMessage={handleSendMessage} />
                </> :

            <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="ChatBubbleLeftRightIcon" size={64} variant="outline" className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
            }
            </div>
          </div> :

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockAnnouncements.map((announcement) =>
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            onMarkAsRead={handleMarkAsRead} />

          )}
          </div>
        }
      </div>
    </div>);

};

export default CommunicationHubInteractive;