import { TenantUI } from "@/lib/tenant/tenantUI";
import cyberHero from "@/assets/tenant/cyber_hero.svg";
import cyberLogo from "@/assets/tenant/cyber_logo.svg";
import delegateImage from "@/assets/tenant/cyber_delegate.svg";
import successImage from "@/assets/tenant/cyber_success.svg";
import pendingImage from "@/assets/tenant/cyber_pending.svg";
import infoPageCard01 from "@/assets/tenant/cyber_info_1.png";
import infoPageCard02 from "@/assets/tenant/cyber_info_2.png";
import infoPageCard03 from "@/assets/tenant/cyber_info_3.png";
import infoPageCard04 from "@/assets/tenant/cyber_info_4.png";
import infoPageHero from "@/assets/tenant/cyber_info_hero.png";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

export const cyberTenantUIConfig = new TenantUI({
  title: "Cyber Agora",
  logo: cyberLogo,

  googleAnalytics: "G-KZ3G1HV72Y",

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Cyber",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "#171717",
    secondary: "#404040",
    tertiary: "#737373",
    neutral: "#FFFFFF",
    wash: "#FAFAFA",
    line: "#E5E5E5",
    positive: "#00992B",
    negative: "#C52F00",
    brandPrimary: "#171717",
    brandSecondary: "#F2F2F2",
  },

  links: [
    {
      name: "code-of-conduct",
      title: "Code of Conduct",
      url: "https://docs.cyber.co/governance/code-of-conduct",
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
      title: "Welcome to the home of Cyber voters",
      hero: cyberHero,
      description:
        "Cyber delegates are the stewards of CyberDAO. They are volunteers and members of the Cyber community who have been elected to represent other token holders and make governance decisions on their behalf.",
      meta: {
        title: "Welcome to Cyber governance",
        description: "Home of token governance",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "delegates",
      title: "Welcome to the home of Cyber voters",
      description:
        "Cyber delegates are the stewards of CyberDAO. They are volunteers and members of the Cyber community who have been elected to represent other token holders and make governance decisions on their behalf.",
      hero: cyberHero,
      meta: {
        title: "Contribute to CyberDAO with your staked CYBER",
        description:
          "Cyber Agora is a unified and dedicated delegate portal for CyberDAO governance. Cyber Agora is where all protocol improvement votes are executed. After the discussion phase, all official CyberDAO governance activities occur on the Cyber Agora portal. This includes member delegation, voting, and other matters related to CyberDAO's decentralized governance.",
        imageTitle: "Cyber Governance",
        imageDescription: "Participate in CyberDAO",
      },
    },
    {
      route: "proposals",
      title: "Welcome to Cyber governance",
      description:
        "Cyber delegates are the stewards of the Cyber DAO, appointed by token holders to make governance decisions on their behalf.",
      hero: cyberHero,
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "info",
      title: "Welcome to the Community",
      description:
        "Agora is the home of CyberDAO governance, where CYBER stakers delegate, vote, and make decisions to steward the future of the Cyber ecosystem.",
      meta: {
        title: "Cyber Agora",
        description: "Home of Cyber governance",
        imageTitle: "Cyber Agora",
        imageDescription: "Home of Cyber governance",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://discord.com/invite/buildoncyber",
          image: infoPageCard01,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://forum.cyber.co",
          image: infoPageCard02,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://docs.cyber.co/build-on-cyber/contract-deployment",
          image: infoPageCard03,
        },
        {
          name: "Protocol Vision",
          title: "Protocol Vision",
          url: "https://docs.cyber.co",
          image: infoPageCard04,
        },
      ],
    },
    {
      route: "info/about",
      title: "About Cyber",
      hero: infoPageHero,
      description:
        "Cyber is a Layer 2 blockchain designed for social applications. Cyber facilitates the creation of more engaging and meaningful web3 experiences by enabling onchain dapps to integrate social features. The Cyber ecosystem, its technology, and associated protocols are governed by CyberDAO, which is composed of CYBER token stakers and delegates.",
      meta: {
        title: "Info of Agora",
        description: "Welcome to the CyberDAO",
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
      name: "delegates/endorsed-filter",
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
      name: "proposal-lifecycle",
      enabled: false,
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
        proposalTypes: [ProposalType?.BASIC, ProposalType?.APPROVAL],
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
  ],
});
