import Image from "next/image";

import { wrap } from "./editorial";
import { FacebookIcon, InstagramIcon } from "./icons";
import { asset, classTimes, contact, routes } from "./links";

const footerLink = "text-paper/70 transition-colors hover:text-white";

const quickLinks = [
  { label: "Class Schedule", href: routes.schedule },
  { label: "Pricing", href: routes.pricing },
  { label: "Corporate Program", href: routes.corporate },
  { label: "Club Rules", href: routes.clubRules },
  { label: "About Us", href: routes.ourStory },
];

/** Solid ink footer with the studio motto set large (ADR 0009). */
export function SiteFooter() {
  return (
    <footer className="fb-grain bg-ink pt-20 pb-10 text-paper lg:pt-28">
      <div className={`${wrap} relative z-10`}>
        <p className="fb-display max-w-[16ch] text-[clamp(3rem,8vw,7.5rem)]">
          Sometimes stopping is what makes you <span className="text-crimson">go.</span>
        </p>

        <div className="mt-20 grid gap-12 border-t border-paper/15 pt-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Image
              src={asset("/images/fitbreak-logo-white.png")}
              alt="FitBreak"
              width={1452}
              height={1036}
              className="mb-5 h-14 w-auto"
            />
            <p className="max-w-xs text-paper/70">
              Women-only bootcamp fitness studio in Calapan City.
            </p>
            <div className="mt-6 flex gap-2">
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center border border-paper/20 transition-colors hover:border-paper hover:bg-paper hover:text-ink"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center border border-paper/20 transition-colors hover:border-paper hover:bg-paper hover:text-ink"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="fb-label mb-5 text-paper/60">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={footerLink}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-5">
            <h3 className="fb-label mb-5 text-paper/60">Visit Us</h3>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-4 text-paper/70">
                <p>
                  2nd Floor Roxas Drive
                  <br />
                  Brgy Ilaya, Calapan City
                  <br />
                  Oriental Mindoro, Philippines
                </p>
                <p>
                  <a href={`mailto:${contact.email}`} className={footerLink}>
                    {contact.email}
                  </a>
                  <br />
                  <a href={contact.phoneHref} className={`${footerLink} fb-num`}>
                    {contact.phoneDisplay}
                  </a>
                </p>
              </div>
              <div className="text-paper/70">
                <p className="mb-1 font-semibold text-paper">Class Hours (Mon-Sat)</p>
                <ul className="fb-num">
                  {classTimes.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="mt-1 text-paper/60">Closed every Sunday</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-paper/15 pt-8 text-sm text-paper/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} FitBreak. All rights reserved.</p>
          <div className="flex gap-6">
            <a href={routes.privacy} className={footerLink}>
              Privacy Policy
            </a>
            <a href={routes.terms} className={footerLink}>
              Terms of Service
            </a>
          </div>
          <p className="text-xs">
            Powered by{" "}
            <a
              href="https://fusionict.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${footerLink} underline underline-offset-2`}
            >
              FusionICT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
