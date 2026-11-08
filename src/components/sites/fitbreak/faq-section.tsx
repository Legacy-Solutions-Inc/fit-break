import type { Faq } from "@/lib/seo/structured-data";
import { cn } from "@/lib/utils";

import { wrap } from "./editorial";

/**
 * Editorial FAQ: a sticky heading beside a numbered list of open/close answers.
 * Pass the same list to `buildFaqPage` so the structured data equals the page.
 */
export function FaqSection({
  faqs,
  intro,
  className,
}: {
  faqs: readonly Faq[];
  /** Optional paragraph under the heading. */
  intro?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-20 lg:py-32", className)}>
      <div className={cn(wrap, "grid gap-12 lg:grid-cols-12 lg:gap-10")}>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="fb-label mb-4 text-mute">Questions</p>
            <h2 className="fb-display text-[clamp(2.2rem,4.65vw,3.9rem)]">
              Frequently Asked Questions
            </h2>
            {intro && <p className="mt-8 max-w-md text-lg leading-relaxed text-mute">{intro}</p>}
          </div>
        </div>
        <div className="border-t-2 border-ink lg:col-span-7 lg:col-start-6">
          {faqs.map((f, i) => (
            <details key={f.q} data-reveal className="group border-b border-ink/15">
              <summary className="flex cursor-pointer list-none items-baseline gap-5 py-6 transition-colors hover:bg-bone/60 [&::-webkit-details-marker]:hidden">
                <span className="fb-num fb-label w-6 flex-none text-mute">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-lg font-semibold sm:text-xl">{f.q}</span>
                <span
                  aria-hidden="true"
                  className="fb-display flex-none pr-1 text-3xl leading-none transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-7 pl-11 text-mute">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
