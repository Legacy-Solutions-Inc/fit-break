import type { NewsletterSource } from "@/app/(fitbreak)/actions";

import { NewsletterForm } from "./newsletter-form";

export function Newsletter({ source = "homepage" }: { source?: NewsletterSource }) {
  return (
    <section className="bg-gray-900 py-16 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold">Get Fitness Tips in Your Inbox</h2>
        <p className="mb-8 text-gray-400">
          Subscribe to our newsletter for weekly workout tips, nutrition advice, and exclusive
          offers.
        </p>
        <NewsletterForm source={source} />
      </div>
    </section>
  );
}
