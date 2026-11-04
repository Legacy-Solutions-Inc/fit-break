import Image from "next/image";
import Link from "next/link";

import { FacebookIcon, Icon, SolidCheck } from "./icons";
import { asset, cardIn, contact, routes } from "./links";

const perks = [
  "Access to member-only class packs",
  "Invitations to special FitBreak events & workshops",
  "Discounts on FitBreak activewear & merchandise",
];

function SignInGate() {
  return (
    <div
      style={cardIn(15)}
      className="fb-card-in mb-8 rounded-2xl bg-white p-12 text-center shadow-lg"
    >
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <Icon name="lock" className="h-8 w-8 text-brand-500" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">Want to See Our Pricing?</h3>
        <p className="mb-6 text-gray-600">
          Sign in to your account or follow us on Facebook for pricing, promos, and updates!
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={routes.login}
            className="rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-brand-600"
          >
            Sign In / Create Account
          </Link>
          <a
            href={contact.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700"
          >
            <FacebookIcon className="mr-2 h-5 w-5" />
            Follow on Facebook
          </a>
        </div>
      </div>
    </div>
  );
}

function MemberPricing() {
  const pack = "block w-full rounded-full px-6 py-3 text-center font-semibold transition-all";
  return (
    <div>
      <div className="mb-8 rounded-2xl bg-linear-to-r from-teal-500 to-teal-600 p-6 text-white">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xl font-bold">Annual Membership Fee</h3>
            <p className="mb-2 text-3xl font-bold">₱500</p>
            <p className="text-sm text-teal-100">
              Required for all package members (Starter, Standard, Power). One-time annual fee,
              non-refundable.
            </p>
          </div>
          <div className="space-y-2">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <Icon name="check" className="h-5 w-5 text-teal-200" />
                <span className="text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          style={cardIn(16)}
          className="fb-card-in rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all hover:shadow-lg"
        >
          <h3 className="mb-2 text-xl font-bold text-gray-900">Guest Drop-In</h3>
          <p className="mb-4 text-sm text-gray-600">Try a class • No membership required</p>
          <p className="mb-2 text-3xl font-bold text-brand-500">
            ₱350<span className="text-base font-normal text-gray-600">/class</span>
          </p>
          <p className="mb-2 text-xs text-gray-500">Next-day booking only</p>
          <p className="mb-4 text-xs font-medium text-amber-600">Limited to 3 drop-ins</p>
          <a
            href={contact.messenger}
            target="_blank"
            rel="noopener noreferrer"
            className={`${pack} bg-gray-200 text-gray-800 hover:bg-gray-300`}
          >
            Message Us to Book
          </a>
        </div>

        <div
          style={cardIn(17)}
          className="fb-card-in rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all hover:shadow-lg"
        >
          <span className="mb-3 inline-block rounded-full bg-brand-100 px-2 py-1 text-xs font-bold text-brand-700">
            14% OFF
          </span>
          <h3 className="mb-2 text-xl font-bold text-gray-900">Starter Pack</h3>
          <p className="mb-4 text-sm text-gray-600">6 Classes • Valid 30 days</p>
          <p className="mb-1 text-3xl font-bold text-brand-500">₱1,800</p>
          <p className="mb-4 text-sm text-gray-500">₱300/class • 3-day advance booking</p>
          <a
            href={contact.messenger}
            target="_blank"
            rel="noopener noreferrer"
            className={`${pack} bg-brand-500 text-white hover:bg-brand-600`}
          >
            Ask About This Pack
          </a>
        </div>

        <div
          style={cardIn(18)}
          className="fb-card-in relative overflow-hidden rounded-2xl border-2 border-brand-500 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
        >
          <div className="absolute top-0 right-0 rounded-bl-lg bg-brand-500 px-3 py-1 text-xs font-bold text-white">
            Popular
          </div>
          <span className="mb-3 inline-block rounded-full bg-brand-100 px-2 py-1 text-xs font-bold text-brand-700">
            21% OFF
          </span>
          <h3 className="mb-2 text-xl font-bold text-gray-900">Standard Pack</h3>
          <p className="mb-4 text-sm text-gray-600">12 Classes • Valid 30 days</p>
          <p className="mb-1 text-3xl font-bold text-brand-500">₱3,300</p>
          <p className="mb-4 text-sm text-gray-500">₱275/class • 5-day advance booking</p>
          <a
            href={contact.messenger}
            target="_blank"
            rel="noopener noreferrer"
            className={`${pack} bg-brand-500 text-white hover:bg-brand-600`}
          >
            Ask About This Pack
          </a>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 rounded-bl-lg bg-yellow-400 px-3 py-1 text-xs font-bold text-gray-900">
            Best Value
          </div>
          <span className="mb-3 inline-block rounded-full bg-white/20 px-2 py-1 text-xs font-bold text-white">
            29% OFF
          </span>
          <h3 className="mb-2 text-xl font-bold">Power Pack</h3>
          <p className="mb-4 text-sm text-brand-100">20 Classes • Valid 45 days</p>
          <p className="mb-1 text-3xl font-bold">₱5,000</p>
          <p className="mb-4 text-sm text-brand-100">₱250/class • 7-day advance booking</p>
          <a
            href={contact.messenger}
            target="_blank"
            rel="noopener noreferrer"
            className={`${pack} bg-white text-brand-600 hover:bg-brand-50`}
          >
            Ask About This Pack
          </a>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Payment Options</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <SolidCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-brand-500" />
            <span className="text-base text-gray-700">
              <strong>GCash:</strong> Send payment and send your receipt on Messenger
            </span>
          </div>
          <div className="flex items-start gap-3">
            <SolidCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-brand-500" />
            <span className="text-base text-gray-700">
              <strong>BPI Bank Transfer:</strong> 8969-3458-85 (Iren San Buenaventura)
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Your classes are confirmed once we verify your payment.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4">
        {[
          { src: "/images/fitbreak6.jpg", alt: "FitBreak community" },
          { src: "/images/fitbreak8.jpg", alt: "FitBreak training" },
          { src: "/images/fitbreak11.jpg", alt: "FitBreak workout" },
        ].map((img) => (
          <div key={img.src} className="relative h-32 overflow-hidden rounded-xl">
            <Image
              src={asset(img.src)}
              alt={img.alt}
              fill
              sizes="(min-width: 1280px) 400px, 33vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Pricing is members-only on the source (guests see a sign-in gate). On the
 * Information Site prices are public, so `showPrices` is true for everyone.
 */
export function Pricing({ showPrices }: { showPrices: boolean }) {
  return (
    <section id="pricing" className="bg-linear-to-br from-pink-50 to-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Membership &amp; Pricing</h2>
        <p className="mb-8 text-gray-600">
          Pay via <strong>GCash or bank transfer only</strong>, no cash payments.{" "}
          <a href={routes.pricing} className="text-brand-600 hover:underline">
            View full pricing details
          </a>
        </p>

        {showPrices ? <MemberPricing /> : <SignInGate />}

        <div className="mt-10 rounded-2xl bg-linear-to-r from-purple-600 to-purple-700 p-8 text-white">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                For Organizations
              </span>
              <h3 className="mb-2 text-2xl font-bold">Corporate Group Program</h3>
              <p className="mb-4 text-purple-100">
                Enroll 5+ women from your organization and get exclusive group rates at{" "}
                <strong className="text-white">₱200 per class</strong> — that&apos;s 42% off!
              </p>
              <ul className="space-y-2 text-sm text-purple-100">
                <li className="flex items-center gap-2">
                  <SolidCheck className="h-4 w-4 text-yellow-300" />
                  Companies, schools, government offices
                </li>
                <li className="flex items-center gap-2">
                  <SolidCheck className="h-4 w-4 text-yellow-300" />
                  Employee wellness programs
                </li>
              </ul>
            </div>
            {/* The source markup says md:text-right, but that class is absent from its
                compiled CSS, so the live site centres this column. */}
            <div className="space-y-3 text-center">
              <a
                href={routes.corporate}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-purple-700 shadow-lg transition-all hover:bg-purple-50"
              >
                Learn More
                <Icon name="arrowRight" className="h-5 w-5" />
              </a>
              <div>
                <a
                  href={asset("/fitbreak-corporate-flyer.pdf")}
                  download
                  className="inline-flex items-center gap-1 text-sm text-white/80 transition-colors hover:text-white"
                >
                  <Icon name="download" className="h-4 w-4" />
                  Download Flyer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
