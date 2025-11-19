import { TenantUI } from "@/lib/tenant/tenantUI";
import deriveHero from "@/assets/tenant/derive_hero.svg";
import deriveLogo from "@/assets/tenant/derive_logo.svg";
import delegateImage from "@/assets/tenant/derive_delegate.svg";
import successImage from "@/assets/tenant/derive_success.svg";
import pendingImage from "@/assets/tenant/derive_pending.svg";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import infoPageCard01 from "@/assets/tenant/derive_info_0.png";
import infoPageCard02 from "@/assets/tenant/derive_info_1.png";
import infoPageCard03 from "@/assets/tenant/derive_info_2.png";
import infoPageCard04 from "@/assets/tenant/derive_info_3.png";
import infoPageHero from "@/assets/tenant/derive_gov.png";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
export const deriveTenantUIConfig = new TenantUI({
  title: "Derive Agora",
  logo: deriveLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.DERIVE)],

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Derive DAO",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "233 232 226",
    secondary: "149 149 143",
    tertiary: "149 149 143",
    neutral: "9 10 10",
    wash: "20 20 20",
    line: "38 41 41",
    positive: "19 238 154",
    negative: "246 62 88",
    brandPrimary: "244 62 88",
    brandSecondary: "0 0 0 ",
    tokenAmountFont: "font-chivoMono",
  },

  theme: "dark",

  links: [
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.com/invite/Derive",
    },
    {
      name: "partial-delegation-faq",
      title: "partial delegation FAQ",
      url: "https://agoraxyz.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c",
    },
  ],

  smartAccountConfig: {
    bundlerUrl: isProd
      ? `https://bundler-lyra-mainnet-0.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`
      : `https://bundler-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`,

    entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factoryAddress: "0x000000893A26168158fbeaDD9335Be5bC96592E2",
    paymasterAddress: isProd
      ? "0xa179c3b32d3eE58353d3F277b32D1e03DD33fFCA"
      : "0x5a6499b442711feeA0Aa73C6574042EC5E2e5945",
    paymasterUrl: isProd
      ? "https://derive.xyz/api/paymaster"
      : "https://testnet.derive.xyz/api/paymaster",
    salt: BigInt(0),
    type: "LightAccount",
    version: "v1.1.0",
  },

  governanceIssues: [
    {
      icon: "piggyBank",
      title: "Treasury",
      key: "treasury",
    },
    {
      icon: "ballot",
      title: "Metagovernance",
      key: "metaGovernance",
    },
    {
      icon: "stack",
      title: "Protocol",
      key: "protocol",
    },
    {
      icon: "sparks",
      title: "Grants",
      key: "grants",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Derive Governance",
      description:
        "Agora is the home of Derive Governance, where DRV stakers delegate, vote, and make decisions to steward the future of the Derive ecosystem.",
      hero: deriveHero,
      meta: {
        title: "Derive Agora",
        description: "Home of Derive Governance",
        imageTitle: "Derive Agora",
        imageDescription: "Home of Derive Governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Derive Governance",
      description:
        "Agora is the home of Derive Governance, where DRV stakers delegate, vote, and make decisions to steward the future of the Derive ecosystem.",
      hero: deriveHero,
      meta: {
        title: "Voter on Derive Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Voter on Derive Agora",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Derive Governance",
      description:
        "Agora is the home of Derive Governance, where DRV stakers delegate, vote, and make decisions to steward the future of the Derive ecosystem.",
      hero: deriveHero,
      meta: {
        title: "Derive Agora",
        description: "Home of Derive Governance",
        imageTitle: "Derive Agora",
        imageDescription: "Home of Derive Governance",
      },
    },
    {
      route: "info/about",
      title: "About Derive",
      hero: infoPageHero,
      description:
        "Derive is a permissionless, decentralized protocol that creates and settles unique programmable onchain options, perpetuals, and structured products. The protocol is deployed on an Optimistic Rollup that settles to the Ethereum blockchain. The protocol is governed by the Derive DAO and DRV stakers.",
      meta: {
        title: "About Derive Governance",
        description: "Home of Derive Governance",
        imageTitle: "About Derive Governance",
        imageDescription: "Home of Derive Governance",
      },
    },
    {
      route: "info",
      title: "Welcome to Derive Governance",
      description:
        "Agora is the home of Derive Governance, where DRV stakers delegate, vote, and make decisions to steward the future of the Derive ecosystem.",
      meta: {
        title: "About Derive Governance",
        description: "Home of Derive Governance",
        imageTitle: "About Derive Governance",
        imageDescription: "Home of Derive Governance",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://discord.com/invite/Derive",
          image: infoPageCard01,
        },
        {
          name: "Gov. Forums",
          title: "Gov. Forums",
          url: "https://forums.derive.xyz",
          image: infoPageCard02,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://docs.derive.xyz",
          image: infoPageCard03,
        },
        {
          name: "Protocol Vision",
          title: "Protocol Vision",
          url: "https://derive.xyz",
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
      name: "info",
      enabled: true,
    },
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "snapshotVotes",
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
            prodAddress: "0x5d729d4c0BF5d0a2Fa0F801c6e0023BD450c4fd6",
            testnetAddress: "0x8dfC3B23EE4ca0b8C4af1e4EC7F72D2efbAB70E3",
          },
          {
            type: ProposalType?.OPTIMISTIC,
            prodAddress: "0xf8D15c3132eFA557989A1C9331B6667Ca8Caa3a9",
            testnetAddress: "0x785553111A66B88E3D0cef523C3A2c6D821e675B",
          },
        ],
        copy: {
          helperText: `
## Proposal checklist
**1. Select the proposal type**

Proposal types set the quorum and approval thresholds for your proposal. Select the correct type for the proposal that you're making.

**2. Choose your vote type**

This determines if your proposal will be a simple yes/no or a multiple choice.

**3. Create your proposal draft**

Now that the vote and proposal type are set, you can create your proposal by giving it a title, description, and optionally a set of transactions to execute.

**4. Submit your draft onchain**

If you meet the proposal threshold or are the manager of the governor, then you can submit your draft onchain as a proposal. If you do not meet these requirements, you can find a sponsor for your proposal who does.
        `.trim(),
        },
        gatingType: ProposalGatingType?.GOVERNOR_V1,
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
      name: "use-archive-for-vote-history",
      enabled: false,
    },
    {
      name: "forums",
      enabled: false,
    },
  ],
});
