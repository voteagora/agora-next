import { TenantUI } from "@/lib/tenant/tenantUI";
import optimismLogo from "@/assets/tenant/optimism_logo.svg";
import optimismHero from "@/assets/tenant/optimism_hero.svg";
import successImage from "@/assets/tenant/optimism_success.svg";
import pendingImage from "@/assets/tenant/optimism_pending.svg";
import delegateImage from "@/assets/tenant/optimism_delegate.svg";
import infoPageCard01 from "@/assets/tenant/optimism_info_1.png";
import infoPageCard02 from "@/assets/tenant/optimism_info_2.png";
import infoPageCard03 from "@/assets/tenant/optimism_info_3.png";
import infoPageCard04 from "@/assets/tenant/optimism_info_4.png";
import { ProposalGatingType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const optimismTenantUIConfig = new TenantUI({
  title: "Optimism Agora",
  logo: optimismLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.OPTIMISM)],

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "255 255 255",
    wash: "255 255 255",
    line: "229 229 229",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "255 255 255",
    tokenAmountFont: "font-chivoMono",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [
      "0x3eee61b92c36e97be6319bf9096a1ac3c04a1466", // ACC
      "0x5e349eca2dc61abcd9dd99ce94d04136151a09ee", // lindajxie.eth
    ],
  },

  governanceIssues: [
    {
      icon: "banknotes",
      title: "Treasury management",
      key: "treasury",
    },
    {
      icon: "piggyBank",
      title: "Grant funding",
      key: "funding",
    },
    {
      icon: "sparks",
      title: "Public goods",
      key: "publicGoods",
    },
  ],

  organization: {
    title: "Optimism Foundation",
  },

  links: [
    {
      name: "calendar",
      title: "Governance calendar",
      url: "https://calendar.google.com/calendar/ical/c_fnmtguh6noo6qgbni2gperid4k%40group.calendar.google.com/public/basic.ics",
    },
    {
      name: "faq",
      title: "FAQ",
      url: "https://agoraxyz.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c",
    },
    {
      name: "advanced-delegation-faq",
      title: "advanced delegation FAQ",
      url: "https://agoraxyz.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c",
    },
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.gg/vBJkUYBuwX",
    },
    {
      name: "bugs",
      title: "Report bugs & feedback",
      url: "https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc",
    },
    {
      name: "governance-forum",
      title: "Governance Forum",
      url: "https://gov.optimism.io/",
    },
    {
      name: "code-of-conduct",
      title: "Delegate Code of Conduct",
      url: "https://gov.optimism.io/t/code-of-conduct/5751",
    },
    {
      name: "delegate-statement-template",
      title: "View Template",
      url: "https://gov.optimism.io/t/delegate-commitments/235",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Optimism voters",
      description:
        "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
      hero: optimismHero,
      meta: {
        title: "Optimism Agora",
        description: "Home of token house governance and RPGF",
        imageTitle: "Optimism Agora",
        imageDescription: "Home of token house governance and RPGF",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Optimism voters",
      description:
        "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
      hero: optimismHero,
      meta: {
        title: "Optimism Agora",
        description: "Home of token house governance and RPGF",
        imageTitle: "Optimism Agora",
        imageDescription: "Home of token house governance and RPGF",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Optimism voters",
      description:
        "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
      hero: optimismHero,
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Voter on Agora",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "info",
      title: "Welcome to the Optimism Collective",
      description:
        "A collective of companies, communities, and citizens working together.",
      hero: optimismHero,
      meta: {
        title: "Info of Agora",
        description: "Welcome to the Optimism Collective",
        imageTitle: "Info of Agora",
        imageDescription: "Welcome to the Optimism Collective",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "",
          image: infoPageCard01,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "",
          image: infoPageCard02,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "",
          image: infoPageCard03,
        },
        {
          name: "Optimistic Vision",
          title: "Optimistic Vision",
          url: "",
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
      name: "delegates/code-of-conduct",
      enabled: true,
    },
    {
      name: "retropgf",
      enabled: false,
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "info",
      enabled: false,
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
        // Temporary: allow public draft sharing via ?share=AuthorAddress
        allowDraftSharing: true,
        offchainProposalCreator: [
          "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB",
          "0xa7f8Ad892F3E6f25BB042c8AD7a220e74aCebAd8",
          "0x011B83250067782A4435FAb0B0119Ec835404E60",
          "0x77a1c4669D642E8A25B1da8bAE4a7466f0f3a7c3",
        ],
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
            type: "basic",
            prodAddress: null,
            testnetAddress: null,
          },
          {
            type: "approval",
            prodAddress: "0x8060B18290F48fc0bF2149EEb2F3c280bDe7674f",
            testnetAddress: "0x4E2e3509F4C77Df377FeE48e3969BB7000B9FAF1",
          },
          {
            type: "optimistic",
            prodAddress: "0x8980C97f0e8a3A69831139e51003E65238F1F343",
            testnetAddress: "0xd88b3D2DFf4ACF38CBD6C425F40Cd1A687E1ee4B",
          },
        ],
        copy: {
          helperText: `
## Proposal checklist

**1. Select proposal type**

Proposal types set the quorum and approval thresholds for your proposal. You can view, edit, or create a new one via the [admin panel](https://vote.optimism.io/admin).

**2. Choose your vote type**

This determines if your proposal will be a simple yes/no or a multiple choice.

**3. Create your proposal draft**

Now that the vote and proposal type are set, you can use this form to create your proposal. Proposed transactions are optional, as the Token House governor is not executable for now.

**4. Get signatures for your SAFE**

If you're using the OP Foundation multisig, you can queue several proposals at once so that your co-signers can sign all the transactions in one sitting. Proposals will appear in chronological order in the final UI, so the last proposal you put in will show up on top for voters. Note that the order is not guaranteed if you batch all the proposal creation transactions into a single block, as then there is no timing difference.
`.trim(),
        },
        gatingType: ProposalGatingType?.MANAGER,
      },
    },
    {
      name: "delegation-encouragement",
      enabled: true,
    },
    {
      name: "use-archive-for-proposals",
      enabled: false,
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
      name: "use-archive-vote-history",
      enabled: true,
    },
    {
      name: "show-participation",
      enabled: true,
    },
    {
      name: "proposals/offchain",
      enabled: true,
    },
    {
      name: "forums",
      enabled: false,
    },
  ],
});
