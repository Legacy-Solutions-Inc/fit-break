import { RevealScope } from "@/components/sites/fitbreak/motion/reveal-scope";

/**
 * Re-mounts on every navigation (unlike the layout), so each page's content
 * fades and lifts in (`fb-page-in`, pure CSS — runs even before JS) beneath the
 * persistent header and footer, then reveals its blocks as they scroll in.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <RevealScope className="fb-page-in">{children}</RevealScope>;
}
