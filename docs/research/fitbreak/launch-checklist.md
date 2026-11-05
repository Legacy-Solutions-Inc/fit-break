# FitBreak launch checklist (owner's work outside the code)

From `docs/specs/2026-11-05-seo-geo-analytics.md` and ADR 0010. Do these in order around the
day the new site replaces fitbreak.ph.

## Before launch

- [ ] **GA4 property** under the studio's Google account (Admin → Create property, time zone
      Asia/Manila, currency PHP). Add the agency's Google account as Administrator.
- [ ] Create a **web data stream** for `https://fitbreak.ph` and copy the measurement ID
      (`G-…`).
- [ ] **Production settings** (the hosting provider's environment variables):
  - `NEXT_PUBLIC_SITE_URL=https://fitbreak.ph` (canonical links, sitemap, structured data and
    share images all use it; today it is `http://localhost:3000`).
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-…` (analytics stays off until this is set).
- [ ] **Studio approvals** from the fact sheet: the homepage definition sentence and FAQ (built
      but switched off until approved) and the privacy-policy paragraph about Google Analytics.
- [ ] **Search Console:** confirm `fitbreak.ph` is a **Domain** property verified by DNS (TXT
      record). If it's only a URL-prefix property verified through the old site's HTML file or
      tag, add the DNS domain property now; the old verification disappears with the old site.

## Launch day

- [ ] Point fitbreak.ph at the new site.
- [ ] Search Console → Sitemaps → submit `https://fitbreak.ph/sitemap.xml`.
- [ ] Search Console → URL inspection → request indexing for `/`, `/pricing`, `/schedule`.
- [ ] GA4 → Admin → Events → mark **`booking_enquiry`** as a key event (it appears after the
      first real click on a Messenger, phone or email link).
- [ ] GA4 → Admin → Product links → **link Search Console**.
- [ ] Spot-check:
  - `https://fitbreak.ph/llms.txt`
  - `https://fitbreak.ph/robots.txt`
  - a page in Google's Rich Results Test
  - a shared link's preview in Messenger

## First week

- [ ] **Google Business Profile** (business.google.com):
  - Claim the listing, or create it if it doesn't exist.
  - Category **Fitness center** (add **Gym** as a secondary).
  - Name **FitBreak**. Address **2nd Floor Roxas Drive, Brgy Ilaya, Calapan City, Oriental
    Mindoro 5200**. Phone **0965 944 1194**. These must match the site exactly.
  - Hours: Monday–Saturday class times; Sunday closed.
  - Website `https://fitbreak.ph`, plus the Messenger link as the booking / contact link.
  - Real photos of the studio and classes.
  - Then send the profile URL to the developer so it's added to the site's structured data
    (`sameAs`).
- [ ] **Same details everywhere.** Update the Facebook page (About), Instagram bio, and the Waze
      / Google Maps pin so the name, address and phone match the site character for character.
- [ ] **Reviews.** Ask current members for Google reviews (a short link from the Business
      Profile). Reply to each one.

## After a month

- [ ] GA4: which pages and placements lead to `booking_enquiry` (Explore → Free form, dimension
      "placement").
- [ ] Search Console: queries and pages getting impressions; fix any coverage errors.
- [ ] Re-run the GEO audit (`geo-audit.md`): ask ChatGPT, Perplexity, Gemini and Google AI
      Overviews the questions in its query table and note whether fitbreak.ph is cited.
