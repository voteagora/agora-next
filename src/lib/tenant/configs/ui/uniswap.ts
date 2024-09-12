import { TenantUI } from "@/lib/tenant/tenantUI";
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

export const uniswapTenantUIConfig = new TenantUI({
  title: "Uniswap Agora",
  logo: uniswapLogo,

  googleAnalytics: "G-KBG8GS1R45",

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Uniswap Foundation",
  },

  links: [
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
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
      name: "delegates/edit",
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
          ProposalType?.BASIC,
          ProposalType?.APPROVAL,
          ProposalType?.OPTIMISTIC,
        ],
        copy: {
          helperText: `
## Proposal checklist

**1. Select proposal type**

Proposal types set the quorum and approval thresholds for your proposal. You can view, edit, or create a new one via the [admin panel](https://vote.optimism.io/admin).

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
  ],
});
