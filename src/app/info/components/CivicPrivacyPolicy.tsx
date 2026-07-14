import React from "react";
import Link from "next/link";

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-10 text-xl font-bold text-primary">{children}</h2>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 text-secondary leading-relaxed">{children}</p>
);

const List = ({ children }: { children: React.ReactNode }) => (
  <ul className="mt-4 list-disc space-y-2 pl-6 text-secondary leading-relaxed">
    {children}
  </ul>
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
        anonymized and cannot be deleted.
      </Paragraph>

      <div className="mt-14 border-t border-line pt-8">
        <h2 className="text-2xl font-black text-primary">Appendix A</h2>
        <Paragraph>
          Center for Civilians in Conflict (&ldquo;we,&rdquo; &ldquo;our,&rdquo;
          or &ldquo;us&rdquo;) is committed to protecting your privacy. This
          Privacy Policy explains how your personal information is collected,
          used, and disclosed by Center for Civilians in Conflict.
        </Paragraph>
        <Paragraph>
          This Privacy Policy applies to our website, and its associated
          subdomains (collectively, our &ldquo;Service&rdquo;) alongside our
          application, Center for Civilians in Conflict. By accessing or using
          our Service, you signify that you have read, understood, and agree to
          our collection, storage, use, and disclosure of your personal
          information as described in this Privacy Policy and our Terms of
          Service.
        </Paragraph>

        <Heading>Definitions and key terms</Heading>
        <Paragraph>
          To help explain things as clearly as possible in this Privacy Policy,
          every time any of these terms are referenced, are strictly defined as:
        </Paragraph>
        <List>
          <li>
            <strong>Cookie:</strong> small amount of data generated by a website
            and saved by your web browser. It is used to identify your browser,
            provide analytics, remember information about you such as your
            language preference or login information.
          </li>
          <li>
            <strong>Company:</strong> when this policy mentions
            &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our,&rdquo; it refers to the Center for Civilians in Conflict
            (CIVIC), that is responsible for your information under this Privacy
            Policy.
          </li>
          <li>
            <strong>Country:</strong> where Center for Civilians in Conflict is
            based, including the United States, Switzerland, Belgium, the
            Netherlands, and the UK.
          </li>
          <li>
            <strong>Customer/Supporter/Donor:</strong> refers to the company,
            organization or person that signs up to use the Center for Civilians
            in Conflict Service to manage the relationships with your consumers
            or service users.
          </li>
          <li>
            <strong>Device:</strong> any internet connected device such as a
            phone, tablet, computer or any other device that can be used to
            visit Center for Civilians in Conflict and access the different
            information and subscription it offers.
          </li>
          <li>
            <strong>IP address:</strong> Every device connected to the Internet
            is assigned a number known as an Internet protocol (IP) address.
            These numbers are usually assigned in geographic blocks. An IP
            address can often be used to identify the location from which a
            device is connecting to the Internet.
          </li>
          <li>
            <strong>Personnel:</strong> refers to those individuals who are
            employed by Center for Civilians in Conflict or are under contract
            to perform a service on behalf of one of the parties.
          </li>
          <li>
            <strong>Personal Data:</strong> any information that directly,
            indirectly, or in connection with other information — including a
            personal identification number — allows for the identification or
            identifiability of a natural person.
          </li>
          <li>
            <strong>Service:</strong> refers to the service provided by Center
            for Civilians in Conflict as described in the relative terms (if
            available) and on this platform.
          </li>
          <li>
            <strong>Third-party service:</strong> refers to advertisers, contest
            sponsors, promotional and marketing partners, and others who provide
            our content or whose products or services we think may interest you.
          </li>
          <li>
            <strong>Website:</strong> Center for Civilians in Conflict&apos;s
            site, which can be accessed via this URL:{" "}
            <a
              href="https://civiliansinconflict.org/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-brandPrimary hover:underline"
            >
              https://civiliansinconflict.org/
            </a>
          </li>
          <li>
            <strong>You:</strong> a person or entity that is registered with
            Center for Civilians in Conflict to receive information, or because
            of a donation you made.
          </li>
        </List>

        <Heading>What Information Do We Collect?</Heading>
        <Paragraph>
          We collect information from you when you visit our website, register
          on our site, make a donation, subscribe to our newsletter, respond to
          a survey or fill out a form.
        </Paragraph>
        <List>
          <li>Name / Username</li>
          <li>Email Addresses</li>
        </List>

        <Heading>How Do We Use The Information We Collect?</Heading>
        <Paragraph>
          Any of the information we collect from you may be used in one of the
          following ways:
        </Paragraph>
        <List>
          <li>
            To personalize your experience (your information helps us to better
            respond to your individual needs)
          </li>
          <li>
            To improve our website (we continually strive to improve our website
            offerings based on the information and feedback we receive from you)
          </li>
          <li>To process donations</li>
          <li>
            To administer a contest, promotion, survey or other site feature
          </li>
          <li>To send periodic emails</li>
        </List>

        <Heading>
          When does Center for Civilians in Conflict use end user information
          from third parties?
        </Heading>
        <Paragraph>
          Center for Civilians in Conflict will collect End User Data necessary
          to provide an optimal experience to its supporters.
        </Paragraph>
        <Paragraph>
          End users may voluntarily provide us with information they have made
          available on social media websites. If you provide us with any such
          information, we may collect publicly available information from the
          social media websites you have indicated. You can control how much of
          your information social media websites make public by visiting these
          websites and changing your privacy settings.
        </Paragraph>

        <Heading>
          When does Center for Civilians in Conflict use customer information
          from third parties?
        </Heading>
        <Paragraph>
          We receive some information from the third parties when you contact
          us. For example, when you submit your email address to us to show
          interest in becoming a Center for Civilians in Conflict supporter, we
          receive information from a third party that provides automated fraud
          detection services to Center for Civilians in Conflict. We also
          occasionally collect information that is made publicly available on
          social media websites. You can control how much of your information
          social media websites make public by visiting these websites and
          changing your privacy settings.
        </Paragraph>

        <Heading>
          Do we share the information we collect with third parties?
        </Heading>
        <Paragraph>
          We may share the information that we collect, both personal and
          non-personal, with third parties such as promotional and marketing
          partners, and others who provide our content. We may also share it
          with our current and future affiliated companies and business
          partners.
        </Paragraph>
        <Paragraph>
          We may engage trusted third party service providers to perform
          functions and provide services to us, such as hosting and maintaining
          our servers and the website, database storage and management, e-mail
          management, storage marketing, or credit card processing. We will
          likely share your personal information, and possibly some non-personal
          information, with these third parties to enable them to perform these
          services for us and for you.
        </Paragraph>
        <Paragraph>
          We may share portions of our log file data, including IP addresses,
          for analytics purposes with third parties such as web analytics
          partners, application developers, and ad networks. If your IP address
          is shared, it may be used to estimate general location and other
          technographics such as connection speed, whether you have visited the
          website in a shared location, and type of the device used to visit the
          website. They may aggregate information about our online presence and
          what you see on the website and then provide auditing, research and
          reporting for us.
        </Paragraph>
        <Paragraph>
          We may also disclose personal and non-personal information about you
          to government or law enforcement officials or private parties as we,
          in our sole discretion, believe necessary or appropriate in order to
          respond to claims, legal process (including subpoenas), to protect our
          rights and interests or those of a third party, the safety of the
          public or any person, to prevent or stop any illegal, unethical, or
          legally actionable activity, or to otherwise comply with applicable
          court orders, laws, rules and regulations.
        </Paragraph>

        <Heading>
          Where and when is information collected from end users?
        </Heading>
        <Paragraph>
          Center for Civilians in Conflict will collect personal information
          that you submit to us. We may also receive personal information about
          you from third parties as described above.
        </Paragraph>

        <Heading>How Do We Use Your Email Address?</Heading>
        <Paragraph>
          By submitting your email address on this website, you agree to receive
          emails from us. You can cancel your participation in any of these
          email lists at any time by clicking on the opt-out link or other
          unsubscribe option that is included in the respective email. We only
          send emails to people who have authorized us to contact them, either
          directly, or through a third party. We do not send unsolicited emails,
          because we hate spam as much as you do. By submitting your email
          address, you also agree to allow us to use your email address for
          customer audience targeting on sites like Facebook, where we display
          custom advertising to specific people who have opted-in to receive
          communications from us. Email addresses submitted will be used for the
          sole purpose of sending you information and updates pertaining to your
          order. If, however, you have provided the same email to us through
          another method, we may use it for any of the purposes stated in this
          Policy. Note: If at any time you would like to unsubscribe from
          receiving future emails, we include detailed unsubscribe instructions
          at the bottom of each email.
        </Paragraph>

        <Heading>How Long Do We Keep Your Information?</Heading>
        <Paragraph>
          We keep your information only so long as we need it to fulfill the
          purposes described in this policy. This is also the case for anyone
          that we share your information with. When we no longer need to use
          your information and there is no need for us to keep it to comply with
          our legal or regulatory obligations, we&apos;ll either remove it from
          our systems or depersonalize it so that we can&apos;t identify you.
        </Paragraph>

        <Heading>How Do We Protect Your Information?</Heading>
        <Paragraph>
          We implement a variety of security measures to maintain the safety of
          your personal information when you place an order or enter, submit, or
          access your personal information. We offer the use of a secure server.
          All supplied sensitive/credit information is transmitted via Secure
          Socket Layer (SSL) technology and then encrypted into our Payment
          gateway providers database only to be accessible by those authorized
          with special access rights to such systems, and are required to keep
          the information confidential. After a transaction, your private
          information (credit cards, social security numbers, financials, etc.)
          is never kept on file. We cannot, however, ensure or warrant the
          absolute security of any information you transmit to Center for
          Civilians in Conflict or guarantee that your information on the
          Service may not be accessed, disclosed, altered, or destroyed by a
          breach of any of our physical, technical, or managerial safeguards.
        </Paragraph>

        <Heading>
          Could my information be transferred to other countries?
        </Heading>
        <Paragraph>
          Center for Civilians in Conflict is registered in several countries
          mentioned above. Information collected via our website, through direct
          interactions with you, or from use of our help services may be
          transferred from time to time to our offices or personnel, or to third
          parties, located throughout the world, and may be viewed and hosted
          anywhere in the world, including countries that may not have laws of
          general applicability regulating the use and transfer of such data. To
          the fullest extent allowed by applicable law, by using any of the
          above, you voluntarily consent to the trans-border transfer and
          hosting of such information.
        </Paragraph>

        <Heading>
          Is the information collected through the Center for Civilians in
          Conflict Service secure?
        </Heading>
        <Paragraph>
          We take precautions to protect the security of your information. We
          have physical, electronic, and managerial procedures to help
          safeguard, prevent unauthorized access, maintain data security, and
          correctly use your information. However, neither people nor security
          systems are foolproof, including encryption systems. In addition,
          people can commit intentional crimes, make mistakes or fail to follow
          policies. Therefore, while we use reasonable efforts to protect your
          personal information, we cannot guarantee its absolute security. If
          applicable law imposes any non-disclaimable duty to protect your
          personal information, you agree that intentional misconduct will be
          the standards used to measure our compliance with that duty.
        </Paragraph>

        <Heading>Can I update or correct my information?</Heading>
        <Paragraph>
          The rights you have to request updates or corrections to the
          information Center for Civilians in Conflict collects depend on your
          relationship with Center for Civilians in Conflict. Personnel may
          update or correct their information.
        </Paragraph>
        <Paragraph>
          You have the right to request the restriction of certain uses and
          disclosures of personally identifiable information as follows. You can
          contact us in order to (1) update or correct your personally
          identifiable information, (2) change your preferences with respect to
          communications and other information you receive from us, or (3)
          delete the personally identifiable information maintained about you on
          our systems (subject to the following paragraph), by cancelling your
          account. Such updates, corrections, changes and deletions will have no
          effect on other information that we maintain, or information that we
          have provided to third parties in accordance with this Privacy Policy
          prior to such update, correction, change or deletion. To protect your
          privacy and security, we may take reasonable steps (such as requesting
          a unique password) to verify your identity before granting you profile
          access or making corrections. You are responsible for maintaining the
          secrecy of your unique password and account information at all times.
        </Paragraph>
        <Paragraph>
          You should be aware that it is not technologically possible to remove
          each and every record of the information you have provided to us from
          our system. The need to back up our systems to protect information
          from inadvertent loss means that a copy of your information may exist
          in a non-erasable form that will be difficult or impossible for us to
          locate. Promptly after receiving your request, all personal
          information stored in databases we actively use, and other readily
          searchable media will be updated, corrected, changed or deleted, as
          appropriate, as soon as and to the extent reasonably and technically
          practicable.
        </Paragraph>
        <Paragraph>
          If you are an end user and wish to update, delete, or receive any
          information we have about you, you may do so by contacting the
          organization of which you are a customer.
        </Paragraph>

        <Heading>Governing Law</Heading>
        <Paragraph>
          This Privacy Policy is governed by the laws of United States and the
          EU&apos;s GDPR without regard to its conflict of laws provision. You
          consent to the exclusive jurisdiction of the courts in connection with
          any action or dispute arising between the parties under or in
          connection with this Privacy Policy except for those individuals who
          may have rights to make claims under Privacy Shield, or the Swiss-US
          framework, or under GDPR.
        </Paragraph>
        <Paragraph>
          The laws of United States and the EU&apos;s GDPR, excluding its
          conflicts of law rules, shall govern this Agreement and your use of
          the website. Your use of the website may also be subject to other
          local, state, national, or international laws.
        </Paragraph>
        <Paragraph>
          By using Center for Civilians in Conflict or contacting us directly,
          you signify your acceptance of this Privacy Policy. If you do not
          agree to this Privacy Policy, you should not engage with our website,
          or use our services. Continued use of the website, direct engagement
          with us, or following the posting of changes to this Privacy Policy
          that do not significantly affect the use or disclosure of your
          personal information will mean that you accept those changes.
        </Paragraph>

        <Heading>Your Consent</Heading>
        <Paragraph>
          We&apos;ve updated our Privacy Policy to provide you with complete
          transparency into what is being set when you visit our site and how
          it&apos;s being used. By using our website, registering an account, or
          subscribing to our newsletters, you hereby consent to our Privacy
          Policy and agree to its terms.
        </Paragraph>

        <Heading>Links to Other Websites</Heading>
        <Paragraph>
          Our website may contain links to other websites not operated or
          controlled by Center for Civilians in Conflict. We are not responsible
          for the content, accuracy or opinions expressed in such websites, and
          such websites are not investigated, monitored or checked for accuracy
          or completeness by us. Please remember that when you use a link to go
          from the Services to another website, our Privacy Policy is no longer
          in effect. Your browsing and interaction on any other website,
          including those that have a link on our platform, is subject to that
          website&apos;s own rules and policies. Such third parties may use
          their own cookies or other methods to collect information about you.
        </Paragraph>

        <Heading>Cookies</Heading>
        <Paragraph>
          Center for Civilians in Conflict uses &ldquo;Cookies&rdquo; to
          identify the areas of our website that you have visited. A Cookie is a
          small piece of data stored on your computer or mobile device by your
          web browser. We use Cookies to enhance the performance and
          functionality of our website but are non-essential to their use.
          However, without these cookies, certain functionality like videos may
          become unavailable or you would be required to enter your login
          details every time you visit the website as we would not be able to
          remember that you had logged in previously. Most web browsers can be
          set to disable the use of Cookies. However, if you disable Cookies,
          you may not be able to access functionality on our website correctly
          or at all. We never place Personally Identifiable Information in
          Cookies.
        </Paragraph>

        <Heading>
          Blocking and disabling cookies and similar technologies
        </Heading>
        <Paragraph>
          Wherever you&apos;re located you may also set your browser to block
          cookies and similar technologies, but this action may block our
          essential cookies and prevent our website from functioning properly,
          and you may not be able to fully utilize all of its features and
          services. You should also be aware that you may also lose some saved
          information (e.g. saved login details, site preferences) if you block
          cookies on your browser. Different browsers make different controls
          available to you. Disabling a cookie or category of cookie does not
          delete the cookie from your browser, you will need to do this yourself
          from within your browser, you should visit your browser&apos;s help
          menu for more information.
        </Paragraph>

        <Heading>Changes To Our Privacy Policy</Heading>
        <Paragraph>
          We may change our policies, and we may need to make changes to this
          Privacy Policy so that they accurately reflect our policies. Unless
          otherwise required by law, we will notify you before we make changes
          to this Privacy Policy and give you an opportunity to review them
          before they go into effect. Then, if you continue to use the Service,
          you will be bound by the updated Privacy Policy. If you do not want to
          agree to this or any updated Privacy Policy, you can delete your
          account.
        </Paragraph>

        <Heading>Third-Party Services</Heading>
        <Paragraph>
          We may display, include or make available third-party content
          (including data, information, and other applications) or provide links
          to third-party websites.
        </Paragraph>
        <Paragraph>
          You acknowledge and agree that Center for Civilians in Conflict shall
          not be responsible for any Third-Party, including their accuracy,
          completeness, timeliness, validity, copyright compliance, legality,
          decency, quality or any other aspect thereof. Center for Civilians in
          Conflict does not assume and shall not have any liability or
          responsibility to you or any other person or entity for any
          Third-Party.
        </Paragraph>
        <Paragraph>
          Third-Parties and links thereto are provided solely as a convenience
          to you and you access and use them entirely at your own risk and
          subject to such third parties&apos; terms and conditions.
        </Paragraph>

        <Heading>Tracking Technologies</Heading>
        <List>
          <li>
            <strong>Cookies:</strong> We use Cookies to enhance the performance
            and functionality of our website but are non-essential to their use.
            However, without these cookies, certain functionality like videos
            may become unavailable or you would be required to enter your login
            details every time you visit the website as we would not be able to
            remember that you had logged in previously.
          </li>
          <li>
            <strong>Local Storage:</strong> Local Storage sometimes known as DOM
            storage, provides web apps with methods and protocols for storing
            client-side data. Web storage supports persistent data storage,
            similar to cookies but with a greatly enhanced capacity and no
            information stored in the HTTP request header.
          </li>
        </List>

        <Heading>
          Information about General Data Protection Regulation (GDPR)
        </Heading>
        <Paragraph>
          We may be collecting and using information from you if you are from
          the European Economic Area (EEA), and in this section of our Privacy
          Policy we are going to explain exactly how and why is this data
          collected, and how we maintain this data under protection from being
          replicated or used in the wrong way.
        </Paragraph>

        <Heading>What is GDPR?</Heading>
        <Paragraph>
          GDPR is an EU-wide privacy and data protection law that regulates how
          EU residents&apos; data is protected and enhances the control the EU
          residents have, over their personal data.
        </Paragraph>
        <Paragraph>
          The GDPR is relevant to any globally operating entity and not just the
          EU-based businesses and EU residents. Our supporters&apos; data is
          important irrespective of where they are located, which is why we have
          implemented GDPR controls as our baseline standard for all our
          operations worldwide.
        </Paragraph>

        <Heading>What is personal data?</Heading>
        <Paragraph>
          Any data that relates to an identifiable or identified individual.
          GDPR covers a broad spectrum of information that could be used on its
          own, or in combination with other pieces of information, to identify a
          person. Personal data extends beyond a person&apos;s name or email
          address. Some examples include financial information, political
          opinions, genetic data, biometric data, IP addresses, physical
          address, sexual orientation, and ethnicity.
        </Paragraph>
        <Paragraph>
          The Data Protection Principles include requirements such as:
        </Paragraph>
        <List>
          <li>
            Personal data collected must be processed in a fair, legal, and
            transparent way and should only be used in a way that a person would
            reasonably expect.
          </li>
          <li>
            Personal data should only be collected to fulfil a specific purpose
            and it should only be used for that purpose. Organizations must
            specify why they need the personal data when they collect it.
          </li>
          <li>
            Personal data should be held no longer than necessary to fulfil its
            purpose.
          </li>
          <li>
            People covered by the GDPR have the right to access their own
            personal data. They can also request a copy of their data, and that
            their data be updated, deleted, restricted, or moved to another
            organization.
          </li>
        </List>

        <Heading>Why is GDPR important?</Heading>
        <Paragraph>
          GDPR adds some new requirements regarding how companies should protect
          individuals&apos; personal data that they collect and process. It also
          raises the stakes for compliance by increasing enforcement and
          imposing greater fines for breach. Beyond these facts it&apos;s simply
          the right thing to do. At Center for Civilians in Conflict we strongly
          believe that your data privacy is very important and we already have
          solid security and privacy practices in place that go beyond the
          requirements of this new regulation.
        </Paragraph>

        <Heading>
          Individual Data Subject&apos;s Rights - Data Access, Portability and
          Deletion
        </Heading>
        <Paragraph>
          We are committed to helping our customers meet the data subject rights
          requirements of GDPR. Center for Civilians in Conflict processes or
          stores all personal data in fully vetted, DPA compliant vendors. We do
          store all conversation and personal data for up to 6 years unless your
          account is deleted. In which case, we dispose of all data in
          accordance with our Terms of Service and Privacy Policy, but we will
          not hold it longer than 60 days.
        </Paragraph>

        <Heading>California Residents</Heading>
        <Paragraph>
          The California Consumer Privacy Act (CCPA) requires us to disclose
          categories of Personal Information we collect and how we use it, the
          categories of sources from whom we collect Personal Information, and
          the third parties with whom we share it, which we have explained
          above.
        </Paragraph>
        <Paragraph>
          We are also required to communicate information about rights
          California residents have under California law. You may exercise the
          following rights:
        </Paragraph>
        <List>
          <li>
            <strong>Right to Know and Access.</strong> You may submit a
            verifiable request for information regarding the: (1) categories of
            Personal Information we collect, use, or share; (2) purposes for
            which categories of Personal Information are collected or used by
            us; (3) categories of sources from which we collect Personal
            Information; and (4) specific pieces of Personal Information we have
            collected about you.
          </li>
          <li>
            <strong>Right to Equal Service.</strong> We will not discriminate
            against you if you exercise your privacy rights.
          </li>
          <li>
            <strong>Right to Delete.</strong> You may submit a verifiable
            request to close your account and we will delete Personal
            Information about you that we have collected.
          </li>
          <li>
            Request that a business that sells a consumer&apos;s personal data,
            not sell the consumer&apos;s personal data.
          </li>
        </List>
        <Paragraph>
          If you make a request, we have one month to respond to you. If you
          would like to exercise any of these rights, please contact us.
        </Paragraph>
        <Paragraph>
          We do not sell the Personal Information of our users.
        </Paragraph>
        <Paragraph>
          For more information about these rights, please contact us.
        </Paragraph>

        <Heading>California Online Privacy Protection Act (CalOPPA)</Heading>
        <Paragraph>
          CalOPPA requires us to disclose categories of Personal Information we
          collect and how we use it, the categories of sources from whom we
          collect Personal Information, and the third parties with whom we share
          it, which we have explained above.
        </Paragraph>
        <Paragraph>CalOPPA users have the following rights:</Paragraph>
        <List>
          <li>
            <strong>Right to Know and Access.</strong> You may submit a
            verifiable request for information regarding the: (1) categories of
            Personal Information we collect, use, or share; (2) purposes for
            which categories of Personal Information are collected or used by
            us; (3) categories of sources from which we collect Personal
            Information; and (4) specific pieces of Personal Information we have
            collected about you.
          </li>
          <li>
            <strong>Right to Equal Service.</strong> We will not discriminate
            against you if you exercise your privacy rights.
          </li>
          <li>
            <strong>Right to Delete.</strong> You may submit a verifiable
            request to close your account and we will delete Personal
            Information about you that we have collected.
          </li>
          <li>
            Right to request that a business that sells a consumer&apos;s
            personal data, not sell the consumer&apos;s personal data.
          </li>
        </List>
        <Paragraph>
          If you make a request, we have one month to respond to you. If you
          would like to exercise any of these rights, please contact us.
        </Paragraph>
        <Paragraph>
          We do not sell the Personal Information of our users.
        </Paragraph>
        <Paragraph>
          For more information about these rights, please contact us.
        </Paragraph>

        <Heading>Contact Us</Heading>
        <Paragraph>
          Don&apos;t hesitate to contact us if you have any questions.
        </Paragraph>
        <List>
          <li>
            Via Email: <Email />
          </li>
        </List>
      </div>
    </div>
  );
};

export default CivicPrivacyPolicy;
