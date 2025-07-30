import { TenantUI } from "@/lib/tenant/tenantUI";
import shapeLogo from "@/assets/tenant/shape_logo.svg";
import shapeHero from "@/assets/tenant/shape_hero.svg";
import shapeSuccess from "@/assets/tenant/shape_success.svg";
import shapePending from "@/assets/tenant/shape_pending.svg";
import shapeDelegate from "@/assets/tenant/shape_delegate.svg";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const shapeTenantUIConfig = new TenantUI({
  title: "Shape",
  logo: shapeLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.SHAPE)],

  assets: {
    success: shapeSuccess,
    pending: shapePending,
    delegate: shapeDelegate,
  },

  organization: {
    title: "Shape",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "23 23 23",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "252 251 247",
    wash: "255 255 255",
    line: "223 223 223",
    positive: "66 122 43",
    negative: "182 13 13",
    brandPrimary: "144 193 41",
    brandSecondary: "242 242 242",
    font: "font-shape",
    letterSpacing: "0",
    tokenAmountFont: "font-chivoMono",
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
      title: "Agora is the home of Shape voters",
      description:
        "Shape Delegates are the stewards of Shape governance, appointed by token holders to make governance decisions on their behalf.",
      hero: shapeHero,
      meta: {
        title: "Shape Agora",
        description: "Home of Shape governance",
        imageTitle: "Shape Agora",
        imageDescription: "Home of Shape governance",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Shape voters",
      description:
        "Shape Delegates are the stewards of Shape governance, appointed by token holders to make governance decisions on their behalf.",
      hero: shapeHero,
      meta: {
        title: "Shape Agora",
        description: "Home of Shape governance",
        imageTitle: "Shape Agora",
        imageDescription: "Home of Shape governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Shape voters",
      description:
        "Shape Delegates are the stewards of Shape governance, appointed by token holders to make governance decisions on their behalf.",
      hero: shapeHero,
      meta: {
        title: "Shape Delegates",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Shape Delegates",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "info",
      title: "Welcome to Shape",
      description:
        "A collective of companies, communities, and citizens working together.",
      hero: shapeHero,
      meta: {
        title: "Shape Info",
        description: "Welcome to Shape",
        imageTitle: "Shape Info",
        imageDescription: "Welcome to Shape",
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
        proposalTypes: [
          {
            type: ProposalType?.BASIC,
            prodAddress: null,
            testnetAddress: null,
          },
          {
            type: "optimistic",
            prodAddress: "0x2e360A2bb39B47749D5F34cf0E1A285C76c088c3",
            testnetAddress: "0x4414D030cFfEC5Edc011a27c653Ce21704b12d85",
          },
        ],
        copy: {
          helperText: `
## Proposal checklist
1. Select the correct proposal type that matches the correct transfer size.
2. Add a title, description
3. Add transactions.
If you need help creating transactions / calldata, please see este [video](https://www.loom.com/share/33b000ef682c4129995c8fa4bc35db57).
`.trim(),
        },
        gatingType: ProposalGatingType.MANAGER,
      },
    },
    // DAO-Node Integration - Phase 1
    // Shape is the first tenant with Governor v2.0 (AGORA_20) to use DAO-Node
    {
      name: "use-daonode-for-proposals",
      enabled: true,
    },
    {
      name: "dao-node/proposal-votes",
      enabled: true,
    },
    {
      name: "dao-node/delegate/addr",
      enabled: true,
    },
    {
      name: "use-daonode-for-votable-supply",
      enabled: true,
    },
    {
      name: "use-daonode-for-proposal-types",
      enabled: true,
    },
    {
      name: "dao-node/votes-chart",
      enabled: true,
    },
  ],
});
