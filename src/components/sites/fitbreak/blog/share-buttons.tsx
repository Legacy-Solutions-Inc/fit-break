"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "../icons";
import { ClipboardIcon, FacebookShareIcon, XIcon } from "./blog-icons";

/**
 * blog-post.html "Share this article": Facebook / X intents plus Copy Link,
 * which shows the source's bottom-centre pill toast for 3 s.
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

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-gray-900">Share this article</p>
        <div className="flex gap-3">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <FacebookShareIcon className="h-4 w-4" />
            Share
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <XIcon className="h-4 w-4" />
            Post
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ClipboardIcon className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      </div>

      <div
        role="status"
        className={
          toast
            ? "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-white shadow-lg"
            : "sr-only"
        }
      >
        {toast && (
          <>
            <Icon name="check" className="h-5 w-5 text-green-400" />
            <span>{toast}</span>
          </>
        )}
      </div>
    </div>
  );
}
