import { TenantUI } from "@/lib/tenant/tenantUI";
import React from "react";
import uniswapHero from "@/assets/tenant/uniswap_hero.svg";
import uniswapLogo from "@/assets/tenant/uniswap_logo.svg";
import successImage from "@/assets/tenant/uniswap_success.svg";
import pendingImage from "@/assets/tenant/uniswap_pending.svg";
import delegateImage from "@/assets/tenant/uniswap_delegate.svg";
import infoPageCard01 from "@/assets/tenant/uniswap_info_1.png";
import infoPageCard02 from "@/assets/tenant/uniswap_info_2.png";
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
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "255 255 255",
    tokenAmountFont: "font-chivoMono",
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
      title: "Uniswap Protocol Governance",
      description:
        "Uniswap is a public good owned and governed by UNI token holders.",
      meta: {
        title: "Uniswap Protocol Governance",
        description:
          "Uniswap is a public good owned and governed by UNI token holders.",
        imageTitle: "Uniswap Protocol Governance",
        imageDescription:
          "Uniswap is a public good owned and governed by UNI token holders.",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://discord.com/invite/FCfyBSbCU5",
          image: infoPageCard01,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://gov.uniswap.org",
          image: infoPageCard02,
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
      ],
    },
    {
      route: "info/about",
      title: "About Uniswap",
      hero: infoPageHero,
      description:
        "The Uniswap protocol is a peer-to-peer system designed for exchanging cryptocurrencies. The protocol is implemented as a set of persistent, non-upgradable smart contracts; designed to prioritize censorship resistance, security, self-custody, and to function without any trusted intermediaries who may selectively restrict access. The Uniswap Protocol is a public good owned and governed by UNI token holders.",
      meta: {
        title: "Uniswap Protocol Governance",
        description:
          "Uniswap is a public good owned and governed by UNI token holders.",
        imageTitle: "Uniswap Protocol Governance",
        imageDescription:
          "Uniswap is a public good owned and governed by UNI token holders.",
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
      enabled: true,
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
  ],
});
