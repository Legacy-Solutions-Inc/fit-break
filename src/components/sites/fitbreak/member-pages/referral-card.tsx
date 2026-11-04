"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "../icons";

const SHARE_MESSAGE =
  "Join me at FitBreak! Women-only fitness bootcamp. Sign up using my link and we both get a free class!";

type Platform = "facebook" | "messenger" | "whatsapp" | "viber" | "telegram" | "twitter";

function shareUrl(platform: Platform, link: string): string {
  const encodedLink = encodeURIComponent(link);
  const encodedMessage = encodeURIComponent(`${SHARE_MESSAGE} ${link}`);
  switch (platform) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodeURIComponent(SHARE_MESSAGE)}`;
    case "messenger":
      // Desktop fallback, as the source.
      return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? `fb-messenger://share/?link=${encodedLink}`
        : `https://www.facebook.com/dialog/send?link=${encodedLink}&app_id=751967784039817&redirect_uri=${encodeURIComponent(window.location.href)}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodedMessage}`;
    case "viber":
      return `viber://forward?text=${encodedMessage}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(SHARE_MESSAGE)}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_MESSAGE)}&url=${encodedLink}`;
  }
}

const shareButtons: {
  platform: Platform;
  label: string;
  title: string;
  className: string;
  path: string;
}[] = [
  {
    platform: "facebook",
    label: "Facebook",
    title: "Share on Facebook",
    className: "bg-[#1877F2]",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    platform: "messenger",
    label: "Messenger",
    title: "Send via Messenger",
    className: "bg-linear-to-r from-[#00B2FF] to-[#006AFF]",
    path: "M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z",
  },
  {
    platform: "whatsapp",
    label: "WhatsApp",
    title: "Share on WhatsApp",
    className: "bg-[#25D366]",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  },
  {
    platform: "viber",
    label: "Viber",
    title: "Share on Viber",
    className: "bg-[#7360F2]",
    path: "M11.4 0C9.473.028 5.333.344 3.01 2.467 1.309 4.168.622 6.68.582 9.78c-.04 3.1-.09 8.91 5.45 10.5h.01l-.01 2.42s-.04.98.61 1.18c.78.25 1.24-.5 1.99-1.3.41-.44.98-1.08 1.4-1.58 3.87.32 6.85-.42 7.19-.53.79-.25 5.27-.83 6-6.79.75-6.14-.36-10.02-2.38-11.76C18.86.87 14.144.04 11.4 0zm.33 1.87c2.64.04 6.47.6 8.24 2.04 1.59 1.38 2.47 4.65 1.84 9.72-.58 4.77-4.16 5.17-4.82 5.38-.28.09-2.79.72-5.97.54 0 0-2.37 2.86-3.11 3.6-.12.12-.26.17-.35.15-.13-.04-.17-.19-.16-.41 0-.32.02-3.94.02-3.94-4.44-1.28-4.18-6.12-4.15-8.57.03-2.45.53-4.5 1.89-5.84C6.64 2.84 9.55 1.87 11.73 1.87zm.08 2.8c-.2 0-.2.3 0 .3 2.61.08 4.65 1.65 4.87 4.76 0 .19.3.18.3-.01-.04-1.7-.71-3.14-1.88-4.12a5.67 5.67 0 00-3.3-1.13zm-3.18.93c-.28-.02-.6.1-.94.35l-.02.02c-.32.27-.62.59-.84.92-.37.54-.43 1.08-.18 1.59.51 1.07 1.2 2.09 2.08 3.11l.03.03c.8.92 1.73 1.76 2.76 2.5l.05.04c.86.58 2.52 1.36 2.9 1.43h.01c.36.07.67-.01.9-.24l.01-.02c.24-.24.48-.57.67-.9.32-.56.15-1.12-.4-1.4l-1.56-.85a.67.67 0 00-.7.07l-.62.52c-.18.14-.43.12-.58.06-1.17-.57-3-2.2-3.45-3.4-.05-.16 0-.4.16-.56l.58-.55a.67.67 0 00.14-.7l-.79-1.65c-.14-.27-.42-.37-.71-.4zm3.06.85c-.2 0-.2.3 0 .3 1.63.06 2.86 1.12 2.93 2.87 0 .2.3.18.3-.01-.03-1.94-1.41-3.1-3.23-3.16zm.08 1.48c-.2-.02-.21.28-.01.3 1.01.09 1.42.68 1.47 1.57 0 .2.3.18.3-.01-.03-1.04-.59-1.79-1.76-1.86z",
  },
  {
    platform: "telegram",
    label: "Telegram",
    title: "Share on Telegram",
    className: "bg-[#0088cc]",
    path: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  },
  {
    platform: "twitter",
    label: "X",
    title: "Share on X",
    className: "bg-black",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

const PEOPLE =
  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z";
const SHARE =
  "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z";

/** "Refer Friends & Earn Credits" card + "Your Referral Link" modal (profile.html, referral.js). */
export function ReferralCard({
  referralLink,
  qrDataUrl,
  referralCount,
  referralRewards,
}: {
  referralLink: string;
  qrDataUrl: string;
  referralCount: number;
  referralRewards: number;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      // Older browsers: select so the member can copy manually.
      linkRef.current?.select();
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 3000);
  }

  return (
    <>
      <div
        id="referral-section"
        data-tour="referral"
        className="rounded-2xl bg-linear-to-r from-brand-500 to-brand-600 p-6 text-white shadow-xs md:col-span-2"
      >
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={PEOPLE} />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">Refer Friends &amp; Earn Credits</h3>
              <p className="text-sm text-brand-100">
                Share your link. When they book, you both get 1 free class!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-brand-600 shadow-lg transition-all hover:bg-brand-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={SHARE} />
            </svg>
            Get My Referral Link
          </button>
        </div>
        <div className="mt-4 flex gap-6 border-t border-white/20 pt-4 text-sm">
          <div>
            <span className="text-brand-200">Friends Referred:</span>
            <span className="ml-1 font-bold">{referralCount}</span>
          </div>
          <div>
            <span className="text-brand-200">Credits Earned:</span>
            <span className="ml-1 font-bold">{referralRewards}</span>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="referral-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white"
          >
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <h2 id="referral-title" className="text-xl font-bold text-gray-900">
                  Your Referral Link
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 transition hover:bg-gray-100"
                >
                  <Icon name="close" className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-50 p-4 text-center">
                  <p className="text-3xl font-bold text-brand-600">{referralCount}</p>
                  <p className="text-sm text-gray-600">Friends Referred</p>
                </div>
                <div className="rounded-xl bg-green-50 p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{referralRewards}</p>
                  <p className="text-sm text-gray-600">Credits Earned</p>
                </div>
              </div>

              <div className="text-center">
                <p className="mb-3 text-sm text-gray-600">Scan QR Code</p>
                <div className="inline-block rounded-xl border-2 border-gray-200 bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- generated data: URL */}
                  <img
                    src={qrDataUrl}
                    alt="Referral QR code"
                    width={200}
                    height={200}
                    className="block"
                  />
                </div>
                <a
                  href={qrDataUrl}
                  download="fitbreak-referral-qr.png"
                  className="mx-auto mt-3 flex w-fit items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  <Icon name="download" className="h-4 w-4" />
                  Download QR
                </a>
              </div>

              <div>
                <label htmlFor="referral-link-input" className="mb-2 block text-sm text-gray-600">
                  Or share this link:
                </label>
                <div className="flex gap-2">
                  <input
                    ref={linkRef}
                    id="referral-link-input"
                    type="text"
                    readOnly
                    value={referralLink}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-xl bg-brand-500 px-4 py-3 font-medium text-white transition hover:bg-brand-600"
                  >
                    Copy
                  </button>
                </div>
                <p
                  role="status"
                  className={
                    copied ? "mt-2 flex items-center gap-1 text-sm text-green-600" : "sr-only"
                  }
                >
                  {copied && (
                    <>
                      <Icon name="check" className="h-4 w-4" />
                      Link copied to clipboard!
                    </>
                  )}
                </p>
              </div>

              <div>
                <p className="mb-3 text-sm text-gray-600">Share on social media:</p>
                <div className="grid grid-cols-3 gap-2">
                  {shareButtons.map((b) => (
                    <button
                      key={b.platform}
                      type="button"
                      title={b.title}
                      onClick={() =>
                        window.open(
                          shareUrl(b.platform, referralLink),
                          "_blank",
                          "width=600,height=400",
                        )
                      }
                      className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-white transition hover:opacity-90 ${b.className}`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={b.path} />
                      </svg>
                      <span>{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-2 font-semibold text-gray-900">How it works:</p>
                <ol className="space-y-1 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="font-bold text-brand-600">1.</span> Share your link with
                    friends
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-brand-600">2.</span> They sign up using your
                    link
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-brand-600">3.</span> When they book their first
                    class, you both get 1 free credit!
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
