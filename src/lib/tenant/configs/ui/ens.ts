import { TenantUI } from "@/lib/tenant/tenantUI";
import ensLogo from "@/assets/tenant/ens_logo.svg";
import ensHero from "@/assets/tenant/ens_hero.svg";
import successImage from "@/assets/tenant/ens_success.svg";
import pendingImage from "@/assets/tenant/ens_pending.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import infoPageHero from "@/assets/tenant/ens_info_hero.png";
import infoPageCard00 from "@/assets/tenant/ens_info_0.png";
import infoPageCard01 from "@/assets/tenant/ens_info_1.png";
import infoPageCard02 from "@/assets/tenant/ens_info_2.png";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const ensTenantUIConfig = new TenantUI({
  title: "ENS Agora",
  logo: ensLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.ENS)],

  assets: {
    // TODO: Replace success and pending images
    success: successImage,
    pending: pendingImage,
    delegate: delegateAvatar,
  },

  customization: {
    primary: "1 26 37",
    secondary: "9 60 82",
    tertiary: "74 92 99",
    neutral: "246 246 246",
    wash: "255 255 255",
    line: "229 229 229",
    positive: "0 153 43",
    negative: "226 54 54",
    brandPrimary: "1 26 37",
    brandSecondary: "255 255 255",
    tokenAmountFont: "font-chivoMono",
  },

  organization: {
    title: "ENS Foundation",
  },

  links: [
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
  ],
  pages: [
    {
      route: "/",
      title: "Agora is the home of ENS voters",
      hero: ensHero,
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "ENS Agora",
        description: "Home of token governance",
        imageTitle: "ENS Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of ENS voters",
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "ENS Agora",
        description: "Home of token governance",
        imageTitle: "ENS Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of ENS voters",
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
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
      title: "Welcome to the Community",
      description:
        "Agora is the home of ENS governance, where ENS stakers delegate, vote, and make decisions to steward the future of the ENS ecosystem.",
      meta: {
        title: "ENS Agora",
        description: "Home of ENS governance",
        imageTitle: "ENS Agora",
        imageDescription: "Home of ENS governance",
      },
      links: [
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://discuss.ens.domains/",
          image: infoPageCard01,
        },
        {
          name: "Governance Docs",
          title: "Protocol Docs",
          url: "https://docs.ens.domains/dao",
          image: infoPageCard02,
        },
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://chat.ens.domains/",
          image: infoPageCard00,
        },
      ],
    },
    {
      route: "info/about",
      title: "About ENS",
      hero: infoPageHero,
      description:
        "ENS is the Ethereum Name Service. ENS is a naming system that creates domains on the Ethereum blockchain, allowing you to link your wallet address to a human-readable ENS name. ENS names are domains, NFTs, and usernames for your digital identity across the internet.",
      meta: {
        title: "ENS Agora",
        description: "Home of ENS governance",
        imageTitle: "ENS Agora",
        imageDescription: "Home of ENS governance",
      },
    },
  ],

  toggles: [
    {
      name: "proposals",
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
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "snapshotVotes",
      enabled: true,
    },
    {
      name: "sponsoredVote",
      enabled: true,
      config: {
        signature: {
          version: "1",
        },
        sponsorAddress:
          process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
            ? "0x7735C385081568e9338aEc70492Debfd2d5c3450"
            : "0xaA8cdaE56695d3E4e082F28c37209bACd6B09779",
        minBalance: "0.001",
        minVPToUseGasRelay: "10",
      },
    },
    {
      name: "sponsoredDelegate",
      enabled: true,
      config: {
        signature: {
          version: "1",
        },
        sponsorAddress:
          process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
            ? "0x7735C385081568e9338aEc70492Debfd2d5c3450"
            : "0xaA8cdaE56695d3E4e082F28c37209bACd6B09779",
        minBalance: "0.001",
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
      name: "show-efp-stats",
      enabled: true,
    },
    {
      name: "show-ens-text-records",
      enabled: true,
    },
    {
      name: "proposal-lifecycle",
      enabled: true,
      config: {
        stages: [
          {
            stage: PrismaProposalStage.ADDING_TEMP_CHECK,
            order: 0,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.DRAFTING,
            order: 1,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.ADDING_GITHUB_PR,
            order: 2,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.AWAITING_SUBMISSION,
            order: 3,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.PENDING,
            order: 4,
            isPreSubmission: false,
          },
          {
            stage: PrismaProposalStage.QUEUED,
            order: 5,
            isPreSubmission: false,
          },
          {
            stage: PrismaProposalStage.EXECUTED,
            order: 6,
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
            type: ProposalType?.SOCIAL,
            prodAddress: null,
            testnetAddress: null,
          },
        ],
        snapshotConfig: {
          domain: "ens.eth",
          requiredTokens: 10000,
        },
        copy: {
          helperText: `
## Proposal checklist

**1. Post a temp check on Discourse**

The purpose of the Temperature Check is to determine if there is sufficient will to make changes to the status quo. To create a Temperature Check, ask a general, non-biased question to the community on discuss.ens.domains about a potential change.

**2. Create a draft proposal on Github**

This determines if your proposal will be a simple yes/no or a multiple choice. To create a Draft Proposal, create a new governance proposal in the governance-docs repository on GitHub. Start by copying the template for an executable proposal, social proposal, or constitutional amendment, as appropriate. Once you have written your proposal, create a Draft Pull Request for it. Start a new post in the DAO-wide -> Draft Proposals category with a link to the PR for discussion.

**3. Create your proposal**

Now you're ready to use this form to create your proposal. Choose whether your proposal is a Social Proposal or Executable. If your proposal is a Social Proposal, that's it! If the vote passes, the proposal is passed and you are done. If it's the latter, once the propose() function has been called, a seven day voting period is started. Ongoing discussion can take place on your proposal post. If the proposal passes successfully, a two day timelock will follow before the proposed code is executed.

**4. Learn more**

For a full walkthrough of the proposal process, check out the [ENS DAO docs](https://docs.ens.domains/dao/proposals/submit)
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
      name: "use-archive-for-proposals",
      enabled: true,
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
      name: "show-participation",
      enabled: true,
    },
    {
      name: "forums",
      enabled: false,
    },
  ],
});
