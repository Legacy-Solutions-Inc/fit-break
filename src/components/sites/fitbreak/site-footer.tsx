import Image from "next/image";

import { FacebookIcon, Icon, InstagramIcon } from "./icons";
import { asset, classTimes, contact, routes } from "./links";

const footerLink = "text-sm text-gray-400 transition-colors hover:text-brand-400";

const quickLinks = [
  { label: "Class Schedule", href: routes.schedule },
  { label: "Pricing", href: routes.pricing },
  { label: "Corporate Program", href: routes.corporate },
  { label: "Club Rules", href: routes.clubRules },
  { label: "About Us", href: routes.ourStory },
];

export function SiteFooter() {
  return (
    <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Image
              src={asset("/images/fitbreak-logo-white.png")}
              alt="FitBreak"
              width={1452}
              height={1036}
              className="mb-4 h-12 w-auto"
            />
            <p className="mb-4 text-sm text-gray-400 italic">
              &quot;Sometimes stopping is what makes you go.&quot;
            </p>
            <p className="mb-4 text-sm text-gray-500">
              Women-only bootcamp fitness studio in Calapan City.
            </p>
            <div className="flex gap-4">
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 transition-colors hover:bg-blue-600"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 transition-all hover:bg-linear-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={footerLink}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Visit Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Icon name="pin" className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-400" />
                <p className="text-gray-400">
                  2nd Floor Roxas Drive
                  <br />
                  Brgy Ilaya, Calapan City
                  <br />
                  Oriental Mindoro, Philippines
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="clock" className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-400" />
                <div className="text-gray-400">
                  <p className="mb-1 font-medium text-gray-300">Class Hours (Mon-Sat)</p>
                  {classTimes.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                  <p className="mt-1 text-gray-500">Closed every Sunday</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="mail" className="h-5 w-5 flex-shrink-0 text-brand-400" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-gray-400 transition-colors hover:text-brand-400"
                >
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="phone" className="h-5 w-5 flex-shrink-0 text-brand-400" />
                <a
                  href={contact.phoneHref}
                  className="text-gray-400 transition-colors hover:text-brand-400"
                >
                  {contact.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-sm text-gray-400 md:text-left">
              © {new Date().getFullYear()} FitBreak. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href={routes.privacy} className={footerLink}>
                Privacy Policy
              </a>
              <span className="text-gray-600">•</span>
              <a href={routes.terms} className={footerLink}>
                Terms of Service
              </a>
            </div>
            <div className="text-xs text-gray-500">
              Powered by{" "}
              <a
                href="https://fusionict.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-400 transition-colors hover:text-brand-400"
              >
                FusionICT
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
