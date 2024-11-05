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
          name: "Documentation",
          title: "Documentation",
          url: "https://protocol-guild.readthedocs.io",
          image: pguildLogo,
        },
        {
          name: "Membership",
          title: "Membership",
          url: "https://protocol-guild.readthedocs.io/en/latest/02-membership.html#active-members",
          image: pguildLogo,
        },
        {
          name: "Guild Pledge",
          title: "Guild Pledge",
          url: "https://tim.mirror.xyz/srVdVopOFhD_ZoRDR50x8n5wmW3aRJIrNEAkpyQ4_ng",
          image: pguildLogo,
        },
        {
          name: "Other links",
          title: "Other links",
          url: "https://linktr.ee/protocolguild",
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
        proposalTypes: [ProposalType?.BASIC],
        copy: {
          helperText: `
                ## Proposal checklist`.trim(),
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
      },
    },
  ],
});
