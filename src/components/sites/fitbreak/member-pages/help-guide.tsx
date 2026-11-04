"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Icon } from "../icons";
import { routes } from "../links";

interface GuideItem {
  id: string;
  emoji: string;
  title: string;
  defaultOpen?: boolean;
  body: ReactNode;
}

interface GuideSection {
  id: string;
  label: string;
  className: string;
  textClassName: string;
  items: GuideItem[];
}

const link = "font-medium text-brand-500 hover:underline";

const classTypes = (
  <div className="ml-9 space-y-3">
    <p>FitBreak offers various bootcamp-style classes designed for all fitness levels:</p>
    <ul className="space-y-2">
      <li>
        <strong className="text-gray-900">HIIT:</strong> High-intensity interval training for
        maximum calorie burn
      </li>
      <li>
        <strong className="text-gray-900">Strength:</strong> Resistance training to build muscle and
        tone
      </li>
      <li>
        <strong className="text-gray-900">Cardio:</strong> Heart-pumping exercises to improve
        endurance
      </li>
      <li>
        <strong className="text-gray-900">Core:</strong> Ab-focused workouts for a stronger
        midsection
      </li>
      <li>
        <strong className="text-gray-900">Full Body:</strong> Complete workout targeting all muscle
        groups
      </li>
    </ul>
    <p className="mt-2">
      <strong>What to bring:</strong> Water bottle, towel, and comfortable workout clothes
    </p>
  </div>
);

