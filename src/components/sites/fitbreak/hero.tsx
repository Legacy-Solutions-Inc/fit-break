import Image from "next/image";

import { asset, contact } from "./links";

const bullets: React.ReactNode[] = [
  "Coach-led bootcamp classes",
  "Fully air conditioned fitness studio",
  "Functional circuit training class format",
  <>
    Book via <strong>Messenger</strong> or call us
  </>,
  <>
    Pay via <strong>GCash</strong> or <strong>bank transfer</strong> only
  </>,
];

export function Hero() {
  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden py-12 lg:min-h-[700px] lg:py-20">
      <div className="absolute inset-0 z-0">
        <Image
          src={asset("/images/fitbreak12.webp")}
          alt="FitBreak Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_center]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/70 to-transparent lg:from-white/85 lg:via-white/50 lg:to-transparent" />
      </div>

      {/* Desktop promo banner — pinned to the far right, outside the text column. */}
      <div className="absolute top-24 right-[5%] z-20 hidden lg:block">
        <div className="fb-promo-banner rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 px-6 py-4 text-white shadow-2xl">
          <div className="text-center">
            <p className="mb-2 text-2xl font-bold">We are now open!</p>
            <a
              href={contact.messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="fb-promo-btn inline-block rounded-full bg-white px-4 py-2 font-bold text-brand-600 transition hover:bg-yellow-300"
            >
              Message Us to Book
            </a>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 w-full px-4 sm:px-6"
        style={{ paddingLeft: "max(1.5rem, 10vw)" }}
      >
        {/* Mobile promo banner */}
        <div className="mb-6 block lg:hidden">
          <div className="animate-pulse rounded-2xl border-2 border-brand-400 bg-linear-to-r from-brand-500 to-brand-600 px-5 py-4 text-center text-white shadow-xl">
            <p className="mb-2 text-xl font-bold">We are now open!</p>
            <a
              href={contact.messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="fb-promo-btn inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-600 transition hover:bg-yellow-300"
            >
              Message Us to Book
            </a>
          </div>
        </div>

        <div className="max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1.5 text-sm font-bold text-brand-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
            Women-Only • 2nd Floor Roxas Drive, Brgy Ilaya, Calapan City
          </span>
          <h1 className="mb-4 text-4xl leading-tight font-bold text-gray-900 lg:text-5xl lg:leading-none">
            FitBreak: For Every Moment You Choose Yourself
          </h1>
          <p className="mb-6 text-lg text-gray-600">
            A women-only fitness club offering one-hour bootcamp workouts that fit your busy life—so
            you can be strong, healthy, and happy.
          </p>

          <ul className="mb-8 space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent-500" />
                <p className="text-gray-700">{b}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={contact.messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-500 px-6 py-3 text-center font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl"
            >
              Book Your First Class
            </a>
            <a
              href="#programs"
              className="rounded-full border border-gray-200 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              See Schedule
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-500 italic">
            &quot;Sometimes stopping is what makes you go.&quot;
          </p>
        </div>
      </div>
    </section>
  );
}
