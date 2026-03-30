// Using demo assets as placeholder - replace with actual standwithcrypto assets later

import { TenantUI } from "@/lib/tenant/tenantUI";

import SwcBanner from "@/assets/tenant/swc_banner.jpeg";
import StandWithCryptoLogo from "@/assets/tenant/standwithcrypto_logo.svg";
import demoDelegate from "@/assets/tenant/demo_delegate.svg";
import demoDocs from "@/assets/tenant/swc_donate.png";
import demoVision from "@/assets/tenant/swc_optIn.png";
import demoForum from "@/assets/tenant/swc_voterAttestation.png";
import demoDiscord from "@/assets/tenant/swc_tweet.png";

import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

import DelegatingSectionContent from "@/app/info/components/DelegatingSectionContent";

const SWC_ADDITIONAL_DELEGATE_STATEMENT_ADDRESSES = [
  ...new Set(
    [
      "0xcC0B26236AFa80673b0859312a7eC16d2b72C1ea",
      "0x8d5237037A590A2dB531F3CfB8f42605cF306f34",
      "0x4F9CCD8C2d017EaDD0CdAaC6692c9BcD96c92e53",
      "0xA622279f76ddbed4f2CC986c09244262Dba8f4Ba",
      "0x2A169e4fBda18AA291608e7Aa8795271d18099F5",
      "0xF7f8cD8638119d51F963F08f6015d83D39c87768",
      "0xd1cB31b244d5fd46a0d82EA37b26f8480Fa12E58",
      "0x9EAa9188035d131dAe52487253cBF8FF90228d94",
      "0x5eAd0CFb2AcA0a93F1E5977d3a4Dee91f4deB581",
      "0xbd95620227f47BB21C162836D510cC51E79fe2e8",
      "0x9E65064B22dE40fD1232C893Df71022Ce92aC30A",
      "0x0a17024004d0d0b5b5110d5B9E4Fd179Fc99Dc24",
      "0x22f2F5A4eAD6f42761Bf8A7cD340de684A51fc07",
      "0x22EdAAE2Fe5e3AC84D9f25723A4d945D8C4c47aD",
      "0xA4548A273Bc0b08826Dd68CF5a0eaFE24e1CAC65",
      "0x3D055d9ffD7DeceDC5f01EA8eBE6a3e2dF99dfBa",
    ].map((a) => a.toLowerCase() as `0x${string}`)
  ),
] as `0x${string}`[];