const sections: GuideSection[] = [
  {
    id: "start",
    label: "🚀 Getting Started",
    className: "bg-green-50 border-green-100",
    textClassName: "text-green-800",
    items: [
      {
        id: "quick-start",
        emoji: "⭐",
        title: "Quick Start Guide (Read This First!)",
        defaultOpen: true,
        body: (
          <div className="ml-9 space-y-4">
            <p className="font-medium text-gray-900">
              Welcome to FitBreak! Here&apos;s how to get started in 3 easy steps:
            </p>
            <div className="grid gap-3">
              {(
                [
                  [
                    "1",
                    "Buy Credits",
                    "Go to Pricing → Choose a package → Pay via GCash/BPI → Wait for approval",
                    "bg-blue-50",
                    "bg-blue-500",
                    "text-blue-900",
                    "text-blue-700",
                  ],
                  [
                    "2",
                    "Book a Class",
                    "Go to Schedule → Pick a class → Click Book Now → Done!",
                    "bg-green-50",
                    "bg-green-500",
                    "text-green-900",
                    "text-green-700",
                  ],
                  [
                    "3",
                    "Show Up & Sweat!",
                    "Arrive 10 mins early → Check in with instructor → Enjoy your workout!",
                    "bg-purple-50",
                    "bg-purple-500",
                    "text-purple-900",
                    "text-purple-700",
                  ],
                ] as const
              ).map(([n, title, text, box, dot, strong, soft]) => (
                <div key={n} className={cn("flex gap-3 rounded-lg p-3", box)}>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white",
                      dot,
                    )}
                  >
                    {n}
                  </span>
                  <div>
                    <p className={cn("font-semibold", strong)}>{title}</p>
                    <p className={cn("text-xs", soft)}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: "book",
        emoji: "📅",
        title: "How to Book a Class",
        body: (
          <>
            <ol className="ml-9 list-inside list-decimal space-y-2">
              <li>
                Go to{" "}
                <a href={routes.schedule} className={link}>
                  Schedule
                </a>{" "}
                page
              </li>
              <li>Browse available classes by day</li>
              <li>Click on a class to view details</li>
              <li>Click &quot;Book Now&quot; to reserve your spot</li>
              <li>You&apos;ll receive an email confirmation</li>
            </ol>
            <p className="mt-2 ml-9 text-gray-500">
              Note: You need credits to book classes. Each class costs 1 credit.
            </p>
          </>
        ),
      },
      {
        id: "buy",
        emoji: "💳",
        title: "How to Buy Credits",
        body: (
          <>
            <ol className="ml-9 list-inside list-decimal space-y-2">
              <li>
                Go to{" "}
                <a href={routes.pricing} className={link}>
                  Pricing
                </a>{" "}
                page
              </li>
              <li>Choose a package that suits your needs</li>
              <li>Click &quot;Get Started&quot; on your preferred package</li>
              <li>Select payment method (GCash or BPI)</li>
              <li>Send payment to the displayed account</li>
              <li>Upload screenshot of your payment</li>
              <li>Wait for admin approval (usually 1-2 hours)</li>
            </ol>
            <div className="mt-3 ml-9 rounded-lg bg-blue-50 p-3">
              <p className="font-medium text-blue-800">Available Packages:</p>
              <ul className="mt-1 space-y-1 text-xs text-blue-700">
                <li>• Drop-In: 1 credit (7 days validity)</li>
                <li>• Starter Pack: 6 credits (30 days)</li>
                <li>• Standard Pack: 12 credits (30 days)</li>
                <li>• Power Pack: 20 credits (45 days)</li>
              </ul>
            </div>
          </>
        ),
      },
      {
        id: "check-in",
        emoji: "✅",
        title: "How to Check In to a Class",
        body: (
          <>
            <p className="mb-3 ml-9 font-medium text-gray-900">Three easy ways to check in:</p>
            <div className="mb-3 ml-9 rounded-xl bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">📲</span>
                <p className="font-semibold text-green-800">
                  Option 1: Scan the Studio QR (Fastest!)
                </p>
              </div>
              <ol className="list-inside list-decimal space-y-2 text-xs text-green-700">
                <li>Look for the QR code displayed at the studio counter</li>
                <li>Open your phone camera and scan it</li>
                <li>Tap the link that appears on your screen</li>
                <li>Sign in (if needed) and tap your class to check in</li>
              </ol>
              <p className="mt-2 text-xs text-green-600 italic">
                💡 Self check-in is available 30 min before to 15 min after class
              </p>
            </div>
            <div className="mb-3 ml-9 rounded-xl bg-brand-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">📱</span>
                <p className="font-semibold text-brand-800">Option 2: Show Your Booking QR</p>
              </div>
              <ol className="list-inside list-decimal space-y-2 text-xs text-brand-700">
                <li>
                  Go to{" "}
                  <a href={routes.member.bookings} className="font-medium text-brand-600 underline">
                    My Bookings
                  </a>{" "}
                  before class
                </li>
                <li>Find your upcoming class - you&apos;ll see a QR code</li>
                <li>Show it to Coach Iren when you arrive</li>
                <li>She&apos;ll scan it and you&apos;re checked in!</li>
              </ol>
              <p className="mt-2 text-xs text-brand-600 italic">
                💡 Your QR code appears 24 hours before class
              </p>
            </div>
            <div className="ml-9 rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">🙋</span>
                <p className="font-semibold text-gray-800">Option 3: Manual Check-in</p>
              </div>
              <ol className="list-inside list-decimal space-y-2 text-xs text-gray-600">
                <li>Tell Coach Iren your name when you arrive</li>
                <li>She&apos;ll find your booking and check you in</li>
              </ol>
            </div>
            <p className="mt-3 ml-9 text-gray-500">
              Tip: You can view your booked classes in your{" "}
              <a href={routes.member.bookings} className="text-brand-500 hover:underline">
                My Bookings
              </a>
              .
            </p>
          </>
        ),
      },
      {
        id: "cancel",
        emoji: "❌",
        title: "How to Cancel a Booking",
        body: (
          <>
            <ol className="ml-9 list-inside list-decimal space-y-2">
              <li>
                Go to{" "}
                <a href={routes.member.bookings} className={link}>
                  My Bookings
                </a>
              </li>
              <li>Find the class you want to cancel</li>
              <li>Click &quot;Cancel&quot; on the booking</li>
              <li>Your credit will be refunded automatically</li>
            </ol>
            <div className="mt-3 ml-9 rounded-lg bg-yellow-50 p-3">
              <p className="text-xs text-yellow-800">
                <strong>Cancellation Policy:</strong> Cancel at least 4 hours before the class to
                get your credit back. Late cancellations may forfeit the credit.
              </p>
            </div>
          </>
        ),
      },
      { id: "class-types", emoji: "🏋️", title: "Class Types & What to Expect", body: classTypes },
    ],
  },
  {
    id: "payments",
    label: "💳 Payments & Credits",
    className: "mt-2 bg-blue-50 border-blue-100",
    textClassName: "text-blue-800",
    items: [
      {
        id: "credits",
        emoji: "🎫",
        title: "Understanding Your Credits",
        body: (
          <div className="ml-9 space-y-3">
            <div className="rounded-lg bg-green-50 p-3">
              <p className="font-semibold text-green-800">What are credits?</p>
              <p className="mt-1 text-xs text-green-700">
                Credits are your class passes. 1 credit = 1 class session. Buy them in packages and
                use them to book classes.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Where to see your credits:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>
                  • <strong>Dashboard:</strong> Shows remaining credits prominently
                </li>
                <li>
                  • <strong>Sidebar:</strong> Quick view on desktop
                </li>
                <li>
                  • <strong>Profile page:</strong> Detailed credit info
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <p className="font-semibold text-orange-800">⏰ Credit Expiry</p>
              <p className="mt-1 text-xs text-orange-700">
                Credits expire based on your package validity (7-45 days). Check your dashboard to
                see when your credits expire. Use them before they&apos;re gone!
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "payment-status",
        emoji: "📊",
        title: "Tracking Your Payment Status",
        body: (
          <div className="ml-9 space-y-3">
            <p className="font-medium text-gray-900">Payment Status Guide:</p>
            <div className="space-y-2">
              {(
                [
                  [
                    "Pending",
                    "bg-yellow-100 text-yellow-800",
                    "Waiting for admin verification (usually 1-2 hours)",
                  ],
                  [
                    "Approved",
                    "bg-green-100 text-green-800",
                    "Payment verified! Credits added to your account",
                  ],
                  [
                    "Rejected",
                    "bg-red-100 text-red-800",
                    "Issue with payment - check your email for details",
                  ],
                  ["Refunded", "bg-blue-100 text-blue-800", "Money returned to your account"],
                ] as const
              ).map(([label, badge, text]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={cn("rounded-[4px] px-2 py-1 text-xs font-bold", badge)}>
                    {label}
                  </span>
                  <span className="text-xs">{text}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Check your payment history in the{" "}
              <a href={routes.member.payments} className="text-brand-500 hover:underline">
                Payments
              </a>{" "}
              page.
            </p>
          </div>
        ),
      },
      {
        id: "save",
        emoji: "💡",
        title: "Tips to Save on Credits",
        body: (
          <div className="ml-9 space-y-2">
            <ul className="space-y-2">
              {(
                [
                  [
                    "💰",
                    "Buy bigger packs:",
                    "Power Pack gives you ₱250/class vs ₱350 for drop-in",
                  ],
                  ["👥", "Refer friends:", "Earn bonus credits when friends sign up"],
                  ["📅", "Book ahead:", "Plan your week to maximize credit usage before expiry"],
                  ["⏰", "Cancel early:", "Cancel 4+ hours ahead to get your credit back"],
                  ["📱", "Watch for promos:", "Follow us on social media for special deals"],
                ] as const
              ).map(([emoji, strong, text]) => (
                <li key={strong} className="flex gap-2">
                  <span>{emoji}</span>{" "}
                  <span>
                    <strong>{strong}</strong> {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: "troubleshooting",
    label: "🔧 Troubleshooting",
    className: "mt-2 bg-red-50 border-red-100",
    textClassName: "text-red-800",
    items: [
      {
        id: "issues",
        emoji: "❓",
        title: "Common Issues & Solutions",
        body: (
          <div className="ml-9 space-y-4">
            {(
              [
                [
                  '"I can\'t book a class"',
                  [
                    "Check if you have available credits",
                    "Make sure you're logged in",
                    "Check if the class is full (waitlist available)",
                    "Verify your credits haven't expired",
                  ],
                ],
                [
                  '"My payment is still pending"',
                  [
                    "Verification usually takes 1-2 hours",
                    "Check if you uploaded a clear receipt",
                    "Email support@fitbreak.ph if pending > 24 hours",
                  ],
                ],
                [
                  '"I didn\'t receive my credits"',
                  [
                    "Check your email for approval notification",
                    "Refresh your dashboard page",
                    "Check payment status in Payments page",
                  ],
                ],
                [
                  '"I accidentally booked the wrong class"',
                  [
                    "Cancel immediately from My Bookings",
                    "Credit is refunded if cancelled 4+ hours ahead",
                    "Book the correct class right away",
                  ],
                ],
              ] as const
            ).map(([title, tips]) => (
              <div key={title} className="border-l-2 border-gray-200 pl-3">
                <p className="font-semibold text-gray-900">{title}</p>
                <ul className="mt-1 space-y-1 text-xs">
                  {tips.map((t) => (
                    <li key={t}>✓ {t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "security",
        emoji: "🔐",
        title: "Account & Security",
        body: (
          <div className="ml-9 space-y-3">
            <div>
              <p className="font-medium text-gray-900">Reset your password:</p>
              <p className="text-xs">
                Go to{" "}
                <a href={routes.member.settings} className="text-brand-500 hover:underline">
                  Settings
                </a>{" "}
                → Security → Change Password
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Update your profile:</p>
              <p className="text-xs">Edit your name, phone, and emergency contact on this page</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Connect wearables:</p>
              <p className="text-xs">
                Go to{" "}
                <a href={routes.member.settings} className="text-brand-500 hover:underline">
                  Settings
                </a>{" "}
                → Connected Devices to sync Google Fit or Fitbit
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "about",
    label: "ℹ️ About FitBreak",
    className: "mt-2 bg-purple-50 border-purple-100",
    textClassName: "text-purple-800",
    items: [
      { id: "class-types-2", emoji: "🏋️", title: "Class Types & What to Expect", body: classTypes },
      {
        id: "location",
        emoji: "📍",
        title: "Studio Location & Contact",
        body: (
          <div className="ml-9 space-y-3">
            <div>
              <p className="font-medium text-gray-900">Address:</p>
              <p>2nd Floor Roxas Drive, Brgy Ilaya, Calapan City, Oriental Mindoro</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Contact:</p>
              <p>
                Email:{" "}
                <a href="mailto:support@fitbreak.ph" className="text-brand-500 hover:underline">
                  support@fitbreak.ph
                </a>
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Operating Hours:</p>
              <p>Monday - Saturday: 6:00 AM - 8:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        ),
      },
      {
        id: "policies",
        emoji: "📜",
        title: "Policies & Terms",
        body: (
          <div className="ml-9 space-y-2">
            <p>
              <a href={routes.terms} className="text-brand-500 hover:underline">
                Terms of Service
              </a>{" "}
              - Rules for using FitBreak
            </p>
            <p>
              <a href={routes.privacy} className="text-brand-500 hover:underline">
                Privacy Policy
              </a>{" "}
              - How we protect your data
            </p>
            {/* The source links /refund-policy.html, a page the live site does not have. */}
            <p>Refund Policy - Our refund guidelines</p>
          </div>
        ),
      },
    ],
  },
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlighted({ text, term }: { text: string; term: string }) {
  if (!term || !text.toLowerCase().includes(term.toLowerCase())) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-[4px] px-0.5">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** "Help & Guide" card with live search (profile.html). */
export function HelpGuide() {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [matches, setMatches] = useState<Set<string> | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDetailsElement>());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const needle = term.toLowerCase();
    if (!needle) {
      setMatches(null);
      return;
    }
    const found = new Set<string>();
    for (const [id, el] of itemRefs.current) {
      if ((el.textContent ?? "").toLowerCase().includes(needle)) {
        found.add(id);
        el.open = true; // auto-expand matches, as the source
      }
    }
    setMatches(found);
  }, [term]);

  function clear() {
    setQuery("");
    setTerm("");
  }

  const active = matches !== null;

  return (
    <div
      id="help-guide"
      className="mt-6 scroll-mt-24 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs"
    >
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
            <svg
              className="h-5 w-5 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Help &amp; Guide</h3>
            <p className="text-sm text-gray-500">Learn how to use FitBreak</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 p-4">
        <div className="relative">
          <svg
            className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") clear();
            }}
            aria-label="Search help topics"
            placeholder="Search help topics... (e.g., book, credit, check in, cancel)"
            className="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-brand-400 focus:outline-hidden"
          />
          {active && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                clear();
                inputRef.current?.focus();
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
            >
              <Icon name="close" className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        <p
          role="status"
          className={cn(
            active ? "mt-2 text-xs" : "sr-only",
            matches?.size === 0 ? "text-red-500" : "text-gray-500",
          )}
        >
          {active &&
            (matches.size === 0
              ? `No results found for "${term}"`
              : `Found ${matches.size} topic${matches.size === 1 ? "" : "s"} matching "${term}"`)}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {sections.map((section) => {
          const sectionVisible = !active || section.items.some((i) => matches.has(i.id));
          return (
            <Fragment key={section.id}>
              <div className={cn("border-b p-3", section.className, !sectionVisible && "hidden")}>
                <p
                  className={cn(
                    "text-xs font-semibold tracking-wide uppercase",
                    section.textClassName,
                  )}
                >
                  {section.label}
                </p>
              </div>
              {section.items.map((item) => {
                const hit = active && matches.has(item.id);
                return (
                  <details
                    key={item.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(item.id, el);
                      else itemRefs.current.delete(item.id);
                    }}
                    open={item.defaultOpen}
                    className={cn(
                      "group",
                      active && !hit && "hidden",
                      // v3's default ring colour (the source's ring-brand-300 is not in its CSS).
                      hit && "ring-2 ring-blue-500/50",
                    )}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center gap-3">
                        <span className="text-xl" aria-hidden="true">
                          {item.emoji}
                        </span>
                        <span className="font-medium text-gray-900">
                          <Highlighted text={item.title} term={hit ? term : ""} />
                        </span>
                      </div>
                      <Icon
                        name="chevronDown"
                        className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div className="space-y-2 px-4 pb-4 text-sm text-gray-600">{item.body}</div>
                  </details>
                );
              })}
            </Fragment>
          );
        })}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          Need more help? Contact us at{" "}
          <a
            href="mailto:support@fitbreak.ph"
            className="font-medium text-brand-500 hover:underline"
          >
            support@fitbreak.ph
          </a>
        </p>
      </div>
    </div>
  );
}
