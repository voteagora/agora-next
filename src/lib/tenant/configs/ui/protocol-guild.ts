import { TenantUI } from "@/lib/tenant/tenantUI";
import pguildLogo from "@/assets/tenant/pguild_logo.svg";
import pguildHero from "@/assets/tenant/pguild_hero.svg";
import successImage from "@/assets/tenant/ens_success.svg";
import pendingImage from "@/assets/tenant/ens_pending.svg";
import infoPageCard01 from "@/assets/tenant/optimism_info_1.png";
import infoPageCard02 from "@/assets/tenant/optimism_info_2.png";
import infoPageCard03 from "@/assets/tenant/optimism_info_3.png";
import infoPageCard04 from "@/assets/tenant/optimism_info_4.png";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

export const protocolGuildTenantUIConfig = new TenantUI({
  title: "Protocol Guild",
  logo: pguildLogo,

  assets: {
    // TODO: Replace success and pending images
    success: successImage,
    pending: pendingImage,
    delegate: delegateAvatar,
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
      title: "Protocol Guide Governance",
      hero: pguildHero,
      description:
        "Protocol Guild members are Ethereum L1 R&D maintainers. This is the home of their governance.",
      meta: {
        title: "Protocol Guild Agora",
        description: "Home of Ethereum L1 R&D governance",
        imageTitle: "Protocol Guild Agora",
        imageDescription: "Home of Ethereum L1 R&D governance",
      },
    },
    {
      route: "proposals",
      title: "Protocol Guild Governance",
      description:
        "Protocol Guild members are Ethereum L1 R&D maintainers. This is the home of their governance.",
      meta: {
        title: "Protocol Guild Agora",
        description: "Home of Ethereum L1 R&D governance",
        imageTitle: "Protocol Guild Agora",
        imageDescription: "Home of Ethereum L1 R&D governance",
      },
    },
    {
      route: "delegates",
      title: "Protocol Guild Governance",
      description:
        "Protocol Guild members are Ethereum L1 R&D maintainers. This is the home of their governance.",
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
      title: "Protocol Guild Governance",
      description:
        "Protocol Guild members are Ethereum L1 R&D maintainers. This is the home of their governance.",
      hero: pguildHero,
      meta: {
        title: "Info of Agora",
        description: "Welcome to Protocol Guild",
        imageTitle: "Info of Agora",
        imageDescription: "Welcome to Protocol Guild",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "",
          image: pguildLogo,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "",
          image: pguildLogo,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "",
          image: pguildLogo,
        },
        {
          name: "Optimistic Vision",
          title: "Optimistic Vision",
          url: "",
          image: pguildLogo,
        },
      ],
    },
    {
      route: "info/about",
      title: "About Protocol Guild",
      hero: pguildHero,
      description:
        "The Protocol Guild is a collective funding mechanism for +180 Ethereum L1 R&D maintainers 🌿. Supported by donors who have taken the Protocol Guild Pledge, the Protocol Guild’s mission is to make contributing to Ethereum L1 R&D economically rational on a risk-adjusted basis, while avoiding capture.",
      meta: {
        title: "About Protocol Guild",
        description:
          "The Protocol Guild is a collective funding mechanism for +180 Ethereum L1 R&D maintainers 🌿. Supported by donors who have taken the Protocol Guild Pledge, the Protocol Guild’s mission is to make contributing to Ethereum L1 R&D economically rational on a risk-adjusted basis, while avoiding capture.",
        imageTitle: "About Protocol Guild",
        imageDescription:
          "The Protocol Guild is a collective funding mechanism for +180 Ethereum L1 R&D maintainers 🌿. Supported by donors who have taken the Protocol Guild Pledge, the Protocol Guild’s mission is to make contributing to Ethereum L1 R&D economically rational on a risk-adjusted basis, while avoiding capture.",
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
      enabled: false,
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
            stage: PrismaProposalStage.AWAITING_SUBMISSION,
            order: 2,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.PENDING,
            order: 3,
            isPreSubmission: false,
          },
          {
            stage: PrismaProposalStage.QUEUED,
            order: 4,
            isPreSubmission: false,
          },
          {
            stage: PrismaProposalStage.EXECUTED,
            order: 5,
            isPreSubmission: false,
          },
        ],
        proposalTypes: [ProposalType?.BASIC],
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
  ],
});
