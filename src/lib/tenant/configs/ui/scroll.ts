import { TenantUI } from "@/lib/tenant/tenantUI";
import scrollHero from "@/assets/tenant/scroll_hero.png";
import scrollLogo from "@/assets/tenant/scroll_logo.svg";
import delegateImage from "@/assets/tenant/scroll_delegate.svg";
import successImage from "@/assets/tenant/scroll_success.svg";
import pendingImage from "@/assets/tenant/scroll_pending.svg";
import failedImage from "@/assets/tenant/scroll_failed.svg";
import infoPageCard02 from "@/assets/tenant/scroll_info_2.png";
import infoPageCard03 from "@/assets/tenant/scroll_info_3.png";
import infoPageCard04 from "@/assets/tenant/scroll_info_4.png";
import infoPageHero from "@/assets/tenant/scroll_gov.png";
import appleTouchIcon from "@/assets/tenant/scroll_favicon/apple-touch-icon.png";
import favicon32x32 from "@/assets/tenant/scroll_favicon/favicon-32x32.png";
import favicon16x16 from "@/assets/tenant/scroll_favicon/favicon-16x16.png";
import shortcutIcon from "@/assets/tenant/scroll_favicon/favicon.ico";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const scrollTenantUIConfig = new TenantUI({
  title: "Scroll Governance",
  logo: scrollLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.SCROLL)],

  googleAnalytics: "G-SV1E7HY7YZ",

  assets: {
    success: successImage,
    pending: pendingImage,
    failed: failedImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Scroll DAO",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "16 16 16",
    secondary: "91 91 91",
    tertiary: "164 164 164",
    neutral: "255 255 255",
    wash: "255 255 255",
    line: "220 220 220",
    positive: "15 142 126",
    negative: "255 104 75",
    brandPrimary: "255 104 75",
    brandSecondary: "255 248 243",
    tokenAmountFont: "font-chivoMono",
  },

  favicon: {
    "apple-touch-icon": appleTouchIcon.src,
    icon32x32: favicon32x32.src,
    icon16x16: favicon16x16.src,
    "shortcut-icon": shortcutIcon.src,
  },

  links: [
    {
      name: "partial-delegation-faq",
      title: "partial delegation FAQ",
      url: "https://agoraxyz.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c",
    },
  ],

  governanceIssues: [
    {
      icon: "hammerEmoji",
      title: "Builders",
      key: "builders",
    },
    {
      icon: "peopleEmoji",
      title: "Community",
      key: "community",
    },
    {
      icon: "worldEmoji",
      title: "Decentralization",
      key: "decentralization",
    },
    {
      icon: "sproutEmoji",
      title: "Sustainability",
      key: "sustainability",
    },
    {
      icon: "lockEmoji",
      title: "Privacy",
      key: "privacy",
    },
    {
      icon: "scaleEmoji",
      title: "Governance",
      key: "governance",
    },
    {
      icon: "testTubeEmoji",
      title: "Experimentation",
      key: "experimentation",
    },
    {
      icon: "shieldEmoji",
      title: "Security",
      key: "security",
    },
  ],

  hideAgoraBranding: true,

  pages: [
    {
      route: "/",
      title: "Welcome to Scroll Governance",
      description:
        "Delegates represent the Scroll ecosystem, guiding governance decisions on behalf of SCR token holders to ensure the platform evolves in line with community priorities.",
      hero: scrollHero,
      meta: {
        title: "Welcome to Scroll Governance",
        description: "Home of token governance",
        imageTitle: "Welcome to Scroll Governance",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "proposals",
      title: "Welcome to Scroll Governance",
      description:
        "Scroll delegates are the stewards of Scroll DAO. They are volunteers and members of the Scroll community who have been elected to represent other token holders and make governance decisions on their behalf.",
      hero: scrollHero,
      meta: {
        title: "Voters of Scroll Governance",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Scroll Governance",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "delegates",
      title: "Agora is home to Scroll delegates",
      description:
        "Scroll delegates are the stewards of Scroll DAO. They are volunteers and members of the Scroll community who have been elected to represent other token holders and make governance decisions on their behalf.",
      hero: scrollHero,
      meta: {
        title: "Voters of Scroll Governance",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Voters of Scroll Governance",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "info/about",
      title: "About Scroll",
      hero: infoPageHero,
      description:
        "Scroll is the leading zero-knowledge rollup. Leveraging fast finality and high throughput, Scroll is creating a more accessible, scalable, and secure onchain future for everyone. Our mission is to provide an easy-to-use, developer-friendly environment to scale Ethereum for good. Scroll empowers builders to ascend beyond today's limitations and drive real-world impact.",
      meta: {
        title: "Info of Scroll Governance",
        description: "Welcome to the Scroll DAO",
        imageTitle: "",
        imageDescription: "",
      },
    },
    {
      route: "info",
      title: "Welcome to Scroll Governance",
      description:
        "Delegates represent the Scroll ecosystem, guiding governance decisions on behalf of SCR token holders to ensure the platform evolves in line with community priorities.",
      meta: {
        title: "Scroll Governance",
        description: "Home of Scroll Governance",
        imageTitle: "Scroll Governance",
        imageDescription: "Home of Scroll Governance",
      },
      links: [
        {
          name: "Governance Forums",
          title: "Gov. Forums",
          url: "https://forum.scroll.io",
          image: infoPageCard02,
        },
        {
          name: "Governance Docs",
          title: "Gov. Docs",
          url: "https://scroll.io/gov-docs/content/overview",
          image: infoPageCard03,
        },
        {
          name: "Protocol Vision",
          title: "Protocol Vision",
          url: "https://scroll.io/blog/scroll-everyone-everywhere",
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
      name: "delegates/endorsed-filter",
      enabled: true,
      config: {
        tooltip: "Verified by Scroll team",
        showFilterLabel: "Verified Delegates",
        hideFilterLabel: "All Delegates",
        defaultFilter: true,
      },
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "delegates/delegate",
      enabled: true,
    },
    {
      name: "delegates/code-of-conduct",
      enabled: false,
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
      name: "show-participation",
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
            prodAddress: "0xe5bAF6359d200C144A9e52E3361efA6Dc5780cC9",
            testnetAddress: "0x678dEbd4B7bEB0412B2848FfEcbE761D39b961c4",
          },
          {
            type: ProposalType?.OPTIMISTIC,
            prodAddress: "0x89c4C0E77f7876415d07a2e43E5e9a6A4Cab3538",
            testnetAddress: "0x5fA0a34a3262d646E7e28a621F631bBA5Ae029c5",
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
      enabled: true,
    },
    {
      name: "forums",
      enabled: false,
    },
  ],
});
