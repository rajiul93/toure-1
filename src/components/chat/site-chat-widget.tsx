'use client';

import { useSiteConfig } from '@/components/site-config/site-config-provider';
import { tourSlugFromPath } from '@/lib/tour-path';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsChat, BsXLg } from 'react-icons/bs';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
  offerWhatsappHandoff?: boolean;
};

export default function SiteChatWidget() {
  const site = useSiteConfig();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Escape is the expected way out of any overlay, and the input holds focus
  // while the panel is open so the keydown would otherwise go nowhere useful.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  // Follow the conversation for the typing bubble too, not just finished
  // replies, so the indicator is never left below the fold.
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const question = input.trim();
      setInput('');
      // Clicking Send moves focus to the button; put the visitor back in the
      // field so the next question is always one keystroke away.
      inputRef.current?.focus();
      setMessages((prev) => [...prev, { role: 'user', text: question }]);
      setLoading(true);

      // Read the tour at send time, not render time, so a visitor who navigates
      // with the panel open gets answers scoped to the page they are on now.
      const tourSlug = tourSlugFromPath(pathname);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            tourSlug ? { question, tourSlug } : { question },
          ),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = (await response.json()) as {
          answer: string;
          offerWhatsappHandoff?: boolean;
        };

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.answer,
            offerWhatsappHandoff: data.offerWhatsappHandoff,
          },
        ]);
      } catch (error) {
        console.error('Chat error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Sorry, something went wrong. Please try again.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, pathname],
  );

  const handleWhatsappClick = useCallback(
    (question: string) => {
      const whatsappUrl = `${site.contact.whatsappUrl}?text=${encodeURIComponent(question)}`;
      window.open(whatsappUrl, '_blank');
    },
    [site.contact.whatsappUrl],
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-hover"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? <BsXLg className="size-5" /> : <BsChat className="size-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex w-96 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
            <span className="font-semibold text-heading">Chat with us</span>
            {loading && (
              <span className="animate-pulse-soft text-xs text-zinc-500">
                typing…
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto rounded p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
              aria-label="Close chat"
            >
              <BsXLg className="size-3.5" />
            </button>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto p-4"
            style={{ maxHeight: '400px' }}
          >
            {messages.length === 0 && (
              <p className="text-sm text-zinc-500">
                Ask us anything about our tours, hours, pricing, or policies.
              </p>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-zinc-100 text-zinc-900'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-3"
                  role="status"
                  aria-label="Typing a reply"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="animate-typing-dot size-2 rounded-full bg-zinc-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 &&
              messages[messages.length - 1]?.offerWhatsappHandoff && (
                <button
                  onClick={() =>
                    handleWhatsappClick(
                      messages[messages.length - 2]?.text || 'Hi there!',
                    )
                  }
                  className="mt-2 w-full rounded-lg bg-success px-3 py-2 text-sm font-semibold text-white hover:bg-success-hover"
                >
                  Yes, talk to our team
                </button>
              )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-zinc-200 p-4"
          >
            <div className="flex gap-2">
              {/* Deliberately not disabled while loading: disabling blurs the
                  field, and the browser will not hand focus back afterwards.
                  handleSubmit already ignores sends while a reply is pending. */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
