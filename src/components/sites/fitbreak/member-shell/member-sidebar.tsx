"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/lib/auth/actions";

import { asset, routes } from "../links";
import { NavIcon, type NavIconName } from "./nav-icons";
import { SIDEBAR_COLLAPSED_COOKIE } from "./constants";

// Clone of the source's member-sidebar.js: a fixed, collapsible desktop
// sidebar ("[" toggles it; the choice is persisted) with collapsible
// categories (persisted per category in localStorage, as on the source), a
// slide-in mobile drawer and the mobile bottom navigation bar.

const CATEGORIES_KEY = "fitbreak_member_sidebar_categories_v2";

type PageId =
  | "dashboard"
  | "schedule"
  | "bookings"
  | "trainers"
  | "programs"
  | "tracker"
  | "statistics"
  | "profile"
  | "payments"
  | "settings";

interface NavItem {
  id: PageId;
  href: string;
  label: string;
  icon: NavIconName;
}

const categories: Array<{ id: string; label: string; icon: NavIconName; items: NavItem[] }> = [
  {
    id: "classes",
    label: "Classes",
    icon: "classes",
    items: [
      { id: "schedule", href: routes.schedule, label: "Schedule", icon: "schedule" },
      { id: "bookings", href: routes.member.bookings, label: "My Bookings", icon: "bookings" },
      { id: "trainers", href: routes.member.trainers, label: "Our Trainers", icon: "trainers" },
    ],
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: "fitness",
    items: [
      { id: "programs", href: routes.member.programs, label: "Programs", icon: "exercises" },
      {
        id: "tracker",
        href: routes.member.workoutTracker,
        label: "Workout Tracker",
        icon: "tracker",
      },
      { id: "statistics", href: routes.member.statistics, label: "Statistics", icon: "statistics" },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: "account",
    items: [
      { id: "profile", href: routes.member.profile, label: "Profile", icon: "profile" },
      { id: "payments", href: routes.member.payments, label: "Payments", icon: "payments" },
      { id: "settings", href: routes.member.settings, label: "Settings", icon: "settings" },
    ],
  },
];

const pageByPath: Record<string, PageId> = {
  [routes.member.dashboard]: "dashboard",
  [routes.schedule]: "schedule",
  [routes.member.bookings]: "bookings",
  [routes.member.trainers]: "trainers",
  [routes.member.programs]: "programs",
  [routes.member.workoutTracker]: "tracker",
  [routes.member.statistics]: "statistics",
  [routes.member.profile]: "profile",
  [routes.member.payments]: "payments",
  [routes.member.settings]: "settings",
};

function readCategoryStates(): Record<string, boolean> {
  try {
    const saved = window.localStorage.getItem(CATEGORIES_KEY);
    return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/** The source hides the site header and offsets main/footer for the fixed sidebar. */
function shellCss(collapsed: boolean): string {
  const margin = collapsed ? "4rem" : "16rem";
  return `.fb-site > header { display: none !important; }
.fb-site > main { padding-bottom: 5rem; }
@media (min-width: 1024px) {
  .fb-site > main { padding-bottom: 0; margin-left: ${margin} !important; }
  .fb-site > footer { margin-left: ${margin} !important; }
}`;
}

function Tooltip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute left-full z-50 ml-2 rounded-[4px] bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
      {label}
    </div>
  );
}

export interface MemberSidebarProps {
  name: string;
  avatarUrl: string;
  credits: number;
  isAdmin: boolean;
  initialCollapsed: boolean;
}

export function MemberSidebar({
  name,
  avatarUrl,
  credits,
  isAdmin,
  initialCollapsed,
}: MemberSidebarProps) {
  const pathname = usePathname();
  const activePage = pageByPath[pathname] ?? "";
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryStates, setCategoryStates] = useState<Record<string, boolean>>({});
  const userAreaRef = useRef<HTMLDivElement>(null);

  // Saved category states live in localStorage (read after mount).
  useEffect(() => {
    setCategoryStates(readCategoryStates());
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  // Keyboard shortcut: "[" toggles the sidebar (outside text inputs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setUserMenuOpen(false);
        return;
      }
      if (e.key !== "[" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      toggleCollapsed();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  // Close the user menu on an outside click.
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userAreaRef.current && !userAreaRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [userMenuOpen]);

  // Lock page scroll while the mobile drawer is open; close it on navigation.
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  function toggleCategory(id: string, expanded: boolean) {
    setCategoryStates((prev) => {
      const next = { ...prev, [id]: !expanded };
      try {
        window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable (private mode) — state still applies in memory.
      }
      return next;
    });
  }

  const hideLabel = collapsed ? "hidden" : "";
  const dashboardActive = activePage === "dashboard";

  const bottomItems: Array<{ id: string; href: string; label: string; icon: NavIconName }> = [
    { id: "dashboard", href: routes.member.dashboard, label: "Home", icon: "home" },
    { id: "schedule", href: routes.schedule, label: "Classes", icon: "schedule" },
    { id: "bookings", href: routes.member.bookings, label: "Bookings", icon: "bookings" },
    { id: "payments", href: routes.member.payments, label: "Payments", icon: "payments" },
  ];

  return (
    <>
      <style>{shellCss(collapsed)}</style>

      {/* Sidebar overlay for mobile */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="sidebar"
        aria-label="Member navigation"
        className={`fixed top-0 left-0 z-40 h-[calc(100vh-5rem)] lg:h-screen ${collapsed ? "w-16" : "w-64"} flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div
          className={`flex items-center border-b border-gray-100 p-4 ${collapsed ? "justify-center" : ""}`}
        >
          <Link
            href={routes.member.dashboard}
            className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}
          >
            {collapsed ? (
              <Image
                src={asset("/images/android-chrome-512x512.png")}
                alt="FitBreak"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Image
                src={asset("/images/fitbreak-landscape-logo.png")}
                alt="FitBreak"
                width={168}
                height={40}
                className="h-10 w-auto"
                priority
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          <Link
            href={routes.member.dashboard}
            title={collapsed ? "Dashboard" : undefined}
            aria-current={dashboardActive ? "page" : undefined}
            className={`group relative mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${dashboardActive ? "bg-brand-500 font-medium text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"} ${collapsed ? "justify-center" : ""}`}
          >
            <NavIcon name="dashboard" className="h-5 w-5 shrink-0" />
            <span className={hideLabel}>Dashboard</span>
            {collapsed && <Tooltip label="Dashboard" />}
          </Link>

          {categories.map((category) => {
            const categoryActive = category.items.some((item) => item.id === activePage);
            const expanded = categoryActive || categoryStates[category.id] === true;
            return (
              <div key={category.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`fb-nav-${category.id}`}
                  onClick={() => toggleCategory(category.id, expanded)}
                  className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <NavIcon
                      name={category.icon}
                      className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-600"
                    />
                    <span className={`text-sm font-medium ${hideLabel}`}>{category.label}</span>
                  </div>
                  <NavIcon
                    name="chevron"
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-90" : ""} ${hideLabel}`}
                  />
                </button>
                <div
                  id={`fb-nav-${category.id}`}
                  className={`grid transition-all duration-200 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <div className={`space-y-0.5 py-1 pl-8 ${collapsed ? "pl-0" : ""}`}>
                      {category.items.map((item) => {
                        const active = item.id === activePage;
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            tabIndex={expanded ? undefined : -1}
                            title={collapsed ? item.label : undefined}
                            aria-current={active ? "page" : undefined}
                            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 ${active ? "bg-brand-50 font-medium text-brand-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"} text-sm transition ${collapsed ? "justify-center px-2" : ""}`}
                          >
                            <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
                            <span className={hideLabel}>{item.label}</span>
                            {collapsed && <Tooltip label={item.label} />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer section */}
        <div className="shrink-0">
          <div
            ref={userAreaRef}
            className={`relative border-t border-gray-100 p-3 ${collapsed ? "p-2" : ""}`}
          >
            <button
              type="button"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              onClick={() => setUserMenuOpen((open) => !open)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-50 ${collapsed ? "justify-center" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote generated avatar, as on the source */}
              <img src={avatarUrl} alt="User" className="h-9 w-9 shrink-0 rounded-full" />
              <div className={`min-w-0 flex-1 ${hideLabel}`}>
                <p className="truncate text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">{credits} credits</p>
              </div>
              <NavIcon name="chevronUp" className={`h-4 w-4 text-gray-400 ${hideLabel}`} />
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                className={`mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${collapsed ? "absolute bottom-16 left-2 w-48" : ""}`}
              >
                <Link
                  role="menuitem"
                  href={routes.member.profile}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <NavIcon name="profile" className="h-4 w-4" />
                  My Profile
                </Link>
                <Link
                  role="menuitem"
                  href={routes.member.settings}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <NavIcon name="settings" className="h-4 w-4" />
                  Settings
                </Link>
                {isAdmin && (
                  <Link
                    role="menuitem"
                    href={routes.admin}
                    className="flex items-center gap-2 bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100"
                  >
                    <NavIcon name="admin" className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <div className="border-t border-gray-100" />
                <form action={signOut}>
                  <button
                    role="menuitem"
                    type="submit"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <NavIcon name="logout" className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className={`p-3 pt-0 ${collapsed ? "p-2 pt-0" : ""}`}>
              <Link
                href={routes.admin}
                title="Admin Dashboard"
                className={`flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-purple-700 hover:to-purple-800 ${collapsed ? "px-2" : ""}`}
              >
                <NavIcon name="admin" className="h-5 w-5" />
                <span className={hideLabel}>Admin Dashboard</span>
              </Link>
            </div>
          )}

          <div className={`p-3 pt-0 ${collapsed ? "p-2 pt-0" : ""}`}>
            <Link
              href={routes.schedule}
              title="Book a Class"
              className={`flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-500 to-brand-600 py-2.5 text-sm font-semibold text-white transition hover:from-brand-600 hover:to-brand-700 ${collapsed ? "px-2" : ""}`}
            >
              <NavIcon name="plus" className="pointer-events-none h-5 w-5" />
              <span className={`pointer-events-none ${hideLabel}`}>Book a Class</span>
            </Link>
          </div>

          {/* Sign out — always visible on mobile */}
          <div className={`p-3 pt-0 lg:hidden ${collapsed ? "p-2 pt-0" : ""}`}>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <NavIcon name="logout" className="pointer-events-none h-5 w-5" />
                <span className={`pointer-events-none ${hideLabel}`}>Sign Out</span>
              </button>
            </form>
          </div>

          {/* Desktop collapse toggle (keyboard: "[") */}
          <div className="hidden border-t border-gray-100 p-2 lg:block">
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar ([)" : "Collapse sidebar ([)"}
              className="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <NavIcon
                name="chevron"
                className={`h-4 w-4 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Member quick navigation"
        className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom,0)] lg:hidden"
      >
        <div className="flex items-center justify-around">
          {bottomItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.id === activePage ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center px-2 py-2 ${item.id === activePage ? "text-brand-500" : "text-gray-500"} transition-colors hover:text-brand-500`}
            >
              <NavIcon name={item.icon} className="h-6 w-6" />
              <span className="mt-1 text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          {isAdmin ? (
            <Link
              href={routes.admin}
              className="flex flex-1 flex-col items-center justify-center px-2 py-2 text-gray-500 transition-colors hover:text-brand-500"
            >
              <NavIcon name="admin" className="h-6 w-6" />
              <span className="mt-1 text-xs font-medium">Admin</span>
            </Link>
          ) : (
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="sidebar"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex flex-1 flex-col items-center justify-center px-2 py-2 text-gray-500 transition-colors hover:text-brand-500"
            >
              <NavIcon name="more" className="h-6 w-6" />
              <span className="mt-1 text-xs font-medium">More</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
