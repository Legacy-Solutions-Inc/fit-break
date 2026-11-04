import type { Metadata } from "next";
import { headers } from "next/headers";
import QRCode from "qrcode";

import { routes } from "@/components/sites/fitbreak/links";
import { HelpGuide } from "@/components/sites/fitbreak/member-pages/help-guide";
import { OnboardingTour } from "@/components/sites/fitbreak/member-pages/onboarding-tour";
import { ProfileForm } from "@/components/sites/fitbreak/member-pages/profile-form";
import { ReferralCard } from "@/components/sites/fitbreak/member-pages/referral-card";
import { activeStreak, classesAttended } from "@/components/sites/fitbreak/member-pages/stats";
import { requireMember } from "@/lib/fitbreak/member";
import { classStart } from "@/services/fitbreak/catalog";
import { getBodyMetrics, listWorkouts } from "@/services/fitbreak/fitness";
import { getAccount, listBookings } from "@/services/fitbreak/members";

export const metadata: Metadata = {
  title: { absolute: "My Profile — FitBreak" },
  description: "Manage your personal information",
};

/** This request's own origin, so referral links never point at another host. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function ProfilePage() {
  const member = await requireMember();
  const [account, body, bookings, workouts, origin] = await Promise.all([
    getAccount(member.id, member.email),
    getBodyMetrics(member.id),
    listBookings(member.id),
    listWorkouts(member.id),
    requestOrigin(),
  ]);

  const referralLink = `${origin}${routes.signup}&ref=${encodeURIComponent(account.referralCode)}`;
  const qrDataUrl = await QRCode.toDataURL(referralLink, {
    width: 200,
    margin: 0,
    errorCorrectionLevel: "H",
    color: { dark: "#D71E49", light: "#ffffff" },
  });

  const now = new Date();
  const attended = classesAttended(bookings, now);
  const streak = activeStreak(
    [
      ...attended.map((b) => classStart(b.date, b.time)),
      ...workouts.map((w) => new Date(w.loggedAt)),
    ],
    now,
  );

  const fullName = account.profile.fullName || member.name;
  // profile.js: the member's photo, else a DiceBear initials avatar.
  const avatarUrl = member.avatarUrl.startsWith("https://ui-avatars.com/")
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=D71E49`
    : member.avatarUrl;
  const memberSince = new Date(account.memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        <div
          data-tour="profile-info"
          className="profile-card mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs"
        >
          <div className="h-32 bg-linear-to-r from-brand-500 to-brand-600" />
          <div className="px-6 pb-6">
            <ProfileForm
              values={{
                fullName: account.profile.fullName || member.name,
                email: account.email || member.email,
                phone: account.profile.phone,
                emergencyContact: account.profile.emergencyContactPhone,
                heightCm: body.heightCm,
                weightKg: body.weightKg,
                birthday: account.profile.birthday,
                gender: body.gender,
                avatarUrl,
              }}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ReferralCard
            referralLink={referralLink}
            qrDataUrl={qrDataUrl}
            referralCount={0}
            referralRewards={0}
          />

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-semibold text-gray-900">{memberSince}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  Active
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-xs break-all text-gray-600">{member.id}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Your Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="text-2xl font-bold text-brand-500">{attended.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Streak</p>
                <p className="text-2xl font-bold text-orange-500">{streak} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits Remaining</p>
                <p className="text-2xl font-bold text-green-500">{account.credits}</p>
              </div>
            </div>
          </div>
        </div>

        <HelpGuide />
      </div>

      <OnboardingTour page="profile" />
    </div>
  );
}
