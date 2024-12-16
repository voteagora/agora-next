import { TenantUI } from "@/lib/tenant/tenantUI";
import boostLogo from "@/assets/tenant/boost_logo.svg";
import boostBanner from "@/assets/tenant/boost_banner.png";
import successImage from "@/assets/tenant/boost_banner.png";
import pendingImage from "@/assets/tenant/boost_banner.png";
import delegateImage from "@/assets/tenant/boost_logo.svg";

import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

export const boostTenantUIConfig = new TenantUI({
  title: "Boost Agora",
  logo: boostLogo,

  assets: {
    success: successImage as unknown as string,
    pending: pendingImage as unknown as string,
    delegate: delegateImage,
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    brandSecondary: "240 244 247",
  },

  // TODO
  governanceIssues: [
    // {
    //   icon: "banknotes",
    //   title: "Treasury management",
    //   key: "treasury",
    // },
  ],

  organization: {
    title: "Boost Protocol",
  },

  links: [
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.com/invite/53c3CxDneJ",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Boost voters",
      description:
        "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
      hero: boostBanner,
      meta: {
        title: "Boost Agora",
        description:
          "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
        imageTitle: "Boost Agora",
        imageDescription:
          "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Boost voters",
      description:
        "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
      hero: boostBanner,
      meta: {
        title: "Boost Agora",
        description:
          "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
        imageTitle: "Boost Agora",
        imageDescription:
          "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Boost voters",
      description:
        "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
      hero: boostBanner,
      meta: {
        title: "Voter on Agora",
        description:
          "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
        imageTitle: "Voter on Agora",
        imageDescription:
          "This is the home of the Boost Collective's Governance. Membership is determined by holding the Boost DAO NFT.",
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
            stage: PrismaProposalStage.AWAITING_SPONSORSHIP,
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

        proposalTypes: [
          {
            type: ProposalType?.BASIC,
            prodAddress: null,
            testnetAddress: null,
          },
          {
            type: ProposalType?.APPROVAL,
            prodAddress: "0xEE0178EabB933A5eDA6309AC1D1678A0670103e3",
            testnetAddress: "0x044e697c37B974d3822832934fC88fA07fa18Fb2",
          },
          {
            type: ProposalType?.OPTIMISTIC,
            prodAddress: "0x38947322EBDb3e892DED2EDca9AA35dD177CCd06",
            testnetAddress: "0x7dB0853038F845c70A278F0dc23d7437404F44fd",
          },
        ],
        copy: {
          draftSteps: [
            {
              title: "Select the proposal type",
              description:
                "Proposal types set the quorum and approval thresholds for your proposal. Select the correct type for the proposal that you're making.",
            },
            {
              title: "Choose your vote type",
              description:
                "This determines if your proposal will be a simple yes/no or a multiple choice.",
            },
            {
              title: "Create your proposal draft",
              description:
                "Now that the vote and proposal type are set, you can create your proposal by giving it a title, description, and optionally a set of transactions to execute.",
            },
            {
              title: "Submit your draft onchain",
              description:
                "If you meet the proposal threshold or are the manager of the governor, then you can submit your draft onchain as a proposal. If you do not meet these requirements, you can find a sponsor for your proposal who does.",
            },
          ],
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
      },
    },
  ],
});
