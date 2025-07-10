import { TenantUI } from "@/lib/tenant/tenantUI";
import WorldHero from "@/assets/tenant/world_hero.svg";
import WorldLogo from "@/assets/tenant/world_logo.svg";
import demoDelegate from "@/assets/tenant/demo_delegate.svg";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const worldTenantUIConfig = new TenantUI({
  title: "World",
  logo: WorldLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.WORLD)],

  assets: {
    success: WorldLogo,
    pending: WorldLogo,
    delegate: demoDelegate,
  },

  organization: {
    title: "World Agora",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "51 49 46",
    secondary: "132 131 130",
    tertiary: "173 172 172",
    neutral: "248 248 247",
    wash: "252 251 247",
    line: "214 214 213",
    positive: "0 171 72",
    negative: "234 57 42",
    brandPrimary: "51 49 46",
  },

  links: [
    {
      name: "code-of-conduct",
      title: "Code of Conduct",
      url: "https://www.agora.xyz/deploy",
    },
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Welcome to World governance",
      hero: WorldHero,
      description:
        "World Foundation serves as the steward of World, supporting and growing the network's self-sufficiency. Aiming for a inclusive, fair and just governance.",
      meta: {
        title: "Welcome to World governance",
        description: "Home of token governance",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "proposals",
      title: "Welcome to World governance",
      description:
        "World Foundation serves as the steward of World, supporting and growing the network's self-sufficiency. Aiming for a inclusive, fair and just governance.",
      hero: WorldHero,
      meta: {
        title: "Voter on World",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "World Governance",
        imageDescription: "Participate in World Governance",
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
            type: ProposalType?.APPROVAL,
            prodAddress: "0x0000000000000000000000000000000000000000",
            testnetAddress: "0x0000000000000000000000000000000000000000",
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
        gatingType: ProposalGatingType?.PERMISSION_TOKEN,
      },
    },
    {
      name: "use-daonode-for-proposals",
      enabled: true,
    },
    {
      name: "use-daonode-for-votable-supply",
      enabled: false,
    },
    {
      name: "use-daonode-for-proposal-types",
      enabled: true,
    },
    {
      name: "use-daonode-for-get-needs-my-vote-proposals",
      enabled: true,
    },
    {
      name: "show-supply-stats",
      enabled: false,
    },
    {
      name: "show-chart",
      enabled: false,
    },
    {
      name: "show-quorum-and-threshold",
      enabled: false,
    },
    {
      name: "show-min-participation",
      enabled: true,
    },
  ],
});
