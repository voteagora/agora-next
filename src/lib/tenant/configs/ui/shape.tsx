import React from "react";
import { TenantUI } from "@/lib/tenant/tenantUI";
import shapeLogo from "@/assets/tenant/shape_logo.svg";
import shapeHero from "@/assets/tenant/shape_hero.svg";
import shapeSuccess from "@/assets/tenant/shape_hero.svg";
import shapePending from "@/assets/tenant/shape_hero.svg";
import shapeInfoHero from "@/assets/tenant/shape_hero.svg";
import shapeInfoCard1 from "@/assets/tenant/shape_info_1.svg";
import shapeInfoCard2 from "@/assets/tenant/shape_info_2.svg";
import shapeInfoCard3 from "@/assets/tenant/shape_info_3.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";

// Note: Using Towns UI as a template for Shape (no-gov client)
export const shapeTenantUIConfig = new TenantUI({
  title: "Shape Protocol",
  logo: shapeLogo,
  logoSize: "36px",
  tokens: [],
  hideAgoraBranding: true,

  assets: {
    success: shapeSuccess,
    pending: shapePending,
    delegate: delegateAvatar,
  },

  customization: {
    primary: "23 23 23",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "252 251 247",
    wash: "255 255 255",
    line: "223 223 223",
    positive: "34 197 94",
    negative: "239 68 68",
    brandPrimary: "23 23 23",
    brandSecondary: "245 245 245",
    tokenAmountFont: "font-chivoMono",
    infoSectionBackground: "255 255 255",
    headerBackground: "255 255 255",
    infoTabBackground: "255 255 255",
    buttonBackground: "240 240 240",
    cardBackground: "255 255 255",
    cardBorder: "223 223 223",
    hoverBackground: "245 245 245",
    textSecondary: "115 115 115",
    footerBackground: "255 255 255",
    innerFooterBackground: "255 255 255",
    customHeroImageSize: "w-auto h-auto",
    customIconBackground: "bg-transparent",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    customAboutSubtitle: "About Structura",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    customIconColor: "#87819F",
  },

  theme: "light",

  organization: {
    title: "Shape Protocol",
  },

  links: [
    {
      name: "twitter",
      title: "Twitter",
      url: "https://x.com/structura",
    },
    {
      name: "shape-website",
      title: "Website",
      url: "#",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Structura Protocol Governance",
      description:
        "Structura is experimenting with minimal, onchain governance. This page is the canonical home for Structura governance information.",
      hero: shapeHero,
      meta: {
        title: "Shape Protocol Agora",
        description: "Home of Shape Protocol governance",
        imageTitle: "Shape Protocol Agora",
        imageDescription: "Home of Shape Protocol governance",
      },
    },
    {
      route: "proposals",
      title: "Shape Protocol Proposals",
      description:
        "Shape Protocol is currently setting up its governance infrastructure. Proposal functionality will be available soon.",
      meta: {
        title: "Shape Protocol Proposals",
        description: "View and vote on Shape Protocol proposals",
        imageTitle: "Shape Protocol Proposals",
        imageDescription: "View and vote on Shape Protocol proposals",
      },
    },
    {
      route: "info",
      title: "Welcome to Structura",
      description:
        "Structura, a Wyoming DUNA. This is the Member Dashboard for DUNA documents, onchain proposals, voting and governance.\nView Structura DUNA Member Disclosures",
      hero: shapeHero,
      links: [
        {
          name: "Docs",
          title: "Docs",
          url: "#",
          image: shapeInfoCard1,
        },
        {
          name: "Governance Forums",
          title: "Governance",
          url: "/forums",
          image: shapeInfoCard2,
        },
        {
          name: "Document Archive",
          title: "Document Archive",
          url: "/document-archive",
          image: shapeInfoCard3,
        },
      ],
      meta: {
        title: "Shape Protocol Agora",
        description: "Home of Shape Protocol governance",
        imageTitle: "Shape Protocol Agora",
        imageDescription: "Home of Shape Protocol governance",
      },
    },
    {
      route: "delegates",
      title: "Shape Protocol Delegates",
      description:
        "Shape Protocol is currently setting up its governance infrastructure. Delegate functionality will be available soon.",
      meta: {
        title: "Shape Protocol Delegates",
        description: "Delegate your voting power in Shape Protocol",
        imageTitle: "Shape Protocol Delegates",
        imageDescription: "Delegate your voting power in Shape Protocol",
      },
    },
    {
      route: "info/about",
      title: "Structura Roadmap",
      hero: shapeInfoHero,
      description:
        "Structura is the Decentralized Unincorporated Nonprofit Association comprised of SHAPE governance token holders: a legal structure purpose-built for decentralized communities that need to operate in the real world without sacrificing decentralization.\n\nDAOs coordinate beautifully onchain. But the moment they need to do something outside the chain (sign a contract, engage a service provider, open a bank account), the structure breaks down. Structura fixes that. Governance decisions made by SHAPE holders translate into real-world actions.\n\nAs a taxpaying U.S. entity organized under Wyoming law, Structura is positioned at the front of a shifting policy environment - proudly built in America, open to the world. The SHAPE token puts members in ultimate control of how the treasury is deployed in support of the Shape Network and its nonprofit purpose: a culture-first network that scales open meritocracy to fuel fine art and bold experiments, and bring fun back onchain.\n\nThis Dashboard\n\nThe focal point for Structura governance. Track treasury activity, monitor governance proposals, and stay current on the financial position of the DUNA, including the tax consequences of treasury activity that come with operating as a U.S. entity.\n\nGovernance is yours. This is where you use it.",
      sectionTitle: "Structura Roadmap",
      tabs: [
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#87819F"
            />
          ),
          title: "Voting in Structura",
          description:
            "Voting Process\n\nIn order for a Governance Proposal to be enacted, it must:\n\nfirst be submitted as a Temp-Check, which is a five-day period during which Members can utilize their SHAPE token to indicate support for a proposal. In order for a proposal to transition from a Temp-Check to a vote of the membership, the Temp-Check must attain the support of 5% of the SHAPE tokens in circulation, except as limited by Article 13.\n\nupon a successful Temp-Check, the Governance Proposal period is open for seven days, during which time Members can utilize their SHAPE token to affirm, deny, or participate without voting on the proposal. A proposal:\n\nPasses if the majority of votes affirm the proposal and 10% of the SHAPE tokens in circulation participate in the vote; and\nFails if the majority of votes deny the proposal or 10% of the SHAPE tokens in circulation did not participate in the vote.\n\nA passed Governance Proposal can be reverted for further consideration and modification pursuant to Article 14 if it is determined by the Rules Committee within 3-days of passage to be violative of legal requirements, technically unfeasible, or malicious. If the 3-day period expires without reversion or the Rules Committee affirms the Governance Proposal, it is enacted.\n\nUpon enactment of a Governance Proposal, any recipients of funds must complete a tax reporting intake through tooling provided by the Rules Committee Administrator within 15 days, or the payment will expire, and the recipient shall not be eligible to receive the funds absent future Governance Proposal.\n\nHow voting power works\n\nSHAPE on Ethereum Mainnet\n\nThe SHAPE token uses OpenZeppelin's ERC20Votes. Your tokens do not count as votes until you choose where your voting power should live:\n\nSelf-delegate to vote directly with your own wallet.\nDelegate to someone you trust so they can vote on your behalf.\n\nEither way, you keep full ownership of your tokens. Delegation does not let anyone move your tokens or claim them; it only points your voting power. You can change or revoke delegation at any time by making a new delegation.\n\nDelegating to yourself and others\n\nSelf-Delegation:\nSelf-delegating activates your voting power so you can vote directly in onchain proposals.\nOnchain action: Call delegate (0xYOUR-WALLET-HERE).\nAfter this one-time step (per address, per chain), your votes will track your token balance automatically. No need to repeat unless you later delegate to someone else.\nVote directly from your wallet\n\nDelegate to Other Members:\nYou can point your voting power to a trusted delegate. This helps active representatives vote on your behalf while you retain token ownership and can re-delegate at any time.\nYou are still a member of the WY DUNA.\n\nUnder Wyoming's Decentralized Unincorporated Nonprofit Association Act, a member is someone who may participate in selecting administrators or shaping policies. A membership interest is the voting right defined by those principles, and the Act explicitly contemplates that voting can be administered by smart contracts. Delegating your votes does not transfer your tokens or your membership; it only authorizes another address to cast votes using your voting power.",
        },
      ],
      meta: {
        title: "About Shape Protocol",
        description:
          "Learn about Shape Protocol and decentralized community governance",
        imageTitle: "About Shape Protocol",
        imageDescription:
          "Learn about Shape Protocol and decentralized community governance",
      },
    },
    {
      route: "coming-soon",
      title: "Structura governance goes live on September 15, 2026",
      description: "Shape voters are the stewards for the DAO.",
      hero: shapeHero,
      meta: {
        title: "Shape Protocol Governance",
        description: "Shape Protocol governance coming soon",
        imageTitle: "Shape Protocol Governance",
        imageDescription: "Shape Protocol governance coming soon",
      },
    },
    {
      route: "financials-coming-soon",
      title: "Structura financials are\ncoming soon",
      description: "",
      hero: shapeHero,
      meta: {
        title: "Shape Protocol Financials",
        description: "Shape Protocol financials coming soon",
        imageTitle: "Shape Protocol Financials",
        imageDescription: "Shape Protocol financials coming soon",
      },
    },
  ],

  toggles: [
    { name: "admin", enabled: false },
    { name: "proposals", enabled: false },
    { name: "info", enabled: true },
    { name: "delegates", enabled: true },
    { name: "delegates/edit", enabled: false },
    { name: "snapshotVotes", enabled: false },
    { name: "proposal-execute", enabled: false },
    { name: "proposal-lifecycle", enabled: false },
    { name: "use-daonode-for-proposals", enabled: false },
    { name: "use-daonode-for-votable-supply", enabled: false },
    { name: "use-daonode-for-proposal-types", enabled: false },
    { name: "forums", enabled: true },
    {
      name: "duna",
      enabled: true,
      config: {
        title: "Structura",
      },
    },
    { name: "coming-soon", enabled: true },
    { name: "hide-governor-settings", enabled: true },
    { name: "hide-hero", enabled: true },
    { name: "hide-hero-image", enabled: true },
    { name: "footer/hide-changelog", enabled: true },
    { name: "changelog/simplified-view", enabled: true },
    { name: "footer/hide-votable-supply", enabled: true },
    { name: "footer/hide-total-supply", enabled: true },
    { name: "coming-soon/show-static-proposals", enabled: true },
    { name: "financials-coming-soon", enabled: true },
    {
      name: "shape-hero-content",
      enabled: true,
    },
    {
      name: "duna-disclosures",
      enabled: true,
      config: {
        content: (
          <>
            <div className="mb-6 text-base font-semibold text-tertiary uppercase tracking-wide">
              STRUCTURA – DUNA DISCLOSURES
            </div>

            <div className="font-medium">
              <p className="mt-2">
                By owning the token and actively participating in Structura
                (including, claiming SHAPE tokens through airdrop or
                participation in governance), you acknowledge and agree that you
                are electing to become a member of a Wyoming Decentralized
                Unincorporated Nonprofit Association (&quot;Association&quot;).
                Your participation is subject to the terms and conditions set
                forth in the Association Agreement. You further acknowledge and
                agree that any dispute, claim, or controversy arising out of or
                relating to the Association Agreement, any governance proposal,
                or the rights and obligations of members or administrators shall
                be submitted exclusively to the Wyoming Chancery Court. In the
                event that the Wyoming Chancery Court declines to exercise
                jurisdiction over any such dispute, the parties agree that such
                dispute shall be resolved exclusively in the District Court of
                Laramie County, Wyoming, or in the United States District Court
                for the District of Wyoming, as appropriate.
              </p>
              <p className="mt-4">
                By becoming a member, you further agree that any dispute, claim,
                or proceeding arising out of or relating to the Association
                Agreement shall be resolved solely on an individual basis. You
                expressly waive any right to participate as a plaintiff or class
                member in any purported class, collective, consolidated, or
                representative action, whether in arbitration or in court. No
                class, collective, consolidated, or representative actions or
                arbitrations shall be permitted, and you expressly waive any
                right to participate in or recover relief under any such action
                or proceeding.
              </p>
            </div>
          </>
        ),
        disclaimer: (
          <p className="text-secondary text-sm opacity-75">
            * DUNA Administration Docs will archive upon the release of the
            first financial statements and tax update.
          </p>
        ),
      },
    },
    { name: "ui/use-dark-theme-styling", enabled: false },
    {
      name: "info/governance-sections",
      enabled: true,
      config: {
        title: "Voting in the Structura",
        sections: [
          {
            id: "voting-process",
            title: "Voting process",
            content: (
              <ul className="list-disc list-outside space-y-2 ml-6">
                <li>
                  In order for a <strong>Governance Proposal</strong> to be
                  enacted, it must:
                  <ul className="list-[circle] list-outside space-y-2 ml-6 mt-2 text-sm leading-relaxed">
                    <li>
                      first be submitted as a <strong>Temp-Check</strong>, which
                      is a five-day period during which <strong>Members</strong>{" "}
                      can utilize their SHAPE token to indicate support for a
                      proposal. In order for a proposal to transition from a{" "}
                      <strong>Temp-Check</strong> to a vote of the membership,
                      the <strong>Temp-Check</strong> must attain the support of
                      5% of the SHAPE tokens in circulation, except as limited
                      by Article 13.
                    </li>
                    <li>
                      upon a successful <strong>Temp-Check</strong>, the{" "}
                      <strong>Governance Proposal</strong> period is open for
                      seven days, during which time
                      <strong> Members</strong> can utilize their SHAPE token to
                      affirm, deny, or participate without voting on the
                      proposal. A proposal:
                      <ul className="list-[square] list-outside space-y-1 ml-6 mt-2 text-sm leading-relaxed">
                        <li>
                          <strong>Passes</strong> if the majority of votes
                          affirm the proposal and 10% of the SHAPE tokens in
                          circulation participate in the vote; and
                        </li>
                        <li>
                          <strong>Fails</strong> if the majority of votes deny
                          the proposal or 10% of the SHAPE tokens in circulation
                          did not participate in the vote.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  A passed <strong>Governance Proposal</strong> can be reverted
                  for further consideration and modification pursuant to Article
                  14 of the Association Agreement if it is determined by the{" "}
                  <strong>Rules Committee</strong> within 3-days of passage to
                  be violative of legal requirements, technically unfeasible, or
                  malicious. If the 3-day period expires without reversion or
                  the <strong>Rules Committee</strong> affirms the{" "}
                  <strong>Governance Proposal</strong>, it is enacted.
                </li>
                <li>
                  Upon enactment of a <strong>Governance Proposal</strong>, any
                  recipients of funds must complete a tax reporting intake
                  through tooling provided by the
                  <strong> Rules Committee Administrator</strong> within 15
                  days, or the payment will expire, and the recipient shall not
                  be eligible to receive the funds absent future{" "}
                  <strong>Governance Proposal</strong>.
                </li>
              </ul>
            ),
          },
          {
            id: "voting-power",
            title: "How voting power works",
            content: (
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-3">
                  <h3 className="text-[16px] font-semibold text-primary">
                    SHAPE on Ethereum Mainnet
                  </h3>
                  <div className="flex flex-col space-y-3">
                    <p>
                      The SHAPE token uses OpenZeppelin&apos;s ERC20Votes. Your
                      tokens do not count as votes until you choose where your
                      voting power should live:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                      <li>
                        <strong>Self-delegate</strong> to vote directly with
                        your own wallet.
                      </li>
                      <li>
                        <strong>Delegate to someone you trust</strong> so they
                        can vote on your behalf.
                      </li>
                    </ul>
                    <p>
                      Either way, you keep full ownership of your tokens.
                      Delegation does not let anyone move your tokens or claim
                      them; it only points your voting power. You can change or
                      revoke delegation at any time by making a new delegation.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-3 border-t border-line pt-6">
                  <h3 className="text-[16px] font-semibold text-primary">
                    Delegating to yourself and others
                  </h3>
                  <div className="flex flex-col space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">Self-Delegation:</h4>
                      <p className="mb-2">
                        Self-delegating activates your voting power so you can
                        vote directly in onchain proposals.
                      </p>
                      <p className="mb-2">
                        <strong>Onchain action:</strong> Call{" "}
                        <code className="bg-wash px-2 py-1 rounded text-sm">
                          delegate(0xYOUR-WALLET-HERE)
                        </code>
                        .
                      </p>
                      <p className="mb-2">
                        After this one-time step (per address, per chain), your
                        votes will track your token balance automatically. No
                        need to repeat unless you later delegate to someone
                        else.
                      </p>
                      <p>Vote directly from your wallet</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Delegate to Other Members:
                      </h4>
                      <p className="mb-2">
                        You can point your voting power to a trusted delegate.
                        This helps active representatives vote on your behalf
                        while you retain token ownership and can re-delegate at
                        any time.
                      </p>
                      <p className="mb-2">
                        You are still a member of the WY DUNA.
                      </p>
                      <p>
                        Under Wyoming&apos;s Decentralized Unincorporated
                        Nonprofit Association Act, a member is someone who may
                        participate in selecting administrators or shaping
                        policies. A membership interest is the voting right
                        defined by those principles, and the Act explicitly
                        contemplates that voting can be administered by smart
                        contracts. Delegating your votes does not transfer your
                        tokens or your membership; it only authorizes another
                        address to cast votes using your voting power.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ],
      },
    },
  ],
});
