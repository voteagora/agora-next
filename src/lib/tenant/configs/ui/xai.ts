import { TenantUI } from "@/lib/tenant/tenantUI";
import xaiLogo from "@/assets/tenant/xai_logo.svg";
import xaiHero from "@/assets/tenant/xai_hero.svg";
import successImage from "@/assets/tenant/xai_success.svg";
import pendingImage from "@/assets/tenant/xai_pending.svg";
import delegateImage from "@/assets/tenant/xai_logo.svg";
import infoPageCard01 from "@/assets/tenant/xai_info_1.svg";
import infoPageCard02 from "@/assets/tenant/xai_info_2.svg";
import infoPageCard03 from "@/assets/tenant/xai_info_3.svg";
import infoPageCard04 from "@/assets/tenant/xai_info_4.svg";
import infoPageHero from "@/assets/tenant/xai_info_page_hero.svg";

import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

const PROPOSAL_PAGE_TEXT =
  "Governance decisions are initiated as proposals, providing insights into the priorities of the community. Proposals can be submitted for community discussion in Xai Discord in the #ecosystem-proposals channel.  Proposals are voted on by delegates. Voting power is given to delegates based on XAI + esXAI + staked esXAI. We aggregate each of these to calculate vXAI";
const ROOT_PAGE_TEXT = PROPOSAL_PAGE_TEXT;
const DELEGATE_PAGE_TEXT = `Delegates represent the Xai ecosystem, guiding governance decisions on behalf of Xai token holders to ensure the platform evolves in line with community priorities.  Voting power is based on owned XAI + esXAI + staked esXAI. We aggregate each of these to calculate vXAI.`;
const INFO_PAGE_TEXT = `Xai Gov is the home of Xai DAO governance, where Xai tokenholders delegate, vote, and make decisions to steward the future of the ecosystem.  Voting power is based on owned XAI + esXAI + staked esXAI. We aggregate each of these to calculate vXAI.`;

const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";

const prodTokens = [
  {
    address: "0x4cb9a7ae498cedcbb5eae9f25736ae7d428c9d66",
    symbol: "XAI",
    decimals: 18,
    name: "XAI",
  },
  {
    address: "0x4c749d097832de2fecc989ce18fdc5f1bd76700c",
    symbol: "esXAI",
    decimals: 18,
    name: "esXAI",
  },
  {
    address: "0xab5c23bdbe99d75a7ae4756e7ccefd0a97b37e78",
    symbol: "stXAI",
    decimals: 18,
    name: "stXAI",
  },
];

