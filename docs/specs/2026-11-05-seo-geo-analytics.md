# Spec: SEO, GEO/AEO and Google Analytics 4 for the FitBreak Information Site

Date: 2026-11-05 · Status: ready-for-agent · Decided in a grilling session on 2026-11-05 ·
Related: [ADR 0010](../adr/0010-fitbreak-google-analytics-4.md) (GA4, supersedes 0007 for FitBreak),
[ADR 0009](../adr/0009-fitbreak-departs-visually-from-the-clone.md),
[non-fact messages spec](2026-11-05-remove-non-fact-messages.md), research in `docs/research/fitbreak/`
(`competitors.md`, `geo-audit.md`, `seo-drafts.md`, `fact-sheet.html`)

## Problem Statement

The FitBreak Information Site is about to replace fitbreak.ph. Today:

- **Search engines and AI answer engines have little to work with.** The live fitbreak.ph
  shows a non-JavaScript crawler only its title. The new site renders every page on the
  server, but:
  - only the homepage has structured data;
  - 8 of 12 pages have no share preview, and the default preview is plain text;
  - titles barely mention Calapan or prices;
  - nothing gives AI engines a single trustworthy summary.
- **The owner can't measure anything.** There is no analytics. The only success that matters,
  a visitor leaving to message or call the studio (a **Booking Enquiry**), is invisible.
- **The production address isn't set.** Canonical links and the sitemap would point at
  localhost.
- **Local competitors exist only on Facebook.** No Calapan gym publishes prices, times or
  answers on a crawlable page (`competitors.md`), and the "gyms in Calapan" directories are
  mostly Manila listings. That is an opening FitBreak hasn't yet taken.

## Solution

Launch the site on fitbreak.ph with search and AI visibility built from **Studio Facts** (see
the glossary), and measure Booking Enquiries with Google Analytics 4. Everything search engines
and AI answer engines read comes from the same studio data as the visible pages, so it can't
contradict them:

- keyword-led titles and descriptions;
- a full set of structured data;
- a generated `/llms.txt`;
- per-page share images showing one key fact.

GA4 stays off until a measurement ID is configured. It respects a consent bar using Google's
Consent Mode, and records one key event, `booking_enquiry`.

Work outside the code is listed as an owner's launch checklist: accounts under the studio's
name, Search Console, the Google Business Profile, and matching listing details everywhere.

## User Stories

### Search

1. As a woman in Calapan searching "women-only gym Calapan", I want FitBreak's homepage to come
   up with a title that says exactly that, so that I know I've found the right place.
2. As someone comparing prices, I want the pricing page's search result to show the drop-in
   price and the cheapest pack, so that I can judge cost before clicking.
3. As someone checking times, I want the schedule page's search result to list the class times
   and days, so that I can see whether a class fits my day.
4. As someone researching the coach, I want the coach page's result to name Coach Iren and her
   experience, so that I can trust who'll train me.
5. As an HR officer, I want the corporate page's result to show the ₱200 group rate and who
   qualifies, so that I can propose it at work.
6. As a searcher, I want every page to have one canonical address on fitbreak.ph, so that I
   always land on the real site.
7. As the owner, I want old fitbreak.ph links (the `.html` pages) to keep redirecting to the new
   pages, so that existing rankings and shared links carry over.
8. As the owner, I want the sitemap at fitbreak.ph to list every public page and blog post with
   real addresses, so that I can submit it in Search Console on launch day.
9. As the owner, I want the parked Member Area and login pages kept out of search, so that
   visitors never land on a dead end.

### AI answers (GEO/AEO)

10. As someone asking an AI "is there a women-only gym in Calapan?", I want the answer to cite
    FitBreak with its correct address and hours, so that I can go there.
11. As someone asking an AI "how much is FitBreak?", I want the answer to quote the real prices,
    so that I'm not misled.
12. As someone asking an AI "can I pay with GCash at FitBreak?", I want the answer the studio
    gives on its own site, so that I can prepare payment.
13. As someone asking an AI "who is the coach at FitBreak?", I want it to name Coach Iren and her
    certifications as listed by the studio, so that I can trust her.
14. As an AI answer engine, I want a plain-text `/llms.txt` with the studio's key facts and page
    links, so that I can summarise FitBreak accurately without parsing the whole site.
