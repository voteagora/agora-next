import { TenantUI } from "@/lib/tenant/tenantUI";
import b3Logo from "@/assets/tenant/b3_logo.svg";
import delegateImage from "@/assets/tenant/b3_delegate.svg";
import successImage from "@/assets/tenant/b3_success.svg";
import pendingImage from "@/assets/tenant/b3_pending.svg";
import infoPageCard01 from "@/assets/tenant/b3_info_1.png";
import infoPageCard02 from "@/assets/tenant/b3_info_2.png";
import infoPageCard03 from "@/assets/tenant/b3_info_3.png";
import infoPageCard04 from "@/assets/tenant/b3_info_4.png";
import infoPageHero from "@/assets/tenant/b3_info_hero.png";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const b3TenantUIConfig = new TenantUI({
  title: "B3 Agora",
  logo: b3Logo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.B3)],

  googleAnalytics: "G-WDBYC8751R",

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "B3",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "39 39 39",
    secondary: "39 39 39",
    tertiary: "68 68 68",
    neutral: "255 255 255",
    wash: "255 255 255",
    line: "121 121 121",
    positive: "52 179 74",
    negative: "239 76 76",
    brandPrimary: "51 104 239",
    brandSecondary: "242 242 242",
  },

  links: [
    {
      name: "code-of-conduct",
      title: "Code of Conduct",
      url: "https://forum.b3.fun/t/delegate-code-of-conduct/17",
    },
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
  ],

  governanceIssues: [],

  pages: [
    {
      route: "/",
      title: "Welcome to the B3 Community",
      description:
        "Delegates represent the B3 ecosystem, guiding governance decisions on behalf of B3 token holders. Delegate your voting power, or vote directly on proposals to move the ecosystem forward.",
      meta: {
        title: "B3 Agora",
        description:
          "Delegates represent the B3 ecosystem, guiding governance decisions on behalf of B3 token holders. Delegate your voting power, or vote directly on proposals to move the ecosystem forward.",
        imageTitle: "B3 Agora",
        imageDescription:
          "Delegates represent the B3 ecosystem, guiding governance decisions on behalf of B3 token holders. Delegate your voting power, or vote directly on proposals to move the ecosystem forward.",
      },
    },
    {
      route: "delegates",
      title: "Welcome to the B3 Governance",
      description:
        "Delegates represent the B3 ecosystem, guiding governance decisions on behalf of B3 token holders. Delegate your voting power, or vote directly on proposals to move the ecosystem forward.",
      meta: {
        title: "B3 Agora",
        description:
          "Delegates represent the B3 ecosystem, guiding governance decisions on behalf of B3 token holders. Delegate your voting power, or vote directly on proposals to move the ecosystem forward.",
        imageTitle: "B3 Agora",
        imageDescription:
          "Delegates represent the B3 ecosystem, guiding governance decisions on behalf of B3 token holders. Delegate your voting power, or vote directly on proposals to move the ecosystem forward.",
      },
    },
    {
      route: "proposals",
      title: "Welcome to the B3 Governance",
      description:
        "Cyber delegates are the stewards of the Cyber DAO, appointed by token holders to make governance decisions on their behalf.",
      meta: {
        title: "B3 Agora",
        description:
          "Delegates represent the B3 ecosystem, guiding governance decisions on behalf of B3 token holders. Delegate your voting power, or vote directly on proposals to move the ecosystem forward.",
        imageTitle: "B3 Agora",
        imageDescription:
          "Delegates represent the B3 ecosystem, guiding governance decisions on behalf of B3 token holders. Delegate your voting power, or vote directly on proposals to move the ecosystem forward.",
      },
    },
    {
      route: "info",
      title: "Welcome to the B3 Community",
      hero: infoPageHero,
      description:
        "Created by the ex-base team, B3 is the first horizontally scaled, hyper-operable ecosystem of gamechains, powering the future of gaming.",
      meta: {
        title: "B3 Agora",
        description:
          "Created by the ex-base team, B3 is the first horizontally scaled, hyper-operable ecosystem of gamechains, powering the future of gaming.",
        imageTitle: "B3 Agora",
        imageDescription:
          "Created by the ex-base team, B3 is the first horizontally scaled, hyper-operable ecosystem of gamechains, powering the future of gaming.",
      },
      links: [
        {
          name: "B3.fun",
          title: "B3.fun",
          url: "https://b3.fun/",
          image: infoPageCard01,
        },
        {
          name: "Discord",
          title: "Discord",
          url: "https://discord.gg/b3dotfun",
          image: infoPageCard02,
        },
        {
          name: "Governance forums",
          title: "Governance forums",
          url: "https://forum.b3.fun/",
          image: infoPageCard03,
        },
        {
          name: "Protocol docs",
          title: "Protocol docs",
          url: "https://docs.b3.fun/",
          image: infoPageCard04,
        },
      ],
    },
    {
      route: "info/about",
      title: "Welcome to the B3 Governance",
      hero: infoPageHero,
      description:
        "Created by the ex-base team, B3 is the first horizontally scaled, hyper-operable ecosystem of gamechains, powering the future of gaming.",
      meta: {
        title: "B3 Agora",
        description:
          "Created by the ex-base team, B3 is the first horizontally scaled, hyper-operable ecosystem of gamechains, powering the future of gaming.",
        imageTitle: "B3 Agora",
        imageDescription:
          "Created by the ex-base team, B3 is the first horizontally scaled, hyper-operable ecosystem of gamechains, powering the future of gaming.",
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
      name: "delegates/code-of-conduct",
      enabled: true,
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
            prodAddress: "0x4990CcE6e8CD9596305b83C4860D4C0f3Bf4e8fa",
            testnetAddress: "0x1986516d07ABEddF8107F98b443F21ECFEE1d164",
          },
          {
            type: ProposalType?.OPTIMISTIC,
            prodAddress: "0xf8D15c3132eFA557989A1C9331B6667Ca8Caa3a9",
            testnetAddress: "0xb09A941C4843f79423c8f2C8562aeD1691cbe674",
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
      name: "use-daonode-for-proposal-types",
      enabled: false,
    },
    {
      name: "use-archive-vote-history",
      enabled: true,
    },
    {
      name: "forums",
      enabled: false,
    },
  ],
});
