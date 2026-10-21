import React from "react";
import Link from "next/link";

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-10 text-xl font-bold text-primary">{children}</h2>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 text-secondary leading-relaxed">{children}</p>
);

const Email = () => (
  <a
    href="mailto:giving@civiliansinconflict.org"
    className="text-brandPrimary hover:underline"
  >
    giving@civiliansinconflict.org
  </a>
);

const CivicPrivacyPolicy = () => {
  return (
    <div className="mx-auto mt-6 max-w-3xl text-primary sm:mt-10">
      <Link
        href="/info"
        className="text-sm font-medium text-tertiary transition-colors hover:text-primary"
      >
        ← Back to Info
      </Link>

      <h1 className="mt-6 text-3xl font-black text-primary sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-tertiary">Updated at 2026-07-16</p>

      <Paragraph>
        The Center for Civilians in Conflict respects the privacy of its donors
        and supporters, and does not exchange your information with other
        organizations or 3rd parties. In line with the provisions of the
        European Union (EU)&apos;s General Data Protection Regulation (GDPR),
        CIVIC has put in place the following Privacy Policy.
      </Paragraph>

      <Heading>General Collection and Use of Personal Information</Heading>
      <Paragraph>
        To stay in contact with our supporters, the Center for Civilians in
        Conflict collects and uses personal information such as a
        supporter&apos;s name, address, phone number, and email address when a
        supporter voluntarily provides such information to us. In addition,
        CIVIC keeps a record of each donor&apos;s giving history. This
        information is kept on file for IRS purposes and to analyze overall
        giving patterns in order to make more accurate budget projections.
      </Paragraph>
      <Paragraph>
        CIVIC does not have access to personal credit card information; all
        credit card transactions are handled by a third party, Click &amp;
        Pledge. For its privacy statement, please visit the Click &amp; Pledge
        website.
      </Paragraph>
      <Paragraph>
        We also stay in touch with supporters via Salesforce (our CRM Software)
        and share updates about our work via MailChimp (our Mailing provider).
        You&apos;ll find the Salesforce privacy policy on its web site and the
        MailChimp privacy policy on its website.
      </Paragraph>
      <Paragraph>
        As part of the service provided associated with the CIVIC Supporter
        Pass, we rely on the optional use of Privy. You&apos;ll find the Privy
        privacy policy on its website.
      </Paragraph>
      <Paragraph>
        CIVIC does not sell or in any way share the names and contact
        information of its donors or supporters with other parties. You can
        unsubscribe from notifications using settings in the profile section of
        the app. You can delete your CIVIC supporter pass account at any time by
        using the functionality in the application or by contacting <Email />.
        You can unsubscribe from electronic mailing list at any time directly
        from any newsletter mailing using the &ldquo;unsubscribe&rdquo; link at
        the bottom of the email. If you need to have your records deleted,
        contact us at <Email />. Please note the only data written to the
        blockchain is public key and vote information. This information is
        anonymized and cannot be deleted. Any action you would undertake onchain
        with that same wallet that de-anonymizes your activity will be your
        responsibility and neither CIVIC nor Agora can be held responsible in
        any way.
      </Paragraph>
    </div>
  );
};

export default CivicPrivacyPolicy;
