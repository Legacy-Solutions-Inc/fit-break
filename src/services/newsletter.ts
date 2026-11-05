// ─────────────────────────────────────────────────────────────────────────────
// Newsletter Service Seam. The live fitbreak.ph site writes subscribers to its
// Firestore `newsletter_subscribers` collection; this clone keeps them in memory
// (mock-first, docs/adr/0003) until a real store is wired. Swap the body of
// `subscribe` for a Drizzle/Supabase insert — callers don't change.
// ─────────────────────────────────────────────────────────────────────────────

export interface NewsletterSubscriber {
  email: string;
  source: string;
  subscribedAt: string;
}

const subscribers = new Map<string, NewsletterSubscriber>();

/** Adds (or re-confirms) a subscriber. Emails are stored lower-cased. */
export async function subscribe(email: string, source = "homepage"): Promise<NewsletterSubscriber> {
  const key = email.trim().toLowerCase();
  const existing = subscribers.get(key);
  if (existing) return existing;
  const record = { email: key, source, subscribedAt: new Date().toISOString() };
  subscribers.set(key, record);
  return record;
}

export async function listSubscribers(): Promise<NewsletterSubscriber[]> {
  return [...subscribers.values()];
}
