import { Icon } from "./icons";
import { classTimes, contact } from "./links";

// The exact embed the source uses (Roxas Drive, Calapan). Requires
// `frame-src https://www.google.com` in the CSP — see src/lib/csp.ts.
const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.8384474688546!2d121.18091931483825!3d13.413333390642556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a21a3d8c8c8c8d%3A0x1234567890abcdef!2sRoxas%20Drive%2C%20Calapan%2C%20Oriental%20Mindoro!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph";

export function Contact() {
  return (
    <section id="contact" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-pink-100 bg-linear-to-br from-pink-50 to-white p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Visit Us</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-brand-100 p-3">
                  <Icon name="pin" className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">Location</h3>
                  <p className="text-gray-600">2nd Floor Roxas Drive</p>
                  <p className="text-gray-600">Brgy Ilaya, Calapan City</p>
                  <p className="text-gray-600">Oriental Mindoro</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-accent-100 p-3">
                  <Icon name="clock" className="h-6 w-6 text-accent-700" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">Class Hours</h3>
                  <p className="text-gray-600">Monday - Saturday</p>
                  {classTimes.map((t) => (
                    <p key={t} className="text-gray-600">
                      {t}
                    </p>
                  ))}
                  <p className="mt-2 text-sm text-gray-500">Closed every Sunday</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-purple-100 p-3">
                  <Icon name="mail" className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">Get in Touch</h3>
                  <p className="text-gray-600">Email: {contact.email}</p>
                  <p className="text-gray-600">Phone: {contact.phoneDisplay}</p>
                  <p className="mt-2 text-sm text-gray-500">Message us or visit us!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <iframe
              src={MAP_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 450 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="FitBreak Location - 2nd Floor Roxas Drive, Brgy Ilaya, Calapan City"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
