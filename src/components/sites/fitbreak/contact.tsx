import { ArrowLink, wrap } from "./editorial";
import { classTimes, contact } from "./links";

// The exact embed the source uses (Roxas Drive, Calapan). Requires
// `frame-src https://www.google.com` in the CSP — see src/lib/csp.ts.
const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.8384474688546!2d121.18091931483825!3d13.413333390642556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a21a3d8c8c8c8d%3A0x1234567890abcdef!2sRoxas%20Drive%2C%20Calapan%2C%20Oriental%20Mindoro!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph";

export function Contact() {
  return (
    <section id="contact" className="border-t border-rule bg-paper py-20 lg:py-28">
      <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-5">
          <h2 className="fb-display mb-10 text-[clamp(2.75rem,7vw,5.75rem)]">Visit Us</h2>
          <dl className="divide-y divide-ink/15 border-y border-ink/15">
            <div className="grid grid-cols-[8rem_1fr] gap-4 py-5">
              <dt className="fb-label pt-1 text-mute">Location</dt>
              <dd>
                2nd Floor Roxas Drive
                <br />
                Brgy Ilaya, Calapan City
                <br />
                Oriental Mindoro
              </dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-4 py-5">
              <dt className="fb-label pt-1 text-mute">Class Hours</dt>
              <dd>
                <p className="mb-1 font-semibold">Monday - Saturday</p>
                <ul className="fb-num">
                  {classTimes.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-mute">Closed every Sunday</p>
              </dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] gap-4 py-5">
              <dt className="fb-label pt-1 text-mute">Get in Touch</dt>
              <dd className="space-y-1">
                <p>
                  <a href={`mailto:${contact.email}`} className="hover:text-crimson-deep">
                    {contact.email}
                  </a>
                </p>
                <p>
                  <a href={contact.phoneHref} className="fb-num hover:text-crimson-deep">
                    {contact.phoneDisplay}
                  </a>
                </p>
                <p className="pt-3">
                  <ArrowLink href={contact.messenger} external>
                    Message us or visit us
                  </ArrowLink>
                </p>
              </dd>
            </div>
          </dl>
        </div>

        <div className="min-h-[420px] overflow-hidden bg-bone lg:col-span-7">
          <iframe
            src={MAP_EMBED}
            width="100%"
            height="100%"
            className="contrast-[1.05] grayscale-[0.85]"
            style={{ border: 0, minHeight: 420 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="FitBreak Location - 2nd Floor Roxas Drive, Brgy Ilaya, Calapan City"
          />
        </div>
      </div>
    </section>
  );
}
