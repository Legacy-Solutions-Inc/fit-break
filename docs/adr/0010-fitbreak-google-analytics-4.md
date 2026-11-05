# 10. FitBreak uses Google Analytics 4, consent-moded, instead of PostHog

Date: 2026-11-05

## Status

Accepted. Supersedes [0007](0007-analytics-posthog.md) for the FitBreak Information Site.
The PostHog wiring stays in the template, dormant (no key set).

## Context

The template ships PostHog (ADR 0007): inert until a key is set, and consent-gated. The
owner wants Google Analytics for FitBreak. The site replaces fitbreak.ph, and Google Search
Console is already the owner's search tool. Visitors are in the Philippines, under the Data
Privacy Act (RA 10173). Every booking leaves the site as a Booking Enquiry (Messenger, phone
or email), so the success that matters is that click, not a page view. The site runs a
strict per-request nonce CSP.

## Decision

- **GA4 only.** GA4 links natively to Search Console. PostHog is not configured for FitBreak,
  and no Google Tag Manager is used: it can inject arbitrary scripts, which conflicts with the
  strict CSP.
- **Inert until configured.** A publishable measurement ID in an environment variable turns it
  on. With none set there is no script and no network traffic, matching the template's other
  integrations.
- **Consent Mode.** A small consent bar gives equal weight to Accept and Decline. Before a
  choice, and after Decline, GA runs with storage denied (no cookies, anonymous pings only).
  Accept grants analytics storage. The choice is remembered. The privacy policy names Google
  Analytics; that paragraph is flagged for the studio to approve.
- **One key event: `booking_enquiry`**, with `method` (messenger | phone | email) and
  `placement` (where on the site the click happened, plus the pack name on pricing). Flyer
  downloads and opening the assistant are ordinary events. Everything else uses GA4's enhanced
  measurement.
- **Accounts belong to the studio.** The GA4 property sits under the studio's Google account,
  with the agency as admin.

## Consequences

- The CSP gains Google's tag and collection hosts for GA4 only. The loader script carries the
  request nonce, so `strict-dynamic` covers what it loads.
- Reports use the domain term "Booking Enquiry", the same as the spec and the code.
- Visitors who decline still produce modelled, cookieless data, so totals are estimates.
- Moving to another tool later means re-instrumenting one event and swapping one loader.
- Alternatives considered:
  - GA4 and PostHog together: two tools, two consent paths, more script weight.
  - GA4 through Tag Manager: flexible, but weakens the CSP.
  - A banner that blocks GA entirely until consent: very little data on phones.
  - No banner: weak footing under RA 10173.
