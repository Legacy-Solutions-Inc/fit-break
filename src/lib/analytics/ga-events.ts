import { contact } from "@/components/sites/fitbreak/links";

// Booking Enquiry tracking (CONTEXT.md, ADR 0010). Pure: a clicked link plus
// the `data-placement` / `data-pack` read from its ancestors → the GA4 event to
// send, or null. The delegated click listener does the DOM reading.

/** Where a Booking Enquiry happened. Unmarked links report `other`. */
export type Placement =
  | "header"
  | "hero"
  | "pricing-pack"
  | "drop-in"
  | "schedule"
  | "contact"
  | "coach"
  | "corporate"
  | "footer"
  | "assistant"
  | "other";

export type EnquiryMethod = "messenger" | "phone" | "email";

/** The one key event: a visitor leaving to message, call or email the studio. */
export interface BookingEnquiryEvent {
  event: "booking_enquiry";
  method: EnquiryMethod;
  placement: string;
  pack?: string;
}

/** Ordinary (non-key) event: the corporate flyer PDF was downloaded. */
export interface FlyerDownloadEvent {
  event: "flyer_download";
  placement: string;
}

export type LinkEvent = BookingEnquiryEvent | FlyerDownloadEvent;

export interface ClickedLink {
  /** The link's href (absolute or as written). */
  href: string;
  /** `data-placement` of the nearest marked ancestor. */
  placement?: string | null;
  /** `data-pack` of the nearest marked ancestor (pricing packs). */
  pack?: string | null;
}

const MESSENGER_PREFIX = "https://m.me/";
const FLYER_FILE = "/fitbreak-corporate-flyer.pdf";

function enquiryMethod(href: string): EnquiryMethod | null {
  if (href.startsWith(MESSENGER_PREFIX)) return "messenger";
  const lower = href.toLowerCase();
  if (lower.startsWith("tel:")) return "phone";
  if (lower.startsWith("mailto:")) {
    const address = decodeURIComponent(lower.slice("mailto:".length).split("?")[0] ?? "");
    return address === contact.email.toLowerCase() ? "email" : null;
  }
  return null;
}

function isFlyer(href: string): boolean {
  try {
    return new URL(href, "https://fitbreak.invalid").pathname.endsWith(FLYER_FILE);
  } catch {
    return false;
  }
}

/** Map a clicked link to the GA4 event it should record, or null for any other link. */
export function linkEvent({ href, placement, pack }: ClickedLink): LinkEvent | null {
  const where = placement || "other";
  const method = enquiryMethod(href);
  if (method) {
    return { event: "booking_enquiry", method, placement: where, ...(pack ? { pack } : {}) };
  }
  if (isFlyer(href)) return { event: "flyer_download", placement: where };
  return null;
}
