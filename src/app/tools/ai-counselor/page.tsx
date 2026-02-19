'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  "How do I write a strong college application essay?",
  "I'm feeling overwhelmed with schoolwork. What should I do?",
  "Can you help me explore career options that match my interests?",
  "What should I know about applying for scholarships?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] flex items-center justify-center flex-shrink-0">
        <Icon name="SparklesIcon" size={16} className="text-white" variant="solid" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] flex items-center justify-center flex-shrink-0">
        <Icon name="SparklesIcon" size={16} className="text-white" variant="solid" />
      </div>
      <div className="max-w-[75%] bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  );
}

export default function AICounselorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError('');
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');
      setIsStreaming(true);

      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const userContext = user
        ? { firstName: user.firstName, gradeLevel: user.gradeLevel }
        : undefined;

      abortRef.current = new AbortController();

      try {
        const response = await fetch('/api/ai-counselor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, userContext }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError((data as { error?: string }).error || 'Something went wrong. Please try again.');
          setIsStreaming(false);
          return;
        }

        const assistantId = crypto.randomUUID();
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '' },
        ]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          setError('Failed to read response.');
          setIsStreaming(false);
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
        setError('Connection error. Please check your internet and try again.');
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [messages, isStreaming, user]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const handleClear = () => {
    if (isStreaming) handleStop();
    setMessages([]);
    setError('');
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-16 flex flex-col">
        {/* Page header bar */}
        <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-16 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] flex items-center justify-center shadow-sm">
                <Icon name="SparklesIcon" size={18} className="text-white" variant="solid" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-sm leading-tight">AI Counselor</h1>
                <p className="text-xs text-muted-foreground">Powered by Claude</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  Clear chat
                </button>
              )}
              <Link
                href="/homepage"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon name="ArrowLeftIcon" size={14} variant="outline" />
                Back
              </Link>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">

            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] flex items-center justify-center mb-5 shadow-md">
                  <Icon name="SparklesIcon" size={32} className="text-white" variant="solid" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Hi{user?.firstName ? `, ${user.firstName}` : ''}! I&apos;m your AI Counselor
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mb-8">
                  I can help with college prep, career exploration, study strategies, and more.
                  Ask me anything — I&apos;m here to support your academic journey.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-8 max-w-sm">
                  For serious concerns, always reach out to your school counselor or call/text
                  the 988 Suicide &amp; Crisis Lifeline.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Typing indicator — shown while waiting for the first token */}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <TypingIndicator />
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="ExclamationCircleIcon" size={16} className="text-destructive" variant="outline" />
                </div>
                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about school, college, or career..."
                  rows={1}
                  disabled={isStreaming}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-60 transition-all max-h-32 overflow-y-auto"
                  style={{ lineHeight: '1.5' }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                  }}
                />
              </div>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 border border-border flex items-center justify-center transition-colors"
                  title="Stop generating"
                >
                  <span className="w-3.5 h-3.5 rounded-sm bg-foreground/70" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                  title="Send message"
                >
                  <Icon name="PaperAirplaneIcon" size={18} className="text-primary-foreground" variant="solid" />
                </button>
              )}
            </form>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Press Enter to send · Shift+Enter for new line · AI can make mistakes
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
