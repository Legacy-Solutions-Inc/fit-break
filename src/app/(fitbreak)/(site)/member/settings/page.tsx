import type { Metadata } from "next";

import { OnboardingTour } from "@/components/sites/fitbreak/member-pages/onboarding-tour";
import { SettingsPanels } from "@/components/sites/fitbreak/member-pages/settings-panels";
import { getSession } from "@/lib/auth/session";
import { requireMember } from "@/lib/fitbreak/member";
import { getGoals, getPreferences } from "@/services/fitbreak/fitness";
import { getAccount } from "@/services/fitbreak/members";

export const metadata: Metadata = {
  title: { absolute: "Settings — FitBreak" },
  description: "Manage your account preferences",
};

export default async function SettingsPage() {
  const member = await requireMember();
  const [account, goals, prefs, user] = await Promise.all([
    getAccount(member.id, member.email),
    getGoals(member.id),
    getPreferences(member.id),
    getSession(),
  ]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences</p>
        </div>

        <SettingsPanels
          email={member.email}
          lastSignInAt={user?.last_sign_in_at ?? null}
          notifications={{
            emailNotifications: account.settings.emailReminders,
            classReminders: prefs.classReminders,
            marketingEmails: account.settings.promoEmails,
          }}
          goals={goals}
        />
      </div>

      <OnboardingTour page="settings" />
    </div>
  );
}
