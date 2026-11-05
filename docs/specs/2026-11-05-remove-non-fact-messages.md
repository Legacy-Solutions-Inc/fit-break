# Spec: remove non-fact messages from the Information Site

Date: 2026-11-05 · Status: implemented (2026-11-05) · Related: [editorial redesign](2026-11-05-editorial-redesign.md),
[CONTEXT.md](../../CONTEXT.md), the studio fact sheet (`docs/research/fitbreak/fact-sheet.html`)

## Problem Statement

The owner checked where the FitBreak Information Site's content comes from. Most of it was copied from
fitbreak.ph and is a studio fact. A visitor, though, still meets messages that are not facts:

- **Fake confirmation.** The newsletter box says "Thanks for subscribing." but saves nothing. The
  subscriber is lost.
- **Invented contact.** The FitBreak Assistant's error reply tells visitors to write to `support@fitbreak.ph`,
  an address the studio never published.
- **Features that don't exist.** The Assistant offers "live availability" and booking on the schedule page.
  It also says credits are "added" after payment, although no visitor has an account while the Member Area
  is parked.
- **Contested claims.**
  - "4 classes a day" on the homepage and "4 sessions daily" in the schedule page's search description
    disagree with the five class times listed everywhere.
  - The structured data given to search engines says the studio accepts "Cash", while every page says
    GCash or bank transfer only. It also lists two class times instead of five.
- **Wrong booking claim.** Search descriptions say classes are "booked online only" or "Book online", while
  every booking is now a Booking Enquiry by Messenger or phone.
- **Invented labels.** Section labels added in the editorial redesign were never written by the studio:
  - "Why we exist"
  - "The studio, in motion"
  - "Six formats, every day"
  - "Packs & prices"
  - "The FitBreak letter"
  - "Journal"
  - "Timetable"
  - "Side by side"
  - "Click to play — sound on"

  "Six formats, every day" is itself a contested claim; see fact-sheet question 1.2.

Each of these can mislead a visitor, and some lose the studio a lead.

## Solution

Every message on the public Information Site is either a **studio fact**, an honest description of how the
site works, or plain navigation or calls to action (for example "Message Us to Book" or "Read Our Full
Story").

- **A studio fact** is something published on fitbreak.ph without contradiction, or confirmed by the studio
  on the fact sheet.
- **Removed:** anything else. If a message is contested, the contested part goes until the studio answers.
- **Changed:** where removing a message would leave a broken promise, the message is reworded to say only
  what is true. For example, the Assistant points to the published email and phone number.

The newsletter section is hidden until the studio says where sign-ups should go (fact-sheet question 1.5).
It can be switched back on in one place, the same way the Member Area is parked.

## User Stories

1. As a visitor, I want no "Thanks for subscribing" message unless my email is actually kept, so that I'm not
   misled into thinking I'll hear from the studio.
2. As a visitor, I want no newsletter box at all while sign-ups go nowhere, so that I don't waste my time.
3. As the owner, I want to switch the newsletter back on in one place once the studio chooses where
   sign-ups go, so that bringing it back is a one-line change.
4. As a visitor, I want the Assistant's error message to give me the studio's real email and phone, so that
   I can actually reach them.
5. As a visitor, I want the Assistant never to mention an address the studio doesn't use, so that my
   message isn't lost.
6. As a visitor, I want the Assistant not to promise "live availability" or online booking while the site
   only shows a timetable, so that I know to message the studio to book.
7. As a visitor, I want the Assistant's answer about paying to describe the Booking Enquiry (pay, send the
   receipt on Messenger, the studio confirms), so that I'm not told about account credits I can't have.
8. As a visitor asking "how do credits work", I still want to learn that each class in a pack counts once and
   that unused classes expire with the pack's validity, so that the studio's policy is still explained.
9. As a visitor reading the homepage, I want only the stats the studio has stated consistently (60 minutes
   per class, 6 days a week, 8–12 women per class), so that I'm not told "4 classes a day" when five
   times are listed.
10. As a visitor finding FitBreak on Google, I want the search description to say how booking really works,
    so that I don't look for an online booking page that doesn't exist.
11. As a visitor finding the schedule page on Google, I want its description not to claim "4 sessions daily",
    so that it agrees with the five times on the page.
12. As a visitor, I want search engines told the same payment methods as the site (GCash or bank transfer, no
    cash), so that I don't turn up with cash.
13. As a visitor, I want search engines given all five class times, so that the hours shown in search results
    match the studio's timetable.
14. As a visitor, I want section labels to describe the section plainly rather than make claims the studio
    hasn't made (for example "Six formats, every day"), so that every statement I read is the studio's.
15. As the owner, I want the invented section labels removed, so that the site speaks only in the studio's
    words.
16. As a visitor on the homepage video, I want the hint to say only what the studio's site said ("Click to
    play"), so that small invented promises don't creep in.
17. As a visitor using a screen reader, I want headings and landmarks to stay intact when a label is removed,
    so that the page is still easy to navigate.
18. As the owner, I want a test that fails if any of these messages comes back, so that a later change can't
    quietly reintroduce them.
19. As the owner, I want a fact the studio later confirms (for example 5 classes a day) to be easy to add
    back as plain content, so that removing a message now doesn't mean losing it for good.
20. As the studio, I want the facts already published consistently (prices, times, address, phone, payment
    account, policies) left untouched, so that nothing true disappears.

## Implementation Decisions

