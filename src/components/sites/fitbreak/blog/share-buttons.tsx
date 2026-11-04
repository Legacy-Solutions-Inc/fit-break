"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "../icons";
import { ClipboardIcon, FacebookShareIcon, XIcon } from "./blog-icons";

/**
 * blog-post.html "Share this article": Facebook / X intents plus Copy Link,
 * which shows a square ink toast at the bottom centre for 3 s.
 */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [toast, setToast] = useState<string | null>(null);
  // Like the source, share the address actually in the bar (server value first).
  const [pageHref, setPageHref] = useState(url);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setPageHref(window.location.href);
    return () => clearTimeout(timer.current);
  }, []);

  function show(message: string) {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      show("Link copied to clipboard!");
    } catch {
      show("Couldn't copy the link");
    }
  }

  const pageUrl = encodeURIComponent(pageHref);
  const pageTitle = encodeURIComponent(title);

  const button =
    "fb-label inline-flex h-11 items-center gap-2 border border-ink/25 px-4 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson";

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="fb-label text-mute">Share this article</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={button}
          >
            <FacebookShareIcon className="h-4 w-4" />
            Share
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={button}
          >
            <XIcon className="h-4 w-4" />
            Post
          </a>
          <button type="button" onClick={copyLink} className={button}>
            <ClipboardIcon className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      </div>

      <div
        role="status"
        className={
          toast
            ? "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 bg-ink px-6 py-3 text-paper"
            : "sr-only"
        }
      >
        {toast && (
          <>
            <Icon name="check" className="h-5 w-5" />
            <span>{toast}</span>
          </>
        )}
      </div>
    </div>
  );
}