15. As the owner, I want answer crawlers and training crawlers both allowed, so that FitBreak
    becomes known to AI assistants now and in future models.
16. As the owner, I want structured data to say exactly what the pages say, so that search
    engines never penalise a mismatch and AI answers never contradict the site.
17. As the owner, I want prices, times and coach details in structured data to come from the
    same studio data as the pages, so that a price change updates both at once.

### Structured data

18. As a search engine, I want one FitBreak business record (name, logo, address, phone, hours,
    payment methods, social profiles) that every page refers to, so that I treat the site as one
    business.
19. As a search engine on the pricing page, I want the drop-in and three packs marked up as
    offers with ₱ prices, so that I can show accurate prices.
20. As a search engine on the pricing page, I want its six visible FAQs marked up as Q&A, so that
    answer engines can lift them.
21. As a search engine on the corporate page, I want the ₱200 group rate marked up as an offer,
    so that the rate is machine-readable.
22. As a search engine on the coach page, I want Coach Iren marked up as a person who works for
    FitBreak, with her nine certifications, so that her expertise is attributed correctly.
23. As a search engine on a blog post, I want the headline, date, image and author marked up,
    so that the post is understood as an article.
24. As a search engine on an inner page, I want breadcrumbs, so that I understand where the page
    sits in the site.

### Share previews

25. As someone who receives a FitBreak link in Messenger, I want a preview with the page's photo,
    title and one key fact (for example "Drop-in ₱350"), so that I know what it is before
    opening it.
26. As someone sharing a blog post, I want its own image and title in the preview, so that the
    preview matches the article.
27. As the owner, I want every public page to have a share preview, so that no shared link shows
    a blank card.

### Analytics and consent

28. As a visitor, I want a small consent bar with equal Accept and Decline choices, so that I
    decide whether I'm tracked.
29. As a visitor who declines or ignores the bar, I want no analytics cookies set, so that my
    choice is respected.
30. As a visitor, I want my choice remembered, so that I'm not asked on every page.
31. As a visitor, I want to change my choice later from the privacy policy, so that consent can
    be withdrawn as easily as given.
32. As a visitor reading the privacy policy, I want it to say the site uses Google Analytics, so
    that I know what data is collected.
33. As the owner, I want each Booking Enquiry click (Messenger, phone or email) recorded as a
    `booking_enquiry` key event with where it happened, so that I know which pages and buttons
    bring messages.
34. As the owner, I want to see which pack a pricing-page enquiry came from, so that I know which
    pack people ask about.
35. As the owner, I want flyer downloads and assistant openings recorded as ordinary events, so
    that I can see interest without inflating conversions.
36. As the owner, I want analytics to do nothing until a measurement ID is configured, so that
    local development and previews send no data.
37. As the owner, I want GA4 linked to Search Console, so that I see search queries next to
    behaviour.
38. As a visitor, I want the site's security protections to stay strict with analytics on, so
    that no arbitrary scripts can be injected.

### Wording approval and launch

39. As the studio, I want the proposed definition sentence and homepage FAQ shown to me on the
    fact sheet before they go live, so that the site speaks in my words.
40. As the owner, once the studio approves the FAQ, I want it to appear on the homepage with
    matching Q&A structured data, so that it helps AI answers immediately.
41. As the owner, I want a launch checklist for the work outside the code (GA4 property, Search
    Console, Business Profile, matching listings), so that nothing is forgotten on launch day.
42. As the studio, I want the GA4 property and Business Profile owned by my Google account, so
    that the data stays with the business.

## Implementation Decisions

- **Domain.** The site replaces fitbreak.ph. The production site URL setting must be
  `https://fitbreak.ph` (canonical links, sitemap, robots, structured data and share images
  all derive from it). There is no interim address. The existing `.html` redirects stay.
- **Titles and descriptions ship now,** as drafted in `seo-drafts.md`:
  - New title and description on: home, pricing, schedule, coach, club rules, corporate, blog.
  - Our Story, FitBreakers, privacy and terms keep their current description; their titles
    follow the draft table.
  - Every page also gets an Open Graph and Twitter title, description and image.
  - Descriptions never claim online booking (non-fact spec).
