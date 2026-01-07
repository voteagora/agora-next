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
      url: "https://x.com/syndicateio",
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
      name: "use-archive-for-proposal-details",
      enabled: true,
    },
    {
      name: "use-daonode-for-proposals",
      enabled: false,
    },
    {
      name: "use-daonode-for-votable-supply",
      enabled: true,
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
      name: "has-eas-oodao",
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
      enabled: false,
    },
    {
      name: "footer/hide-votable-supply",
      enabled: false,
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
      name: "duna-disclosures",
      enabled: true,
      config: {
        content: (
          <>
            <div className="mb-6 font-medium">
              SYNDICATE NETWORK COLLECTIVE - DUNA DISCLOSURES
            </div>

            <div className="font-medium">
              <p className="mt-2">
                By owning the token and participating in the governance of
                Syndicate, you acknowledge and agree that you are electing to
                become a member of a Wyoming Decentralized Unincorporated
                Nonprofit Association (&quot;Association&quot;). Your
                participation is subject to the terms and conditions set forth
                in the Association Agreement. You further acknowledge and agree
                that any dispute, claim, or controversy arising out of or
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
            year-end financial statements and tax update.
          </p>
        ),
      },
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
        text: "Voting power comes from multiple sources: SYND token delegation on Ethereum mainnet, Aerodrome LP positions on Base, and staked balances on Syndicate's L3. All sources are combined to calculate your total voting power.",
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
                      5% of the SYND tokens minted (excludes future emissions),
                      except as limited by Article 13 of the Association
                      Agreement.
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
                          affirm the proposal and 10% of the minted SYND tokens
                          (excludes future emissions) participate in the vote;
                          and
                        </li>
                        <li>
                          <strong>fails</strong> if the majority of votes deny
                          the proposal or 10% of the SYND tokens minted
                          (excludes future emissions) did not participate in the
                          vote.
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
            title: "How voting power works across chains",
            content: (
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-3">
                  <h3 className="text-[16px] font-semibold text-primary">
                    SYND on Ethereum Mainnet
                  </h3>
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
                    <p>
                      This model keeps everyday transfers cheaper and lets
                      governance use reliable onchain snapshots of voting power
                      at specific blocks.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <h3 className="text-[16px] font-semibold text-primary">
                    Delegating to yourself and others
                  </h3>
                  <DelegatingSectionContent />
                </div>
                <div className="flex flex-col space-y-2 border-t border-line pt-6">
                  <h3 className="text-[16px] font-semibold text-primary">
                    SYND staked on Commons
                  </h3>
                  <div className="flex flex-col space-y-3">
                    <p>
                      In addition to Ethereum Mainnet SYND that can be voted via
                      the OZ ERC20Votes standard, the voting power snapshots
                      also recognize staked SYND on Commons Chain. This voting
                      power does not need to be self-delegated, and cannot be
                      delegated to others. It is calculated via a snapshot using
                      the timestamp from the block where the voting period
                      begins. At this time snapshot, any address staked on
                      Commons will have this voting power added to their mainnet
                      voting power to determine total voting power.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 border-t border-line pt-6">
                  <h3 className="text-[16px] font-semibold text-primary">
                    SYND provided as liquidity on Base
                  </h3>
                  <div className="flex flex-col space-y-3">
                    <p>
                      SYND launched via Aerodrome and maintains its deepest DEX
                      liquidity on both Aerodrome basic and concentrated pools.
                      These SYND tokens provide an important service to the
                      community, and as such, voting for SYND in all Aerodrome
                      pools is added to Ethereum Mainnet and Commons staked SYND
                      voting power to sum total voting power. Agora recognizes
                      LP positions that are both staked and unstaked.
                    </p>
                    <p>
                      The following three pools are included in the calculation:
                      <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                        <li>
                          <code>
                            base:0xA6f77321B8726FaAB89B72f28C2603b667448BC2
                          </code>
                        </li>
                        <li>
                          <code>
                            base:0x9dCBB8258e0015d6cB81061b3F5c47D5C5D6188f
                          </code>
                        </li>
                        <li>
                          <code>
                            base:0x50F8F7fFBD70c6C87b1668EEe4E03F5AC057DE3F
                          </code>
                        </li>
                      </ul>
                    </p>
                    <p>
                      Like SYND staked on Commons, users do not need to delegate
                      voting power for Aerodrome LP positions on Base. This
                      voting power is automatically recognized during the
                      snapshot taken at the time of start of any temp check or
                      proposal voting period.
                    </p>
                  </div>
                </div>
              </div>
            ),
          },
        ],
      },
    },
    {
      name: "include-nonivotes",
      enabled: true,
    },
  ],
});
