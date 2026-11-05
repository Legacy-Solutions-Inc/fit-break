import type { SVGProps } from "react";

// Extra Heroicons v1 paths used by the pricing and how-it-works pages, copied
// verbatim from the source markup (the shared set lives in ../icons.tsx).

type IconProps = SVGProps<SVGSVGElement>;

/** Solid x-mark (20×20) — "not included" rows. */
export function SolidX(props: IconProps) {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Outline device-mobile — GCash. */
export function MobileIcon(props: IconProps) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}
