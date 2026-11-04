import { ContactBlock, H2, H3, LegalPage, List, P } from "./legal";

/** Cloned verbatim from fitbreak.ph/privacy-policy.html (main content only). */
export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" updated="January 24, 2025">
      <P className="mb-8 text-xl leading-relaxed text-ink">
        FitBreak (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
        your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you visit our website or use our services.
      </P>

      <H2>Information We Collect</H2>

      <H3>Personal Information</H3>
      <P>We may collect personal information that you voluntarily provide to us when you:</P>
      <List
        items={[
          "Register for an account",
          "Book a class",
          "Make a payment",
          "Contact us for support",
          "Subscribe to our newsletter",
        ]}
      />

      <P>This information may include:</P>
      <List
        items={[
          "Name and contact information (email, phone number, address)",
          "Payment information (processed securely through GCash)",
          "Age, gender, and fitness level (for class planning)",
          "Emergency contact information",
        ]}
      />

      <H3>Automatically Collected Information</H3>
      <P>When you visit our website, we may automatically collect:</P>
      <List
        items={[
          "IP address and browser type",
          "Device information",
          "Pages visited and time spent",
          "Referral source",
        ]}
      />

      <H2>How We Use Your Information</H2>
      <P>We use your information to:</P>
      <List
        items={[
          "Process your class bookings and memberships",
          "Send booking confirmations and class reminders",
          "Process payments securely",
          "Communicate about class schedules and updates",
          "Improve our services and user experience",
          "Send promotional offers (with your consent)",
          "Comply with legal obligations",
        ]}
      />

      <H2>Data Protection</H2>
      <P>
        We implement appropriate security measures to protect your personal information. However, no
        method of transmission over the internet is 100% secure, and we cannot guarantee absolute
        security.
      </P>

      <H2>Third-Party Services</H2>
      <P>We may use third-party services for:</P>
      <List
        items={[
          <>
            <strong>Payment Processing:</strong> GCash (subject to their privacy policy)
          </>,
          <>
            <strong>Analytics:</strong> Google Analytics (to understand website usage)
          </>,
          <>
            <strong>Email Services:</strong> For sending notifications and updates
          </>,
        ]}
      />

      <H2>Your Rights (Philippine Data Privacy Act)</H2>
      <P>Under the Data Privacy Act of 2012 (Republic Act No. 10173), you have the right to:</P>
      <List
        items={[
          "Access your personal data",
          "Correct inaccurate data",
          "Request deletion of your data",
          "Object to processing of your data",
          "Withdraw consent at any time",
        ]}
      />

      <H2>Data Retention</H2>
      <P>
        We retain your personal information for as long as necessary to provide our services and
        comply with legal obligations. After termination of your membership, we may retain certain
        information for tax, legal, and accounting purposes.
      </P>

      <H2>Cookies</H2>
      <P>
        We use cookies to enhance your experience. You can control cookies through your browser
        settings.
      </P>

      <H2>Children&apos;s Privacy</H2>
      <P>
        Our services are not directed to individuals under 18. We do not knowingly collect personal
        information from children. If you are a parent and believe your child has provided us with
        personal information, please contact us.
      </P>

      <H2>Changes to This Policy</H2>
      <P>
        We may update this Privacy Policy from time to time. We will notify you of any changes by
        posting the new policy on this page and updating the &quot;Last updated&quot; date.
      </P>

      <H2>Contact Us</H2>
      <P>
        If you have questions about this Privacy Policy or wish to exercise your data rights, please
        contact us:
      </P>
      <ContactBlock />

      <P className="mt-12 border-t border-ink/15 pt-6 text-sm text-mute">
        This privacy policy complies with the Data Privacy Act of 2012 (Republic Act No. 10173) of
        the Philippines and its implementing rules and regulations.
      </P>
    </LegalPage>
  );
}
