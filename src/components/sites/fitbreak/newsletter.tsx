import type { NewsletterSource } from "@/app/(fitbreak)/actions";

import { wrap } from "./editorial";
import { NewsletterForm } from "./newsletter-form";

export function Newsletter({ source = "homepage" }: { source?: NewsletterSource }) {
  return (
    <section className="border-t border-rule bg-paper py-20 lg:py-28">
      <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:items-end`}>
        <div className="lg:col-span-6">
          <p className="fb-label mb-4 text-mute">The FitBreak letter</p>
          <h2 className="fb-display text-[clamp(2.5rem,5.5vw,4.5rem)]">
            Get Fitness Tips in Your Inbox
          </h2>
          <p className="mt-5 max-w-md text-lg text-mute">
            Subscribe to our newsletter for weekly workout tips, nutrition advice, and exclusive
            offers.
          </p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <NewsletterForm source={source} />
        </div>
      </div>
    </section>
  );
}
