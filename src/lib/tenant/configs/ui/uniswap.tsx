import { TenantUI } from "@/lib/tenant/tenantUI";
import React from "react";
import uniswapHero from "@/assets/tenant/uniswap_hero.svg";
import uniswapLogo from "@/assets/tenant/uniswap_duni.svg";
import successImage from "@/assets/tenant/uniswap_success.svg";
import pendingImage from "@/assets/tenant/uniswap_pending.svg";
import delegateImage from "@/assets/tenant/uniswap_delegate.svg";
import infoPageCard01 from "@/assets/tenant/uniswap_info_1.png";
import infoPageCard02 from "@/assets/tenant/uniswap_info_2.svg";
import infoPageCard03 from "@/assets/tenant/uniswap_info_3.png";
import infoPageCard04 from "@/assets/tenant/uniswap_info_4.png";
import infoPageHero from "@/assets/tenant/uniswap_info_hero.png";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const uniswapTenantUIConfig = new TenantUI({
  title: "Uniswap Agora",
  logo: uniswapLogo,
  logoSize: "16",
  documentColors: ["#E34FB9", "#A83B89", "#754166", "#5C3C53"],
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.UNISWAP)],

  googleAnalytics: "G-KBG8GS1R45",

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Uniswap Foundation",
  },

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "250 250 250",
    wash: "255 255 255",
    line: "229 229 229",
    infoBannerBackground: "#E134B0",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "255 255 255",
    tokenAmountFont: "font-chivoMono",
    customAboutSubtitle: "About DUNI",
    heroCardGradient: { from: "#FC72FF", to: "#F50DB4" },
  },

  links: [
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
    {
      name: "code-of-conduct",
      title: "Delegate Code of Conduct",
      url: "https://gov.uniswap.org/t/rfc-delegate-code-of-conduct/20913",
    },
    {
      name: "dao-principles",
      title: "Uniswap DAO Principles",
      url: "https://vote.uniswapfoundation.org/proposals/78#uniswap-dao-principles",
    },
  ],

  governanceStakeholders: [
    { title: "Builder", key: "builder" },
    { title: "Community member", key: "communityMember" },
    { title: "Liquidity provider", key: "lp" },
    { title: "Prof. Gov. Contributor", key: "govParticipant" },
    { title: "Trader", key: "trader" },
    { title: "Researcher", key: "researcher" },
    { title: "Other", key: "other" },
  ],

  governanceIssues: [
    {
      icon: "stack",
      title: "Cross chain deployments",
      key: "crossChain",
    },
    {
      icon: "piggyBank",
      title: "Fee switch",
      key: "feeSwitch",
    },
    {
      icon: "piggyBank",
      title: "Fee tiers",
      key: "feeTiers",
    },
    {
      icon: "measure",
      title: "Mechanism design",
      key: "mechanismDesign",
    },
    {
      icon: "ballot",
      title: "Meta governance",
      key: "metaGovernance",
    },
    {
      icon: "sparks",
      title: "Public goods",
      key: "publicGoods",
    },
    {
      icon: "community",
      key: "daoWorkingGroups",
      title: "DAO working groups",
    },
    {
      icon: "chatBubble",
      key: "other",
      title: "Other",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Uniswap governance",
      description:
        "Uniswap governance is a collective of companies, communities, and token holders working together to steward the future of the Uniswap protocol",
      hero: uniswapHero,
      meta: {
        title: "Uniswap Agora",
        description: "Home of token governance",
        imageTitle: "Uniswap Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Uniswap delegates",
      description:
        " Uniswap governance is a collective of companies, communities, and token holders working together to steward the future of the Uniswap protocol",
      hero: uniswapHero,
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Voter on Agora",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Uniswap delegates",
      description:
        "Uniswap governance is a collective of companies, communities, and token holders working together to steward the future of the Uniswap protocol",
      hero: uniswapHero,
      meta: {
        title: "Uniswap Agora",
        description: "Home of token governance",
        imageTitle: "Uniswap Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Welcome to DUNI",
      description: "",
      meta: {
        title: "Welcome to DUNI",
        description: "",
        imageTitle: "Welcome to DUNI",
        imageDescription: "",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://discord.com/invite/FCfyBSbCU5",
          image: infoPageCard01,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://docs.uniswap.org",
          image: infoPageCard03,
        },
        {
          name: "Uniswap Labs",
          title: "Uniswap Labs",
          url: "https://x.com/Uniswap",
          image: infoPageCard04,
        },
        {
          name: "Document Archive",
          title: "Document Archive",
          url: "/document-archive",
          image: infoPageCard02,
        },
      ],
    },
    {
      route: "info/about",
      title: "About DUNI",
      hero: infoPageHero,
      description:
        "This dashboard provides information related to DUNI, a Wyoming Decentralized Unincorporated Nonprofit Association.  As a taxpaying U.S. entity, it is essential that members are aware of the financial inflows and outflows (and related tax consequences) of the DUNA Treasury in a clear and concise manner.\n\nThe UNI token governance token provides members with control over how the Treasury should be utilized in support of the Uniswap Protocol, as well as other limited protocol-specific parameters.\n\nDUNI is established as an organizational framework for community engagement and collective decision-making to purse the development and acceleration of decentralized financial systems.",
      meta: {
        title: "Welcome to DUNI",
        description: "",
        imageTitle: "Welcome to DUNI",
        imageDescription: "",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "delegates/code-of-conduct",
      enabled: true,
    },
    {
      name: "delegates/dao-principles",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "delegates/my-delegates-filter",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "staking",
      enabled: false,
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
      name: "sponsoredVote",
      enabled: true,
      config: {
        sponsorAddress:
          process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
            ? "0xc1B333d56Af681F4Db3194F8Dc6cEdF860a8c950"
            : "0xaA8cdaE56695d3E4e082F28c37209bACd6B09779",
        minBalance: "0.1",
        minVPToUseGasRelay: "10",
      },
    },
    {
      name: "sponsoredDelegate",
      enabled: true,
      config: {
        sponsorAddress:
          process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
            ? "0xc1B333d56Af681F4Db3194F8Dc6cEdF860a8c950"
            : "0xaA8cdaE56695d3E4e082F28c37209bACd6B09779",
        minBalance: "0.1",
        minVPToUseGasRelay: "10",
      },
    },
    {
      name: "proposal-execute",
      enabled: true,
    },
    {
      name: "email-subscriptions",
      enabled: true,
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

  **1. Create your proposal**

  Get started by drafting your proposal directly in the Uniswap governance interface. Clearly outline your objectives, provide supporting details, and ensure your proposal aligns with Uniswap's governance standards.

  **2. Request sponsorship (if threshold not met)**

  If you don't meet the required voting power threshold, you can request sponsorship from existing delegates. This allows your proposal to gain visibility and the necessary backing from the community.

  **3. Submit as waiting for sponsorship**

  If you don't have the voting power to post the proposal yourself, you can request a delegate with enough voting power to sponsor it. The delegate you choose can review your proposal and choose to sponsor it if they support it, pushing it onchain for voting. One note - you should coordinate with sponsor delegates so they know you're looking for sponsorship!

  **4. Submit onchain (If threshold met)**

  If you meet the voting power threshold, you can bypass the sponsorship phase and submit it onchain directly. This fast-tracks your proposal to the voting stage, giving the community the opportunity to decide on its implementation.
  `.trim(),
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
        allowDraftSharing: true,
      },
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
      name: "show-participation",
      enabled: true,
    },
    {
      name: "duna",
      enabled: true,
    },
    {
      name: "forums",
      enabled: false,
    },
    {
      name: "hide-info-tabs",
      enabled: true,
    },
    {
      name: "hide-hero-image",
      enabled: true,
    },
    {
      name: "use-archive-for-vote-history",
      enabled: false,
    },
    {
      name: "duna-description",
      enabled: true,
      config: {
        content: (
          <>
            As of September 9th, 2025, Uniswap Governance adopted a
            Wyoming-registered Decentralized Unincorporated Nonprofit
            Association (DUNA) as the legal structure for the Uniswap Governance
            Protocol. This new legal entity, called &quot;DUNI&quot;, was
            purpose-built to preserve Uniswap&apos;s decentralized governance
            structure while enabling engagement with the offchain world. Learn
            more about the DUNA formation at{" "}
            <a
              href="https://uniswapfoundation.org/duni"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              uniswapfoundation.org/duni
            </a>
            .
          </>
        ),
      },
    },
    {
      name: "duna-disclosures",
      enabled: true,
      config: {
        content: (
          <>
            <div className="mb-6">DUNI Disclosures</div>

            <div>
              <p className="mt-2">
                By owning the token and engaging in the Uniswap Governance
                Protocol, you acknowledge and agree that you are electing to
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

              <p className="mt-2">
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
      },
    },
    {
      name: "duna/financial-statements",
      enabled: true,
      config: {
        title: "DUNI Updates",
      },
    },
  ],
});