- **The definition sentence and homepage FAQ wait for the studio.** Add a "please approve this
  wording" section to the fact sheet containing the drafted definition and the 6 (+1 optional)
  Q&As. Build the homepage FAQ and its Q&A structured data behind a single switch, off by
  default. When approved, the switch turns on, and the FAQ content lives in one place used by
  both the visible list and the structured data. The cash answer follows fact-sheet question
  1.3.
- **Structured data module.** Pure builders in the existing SEO module, one per type, each
  taking studio data and the site URL and returning plain objects:
  - business record (SportsActivityLocation, with a stable `@id` that other records reference)
  - offers (drop-in, three packs, corporate rate)
  - FAQ page (the visible pricing FAQs; the homepage FAQ when switched on)
  - person (Coach Iren, `worksFor` the business, credentials)
  - blog posting
  - breadcrumbs

  Inputs come from the studio catalogue (programs, time slots, packages, annual fee, payment
  details), the coach data and the blog data. Pages render the builders' output, and no page
  hand-writes structured data.

- **One source for prices.** The shared pack-pricing component currently keeps its own copy of
  pack prices. It, the pricing page and the offers builder must all read the studio catalogue,
  so visible prices and structured prices can't drift.
- **`/llms.txt`** is a route that returns plain text built by a pure builder from the same studio
  data:
  - name and one-line description;
  - address, phone, email, Messenger;
  - days and class times;
  - drop-in, pack and corporate prices and the annual fee;
  - how to book (Booking Enquiry) and payment methods;
  - links to the key pages.

  The definition sentence is included only once approved.

- **robots.txt** keeps allowing all crawlers (answer and training) and keeps disallowing the
  parked areas. It also links the sitemap. No crawler-specific blocks.
- **Share images.** One generated image per public page and per blog post:
  - the page photo, the page title in the editorial display type, and at most one key fact
    from studio data;
  - home: Women-only · Calapan City;
  - pricing: Drop-in ₱350 · packs from ₱1,800;
  - schedule: Mon–Sat · 6:30 AM–8:30 PM;
  - corporate: ₱200 a class;
  - coach: the coach's name and role;
  - blog posts: their own image and title.

  The fact strings come from a pure builder so they're testable. The generic site-wide image
  is replaced.

- **GA4 integration** (ADR 0010):
  - **Off by default.** A publishable measurement ID in an environment variable switches it on,
    validated alongside the other public env vars. With no ID there is no script, no consent
    bar and no network traffic.
  - **Loading.** The loader carries the request nonce. The security-policy builder adds
    Google's tag and collection hosts only when the ID is set.
  - **No Tag Manager. PostHog stays dormant** for FitBreak.
- **Consent.**
  - Consent Mode defaults to denied for analytics and ad storage before the loader runs.
  - A small consent bar offers equal-weight Accept and Decline. The choice is stored on the
    visitor's device and applied on later visits. Accept updates analytics storage to granted;
    ad storage stays denied.
  - The privacy policy gains one paragraph naming Google Analytics and how to change the
    choice, plus a control that reopens the consent choice. That paragraph is listed on the
    fact sheet for the studio to approve; it goes live with GA because it's true once GA is on.
  - The consent bar uses the editorial system and stays out of the way of the assistant button.
- **Booking Enquiry tracking.**
  - **Event.** One delegated click listener records `booking_enquiry` for links to Messenger,
    `tel:` and `mailto:` studio addresses.
  - **Parameters.** `method` is messenger, phone or email. `placement` is read from a
    `data-placement` value on the link's nearest marked ancestor: header, hero, pricing-pack,
    drop-in, schedule, contact, coach, corporate, footer, assistant. The pack name is added on
    pricing packs.
  - **Mapping.** A pure function maps a link plus its placement to the event parameters.
  - **Ordinary events.** `flyer_download` and `assistant_open`.
  - **Key event.** `booking_enquiry` is marked as the key event in the GA4 property; that's an
    owner checklist item.
