import { TenantUI } from "@/lib/tenant/tenantUI";
import lineaLogo from "@/assets/tenant/linea_logo.svg";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import infoPageCard01 from "@/assets/tenant/linea_info_1.png";
import infoPageCard02 from "@/assets/tenant/linea_info_2.png";
import infoPageCard03 from "@/assets/tenant/linea_info_3.png";
import infoPageCard04 from "@/assets/tenant/linea_info_4.png";
import infoPageHero from "@/assets/tenant/linea_info_hero.png";
import delegateImage from "@/assets/tenant/linea_delegate.svg";

export const lineaTenantUIConfig = new TenantUI({
  title: "Linea Agora",
  logo: lineaLogo,

  assets: {
    success: lineaLogo,
    pending: lineaLogo,
    delegate: delegateImage,
  },

  organization: {
    title: "Linea",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "25 0 102",
    secondary: "64 64 64",
    tertiary: "195 195 195",
    neutral: "255 255 255",
    wash: "255 255 255",
    line: "223 223 223",
    positive: "97 209 97",
    negative: "242 84 91",
    brandPrimary: "23 23 23",
    brandSecondary: "248 247 242",
  },

  links: [
    {
      name: "code-of-conduct",
      title: "Code of Conduct",
      url: "https://www.agora.xyz/deploy",
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
      title: "Grants",
      key: "grants",
    },
    {
      icon: "ballot",
      title: "Decentralization",
      key: "decentralization",
    },
    {
      icon: "globe",
      title: "Ecosystem development",
      key: "ecosystemDevelopment",
    },
    {
      icon: "sparks",
      title: "Public Goods",
      key: "publicGoods",
    },
    {
      icon: "community",
      key: "daoWorkingGroups",
      title: "DAO working groups",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Welcome to Linea governance",
      description:
        "Linea is the home network for the world, empowering users, builders, and communities to live onchain with high-performance zkEVM technology, robust security, and seamless web3 experiences.",
      meta: {
        title: "Welcome to Linea governance",
        description:
          "Linea is the home network for the world, empowering users, builders, and communities to live onchain with high-performance zkEVM technology, robust security, and seamless web3 experiences.",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "delegates",
      title: "Welcome to Linea governance",
      description:
        "Linea is the home network for the world, empowering users, builders, and communities to live onchain with high-performance zkEVM technology, robust security, and seamless web3 experiences.",
      meta: {
        title: "Contribute to Linea with your staked {Token name}",
        description:
          "Linea is a unified and dedicated delegate portal for Linea governance. Linea is where all protocol improvement votes are executed. After the discussion phase, all official Linea governance activities occur on the Linea portal. This includes member delegation, voting, and other matters related to Linea's decentralized governance.",
        imageTitle: "Linea Governance",
        imageDescription: "Participate in Linea",
      },
    },
    {
      route: "proposals",
      title: "Welcome to Linea governance",
      description:
        "Linea is the home network for the world, empowering users, builders, and communities to live onchain with high-performance zkEVM technology, robust security, and seamless web3 experiences.",
      meta: {
        title: "Voter on Agora",
        description:
          "Linea is the home network for the world, empowering users, builders, and communities to live onchain with high-performance zkEVM technology, robust security, and seamless web3 experiences.",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "info",
      title: "Welcome to Linea governance",
      description:
        "Linea is the home network for the world, empowering users, builders, and communities to live onchain with high-performance zkEVM technology, robust security, and seamless web3 experiences.",
      meta: {
        title: "Welcome to Linea governance",
        description:
          "Linea is the home network for the world, empowering users, builders, and communities to live onchain with high-performance zkEVM technology, robust security, and seamless web3 experiences.",
        imageTitle: "Linea Agora",
        imageDescription: "Home of Linea governance",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://www.agora.xyz/deploy",
          image: infoPageCard01,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://www.agora.xyz/deploy",
          image: infoPageCard02,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://www.agora.xyz/deploy",
          image: infoPageCard03,
        },
        {
          name: "Protocol Vision",
          title: "Protocol Vision",
          url: "https://www.agora.xyz/deploy",
          image: infoPageCard04,
        },
      ],
    },
    {
      route: "info/about",
      title: "Welcome to Linea governance",
      hero: infoPageHero,
      description:
        "In moving toward our mission to empower everyone to live onchain, Linea’s approach has been to take web3 user, builder, and community experience to higher levels. With innovations in security, digital identity, payments, and DeFi, as well as community nurturing and organization, we’ve aimed to lower barriers to entry, create the most secure environment, streamline everyday processes, and elevate the whole web3 experience.",
      meta: {
        title: "",
        description: "Welcome to the Linea Agora",
        imageTitle: "",
        imageDescription: "",
      },
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
      name: "delegates/code-of-conduct",
      enabled: true,
    },
    {
      name: "info",
      enabled: true,
    },
    {
      name: "proposal-execute",
      enabled: true,
    },
    {
      name: "use-timestamp-for-proposals", // For proposal start_block and end_block
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
            prodAddress: "0xD9B569a18FDA0B9e9b983eec885E065f032da1F7",
            testnetAddress: "0xD9B569a18FDA0B9e9b983eec885E065f032da1F7",
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
      name: "use-archive-for-proposals",
      enabled: true,
    },
    {
      name: "use-archive-for-proposal-details",
      enabled: true,
    },
    {
      name: "use-daonode-for-proposal-types",
      enabled: true,
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
