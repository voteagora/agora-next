import { TenantUI } from "@/lib/tenant/tenantUI";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";
import demoLogo from "@/assets/tenant/demo_logo.svg";
import demoDelegate from "@/assets/tenant/demo_delegate.svg";

export const contestTenantUIConfig = new TenantUI({
  title: "Agora Novo Origo Prize",
  logo: demoLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.CONTEST)],

  assets: {
    success: demoLogo,
    pending: demoLogo,
    delegate: demoDelegate,
  },

  organization: {
    title: "Novo Origo Prize",
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
    brandPrimary: "99 102 241",
    brandSecondary: "242 242 242",
  },

  links: [
    {
      name: "contest-rules",
      title: "Contest Rules",
      url: "/info",
    },
    {
      name: "github-repo",
      title: "GitHub Repository",
      url: "https://github.com/voteagora/novo-origo-contest-submissions",
    },
  ],

  governanceIssues: [],

  pages: [
    {
      route: "/",
      title: "Agora Novo Origo Prize",
      description:
        "$15K for the best governance design for a new L1 blockchain",
      meta: {
        title: "Agora Novo Origo Prize",
        description:
          "$15K governance design competition for a new L1 blockchain",
        imageTitle: "Agora Novo Origo Prize",
        imageDescription: "$15K Governance Design Competition",
      },
    },
    {
      route: "info",
      title: "Contest Rules & Details",
      description: "Everything you need to know about the Novo Origo Prize",
      meta: {
        title: "Novo Origo Prize - Rules & Details",
        description:
          "$15K governance design competition for a new L1 blockchain",
        imageTitle: "Novo Origo Prize",
        imageDescription: "Contest Rules & Details",
      },
    },
    {
      route: "submissions",
      title: "Submissions",
      description: "Browse and submit governance design proposals",
      meta: {
        title: "Novo Origo Prize - Submissions",
        description: "Browse governance design submissions",
        imageTitle: "Novo Origo Prize Submissions",
        imageDescription: "Governance Design Proposals",
      },
    },
    {
      route: "forums",
      title: "Discussion",
      description: "Discuss and critique submissions",
      meta: {
        title: "Novo Origo Prize - Discussion",
        description: "Discuss and critique governance design submissions",
        imageTitle: "Novo Origo Prize Discussion",
        imageDescription: "Community Discussion",
      },
    },
    {
      route: "proposals",
      title: "Voting",
      description: "Vote on the winning submission using NOVO tokens",
      meta: {
        title: "Novo Origo Prize - Voting",
        description: "Vote on the winning governance design",
        imageTitle: "Novo Origo Prize Voting",
        imageDescription: "Vote for the Winner",
      },
    },
    {
      route: "delegates",
      title: "Novo Origo Prize Delegates",
      description: "Delegate your voting power for the Novo Origo Prize",
      meta: {
        title: "Novo Origo Prize - Delegates",
        description:
          "Delegate your voting power for the governance design competition",
        imageTitle: "Novo Origo Prize Delegates",
        imageDescription: "Delegate your voting power",
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
      enabled: false,
    },
    {
      name: "delegates/edit",
      enabled: false,
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
      name: "submissions",
      enabled: true,
    },
    {
      name: "proposal-execute",
      enabled: false,
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
        ],
        copy: {
          helperText: `
## Novo Origo Prize Voting

Vote on qualified submissions to determine the winner of the $15K governance design prize.

**Voting Power:**
- 3 votes for identified submitters
- 1 vote for anonymous submitters
- 0 votes for Agora staff

The submission with the most votes wins the prize.
          `.trim(),
        },
        gatingType: ProposalGatingType?.GOVERNOR_V1,
      },
    },
    {
      name: "forums",
      enabled: true,
    },
    {
      name: "grants",
      enabled: false,
    },
    {
      name: "notifications",
      enabled: false,
    },
  ],
});
