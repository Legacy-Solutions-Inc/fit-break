"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { contact } from "./links";

const WELCOME =
  "Hi! I'm the FitBreak Assistant.\n\nI can help you with:\n• Class schedules\n• Pricing and packages\n• How to book\n• Our location\n• How credits work\n\nWhat would you like to know?";
// The studio's published contacts (never an unpublished support address).
const ERROR_REPLY = `Sorry, I'm having trouble connecting. Please try again, or contact us at ${contact.email} or ${contact.phoneDisplay}.`;

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

function getSessionId() {
  const key = "fitbreak_chat_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

/** FitBreak Assistant — floating chat bubble backed by /api/chatbot. */
export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const nextId = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = (from: Message["from"], text: string) =>
    setMessages((m) => [...m, { id: nextId.current++, from, text }]);

  useEffect(() => {
    const t = setTimeout(() => push("bot", WELCOME), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, sending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const message = input.trim();
    if (!message || sending) return;
    setInput("");
    setSending(true);
    push("user", message);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: getSessionId() }),
      });
      // An upstream failure surfaces as a 502 from the proxy; show the same
      // "trouble connecting" message the live widget shows on a failed fetch.
      if (!res.ok) throw new Error(`Chat proxy returned ${res.status}`);
      const data = (await res.json()) as { response?: string; fallback?: string };
      push(
        "bot",
        data.response ?? data.fallback ?? "Sorry, I couldn't process that. Please try again.",
      );
    } catch {
      push("bot", ERROR_REPLY);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  const bubbleText = "max-w-[85%] px-3.5 py-2.5 text-sm leading-[1.45] whitespace-pre-wrap";

  return (
    <div className="fixed right-4 bottom-20 z-[9999] lg:bottom-4">
      <div
        role="dialog"
        aria-label="FitBreak Assistant"
        className={cn(
          "absolute right-0 bottom-[70px] h-[500px] max-h-[calc(100vh-100px)] w-[350px] max-w-[calc(100vw-32px)] flex-col overflow-hidden border border-ink/15 bg-paper text-ink shadow-[0_18px_50px_-12px_rgba(23,19,15,0.35)] max-[400px]:h-[calc(100vh-100px)] max-[400px]:w-[calc(100vw-32px)]",
          open ? "flex" : "hidden",
        )}
      >
        <div className="flex items-center justify-between bg-ink p-4 text-paper">
          <h3 className="fb-display m-0 text-2xl">FitBreak Assistant</h3>
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center p-1 text-white"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          ref={listRef}
          aria-live="polite"
          className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                bubbleText,
                m.from === "bot"
                  ? "self-start border-l-2 border-crimson bg-bone text-ink"
                  : "self-end bg-ink text-paper",
              )}
            >
              {m.text}
            </div>
          ))}
          {sending && (
            <div className={cn(bubbleText, "self-start bg-bone")} aria-label="Assistant is typing">
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((delay) => (
                  <span
                    key={delay}
                    className="fb-typing-dot h-2 w-2 rounded-full bg-mute"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          className="flex gap-2 border-t border-ink/15 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label htmlFor="fb-chat-input" className="sr-only">
            Message
          </label>
          <input
            id="fb-chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            autoComplete="off"
            className="flex-1 border-b border-ink/30 bg-transparent px-1 py-2.5 text-sm transition-colors outline-none placeholder:text-mute focus:border-crimson"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={sending}
            className="flex h-10 w-10 items-center justify-center bg-crimson text-white transition-colors hover:bg-crimson-deep disabled:cursor-not-allowed disabled:bg-rule"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>

      <button
        type="button"
        aria-label={open ? "Close FitBreak Assistant" : "Open FitBreak Assistant"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-[3px] bg-ink shadow-[0_10px_30px_-8px_rgba(23,19,15,0.55)] transition-colors duration-200 hover:bg-crimson"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-paper" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
      </button>
    </div>
  );
}