export const standwithcryptoTenantUIConfig = new TenantUI({
  title: "Stand With Crypto Governance",
  logo: StandWithCryptoLogo,
  logoSize: "40px",
  assets: {
    success: StandWithCryptoLogo,
    pending: StandWithCryptoLogo,
    delegate: demoDelegate,
  },
  organization: {
    title: "Stand With Crypto Alliance",
  },
  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
    additionalStatementAddresses: SWC_ADDITIONAL_DELEGATE_STATEMENT_ADDRESSES,
  },
  customization: {
    // Approximated from public branding where primary is a strong electric violet
    // https://brandfetch.com/standwithcrypto.org
    primary: "0 0 0",
    secondary: "24 24 27", // dark neutral background
    tertiary: "148 163 184", // slate-ish neutral
    neutral: "248 250 252", // near white background
    wash: "255 255 255",
    line: "226 232 240",
    positive: "34 197 94",
    negative: "220 38 38",
    brandPrimary: "97 0 255", // align to core brand [web:10]
    brandSecondary: "242 242 242",
    footerBackground: "255 255 255",
  },
  links: [
    {
      name: "code-of-conduct",
      title: "Code of Conduct",
      url: "https://www.standwithcrypto.org/about", // use mission / core info [page:1]
    },
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
  ],
  governanceIssues: [
    {
      icon: "piggyBank",
      title: "Grants & funding",
      key: "grants",
    },
    {
      icon: "ballot",
      title: "Policy & advocacy",
      key: "policyAdvocacy",
    },
    {
      icon: "globe",
      title: "Ecosystem growth",
      key: "ecosystemDevelopment",
    },
    {
      icon: "sparks",
      title: "Public goods",
      key: "publicGoods",
    },
    {
      icon: "community",
      key: "communityOrganizing",
      title: "Community organizing",
    },
  ],
  pages: [
    {
      route: "/",
      title: "Stand With Crypto governance hub",
      hero: SwcBanner,
      description:
        "Mobilizing crypto advocates to support clear, common-sense rules so innovation and jobs stay in America.", // mission summary [page:1][web:4][web:5][web:13]
      meta: {
        title: "Stand With Crypto governance",
        description:
          "Home for onchain proposals, voting, and advocacy to protect the future of crypto in America.", // mission framing [page:1][page:2][web:5][web:13]
        imageTitle: "Stand With Crypto governance",
        imageDescription:
          "Take action, vote, and help shape crypto policy in America.",
      },
    },
    {
      route: "delegates",
      title: "Find and delegate to crypto advocates",
      description:
        "Browse leading advocates, review their stances on crypto policy, and delegate your voting power to amplify their impact.", // aligns with advocacy + policymakers focus [page:2][page:1]
      hero: SwcBanner,
      meta: {
        title: "Delegates | Stand With Crypto",
        description:
          "Delegate your voting power to trusted advocates who are fighting for pro-crypto policy and common-sense regulation.", // advocacy focus [page:1][page:2][web:4][web:5][web:13]
        imageTitle: "Crypto advocacy delegates",
        imageDescription:
          "Discover and support delegates who stand up for crypto innovation.",
      },
    },
    {
      route: "proposals",
      title: "Proposals and community decisions",
      description:
        "Review active and past governance proposals that shape how Stand With Crypto organizes, funds advocacy, and engages with policymakers.", // tie to US policy [page:2][page:1]
      hero: SwcBanner,
      meta: {
        title: "Proposals | Stand With Crypto",
        description:
          "Explore and vote on proposals that guide our advocacy strategy, funding, and community priorities.",
        imageTitle: "Onchain governance for advocacy",
        imageDescription:
          "Participate in proposals that influence the future of crypto policy.",
      },
    },
    {
      route: "info",
      title: "How Stand With Crypto works",
      description:
        "Learn how our governance process supports the mission to mobilize 52M American crypto owners into a powerful force.", // directly from mission [page:1][web:5][web:13]
      meta: {
        title: "Governance info | Stand With Crypto",
        description:
          "Understand how voting, delegation, and proposals support pro-crypto policy and keep innovation in America.", // mission framing [page:1][page:2]
        imageTitle: "Stand With Crypto governance overview",
        imageDescription:
          "How the community organizes to protect the future of crypto.",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://www.standwithcrypto.org", // placeholder: main hub [page:2]
          image: demoDiscord,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://www.standwithcrypto.org", // placeholder until forums URL exists
          image: demoForum,
        },
        {
          name: "Policy & mission",
          title: "Policy & mission",
          url: "https://www.standwithcrypto.org/about", // mission page [page:1]
          image: demoDocs,
        },
        {
          name: "Vision for crypto in America",
          title: "Vision for crypto in America",
          url: "https://www.standwithcrypto.org/about", // America needs crypto section [page:1]
          image: demoVision,
        },
      ],
    },
    {
      route: "info/about",
      title: "About Stand With Crypto",
      hero: SwcBanner,
      description:
        "Stand With Crypto is a 501(c)(4) nonprofit alliance mobilizing the 52 million American crypto owners to fight for clear, common-sense regulation and keep crypto innovation in America.", // concise about text [page:1][web:4][web:5][web:8][web:13]
      meta: {
        title: "About Stand With Crypto",
        description:
          "Learn how Stand With Crypto organizes advocates, engages policymakers, and pushes for regulatory clarity so America leads in crypto and web3.", // from “America needs crypto” section [page:1]
        imageTitle: "Stand With Crypto Alliance",
        imageDescription:
          "A grassroots movement to protect crypto’s future in America.",
      },
    },
    {
      route: "grants",
      title: "Advocacy grants program",
      description:
        "Apply for grants that support education, organizing, and advocacy aligned with Stand With Crypto’s mission.", // extrapolated governance grants for advocacy [page:1][web:13]
      meta: {
        title: "Stand With Crypto grants",
        description:
          "Funding for projects that mobilize advocates, inform policymakers, and keep crypto innovation in America.",
        imageTitle: "Stand With Crypto grants",
        imageDescription:
          "Support projects that advance pro-crypto policy and education.",
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

- Make sure that you have simulated and reviewed your transactions before seeking sponsorship.
- Check your markdown previews to ensure you didn't break any links.
- Review your description and make sure it's clear and concise.
- Remember that everything lasts forever onchain. Check your spelling and grammar and make this one count.
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
      enabled: false,
    },
    {
      name: "use-daonode-for-proposal-types",
      enabled: false,
    },
    {
      name: "duna",
      enabled: false,
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
      name: "include-nonivotes",
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
      enabled: false,
    },
    {
      name: "duna/use-community-dialogue-label",
      enabled: false,
    },
    {
      name: "duna-disclosures",
      enabled: false,
      config: {
        content: (
          <>
            <div className="mb-6 font-medium">DUNA DISCLOSURES</div>
            <div className="font-medium">
              <p className="mt-2">
                By owning the token and participating in governance, you
                acknowledge and agree that you are electing to become a member
                of a Wyoming Decentralized Unincorporated Nonprofit Association
                (&quot;Association&quot;). Your participation is subject to the
                terms and conditions set forth in the Association Agreement. You
                further acknowledge and agree that any dispute, claim, or
                controversy arising out of or relating to the Association
                Agreement, any governance proposal, or the rights and
                obligations of members or administrators shall be submitted
                exclusively to the Wyoming Chancery Court. In the event that the
                Wyoming Chancery Court declines to exercise jurisdiction over
                any such dispute, the parties agree that such dispute shall be
                resolved exclusively in the District Court of Laramie County,
                Wyoming, or in the United States District Court for the District
                of Wyoming, as appropriate.
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
      name: "show-delegate-badges",
      enabled: true,
    },
    {
      name: "grants",
      enabled: false,
    },
    {
      name: "grants/intake-form",
      enabled: false,
    },
    {
      name: "easv2-govlessvoting",
      enabled: true,
    },
    {
      name: "syndicate-colours-fix-delegate-pages",
      enabled: false,
    },
    {
      name: "syndicate-proposals-page-content",
      enabled: false,
    },
    {
      name: "proposals-page-info-banner",
      enabled: true,
      config: {
        text: "Learn how proposals support pro-crypto advocacy",
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
        text: "Learn more about voting power, delegation, and advocacy",
        link: "/info#voting-power",
        storageKey: "syndicate-voting-power-banner-dismissed",
      },
    },
    {
      name: "delegates-layout-list",
      enabled: false,
    },
    {
      name: "info/governance-sections",
      enabled: true,
      config: {
        title: "Voting in Stand With Crypto",
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
                      can utilize their governance token to indicate support for
                      a proposal.
                    </li>
                    <li>
                      upon a successful <strong>Temp-Check</strong>, the{" "}
                      <strong>Governance Proposal</strong> period is open for
                      seven days, during which time <strong>Members</strong> can
                      vote to affirm, deny, or participate without voting on the
                      proposal.
                      <ul className="list-[square] list-outside space-y-1 ml-6 mt-2 text-sm leading-relaxed">
                        <li>
                          <strong>passes</strong> if the majority of votes
                          affirm the proposal and the required participation
                          threshold is met; and
                        </li>
                        <li>
                          <strong>fails</strong> if the majority of votes deny
                          the proposal or the participation threshold is not
                          met.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  A passed <strong>Governance Proposal</strong> can be reverted
                  for further consideration and modification if it is determined
                  to be legally non-compliant, technically unfeasible, or
                  malicious.
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
                      The governance token uses OpenZeppelin&apos;s ERC20Votes.
                      Your tokens don&apos;t count as votes until you choose
                      where your voting power should live:
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
