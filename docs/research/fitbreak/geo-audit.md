# FitBreak — GEO / AEO readiness audit

Date: 2026-11-05 · Scope: the new Information Site (12 public pages + 25 posts) as served by
the dev server · Constraint: visible copy must stay Studio Facts in the studio's own words
(`docs/specs/2026-11-05-remove-non-fact-messages.md`) · Context: `competitors.md`

## Score (qualitative, 0–10)

| Signal                                              | Live fitbreak.ph | New site today | After this plan |
| --------------------------------------------------- | ---------------- | -------------- | --------------- |
| Content visible without JavaScript                  | 1                | 10             | 10              |
| Factual density (prices, times, address, rules)     | 3                | 9              | 9               |
| Clear one-line definition of the business           | 2                | 5              | 9               |
| Q&A format matching real questions                  | 2                | 5              | 9               |
| Structured data matching visible content            | 0                | 4              | 9               |
| Authority / author signals (who wrote, who coaches) | 3                | 5              | 7               |
| Freshness signals (dates on prices, posts)          | 2                | 4              | 7               |
| Internal consistency (one answer per question)      | 4                | 8              | 9               |
| **Overall GEO readiness**                           | **~2**           | **~6**         | **~8.5**        |

The live site gave a non-JavaScript fetcher only its `<title>`. Launching the server-rendered
site is the biggest single gain.

## What is already strong

- Every page is server-rendered with one `<h1>` and a clear heading tree (verified by curl:
  676 words on `/`, 725 on `/pricing`, 520 on `/schedule`).
- Hard facts are stated plainly and repeated consistently: ₱350 drop-in, packs at ₱300 /
  ₱275 / ₱250 per class, five class times, the address, the phone, GCash/BPI payment.
- `/pricing` has six real Q&As (credits, annual fee, cancelling, confirmation, advance
  booking, rollover), and the answers are in the HTML even when collapsed.
- The homepage structured data (SportsActivityLocation) is now accurate: payment methods
  and five class times.

## Gaps and proposed changes

1. **No single definitional sentence.** AI answers lift a 25–50-word "X is…" statement. The
   hero sentence ("A women-only fitness club offering one-hour bootcamp workouts…") has no
   place in it. Proposal: one sentence built only from Studio Facts, e.g. "FitBreak is a
   women-only bootcamp fitness studio on the 2nd floor of Roxas Drive, Brgy Ilaya, Calapan
   City, with coach-led one-hour classes Monday to Saturday." _New wording, so it needs the
   owner's OK._
2. **The questions people ask aren't answered where they look.** Questions from the
   competitor brief ("Is there a women-only gym in Calapan?", "How much…?", "Can I pay with
   GCash?", "What time are classes?", "How do I book?") are answered across pages, not as
   Q&A. Proposal: a short visible FAQ on the homepage, with answers composed only of facts
   already on the site, plus matching FAQPage structured data. _New wording._
3. **Structured data covers only the homepage.** Proposal, each matching visible content
   only:
   - FAQPage on `/pricing` (and on the homepage if item 2 is accepted)
   - Offer / PriceSpecification for the drop-in and three packs
   - Person for Coach Iren, with her nine certifications as credentials
   - BlogPosting for each post (headline, date, image, author)
   - BreadcrumbList on inner pages
   - Organization `sameAs` links for Facebook and Instagram (already on the homepage) reused
     site-wide
4. **Blog authorship is generic** ("FitBreak Team"). Named authorship (for example Coach
   Iren, if she wrote or approved the posts) is a strong E-E-A-T signal. _Fact needed from
   the studio._
5. **Freshness.** Show a "prices as of" date on `/pricing` and set `dateModified` in the
   structured data. Posts already carry dates.
6. **One contradiction left on `/pricing`.** Starter Pack shows "Valid 30 days" in the pack
   column and "15 days" in the comparison table (the live site has the same conflict). AI
   answers may quote either. The owner chose to leave it for now; it remains a GEO risk
   until the studio answers.
7. **AI crawler access.** `robots.txt` allows every crawler, including GPTBot, ClaudeBot,
   PerplexityBot and Google-Extended. That's right for citation. Whether to also allow
   training crawlers is the owner's call.
8. **`llms.txt`.** A plain-text summary at `/llms.txt` (name, what it is, address, hours,
   prices, booking, key URLs), generated from the same data as the pages. Low cost, and some
   engines read it.
9. **Social previews.** 8 of 12 pages have no Open Graph image or description, and the
   site-wide share image is generic. AI and social surfaces reuse these.

## AI query coverage (after the plan)

| Query                                      | Answered by                         | Today                   |
| ------------------------------------------ | ----------------------------------- | ----------------------- |
| Is there a women-only gym in Calapan?      | Homepage definition + FAQ           | Partly (hero, no place) |
| How much is FitBreak / a class in Calapan? | `/pricing` + Offer data             | Yes (text only)         |
| What time are FitBreak classes?            | `/schedule` + opening hours data    | Yes                     |
| How do I book a class at FitBreak?         | Homepage FAQ, `/pricing` How to Pay | Partly                  |
| Can I pay with GCash?                      | `/pricing` FAQ + structured data    | Yes                     |
| Who is the coach at FitBreak?              | `/calapan1/about` + Person data     | Yes (text only)         |
| Where is FitBreak?                         | Footer, Visit Us, structured data   | Yes                     |
| Do they have corporate rates?              | `/corporate` + Offer data           | Yes (text only)         |

## Self-check (CORE-EEAT GEO items)

- **Pass:** content renders without JavaScript; facts are specific; heading structure is
  clean; Q&A exists on `/pricing`; contact details are consistent.
- **Warn:**
  - No standalone definition.
  - FAQ only on one page.
  - Structured data on one page.
  - Generic blog author.
  - One Starter-validity contradiction.
- **Fail:** none blocking, but the item 3 gaps (FAQPage, Offer, Person) are where competitors
  could never catch up and FitBreak currently doesn't score.

## Handoff

Items 1, 2 and 4 need the owner's approval or a studio fact. Items 3, 5, 7, 8 and 9 are
technical and can be built from existing Studio Facts. Next skill: `seo-content-writer` for
titles, descriptions and the definition and FAQ drafts. Then `schema-markup-generator` and
`technical-seo-checker` before launch.