export const xaiTenantUIConfig = new TenantUI({
  title: "Xai Agora",
  logo: xaiLogo,
  tokens: [
    ...(isProd ? prodTokens : []),
    TenantTokenFactory.create(TENANT_NAMESPACES.XAI),
  ],
  googleAnalytics: "G-BSFWRZVGEB",

  assets: {
    success: successImage as unknown as string,
    pending: pendingImage as unknown as string,
    delegate: delegateImage,
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "250 250 249",
    secondary: "245 245 255",
    tertiary: "231 229 228",
    neutral: "12 10 9",
    wash: "28 25 23",
    line: "41 37 36",
    positive: "34 197 94",
    negative: "239 68 68",
    brandPrimary: "255 0 48",
    brandSecondary: "12 10 9",
    font: "font-rajdhani",
    letterSpacing: "0.02em",
  },

  theme: "dark",

  tacticalStrings: {
    myBalance: "My XAI + esXAI (incl. Staked) balance",
  },

  // TODO
  governanceIssues: [
    // {
    //   icon: "banknotes",
    //   title: "Treasury management",
    //   key: "treasury",
    // },
  ],

  organization: {
    title: "Xai",
  },

  links: [
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.com/invite/xaigames",
    },
  ],

  pages: [
    {
      route: "/",
      title: "WELCOME TO XAI GOVERNANCE",
      description: ROOT_PAGE_TEXT,
      hero: xaiHero,
      meta: {
        title: "Xai Agora",
        description: ROOT_PAGE_TEXT,
        imageTitle: "Xai Agora",
        imageDescription: ROOT_PAGE_TEXT,
      },
    },
    {
      route: "proposals",
      title: "WELCOME TO XAI GOVERNANCE",
      description: PROPOSAL_PAGE_TEXT,
      hero: xaiHero,
      meta: {
        title: "Xai Agora",
        description: PROPOSAL_PAGE_TEXT,
        imageTitle: "Xai Agora",
        imageDescription: PROPOSAL_PAGE_TEXT,
      },
    },
    {
      route: "delegates",
      title: "WELCOME TO XAI GOVERNANCE",
      description: DELEGATE_PAGE_TEXT,
      hero: xaiHero,
      meta: {
        title: "Voter on Agora",
        description: DELEGATE_PAGE_TEXT,
        imageTitle: "Voter on Agora",
        imageDescription: DELEGATE_PAGE_TEXT,
      },
    },
    {
      route: "info/about",
      title: "About Xai",
      hero: infoPageHero,
      description:
        "Xai is the world's first Layer 3 solution for Indie gaming. Powered by Offchain Labs' Arbitrum Technology with games from Ex Populus and other game developers, Xai is set to transform the gaming industry. Join the community, compete with the best, and be part of the revolutionary Vanguard League.",
      meta: {
        title: "About Xai Governance",
        description: "Home of Xai Governance",
        imageTitle: "About Xai Governance",
        imageDescription: "Home of Xai Governance",
      },
    },
    {
      route: "info",
      title: "WELCOME TO THE XAI COMMUNITY",
      description: INFO_PAGE_TEXT,
      meta: {
        title: "Xai Governance",
        description: "Home of Xai Governance",
        imageTitle: "Xai Governance",
        imageDescription: "Home of Xai Governance",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://discord.com/invite/xaigames",
          image: infoPageCard01,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://discord.com/channels/870683519230308372/1276309888921899008",
          image: infoPageCard02,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://xai-foundation.gitbook.io/xai-network/about-xai/xai-governance",
          image: infoPageCard03,
        },
        {
          name: "Xai Vision",
          title: "Xai Vision",
          url: "https://xai-foundation.gitbook.io/xai-network/about-xai/xai-introduction/xai-blockchain",
          image: infoPageCard04,
        },
      ],
    },
  ],

  toggles: [
    {
      name: "admin",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "info",
      enabled: true,
    },
    {
      name: "info/treasury",
      enabled: false,
    },
    {
      name: "use-l1-block-number",
      enabled: true,
    },
    {
      name: "proposal-execute",
      enabled: true,
    },
    {
      name: "proposal-lifecycle",
      enabled: true,
      config: {
        protocolLevelCreateProposalButtonCheck: true,
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
          {
            type: ProposalType?.APPROVAL,
            prodAddress: "0xA8D1D683a43586330b44c073406789e6f6dC04cc",
            testnetAddress: "0x4990cce6e8cd9596305b83c4860d4c0f3bf4e8fa",
          },
          {
            type: ProposalType?.OPTIMISTIC,
            prodAddress: "0x7a0f7659103cfc42f3Eeb265EDb0205bE9B25490",
            testnetAddress: "0xf8d15c3132efa557989a1c9331b6667ca8caa3a9",
          },
        ],
        copy: {
          helperText: `
## Proposal checklist
1. Select the correct proposal type that matches the correct transfer size.
2. Add a title, description
3. Add transactions.
If you need help creating transactions / calldata, please see this [video](https://www.loom.com/share/33b000ef682c4129995c8fa4bc35db57).
`.trim(),
        },
        gatingType: ProposalGatingType?.MANAGER,
      },
    },
    {
      name: "hide-7d-change",
      enabled: true,
    },
    {
      name: "use-daonode-for-proposal-types",
      enabled: false,
    },
    {
      name: "forums",
      enabled: false,
    },
  ],
});
