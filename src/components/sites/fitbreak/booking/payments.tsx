import { STUDIO_TIME_ZONE, type ClassPackage } from "@/services/fitbreak/catalog";
import type { Booking, MemberAccount, Payment } from "@/services/fitbreak/members";

import { CreditUsage, type UsageItem } from "./credit-usage";
import { InvoiceButton, PaymentsFlow, PurchaseButton } from "./payments-flow";

// payments.html + payments.js.

const DAY_MS = 86_400_000;

function Check() {
  return (
    <svg
      className="h-4 w-4 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Perks({ items }: { items: string[] }) {
  return (
    <ul className="mb-6 space-y-2 text-sm text-gray-600">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <Check />
          {item}
        </li>
      ))}
    </ul>
  );
}

const cardCls =
  "rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all hover:shadow-lg";
const buyBtn = "w-full rounded-xl px-6 py-3 font-semibold transition-all";

function PurchaseCards() {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <div className={cardCls}>
        <span className="mb-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
          NO MEMBERSHIP NEEDED
        </span>
        <h3 className="mb-2 text-xl font-bold text-gray-900">Guest Drop-In</h3>
        <p className="mb-4 text-sm text-gray-600">Try a class</p>
        <p className="mb-2 text-3xl font-bold text-brand-500">₱350</p>
        <p className="mb-4 text-sm text-gray-600">per class</p>
        <Perks items={["1 Class Credit", "Valid 7 days", "Next-day booking only"]} />
        <PurchaseButton
          packageId="drop-in"
          className={`${buyBtn} bg-gray-200 text-gray-800 hover:bg-gray-300`}
        />
      </div>

      <div className={cardCls}>
        <span className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
          14% OFF
        </span>
        <h3 className="mb-2 text-xl font-bold text-gray-900">Starter Pack</h3>
        <p className="mb-4 text-sm text-gray-600">Perfect for beginners</p>
        <p className="mb-1 text-3xl font-bold text-brand-500">₱1,800</p>
        <p className="mb-1 text-sm text-gray-600">₱300 per class</p>
        <p className="mb-4 text-sm font-semibold text-green-600">Save ₱300</p>
        <Perks items={["6 Class Credits", "Valid 30 days", "3-day advance booking"]} />
        <PurchaseButton
          packageId="starter"
          className={`${buyBtn} bg-brand-500 text-white hover:bg-brand-600`}
        />
      </div>

      <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
        <div className="absolute top-0 right-0 rounded-bl-lg bg-brand-500 px-3 py-1 text-xs font-bold text-white">
          Most Popular
        </div>
        <span className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
          21% OFF
        </span>
        <h3 className="mb-2 text-xl font-bold text-gray-900">Standard Pack</h3>
        <p className="mb-4 text-sm text-gray-600">Best for regulars</p>
        <p className="mb-1 text-3xl font-bold text-brand-500">₱3,300</p>
        <p className="mb-1 text-sm text-gray-600">₱275 per class</p>
        <p className="mb-4 text-sm font-semibold text-green-600">Save ₱900</p>
        <Perks items={["12 Class Credits", "Valid 30 days", "5-day advance booking"]} />
        <PurchaseButton
          packageId="standard"
          className={`${buyBtn} bg-brand-500 text-white hover:bg-brand-600`}
        />
      </div>

      <div className="relative rounded-2xl border-2 border-purple-500 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
        <div className="absolute top-0 right-0 rounded-bl-lg bg-purple-500 px-3 py-1 text-xs font-bold text-white">
          Best Value
        </div>
        <span className="mb-3 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
          29% OFF
        </span>
        <h3 className="mb-2 text-xl font-bold text-gray-900">Power Pack</h3>
        <p className="mb-4 text-sm text-gray-600">For fitness enthusiasts</p>
        <p className="mb-1 text-3xl font-bold text-brand-500">₱5,000</p>
        <p className="mb-1 text-sm text-gray-600">₱250 per class</p>
        <p className="mb-4 text-sm font-semibold text-green-600">Save ₱2,000</p>
        <Perks items={["20 Class Credits", "Valid 45 days", "7-day advance booking"]} />
        <PurchaseButton
          packageId="power"
          className={`${buyBtn} bg-purple-600 text-white hover:bg-purple-700`}
        />
      </div>
    </div>
  );
}

function paymentDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: STUDIO_TIME_ZONE,
  });
}

export function Payments({
  now,
  account,
  payments,
  bookings,
  initialPackage,
}: {
  now: Date;
  account: MemberAccount;
  payments: Payment[];
  bookings: Booking[];
  initialPackage?: ClassPackage["id"];
}) {
  const nowMs = now.getTime();
  const credits = account.credits;
  let expiryText = "No active membership";
  if (account.creditsExpireAt) {
    const daysLeft = Math.ceil((new Date(account.creditsExpireAt).getTime() - nowMs) / DAY_MS);
    expiryText = daysLeft > 0 ? `Expires in ${daysLeft} days` : "Expired";
  }

  // Unified credit history (payments.js loadCreditUsageHistory).
  const items: UsageItem[] = [];
  let purchased = 0;
  for (const p of payments) {
    if (p.status !== "verified") continue;
    purchased += p.credits;
    items.push({
      type: "credit_added",
      date: p.createdAt,
      credits: p.credits,
      description: p.packageName,
      amount: p.amountPhp,
    });
  }
  let used = 0;
  let attended = 0;
  for (const b of bookings) {
    if (b.status === "cancelled") {
      items.push({
        type: "credit_refunded",
        date: b.createdAt,
        credits: 1,
        description: `Cancelled: ${b.programName}`,
      });
      continue;
    }
    used++;
    if (b.status === "attended") attended++;
    items.push({
      type: "credit_used",
      date: b.createdAt,
      credits: -1,
      description: b.programName,
      classTime: b.time,
      status: b.status,
    });
  }
  items.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PaymentsFlow initialPackage={initialPackage}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Payments &amp; Credits</h1>
          <p className="text-gray-600">Manage your membership and purchase class credits</p>
        </div>

        {/* Current balance */}
        <div
          className="mb-8 rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 p-8 text-white shadow-xl"
          data-tour="payment-status"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-brand-100">Available Credits</p>
              <p id="available-credits" className="text-5xl font-bold">
                {credits}
              </p>
              <p id="credits-expiry" className="mt-2 text-sm text-brand-100">
                {expiryText}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-2 text-brand-100">Membership Status</p>
              <span
                id="membership-status"
                className="inline-block rounded-full bg-white/20 px-4 py-2 font-semibold backdrop-blur-sm"
              >
                {credits > 0 ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Buy credits */}
        <div className="mb-12" id="buy-credits" data-tour="buy-credits">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Purchase Credits</h2>
          <PurchaseCards />
        </div>

        {/* Opening promo banner */}
        <div className="mb-12 rounded-2xl bg-linear-to-r from-brand-500 to-brand-600 p-6 text-center text-white">
          <h3 className="mb-2 text-xl font-bold">January 2026 Opening Promo!</h3>
          <p className="text-brand-100">
            Annual Membership Fee (₱500) WAIVED for all sign-ups this month!
          </p>
        </div>

        {/* Payment history */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Payment History</h2>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-xs">
            <div id="payment-history" className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No payment history yet</p>
                </div>
              ) : (
                payments.map((p) => {
                  const date = paymentDate(p.createdAt);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-6 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{p.packageName}</p>
                        <p className="text-sm text-gray-500">
                          {date} • {p.credits} credits
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.method === "gcash" ? "GCash" : "BPI"} • Ref: {p.referenceNumber}
                          {p.proofFileName ? ` • ${p.proofFileName}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₱{p.amountPhp.toLocaleString("en-US")}
                          </p>
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                              p.status === "verified"
                                ? "bg-green-100 text-green-700"
                                : p.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        {p.status === "verified" && (
                          <InvoiceButton
                            paymentId={p.id}
                            packageName={p.packageName}
                            amount={p.amountPhp}
                            date={date}
                            credits={p.credits}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <CreditUsage
          items={items}
          nowMs={nowMs}
          purchased={purchased}
          used={used}
          attended={attended}
        />
      </div>
    </PaymentsFlow>
  );
}
