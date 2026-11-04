"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { memberAreaEnabled } from "@/config";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./icons";
import { asset, contact, routes } from "./links";

export interface SiteUser {
  name: string;
  email: string;
  avatarUrl: string;
}

const navLink = "text-sm font-medium text-gray-700 transition-colors hover:text-brand-500";
const menuItem = "block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50";
const mobileItem = "block rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50";

const aboutLinks = [
  { label: "The FitBreak Story", href: routes.ourStory },
  { label: "The Owner", href: routes.coach },
  { label: "The FitBreakers", href: routes.fitbreakers },
  { label: "Club Rules", href: routes.clubRules },
];

const userLinks: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "My Dashboard", href: routes.member.dashboard, icon: "home" },
  { label: "My Profile", href: routes.member.profile, icon: "user" },
  { label: "My Bookings", href: routes.member.bookings, icon: "calendar" },
  { label: "Payments", href: routes.member.payments, icon: "card" },
  { label: "Settings", href: routes.member.settings, icon: "cog" },
];

const MESSAGED_KEY = "fb-messaged";

/** True once the page has scrolled past a few pixels. */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return scrolled;
}

/**
 * Whether the "Message Us" button should nudge: yes until the visitor clicks
 * any Messenger link this session (remembered in sessionStorage only).
 */
function useMessengerNudge() {
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem(MESSAGED_KEY)) return;
    setNudge(true);
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="https://m.me/"]');
      if (!link) return;
      sessionStorage.setItem(MESSAGED_KEY, "1");
      setNudge(false);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return nudge;
}

/** Closes a popover on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("click", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, ref]);
}

export function SiteHeader({ user }: { user: SiteUser | null }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled();
  const nudge = useMessengerNudge();

  useDismiss(aboutOpen, () => setAboutOpen(false), aboutRef);
  useDismiss(userOpen, () => setUserOpen(false), userRef);

  return (
    // Slims once scrolled: the bar shrinks 64→56px while an 8px bottom margin
    // grows, so the header's footprint (and everything measured below it, like
    // the pinned homepage scenes) never moves.
    <header
      data-scrolled={scrolled || undefined}
      className={cn(
        "sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur-xl transition-[margin,box-shadow] duration-300 motion-reduce:transition-none",
        scrolled ? "mb-2 shadow-md" : "mb-0 shadow-xs",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex items-center justify-between transition-[height] duration-300 motion-reduce:transition-none",
            scrolled ? "h-14" : "h-16",
          )}
        >
          <div className="flex items-center gap-3">
            <Link href={routes.home} className="flex items-center">
              <Image
                src={asset("/images/fitbreak-landscape-logo.png")}
                alt="FitBreak"
                width={1444}
                height={343}
                priority
                className={cn(
                  "w-auto transition-[height] duration-300 motion-reduce:transition-none",
                  scrolled ? "h-8" : "h-10",
                )}
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {memberAreaEnabled && (
              <a href={routes.howItWorks} className={navLink}>
                How It Works
              </a>
            )}
            <a href={routes.pricing} className={navLink}>
              Pricing
            </a>
            <a href={routes.schedule} className={navLink}>
              Schedule
            </a>

            <div className="relative" ref={aboutRef}>
              <button
                type="button"
                aria-expanded={aboutOpen}
                aria-haspopup="menu"
                onClick={() => setAboutOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-brand-500"
              >
                About Us
                <Icon name="chevronDown" className="h-4 w-4" />
              </button>
              {aboutOpen && (
                <div className="absolute left-0 z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                  {aboutLinks.map((l) => (
                    <a key={l.label} href={l.href} className={menuItem}>
                      {l.label}
                    </a>
                  ))}
                  <div className="my-1 border-t border-gray-100" />
                  <a
                    href={routes.corporate}
                    className="block px-4 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50"
                  >
                    Corporate Program
                  </a>
                </div>
              )}
            </div>

            <a href={routes.blog} className={navLink}>
              Blog
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Notifications: the source renders the bell for everyone; it has no
                guest behaviour, so it is a non-interactive placeholder here too.
                Hidden entirely while the Member Area is parked. */}
            <div className={memberAreaEnabled ? "relative hidden sm:block" : "hidden"}>
              <button
                type="button"
                aria-label="Notifications"
                className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                <Icon name="bell" className="h-5 w-5" />
              </button>
            </div>

            {!memberAreaEnabled ? (
              // Information Site: one Booking Enquiry call to action.
              <a
                href={contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                data-nudge={nudge || undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg",
                  nudge && "fb-nudge",
                )}
              >
                Message Us
              </a>
            ) : user ? (
              <div className="flex items-center gap-3">
                <a
                  href={routes.schedule}
                  className="hidden items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg sm:inline-flex"
                >
                  Book Class
                </a>
                <div className="relative z-[100]" ref={userRef}>
                  <button
                    type="button"
                    aria-label="Account menu"
                    aria-expanded={userOpen}
                    onClick={() => setUserOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-gray-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote generated avatar, as on the source */}
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="pointer-events-none h-9 w-9 rounded-full border-2 border-white shadow-xs"
                    />
                    <Icon
                      name="chevronDown"
                      className="pointer-events-none hidden h-4 w-4 text-gray-600 sm:block"
                    />
                  </button>
                  {userOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white shadow-xl">
                      <div className="border-b border-gray-100 p-4">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-2">
                        {userLinks.map((l) => (
                          <a
                            key={l.label}
                            href={l.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Icon name={l.icon} className="h-5 w-5" />
                            {l.label}
                          </a>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <form action={signOut}>
                          <button
                            type="submit"
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Icon name="signOut" className="h-5 w-5" />
                            Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={routes.login}
                  className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 sm:inline-flex"
                >
                  Sign In
                </Link>
                <Link
                  href={routes.signup}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="fb-mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex-shrink-0 rounded-lg border border-gray-200 p-2 hover:bg-gray-100 md:hidden"
            >
              <Icon name={mobileOpen ? "close" : "menu"} className="pointer-events-none h-6 w-6" />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            id="fb-mobile-menu"
            className="border-t border-gray-200 bg-white shadow-lg md:hidden"
          >
            <div className="space-y-2 px-4 py-3">
              {memberAreaEnabled && (
                <a href={routes.howItWorks} className={mobileItem}>
                  How It Works
                </a>
              )}
              <a href={routes.pricing} className={mobileItem}>
                Pricing
              </a>
              <a href={routes.schedule} className={mobileItem}>
                Schedule
              </a>
              <div className="px-4 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                About Us
              </div>
              {aboutLinks.map((l) => (
                <a key={l.label} href={l.href} className={`${mobileItem} pl-6`}>
                  {l.label}
                </a>
              ))}
              <a
                href={routes.corporate}
                className="block rounded-lg bg-purple-50 px-4 py-3 pl-6 font-medium text-purple-700 hover:bg-purple-100"
              >
                Corporate Program
              </a>
              <a href={routes.blog} className={mobileItem}>
                Blog
              </a>
              <div className="my-2 border-t border-gray-100" />
              {!memberAreaEnabled ? (
                <a
                  href={contact.messenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-brand-600 hover:bg-brand-50"
                >
                  Message Us on Messenger
                </a>
              ) : user ? (
                <>
                  <Link href={routes.member.dashboard} className={mobileItem}>
                    My Dashboard
                  </Link>
                  <a href={routes.member.bookings} className={mobileItem}>
                    My Bookings
                  </a>
                </>
              ) : (
                <Link
                  href={routes.login}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-brand-600 hover:bg-brand-50"
                >
                  <Icon name="signIn" className="h-5 w-5" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
