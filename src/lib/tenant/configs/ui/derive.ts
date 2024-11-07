import { TenantUI } from "@/lib/tenant/tenantUI";
import deriveHero from "@/assets/tenant/derive_hero.svg";
import deriveLogo from "@/assets/tenant/derive_logo.svg";
import delegateImage from "@/assets/tenant/derive_delegate.svg";
import successImage from "@/assets/tenant/derive_success.svg";
import pendingImage from "@/assets/tenant/derive_pending.svg";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";

export const deriveTenantUIConfig = new TenantUI({
  title: "Derive Agora",
  logo: deriveLogo,

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Derive DAO",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  links: [
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.com/invite/Derive",
    },
  ],

  smartAccountConfig: {
    factoryAddress: "0x000000893A26168158fbeaDD9335Be5bC96592E2",
    version: "v2.0.0",
    type: "LightAccount",
    salt: BigInt(0),
  },

  governanceIssues: [
    {
      icon: "piggyBank",
      title: "Treasury",
      key: "treasury",
    },
    {
      icon: "ballot",
      title: "Metagovernance",
      key: "metaGovernance",
    },
    {
      icon: "stack",
      title: "Protocol",
      key: "protocol",
    },
    {
      icon: "sparks",
      title: "Grants",
      key: "grants",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Derive governance",
      description: "Derive governance is launching now. ",
      hero: deriveHero,
      meta: {
        title: "Derive Agora",
        description: "Home of token governance",
        imageTitle: "Derive Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Agora is the home of Derive governance",
      description: "Derive governance is launching now.",
      hero: deriveHero,
      meta: {
        title: "Derive Agora",
        description: "Home of token governance",
        imageTitle: "Derive Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Derive delegates",
      description:
        "Derive voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      hero: deriveHero,
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Voter on Agora",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Derive delegates",
      description:
        "Derive voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      hero: deriveHero,
      meta: {
        title: "Derive Agora",
        description: "Home of token governance",
        imageTitle: "Derive Agora",
        imageDescription: "Home of token governance",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "delegates/edit",
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
        proposalTypes: [ProposalType?.BASIC, ProposalType?.APPROVAL],
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
  ],
});