- **Owner's launch checklist** (a section of the launch docs, not code):
  1. Create the GA4 property under the studio's Google account, with the agency as admin.
     Mark `booking_enquiry` as a key event and link Search Console.
  2. Set the measurement ID and `https://fitbreak.ph` as the site URL in production settings.
  3. Confirm the Search Console domain property (DNS) and submit the sitemap on launch day.
  4. Claim or create the Google Business Profile:
     - category Fitness center;
     - name, address and phone exactly as on the site;
     - the five class times and photos;
     - the website link and the Messenger link.
  5. Make the name, address and phone identical on Facebook and Waze/Maps (today they differ).
  6. Ask members for Google reviews.

## Testing Decisions

- **What a good test is.** It checks outputs a visitor, crawler or analytics receiver gets:
  rendered tags, structured data values, text files, images, and the events pushed by the
  page. It never checks component internals or class names.
- **Seam 1: unit, extending the existing SEO and security-policy tests.**
  - **Structured data builders.**
    - The business record uses the catalogue's five time slots and lists no cash payment.
    - Offers carry exactly the catalogue prices.
    - FAQ output equals the visible FAQ list it was given.
    - Person credentials equal the coach's certification list.
    - Breadcrumbs build absolute fitbreak.ph URLs.
  - **`llms.txt` builder.** Contains the address, phone, every class time and every price, and
    contains no account or online-booking wording.
  - **Share-image fact builder.** One fact per page, taken from catalogue values.
  - **Security-policy builder.** No Google hosts without a measurement ID; the tag and
    collection hosts with one; everything else unchanged.
  - **Booking Enquiry mapping.** Messenger, `tel:` and `mailto:` links map to the right
    `method`, and the placement and pack name come through; other links map to nothing.
  - **Consent mapping.** Stored choice to Consent Mode signals: none → denied, accept →
    analytics granted with ads still denied, decline → denied.

  Prior art: the existing sitemap/robots tests, the security-policy tests, and the assistant
  reply tests.

- **Seam 2: one Playwright spec over the rendered public pages** (the shared public page list).
  - **Always runs:**
    - each page's title and description match the approved drafts;
    - every page has an Open Graph image whose URL responds with an image;
    - canonical links are absolute;
    - each page's structured data parses, and its prices and times equal the numbers visible on
      the page (pricing, schedule, corporate, coach);
    - `/llms.txt` and `robots.txt` respond with the expected facts and rules;
    - with no measurement ID, no Google script loads and no consent bar shows.
  - **GA-on checks, which run only when the test server has a test measurement ID** (Playwright
    can block network to Google):
    - the consent bar appears;
    - Decline keeps storage denied and sets no `_ga` cookie;
    - Accept grants analytics storage;
    - the choice persists across pages;
    - clicking a pricing-pack Messenger link pushes `booking_enquiry` with method messenger,
      placement pricing-pack and the pack name.

  These skip against the owner's plain dev server.

  Prior art: `e2e/facts.spec.ts` (head/meta and structured data checks), `e2e/motion.spec.ts`
  (network routing, sessionStorage), `e2e/a11y.spec.ts` (shared page list).

- **The a11y gate covers the consent bar** when it's shown: keyboard reachable, labelled, with
  contrast passing.
- Lint, type-check, unit tests, build and the full e2e suite stay green.

## Out of Scope

- Writing new blog content or new landing pages for keywords (`competitors.md` long-term
  plan).
- Turning on the homepage FAQ and definition before the studio approves them.
- Resolving open fact-sheet questions: classes per day, which class runs when, cash, GCash
  number, map pin, photos, "Now open", and the Starter Pack's 15 vs 30 days, which the owner
  chose to leave for now.
- PostHog, Google Tag Manager, Facebook Pixel and any advertising tags.
- The Member Area, How It Works and anything only shown when the Member Area is on.
- Doing the off-site checklist itself (accounts, Business Profile, listings), which is owner work.
- Backlink building and directory submissions.

## Further Notes

- GA4 dashboards and reports are configured in the GA4 property by the owner, not in the
  code.
- Google shows FAQ rich results only for government and health sites, so the FAQ markup's
  value is for AI Overviews and answer engines, not expandable search snippets.
- Once the Business Profile exists, add its URL to the business record's social profiles.
- The GEO readiness target is about 8.5/10 (`geo-audit.md`). Re-run the GEO audit and a
  technical SEO check after launch.
