import { ContactBlock, H2, H3, LegalPage, List, P } from "./legal";

/** Cloned verbatim from fitbreak.ph/terms-of-service.html (main content only). */
export function TermsOfService() {
  return (
    <LegalPage title="Terms of Service" updated="January 24, 2025">
      <P className="mb-6 text-gray-700">
        Welcome to FitBreak! These Terms of Service (&quot;Terms&quot;) govern your use of our
        website and services. By accessing or using FitBreak, you agree to be bound by these Terms.
      </P>

      <H2>1. Acceptance of Terms</H2>
      <P>
        By registering for classes, purchasing a membership, or using our services, you agree to
        these Terms and our Privacy Policy. If you do not agree, please do not use our services.
      </P>

      <H2>2. Membership &amp; Registration</H2>
      <H3>Eligibility</H3>
      <List
        items={[
          "You must be at least 18 years old to register",
          "Services are exclusively for women",
          "You must provide accurate and complete information",
          "Annual membership fee: P500 (non-refundable)",
        ]}
      />

      <H3>Account Responsibility</H3>
      <P>
        You are responsible for maintaining the confidentiality of your account and for all
        activities under your account.
      </P>

      <H2>3. Class Bookings</H2>
      <H3>Booking Policy</H3>
      <P>
        If a class is cancelled due to brownouts, typhoons or instructor is not available, then
        credit will be returned back to the members&apos; accounts to be used for future classes.
      </P>

      <H3>Cancellation Policy</H3>
      <List
        items={[
          "Cancel at least 2 hours before class to receive credit",
          "Late cancellations or no-shows forfeit the class credit",
          "Emergency cancellations will be considered on a case-by-case basis",
        ]}
      />

      <H2>4. Payment &amp; Pricing</H2>
      <H3>Payment Methods</H3>
      <List items={["GCash", "BPI Bank Transfer"]} />

      <H3>Pricing</H3>
      <P>
        All prices are in Philippine Pesos (P). Prices are subject to change with notice. Class
        packs and monthly memberships are non-refundable but may be transferred to another person
        with approval.
      </P>

      <H3>Validity Periods</H3>
      <List
        items={[
          "Starter Pack (6 classes): Valid 30 days",
          "Standard Pack (12 classes): Valid 30 days",
          "Power Pack (20 classes): Valid 45 days",
        ]}
      />

      <H2>5. Health &amp; Safety</H2>
      <H3>Medical Clearance</H3>
      <P>
        By participating in classes, you confirm that you are physically fit and have no medical
        conditions that would prevent participation in physical exercise. Consult your physician if
        you have any concerns.
      </P>

      <H3>Assumption of Risk</H3>
      <P>
        Physical exercise involves inherent risks. You participate at your own risk. FitBreak and
        its coaches are not liable for injuries sustained during classes, except in cases of gross
        negligence.
      </P>

      <H3>Insurance</H3>
      <P>
        We recommend maintaining your own health and accident insurance. FitBreak does not provide
        personal accident insurance for participants.
      </P>

      <H2>6. Code of Conduct</H2>
      <P>All members must:</P>
      <List
        items={[
          "Respect other participants and coaches",
          "Arrive on time (10 minutes early for first class)",
          "Wear appropriate workout attire",
          "Maintain personal hygiene",
          "Follow coach instructions for safety",
          "Not use mobile phones during class",
          "Keep the studio clean and organized",
        ]}
      />

      <H2>7. Photography &amp; Brand Usage</H2>
      <P>To protect the privacy and safety of our members:</P>
      <List
        items={[
          <>
            <strong>No photography or video recording</strong> is allowed inside the fitness studio
            without express permission from FitBreak management
          </>,
          <>
            Members are <strong>not permitted to use the FitBreak brand, logo, or name</strong> in
            any social media posting, marketing materials, or public communications without prior
            written consent from the FitBreak owner
          </>,
          "Violation of this policy may result in immediate termination of membership",
        ]}
      />

      <H2>8. Termination</H2>
      <P>We reserve the right to terminate or suspend your membership immediately if you:</P>
      <List
        items={[
          "Violate these Terms",
          "Engage in disruptive or inappropriate behavior",
          "Provide false information",
          "Fail to pay fees",
        ]}
      />

      <H2>9. Limitation of Liability</H2>
      <P>
        To the maximum extent permitted by Philippine law, FitBreak shall not be liable for any
        indirect, incidental, special, or consequential damages arising from your use of our
        services.
      </P>

      <H2>10. Intellectual Property</H2>
      <P>
        All content on our website, including text, graphics, logos, and workout programs, is the
        property of FitBreak and protected by Philippine and international copyright laws.
      </P>

      <H2>11. Governing Law</H2>
      <P>
        These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall
        be resolved in the courts of Calapan City, Oriental Mindoro.
      </P>

      <H2>12. Changes to Terms</H2>
      <P>
        We reserve the right to modify these Terms at any time. Changes will be posted on this page
        with an updated revision date. Continued use of our services constitutes acceptance of
        modified Terms.
      </P>

      <H2>13. Contact Information</H2>
      <ContactBlock />

      <P className="mt-8 text-sm text-gray-600">
        By using FitBreak services, you acknowledge that you have read, understood, and agree to be
        bound by these Terms of Service.
      </P>
    </LegalPage>
  );
}
