import { TenantUI } from "@/lib/tenant/tenantUI";
import boostLogo from "@/assets/tenant/boost_logo.svg";
import boostBanner from "@/assets/tenant/boost_banner.png";
import successImage from "@/assets/tenant/boost_banner.png";
import pendingImage from "@/assets/tenant/boost_banner.png";
import delegateImage from "@/assets/tenant/boost_logo.svg";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

export const boostTenantUIConfig = new TenantUI({
  title: "Boost Agora",
  logo: boostLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.BOOST)],

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
    tokenAmountFont: "font-chivoMono",
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
          helperText: `
## Proposal checklist
1. Select the correct proposal type that matches the correct transfer size.
2. Add a title, description
3. Add transactions.
If you need help creating transactions / calldata, please see this [video](https://www.loom.com/share/33b000ef682c4129995c8fa4bc35db57).
`.trim(),
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
      },
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
      name: "forums",
      enabled: false,
    },
  ],
});
