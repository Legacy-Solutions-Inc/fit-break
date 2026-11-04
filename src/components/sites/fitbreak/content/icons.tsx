import type { SVGProps } from "react";

// Inline SVGs copied from the source content pages that `../icons` doesn't have.

type IconProps = SVGProps<SVGSVGElement>;

/** Heroicons v1 solid check-circle (20×20) — the content pages' list bullet. */
export function SolidCheckCircle(props: IconProps) {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Outline({ d, ...props }: IconProps & { d: string }) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Outline
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      {...props}
    />
  );
}

export function DocumentDownloadIcon(props: IconProps) {
  return (
    <Outline
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      {...props}
    />
  );
}

export function MessengerIcon(props: IconProps) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.544 3.7 7.257v3.5l3.258-1.79c.89.246 1.832.379 2.807.379h.235C17.523 20.59 22 16.445 22 11.243S17.523 2 12 2zm1.213 12.415l-2.788-2.976-5.443 2.976 5.983-6.348 2.857 2.976 5.374-2.976-5.983 6.348z" />
    </svg>
  );
}
