import React from "react";
import { TenantUI, type UITaxFormConfig } from "@/lib/tenant/tenantUI";
import townsLogo from "@/assets/tenant/towns_logo.svg";
import townsHero from "@/assets/tenant/towns_hero.svg";
import townsSuccess from "@/assets/tenant/towns_success.svg";
import townsPending from "@/assets/tenant/towns_pending.svg";
import townsInfoHero from "@/assets/tenant/towns_hero.svg";
import townsInfoCard1 from "@/assets/tenant/towns_info_1.svg";
import townsInfoCard2 from "@/assets/tenant/towns_info_2.svg";
import townsInfoCard3 from "@/assets/tenant/towns_info_3.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import DelegatingSectionContent from "@/app/info/components/DelegatingSectionContent";

export const townsTenantUIConfig = new TenantUI({
  title: "Towns Lodge",
  logo: townsLogo,
  logoSize: "36px",
  tokens: [
    {
      address: "0x000000Fa00b200406de700041CFc6b19BbFB4d13",
      symbol: "TOWNS",
      decimals: 18,
      name: "Towns (ETH)",
      chainId: 1,
    },
    {
      address: "0x00000000A22C618fd6b4D7E9A335C4B96B189a38",
      symbol: "TOWNS",
      decimals: 18,
      name: "Towns (Base)",
      chainId: 8453,
    },
  ],
  hideAgoraBranding: true,

  assets: {
    success: townsSuccess,
    pending: townsPending,
    delegate: delegateAvatar,
  },

  customization: {
    primary: "255 255 255",
    secondary: "222 220 229",
    tertiary: "135 129 159",
    neutral: "23 20 34",
    wash: "23 20 34",
    line: "43 36 73",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "31 234 154", // #31EA9A
    brandSecondary: "23 20 34",
    tokenAmountFont: "font-chivoMono",
    infoSectionBackground: "30 26 47", // #1E1A2F
    headerBackground: "30 26 47", // #1E1A2F
    infoTabBackground: "19 12 47", // #130C2F
    buttonBackground: "25 16 62", // #19103E
    cardBackground: "30 26 47", // #1E1A2F
    cardBorder: "43 36 73", // #2B2449
    hoverBackground: "42 35 56", // #2A2338
    textSecondary: "135 129 159", // #87819F
    footerBackground: "19 12 47", // #130C2F
    innerFooterBackground: "19 12 47", // #130C2F
    tagBackground: "#3A3454",
    infoBannerBackground: "#1E1A2F",
    customHeroImageSize: "w-auto h-auto",
    customIconBackground: "bg-transparent",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    customAboutSubtitle: "About Towns Lodge",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    customIconColor: "#87819F",
    customButtonBackground: "#130C2F",
    customHeroTitleWidth: "max-w-none",
  },

  theme: "dark",

  dunaDisclaimers:
    "* DUNA Administration Docs will archive upon the release of the year-end financial statements and tax update.",

  organization: {
    title: "Towns Lodge",
  },

  links: [
    {
      name: "townstwitter",
      title: "Twitter",
      url: "https://x.com/TownsProtocol",
    },
    {
      name: "townsfarcaster",
      title: "Farcaster",
      url: "https://farcaster.xyz/towns",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Towns Lodge Governance",
      description:
        "Towns is experimenting with minimal, onchain governance. This page is the canonical home for Towns governance info.",
      hero: townsHero,
      meta: {
        title: "Towns Lodge Agora",
        description: "Home of Towns Lodge governance",
        imageTitle: "Towns Lodge Agora",
        imageDescription: "Home of Towns Lodge governance",
      },
    },
    {
      route: "proposals",
      title: "Towns Lodge Proposals",
      description:
        "Towns Lodge is established as an organizational framework for community engagement, collective decision-making, and innovation. Tokenholders can vote their own tokens through self-delegation or assign voting rights to others through delegation.",
      meta: {
        title: "Towns Lodge Proposals",
        description: "View and vote on Towns Lodge proposals",
        imageTitle: "Towns Lodge Proposals",
        imageDescription: "View and vote on Towns Lodge proposals",
      },
    },
    {
      route: "info",
      title: "Welcome to\nTowns Lodge",
      description:
        "Your home for information about Towns Lodge, a Wyoming DUNA.\nMember dashboard for DUNA documents, onchain proposals, voting and governance.",
      hero: townsHero,
      links: [
        {
          name: "Deploy a vault",
          title: "Towns Lodge",
          url: "https://docs.towns.com",
          image: townsInfoCard1,
        },
        {
          name: "Governance Forums",
          title: "Governance",
          url: "/proposals",
          image: townsInfoCard2,
        },
        {
          name: "Protocol Docs",
          title: "Document Archive*",
          url: "/document-archive",
          image: townsInfoCard3,
        },
      ],
      meta: {
        title: "Towns Lodge Agora",
        description: "Home of Towns Lodge governance",
        imageTitle: "Towns Lodge Agora",
        imageDescription: "Home of Towns Lodge governance",
      },
    },
    {
      route: "delegates",
      title: "Towns Lodge Delegates",
      description:
        "Towns Lodge is established as an organizational framework for community engagement, collective decision-making, and innovation. Tokenholders can vote their own tokens through self-delegation or assign voting rights to others through delegation.",
      meta: {
        title: "Towns Lodge Delegates",
        description: "Delegate your voting power in Towns Lodge",
        imageTitle: "Towns Lodge Delegates",
        imageDescription: "Delegate your voting power in Towns Lodge",
      },
    },
    {
      route: "info/about",
      title: "Towns Lodge Roadmap",
      hero: townsInfoHero,
      description:
        "This dashboard is the focal point for information related to the Towns Lodge DUNA.  As a tax-paying U.S. entity, it is essential that members are aware of the financial inflows and outflows (and related tax consequences) of the DUNA Treasury in a clear and concise manner.\n\nThe Towns Lodge is supported by both a Swiss Association and the Towns Lodge DUNA – with the TOWNS governance token providing the members ultimate control over how the Treasury should be utilized.  While the initial funding of the Swiss Association allows it to operate within established parameters, its role and funding will ultimately be decided by the members of the DUNA who, through their voting power, control whether to extend additional funding to the Swiss Association, redirect that funding to another entity, or take on more responsibilities within the DUNA.\n\nThe DUNA Governance does not go live until January 1, 2026, to allow the members of the community time to familiarize themselves with the Swiss Association and the Protocol.",
      sectionTitle: "Towns Lodge Roadmap",
      tabs: [
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#87819F"
            />
          ),
          title: "January 1, 2026",
          description:
            "Token governance is live, with a temperature check and tax reporting intake (via Cowrie – Administrator Services tooling) completed before a proposal is brought to a final vote.",
        },
      ],
      meta: {
        title: "About Towns Lodge",
        description:
          "Learn about Towns Lodge and decentralized community governance",
        imageTitle: "About Towns Lodge",
        imageDescription:
          "Learn about Towns Lodge and decentralized community governance",
      },
    },
    {
      route: "coming-soon",
      title: "Towns Lodge governance goes live on January 1, 2026.",
      description: "",
      hero: townsHero,
      meta: {
        title: "Towns Lodge Governance",
        description: "Towns Lodge governance coming soon",
        imageTitle: "Towns Lodge Governance",
        imageDescription: "Towns Lodge governance coming soon",
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
      name: "tax-form",
      enabled: false,
      config: {
        payeeFormUrl: "http://cowrie.io/tax",
        provider: "cowrie",
      } as UITaxFormConfig,
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
      enabled: false,
    },
    {
      name: "hide-governor-settings",
      enabled: true,
    },
    {
      name: "hide-hero",
      enabled: true,
    },
    {
      name: "hide-hero-image",
      enabled: true,
    },
    {
      name: "towns-hero-content",
      enabled: true,
    },
    {
      name: "duna/use-community-dialogue-label",
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
      name: "footer/hide-votable-supply",
      enabled: true,
    },
    {
      name: "easv2-govlessvoting",
      enabled: true,
    },
    {
      name: "voting-power-info-tooltip",
      enabled: true,
      config: {
        text: "Voting power comes from multiple sources: TOWNS token delegation on Base, and TOWNS token delegation on Ethereum mainnet. All sources are combined to calculate your total voting power.",
      },
    },
    {
      name: "proposals-page-info-banner",
      enabled: true,
      config: {
        text: "Learn more about the voting process",
        link: "/info#voting-process",
        storageKey: "towns-voting-process-banner-dismissed",
      },
    },
    {
      name: "use-archive-for-vote-history",
      enabled: false,
    },
    {
      name: "delegates-page-info-banner",
      enabled: true,
      config: {
        text: "Learn more about voting power & delegation",
        link: "/info#voting-power",
        storageKey: "towns-voting-power-banner-dismissed",
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
        title: "Voting in Towns Lodge",
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
                      can utilize their TOWNS token to indicate support for a
                      proposal. In order for a proposal to transition from a{" "}
                      <strong>Temp-Check</strong> to a vote of the membership,
                      the <strong>Temp-Check</strong> must attain the support of
                      5% of the TOWNS tokens minted (excludes future emissions),
                      except as limited by Article 13 of the Association
                      Agreement.
                    </li>
                    <ul>
                      <li>
                        Towns Node Operators are able to submit proposals
                        directly as Governance Proposals (thereby skipping the
                        Temp-Check) by connecting a wallet containing a Towns
                        Node Operator NFT.
                      </li>
                    </ul>
                    <li>
                      upon a successful <strong>Temp-Check</strong>, the{" "}
                      <strong>Governance Proposal</strong> period is open for
                      seven days, during which time
                      <strong> Members</strong> can utilize their TOWNS token to
                      affirm, deny, or participate without voting on the
                      proposal. A proposal:
                      <ul className="list-[square] list-outside space-y-1 ml-6 mt-2 text-sm leading-relaxed">
                        <li>
                          <strong>passes</strong> if the majority of votes
                          affirm the proposal and 10% of the minted TOWNS tokens
                          (excludes future emissions) participate in the vote;
                          and
                        </li>
                        <li>
                          <strong>fails</strong> if the majority of votes deny
                          the proposal or 10% of the TOWNS tokens minted
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
                    TOWNS on Ethereum Mainnet
                  </h3>
                  <div className="flex flex-col space-y-3">
                    <p>
                      The TOWNS token uses OpenZeppelin&apos;s ERC20Votes. Your
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
              </div>
            ),
          },
        ],
      },
    },
    {
      name: "ui/use-dark-theme-styling",
      enabled: true,
    },
    {
      name: "include-nonivotes",
      enabled: true,
    },
    {
      name: "duna-disclosures",
      enabled: true,
      config: {
        content: (
          <>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px] mb-4">
              TOWNS LODGE – DUNA DISCLOSURES
            </div>

            <div className="space-y-6 text-justify">
              <div>
                <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
                  By owning the token and participating in the governance of
                  Towns Lodge, you acknowledge and agree that you are electing
                  to become a member of a Wyoming Decentralized Unincorporated
                  Nonprofit Association (&ldquo;Association&rdquo;). Your
                  participation is subject to the terms and conditions set forth
                  in the Association Agreement. You further acknowledge and
                  agree that any dispute, claim, or controversy arising out of
                  or relating to the Association Agreement, any governance
                  proposal, or the rights and obligations of members or
                  administrators shall be submitted exclusively to the Wyoming
                  Chancery Court. In the event that the Wyoming Chancery Court
                  declines to exercise jurisdiction over any such dispute, the
                  parties agree that such dispute shall be resolved exclusively
                  in the District Court of Laramie County, Wyoming, or in the
                  United States District Court for the District of Wyoming, as
                  appropriate.
                </div>
              </div>

              <div>
                <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
                  By becoming a member, you further agree that any dispute,
                  claim, or proceeding arising out of or relating to the
                  Association Agreement shall be resolved solely on an
                  individual basis. You expressly waive any right to participate
                  as a plaintiff or class member in any purported class,
                  collective, consolidated, or representative action, whether in
                  arbitration or in court. No class, collective, consolidated,
                  or representative actions or arbitrations shall be permitted,
                  and you expressly waive any right to participate in or recover
                  relief under any such action or proceeding.
                </div>
              </div>
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
  ],
});

// Custom content component for towns coming-soon page
export function TownsComingSoonContent() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-wash border border-line rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">
          🏗️ Governance Infrastructure
        </h3>
        <p className="text-secondary mb-4">
          Towns Lodge is currently setting up its governance infrastructure.
          Proposal functionality will be available soon as the protocol evolves.
        </p>
        <ul className="text-secondary space-y-2">
          <li>• Minimal onchain governance design</li>
          <li>• Community-driven decision making</li>
          <li>• Transparent proposal process</li>
        </ul>
      </div>

      <div className="bg-wash border border-line rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">
          📋 What&apos;s Coming
        </h3>
        <p className="text-secondary mb-4">
          The Towns governance system will include:
        </p>
        <ul className="text-secondary space-y-2">
          <li>• Proposal creation and submission</li>
          <li>• Community voting mechanisms</li>
          <li>• Delegation system</li>
          <li>• Execution and implementation</li>
        </ul>
      </div>
    </div>
  );
}
