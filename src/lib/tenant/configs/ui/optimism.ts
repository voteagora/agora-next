import { TenantUI } from "@/lib/tenant/tenantUI";
import civicLogo from "@/assets/tenant/civic_logo.png";
import civicDelegate from "@/assets/tenant/civic_delegate.svg";
import optimismHero from "@/assets/tenant/optimism_hero.svg";
import successImage from "@/assets/tenant/optimism_success.svg";
import pendingImage from "@/assets/tenant/optimism_pending.svg";
import infoPageCard01 from "@/assets/tenant/optimism_info_1.png";
import infoPageCard02 from "@/assets/tenant/optimism_info_2.png";
import infoPageCard03 from "@/assets/tenant/optimism_info_3.png";
import infoPageCard04 from "@/assets/tenant/optimism_info_4.png";
import { ProposalGatingType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

// CIVIC demo branding — revert before shipping
const civicToken = {
  name: "CIVIC Voting Power",
  symbol: "CIVIC",
  decimals: 0,
  address: "0x4200000000000000000000000000000000000042",
};

export const optimismTenantUIConfig = new TenantUI({
  title: "CIVIC Governance",
  logo: civicLogo,
  logoSize: "46px",
  tokens: [civicToken],

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: civicDelegate,
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
    title: "Center for Civilians in Conflict",
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
      url: "/feedback",
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
      title: "CIVIC community governance",
      description:
        "Members vote on priorities for civilian protection policy, advocacy, and field programs across conflict zones.",
      hero: optimismHero,
      meta: {
        title: "CIVIC Governance",
        description: "Community governance for civilian protection",
        imageTitle: "CIVIC Governance",
        imageDescription: "Community governance for civilian protection",
      },
    },
    {
      route: "proposals",
      title: "CIVIC community governance",
      description:
        "Members vote on priorities for civilian protection policy, advocacy, and field programs across conflict zones.",
      hero: optimismHero,
      meta: {
        title: "CIVIC Governance",
        description: "Community governance for civilian protection",
        imageTitle: "CIVIC Governance",
        imageDescription: "Community governance for civilian protection",
      },
    },
    {
      route: "delegates",
      title: "CIVIC community members",
      description:
        "One person, one vote. Every member holds equal voting power to shape CIVIC's humanitarian priorities.",
      hero: optimismHero,
      meta: {
        title: "CIVIC Governance — Members",
        description: "Community members shaping civilian protection priorities",
        imageTitle: "CIVIC Governance — Members",
        imageDescription:
          "Community members shaping civilian protection priorities",
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
      name: "hide-hero",
      enabled: true,
    },
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
      name: "notifications",
      enabled: true,
    },
    {
      name: "proposal-lifecycle",
      enabled: true,
      config: {
        // Temporary: allow public draft sharing via ?share=AuthorAddress
        allowDraftSharing: true,
        offchainProposalCreator: [
          "0xb8CF6C0425FD799D617351C24fF35B493eD06Cb4", // Jonas's prod EOA
          "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB",
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

This determines if your proposal will be a simple yes/no or a multiple choice or an optimistic proposal.

**3. Create your proposal draft**

Now that the vote and proposal type are set, you can use this form to create your proposal. Proposed transactions are optional, as the Token House governor is not executable for now.

**4. Choose your proposal scope**

Select how your proposal will be voted on:
- **On-Chain Only**: Standard Token House voting via smart contract
- **Off-Chain Only**: Citizen House voting via EAS (requires offchain proposal creator privileges)
- **Hybrid**: Both Token House and Citizen House vote in parallel. Requires two separate submissions: first on-chain to the governor contract, then off-chain for Citizen House.

**5. Get signatures for your SAFE**

If you're using the OP Foundation multisig, you can queue several proposals at once so that your co-signers can sign all the transactions in one sitting. Proposals will appear in chronological order in the final UI, so the last proposal you put in will show up on top for voters. Note that the order is not guaranteed if you batch all the proposal creation transactions into a single block, as then there is no timing difference.
`.trim(),
        },
        gatingType: ProposalGatingType?.MANAGER,
      },
    },
    {
      name: "safe-proposal-choice",
      enabled: true,
    },
    {
      name: "safe-tracking",
      enabled: true,
      config: {
        offchainMessageTracking: true,
        onchainTransactionTracking: true,
      },
    },
    {
      name: "delegation-encouragement",
      enabled: true,
    },
    {
      name: "mirador",
      enabled: true,
      config: {
        proposalCreation: true,
        siweLoginTracing: true,
        governanceVote: true,
        governanceDelegation: true,
        governanceAdmin: true,
        proposalAttestation: true,
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
      name: "use-archive-for-vote-history",
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
