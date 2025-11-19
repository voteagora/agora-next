import React from "react";
import { TenantUI } from "@/lib/tenant/tenantUI";
// TODO: Replace with actual syndicate assets
import syndicateLogo from "@/assets/tenant/syndicate_logo.svg";
import syndicateHero from "@/assets/tenant/syndicate_hero.svg";
import syndicateSuccess from "@/assets/tenant/syndicate_success.svg";
import syndicatePending from "@/assets/tenant/syndicate_pending.svg";
import syndicateInfoCard1 from "@/assets/tenant/syndicate_info_1.svg";
import syndicateInfoCard2 from "@/assets/tenant/syndicate_info_2.svg";
import syndicateInfoCard3 from "@/assets/tenant/syndicate_info_3.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import DelegatingSectionContent from "@/app/info/components/DelegatingSectionContent";

export const syndicateTenantUIConfig = new TenantUI({
  title: "Syndicate Agora",
  logo: syndicateLogo,
  tokens: [
    {
      address: "0x1bAB804803159aD84b8854581AA53AC72455614E",
      symbol: "SYND",
      decimals: 18,
      name: "Syndicate (ETH)",
      chainId: 1,
    },
    {
      address: "0x11dC28D01984079b7efE7763b533e6ed9E3722B9",
      symbol: "SYND",
      decimals: 18,
      name: "Syndicate (Base)",
      chainId: 8453,
    },
  ],

  assets: {
    success: syndicateSuccess,
    pending: syndicatePending,
    delegate: delegateAvatar,
  },

  organization: {
    title: "Syndicate Network",
  },

  dunaDisclaimers:
    "* DUNA Administration Docs will archive upon the release of the year-end financial statements and tax update.",

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "255 255 255", // #FFFFFF - main background
    wash: "236 237 229", // #ECEDE5 - main background
    line: "200 200 200",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "236 237 229", // #ECEDE5 - header background
    tokenAmountFont: "font-chivoMono",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    infoTabBackground: "#FFFFFF",
    buttonBackground: "#FAFAFA",
    infoSectionBackground: "255 255 255",
    // cardBackground: "#FFFFFF", // removing this for now since this causes text to be white in duna content rendere
    customIconBackground: "#FBFBFB",
    footerBackground: "236 237 229",
    customAboutSubtitle: "About Syndicate Network Collective",
    customIconColor: "#87819F",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    noReportsFound: "Quarterly Reports will be posted on October 15th, 2025.",
    customHeroImageSize: "sm:h-[160px]",
  },

  links: [
    {
      name: "syndicatetwitter",
      title: "Twitter",
      url: "https://x.com/SyndicateProtocol",
    },
    {
      name: "syndicatefarcaster",
      title: "Farcaster",
      url: "https://farcaster.xyz/syndicate",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Syndicate governance",
      description:
        "Syndicate governance is a collective of companies, communities, and token holders working together to steward the future of the Syndicate Network",
      hero: syndicateHero,
      meta: {
        title: "Syndicate Network Collective Governance",
        description:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
        imageTitle: "Syndicate Network Collective Governance",
        imageDescription:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Syndicate delegates",
      description:
        "Syndicate governance is a collective of companies, communities, and token holders working together to steward the future of the Syndicate Network",
      hero: syndicateHero,
      meta: {
        title: "Syndicate Network Collective Governance",
        description:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
        imageTitle: "Syndicate Network Collective Governance",
        imageDescription:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
      },
    },
    {
      route: "proposals",
      title: "Syndicate Network Collective is the home of SYND delegates",
      description:
        "SNC is established as an organizational framework for community engagement, collective decision-making, and innovation. Tokenholders can vote their own tokens through self-delegation or assign voting rights to others through delegation.",
      hero: syndicateHero,
      meta: {
        title: "Syndicate Network Collective Governance",
        description:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
        imageTitle: "Syndicate Network Collective Governance",
        imageDescription:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
      },
    },
    {
      route: "info",
      title: "Welcome to Syndicate Network Collective",
      description:
        "The Syndicate Network Collective, a Wyoming DUNA. Member Dashboard for DUNA documents, onchain proposals, voting and governance.",
      meta: {
        title: "Syndicate Network Collective Governance",
        description:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
        imageTitle: "Syndicate Network Collective Governance",
        imageDescription:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
      },
      links: [
        {
          name: "Syndicate Network",
          title: "Syndicate Network",
          url: "https://docs.syndicate.io/",
          image: syndicateInfoCard1,
        },
        {
          name: "Grants Program",
          title: "Grants Program",
          url: "https://bronze-abundant-swift-398.mypinata.cloud/ipfs/QmSQn9P7LzGPa2RJsTDVMaKPw9UoqJTMRoxJTiABpi6YAR",
          image: syndicateInfoCard2,
        },
        {
          name: "Governance",
          title: "Governance",
          url: "https://www.syndicatecollective.org/",
          image: syndicateInfoCard3,
        },
        {
          name: "Document Archive",
          title: "Document Archive*",
          url: "/document-archive",
          image: syndicateInfoCard3,
        },
      ],
    },
    {
      route: "info/about",
      title: "Syndicate Network Collective Roadmap",
      hero: syndicateHero,
      description:
        "This dashboard is the focal point for information related to the Syndicate Network Collective DUNA. As a taxpaying U.S. entity, it is essential that members are aware of the financial inflows and outflows (and related tax consequences) of the DUNA Treasury in a clear and concise manner.\n\nThe SYND governance token provides the members with ultimate control over how the Treasury should be utilized in support of the Syndicate Network.\n\nThe Syndicate Network Collective is established as an organizational framework for collective decision-making and innovation to pursue the common, nonprofit purpose of providing a foundation for community-aligned platforms to reshape how participation and contribution is valued on the internet.",
      sectionTitle: "Syndicate Network Collective Roadmap",
      tabs: [
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#737373"
            />
          ),
          title: "November 3, 2025",
          description:
            "Token governance is live, with a temp-check and tax reporting intake (via Cowrie – Administrator Services tooling) completed upon passage of the governance proposal.",
        },
      ],
      meta: {
        title: "Syndicate Network Collective Governance",
        description:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
        imageTitle: "Syndicate Network Collective Governance",
        imageDescription:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
      },
    },
    {
      route: "coming-soon",
      title: "Welcome to Syndicate governance",
      description: `Syndicate governance goes live on November 3rd, 2025.
`,
      meta: {
        title: "Syndicate Network Collective Governance",
        description:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
        imageTitle: "Syndicate Network Collective Governance",
        imageDescription:
          "The SNC, an organizational framework for community engagement, collective decision making, and innovation. Member dashboard for DUNA documents, proposals, voting, and governance.",
      },
    },
    {
      route: "grants",
      title: "Syndicate Grants Program",
      description:
        "Apply for grants to support the Syndicate Network ecosystem",
      meta: {
        title: "Syndicate Grants Program",
        description:
          "Apply for grants to support the Syndicate Network ecosystem",
        imageTitle: "Syndicate Grants Program",
        imageDescription:
          "Apply for grants to support the Syndicate Network ecosystem",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "delegation-encouragement",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: false,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "info",
      enabled: true,
    },
    {
      name: "info/governance-charts",
      enabled: false,
    },
    {
      name: "proposal-execute",
      enabled: false,
    },
    {
      name: "proposal-lifecycle",
      enabled: true,
      config: {
        stages: [
          {
            stage: PrismaProposalStage.DRAFTING,
            order: 0,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.AWAITING_SUBMISSION,
            order: 1,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.PENDING,
            order: 2,
            isPreSubmission: false,
          },
          {
            stage: PrismaProposalStage.QUEUED,
            order: 3,
            isPreSubmission: false,
          },
          {
            stage: PrismaProposalStage.EXECUTED,
            order: 4,
            isPreSubmission: false,
          },
        ],
        proposalTypes: [
          {
            type: ProposalType?.BASIC,
            prodAddress: null,
            testnetAddress: null,
          },
        ],
        copy: {
          helperText: `
                ## Proposal checklist
- Make sure that you have simulated and review your transactions before seeking sponsorship.
- Check your markdown previews to ensure you didn't break any links.
- Review your description and make sure it's clear and concise.
- Remember that everything lasts forever onchain, check your spelling and grammar and make this one count. You got this.
`.trim(),
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
      },
    },
    {
      name: "use-archive-for-proposals",
      enabled: true,
    },
    {
      name: "use-daonode-for-proposals",
      enabled: false,
    },
    {
      name: "use-daonode-for-votable-supply",
      enabled: false,
    },
    {
      name: "use-daonode-for-proposal-types",
      enabled: false,
    },
    {
      name: "duna",
      enabled: true,
    },
    {
      name: "forums",
      enabled: true,
    },
    {
      name: "coming-soon",
      enabled: false,
    },
    {
      name: "admin",
      enabled: false,
    },
    {
      name: "snapshotVotes",
      enabled: false,
    },
    {
      name: "coming-soon/show-static-proposals",
      enabled: true,
    },
    {
      name: "hide-governor-settings",
      enabled: true,
    },
    {
      name: "hide-hero",
      enabled: false,
    },
    {
      name: "hide-hero-image",
      enabled: true,
    },
    {
      name: "footer/hide-total-supply",
      enabled: true,
    },
    {
      name: "footer/hide-votable-supply",
      enabled: true,
    },
    {
      name: "footer/hide-changelog",
      enabled: true,
    },
    {
      name: "changelog/simplified-view",
      enabled: true,
    },
    {
      name: "syndicate-hero-content",
      enabled: true,
    },
    {
      name: "duna/use-community-dialogue-label",
      enabled: true,
    },
    {
      name: "syndicate-duna-disclosures",
      enabled: true,
    },
    {
      name: "grants",
      enabled: true,
    },
    {
      name: "grants/intake-form",
      enabled: true,
    },
    {
      name: "easv2-govlessvoting",
      enabled: true,
    },
    {
      name: "syndicate-colours-fix-delegate-pages",
      enabled: true,
    },
    {
      name: "voting-power-info-tooltip",
      enabled: true,
      config: {
        text: "SYND voting power is only coming from Mainnet. In order to get voting power, you must bridge to Mainnet.",
      },
    },
    {
      name: "syndicate-proposals-page-content",
      enabled: false,
    },
    {
      name: "proposals-page-info-banner",
      enabled: true,
      config: {
        text: "Learn more about the voting process",
        link: "/info#voting-process",
        storageKey: "syndicate-voting-process-banner-dismissed",
      },
    },
    {
      name: "use-archive-for-vote-history",
      enabled: false,
    },
    {
      name: "syndicate-voters-page-content",
      enabled: false,
    },
    {
      name: "delegates-page-info-banner",
      enabled: true,
      config: {
        text: "Learn more about voting power & delegation",
        link: "/info#voting-power",
        storageKey: "syndicate-voting-power-banner-dismissed",
      },
    },
    {
      name: "delegates-layout-list",
      enabled: true,
    },
    {
      name: "info/governance-sections",
      enabled: true,
      config: {
        title: "Voting in the Syndicate Collective",
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
                      can utilize their SYND token to indicate support for a
                      proposal. In order for a proposal to transition from a{" "}
                      <strong>Temp-Check</strong> to a vote of the membership,
                      the <strong>Temp-Check</strong> must attain the support of
                      5% of the SYND tokens in circulation, except as limited by
                      Article 13 of the Association Agreement.
                    </li>
                    <li>
                      upon a successful <strong>Temp-Check</strong>, the{" "}
                      <strong>Governance Proposal</strong> period is open for
                      seven days, during which time
                      <strong> Members</strong> can utilize their SYND token to
                      affirm, deny, or participate without voting on the
                      proposal. A proposal:
                      <ul className="list-[square] list-outside space-y-1 ml-6 mt-2 text-sm leading-relaxed">
                        <li>
                          <strong>passes</strong> if the majority of votes
                          affirm the proposal and 10% of the SYND tokens in
                          circulation participate in the vote; and
                        </li>
                        <li>
                          <strong>fails</strong> if the majority of votes deny
                          the proposal or 10% of the SYND tokens in circulation
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
                  <div className="flex flex-col space-y-3">
                    <p>
                      The SYND token uses OpenZeppelin&apos;s ERC20Votes. Your
                      tokens don&apos;t count as votes until you choose where
                      your voting power should live:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                      <li>
                        <strong>Self-delegate</strong> to vote directly from
                        your own wallet.
                      </li>
                      <li>
                        <strong>Delegate to someone you trust</strong> so they
                        can vote on your behalf.
                      </li>
                    </ul>
                    <p>
                      Either way, you keep full ownership of your tokens.
                      Delegation <strong>does not</strong> let anyone move your
                      tokens or claim them; it only points your voting power.
                      You can change or revoke delegation at any time by making
                      a new delegation.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <h3 className="text-[15px] font-semibold text-primary">
                    Why it&apos;s designed this way:
                  </h3>
                  <p>
                    This model keeps everyday transfers cheaper and lets
                    governance use reliable onchain snapshots of voting power at
                    specific blocks.
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: "delegating",
            title: "Delegating to yourself and others",
            content: <DelegatingSectionContent />,
          },
        ],
      },
    },
  ],
});
