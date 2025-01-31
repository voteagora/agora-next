import { TenantUI } from "@/lib/tenant/tenantUI";
import xaiLogo from "@/assets/tenant/xai_logo.svg";
import xaiBanner from "@/assets/tenant/xai_banner.svg";
import successImage from "@/assets/tenant/xai_success.svg";
import pendingImage from "@/assets/tenant/xai_pending.svg";
import delegateImage from "@/assets/tenant/xai_logo.svg";
import infoPageCard01 from "@/assets/tenant/xai_info_1.svg";
import infoPageCard02 from "@/assets/tenant/xai_info_2.svg";
import infoPageCard03 from "@/assets/tenant/xai_info_3.svg";
import infoPageCard04 from "@/assets/tenant/xai_info_4.svg";

import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

export const xaiTenantUIConfig = new TenantUI({
  title: "Xai Agora",
  logo: xaiLogo,

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
    primary: "250 250 249",
    secondary: "245 245 255",
    tertiary: "231 229 228",
    neutral: "12 10 9",
    wash: "28 25 23",
    line: "41 37 36",
    positive: "34 197 94",
    negative: "239 68 68",
    brandPrimary: "255 0 48",
    brandSecondary: "12 10 9",
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
    title: "Xai",
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
      title: "Agora is the home of Xai voters",
      description:
        "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
      hero: xaiBanner,
      meta: {
        title: "Xai Agora",
        description:
          "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
        imageTitle: "Xai Agora",
        imageDescription:
          "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Xai voters",
      description:
        "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
      hero: xaiBanner,
      meta: {
        title: "Xai Agora",
        description:
          "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
        imageTitle: "Xai Agora",
        imageDescription:
          "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Xai voters",
      description:
        "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
      hero: xaiBanner,
      meta: {
        title: "Voter on Agora",
        description:
          "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
        imageTitle: "Voter on Agora",
        imageDescription:
          "This is the home of Xai Governance. Membership is determined by holding the Xai token",
      },
    },
    {
      route: "info",
      title: "Welcome to Xai Governance",
      description:
        "This is the home of Xai Governance. Membership is determined by holding the Xai token.",
      meta: {
        title: "Xai Governance",
        description: "Home of Xai Governance",
        imageTitle: "Xai Governance",
        imageDescription: "Home of Xai Governance",
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
          name: "Xai Vision",
          title: "Xai Vision",
          url: "",
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
  ],
});