- **Definition used throughout: Studio Fact.** A statement published on fitbreak.ph without contradiction
  (checked against the source snapshots in the research folder) or confirmed by the studio on the fact sheet.
  Visible text must be a Studio Fact, an honest description of the site's own behaviour, or plain navigation
  or a call to action.
- **Newsletter switch.** Add a newsletter switch to the app config beside `memberAreaEnabled`. It is off by
  default while no destination exists.
  - When off, the newsletter section renders nothing on the homepage and the blog index.
  - The subscribe server action refuses submissions (so a direct POST cannot produce a false success), and
    the sitemap and page layout are unaffected.
  - The newsletter form, action and service stay in the codebase for re-enabling.
- **Assistant (FitBreak Assistant) replies.** The reply module stays pure and deterministic.
  - Error reply: points to the published contacts (calapan1@fitbreak.ph, 0965 944 1194) instead of
    `support@fitbreak.ph`. This is the widget's connection-failure message.
  - Schedule reply: while the Member Area is parked, says to see the weekly timetable on the schedule page
    and to message or call to book. No "live availability".
  - Credits reply while the Member Area is parked:
    - Keeps the studio's policy: one class per credit, and credits expire with the pack's validity.
    - Keeps the payment details (GCash or the published BPI account).
    - Ends with the Booking Enquiry step (send the receipt on Messenger, the studio confirms).
    - Drops "credits are added after your payment is verified" (an account feature).
  - With the Member Area on, the existing member wording stays.
  - The welcome message stays as on the live site.
  - "Every program is offered at every time slot" stays for now. It matches the live booking system and the
    schedule page. It is an open studio question (fact sheet 1.2), not a contradiction a visitor can see.
- **Homepage stats line.** Remove the "4 classes a day" stat. Keep 60 minutes per class, 6 days a week, and
  8–12 women per class.
- **Search metadata.**
  - Homepage description, its social-card description and the site-wide default description: replace "All
    classes booked online only" / "Book online" / "booked online" with the Booking Enquiry (book by
    Messenger or phone). Keep the other phrases.
  - Schedule page description: drop "4 sessions daily".
- **Structured data (homepage SportsActivityLocation).**
  - `paymentAccepted` becomes GCash and bank transfer, with no cash.
  - `openingHoursSpecification` lists the five published Monday–Saturday class times instead of two.
- **Invented section labels.** Remove these labels and leave the heading that follows them as the section
  opening:
  - "Why we exist"
  - "The studio, in motion"
  - "Six formats, every day"
  - "Packs & prices"
  - "The FitBreak letter"
  - "Journal"
  - "Timetable"
  - "Side by side"

  The video hint reverts to the live site's "Click to play". Labels whose words come from the live site stay,
  for example:
  - "For Organizations"
  - "The Woman Behind FitBreak"
  - "New here?"
  - "Now open"
  - "Quick mobile payment"
  - "Direct bank deposit"
  - "per class, per person"

- **No other copy changes.** Facts on the fact sheet still awaiting answers (for example "Now open", the map
  pin, photos) stay as they are until the studio replies. This spec removes contradictions and inventions,
  not unconfirmed-but-consistent studio facts.
- **Parked pages are out of reach.** How It Works and the Member Area are not reachable while the Member Area
  is parked. Their wording ("booked online only", accounts, QR check-in) is left for when the Member Area is
  revisited.

## Testing Decisions

- **What a good test is.** It checks what a visitor can see or receive: page text, page metadata and the
  Assistant's replies. It never checks class names or component internals.
- **Seam 1: one new Playwright spec over the rendered public pages** (the same page list as the a11y gate).
  It asserts:
  - no newsletter email field on the homepage or blog index, and a direct form submission to the subscribe
    action does not report success;
  - none of the removed labels or contested phrases appear in visible text ("4 classes a day", "Six
    formats, every day", the invented labels, "sound on");
  - the homepage and schedule page `<meta name="description">` contain no "online" booking claim and no "4
    sessions";
  - the homepage structured data has no "Cash" in `paymentAccepted` and five opening-hours entries;
  - in the open Assistant chat, a failed reply (network blocked with Playwright routing) shows the published
    email and phone and never `support@fitbreak.ph`, and a schedule question's reply has no "live
    availability".

  Prior art: `e2e/motion.spec.ts` (visitor-level checks, `context.route` to stub network), `e2e/a11y.spec.ts`
  (shared public page list), `e2e/auth-smoke.spec.ts` (text and link checks).

- **Seam 2: the existing unit tests for the Assistant's reply function.** Update them so the parked schedule
  and credits replies contain no account or live-availability wording and still state the credit and expiry
  policy. Prior art: the existing assistant unit test file.
- Lint, type-check, unit tests, build and the full e2e suite (including the a11y gate) must stay green.

## Out of Scope

- Choosing where newsletter sign-ups go, and building that integration (needs fact-sheet answer 1.5).
- Resolving the open studio questions: classes per day, which class runs when, the GCash number, the map pin,
  photos, "Now open". Those changes come from the studio's fact-sheet answers.
- Rewriting long-form copy (Our Story, FitBreakers, Corporate, blog posts, legal pages), which is copied
  verbatim from the studio.
- The Member Area, How It Works, and any wording only shown when the Member Area is on.
- Replacing the Assistant with an LLM or Dialogflow backend.

## Further Notes

- When the studio returns the fact sheet, confirmed answers become a follow-up change. For example, if 5
  classes a day is confirmed, the stat can return as "5 classes a day", and the newsletter switch can be
  turned on once a destination exists.
- The Studio Fact definition above may be worth adding to `CONTEXT.md` if it keeps coming up.
