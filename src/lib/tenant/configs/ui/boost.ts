import { TenantUI } from "@/lib/tenant/tenantUI";
import boostLogo from "@/assets/tenant/boost_logo.svg";
import infoPageCard01 from "@/assets/tenant/boost_info_1.png";
import infoPageCard02 from "@/assets/tenant/boost_info_2.png";
import infoPageCard03 from "@/assets/tenant/boost_info_3.png";
import infoPageCard04 from "@/assets/tenant/boost_info_4.png";
import boostHero from "@/assets/tenant/boost_hero.png";
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
      name: "faq",
      title: "FAQ",
      url: "TODO",
    },
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
    {
      name: "discord",
      title: "Discord",
      url: "TODO",
    },
    {
      name: "governance-forum",
      title: "Governance Forum",
      url: "TODO",
    },
    {
      name: "code-of-conduct",
      title: "Delegate Code of Conduct",
      url: "TODO",
    },
    {
      name: "delegate-statement-template",
      title: "View Template",
      url: "TODO",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Boost voters",
      description: "ADD BOOST DESCRIPTION",
      hero: boostBanner,
      meta: {
        title: "Boost Agora",
        description: "ADD BOOST DESCRIPTION",
        imageTitle: "Boost Agora",
        imageDescription: "ADD BOOST DESCRIPTION",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Boost voters",
      description: "ADD BOOST DESCRIPTION",
      hero: boostBanner,
      meta: {
        title: "Boost Agora",
        description: "ADD BOOST DESCRIPTION",
        imageTitle: "Boost Agora",
        imageDescription: "ADD BOOST DESCRIPTION",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Boost voters",
      description: "ADD BOOST DESCRIPTION",
      hero: boostBanner,
      meta: {
        title: "Voter on Agora",
        description: "ADD BOOST DESCRIPTION",
        imageTitle: "Voter on Agora",
        imageDescription: "ADD BOOST DESCRIPTION",
      },
    },
    {
      route: "info",
      title: "Welcome to the Boost Collective",
      description: "ADD BOOST DESCRIPTION",
      hero: boostBanner,
      meta: {
        title: "Info of Agora",
        description: "ADD BOOST DESCRIPTION",
        imageTitle: "Info of Agora",
        imageDescription: "ADD BOOST DESCRIPTION",
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
    {
      route: "info/about",
      title: "About Boost",
      hero: boostHero,
      description: "ADD BOOST DESCRIPTION",
      meta: {
        title: "About Boost",
        description: "ADD BOOST DESCRIPTION",
        imageTitle: "About Boost",
        imageDescription: "ADD BOOST DESCRIPTION",
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
      name: "info",
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
        // 0xEE0178EabB933A5eDA6309AC1D1678A0670103e3 -- approval prod
        // 0x044e697c37B974d3822832934fC88fA07fa18Fb2 -- approval dev
        // 0x38947322EBDb3e892DED2EDca9AA35dD177CCd06 -- optimistic prod
        // 0x7dB0853038F845c70A278F0dc23d7437404F44fd -- optimistic dev
        proposalTypes: [
          ProposalType?.BASIC,
          ProposalType?.APPROVAL,
          ProposalType?.OPTIMISTIC,
        ],
        copy: {
          helperText: `
## Proposal checklist

`.trim(),
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
      },
    },
  ],
});
