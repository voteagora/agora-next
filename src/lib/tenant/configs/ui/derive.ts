import { TenantUI } from "@/lib/tenant/tenantUI";
import deriveHero from "@/assets/tenant/derive_hero.svg";
import deriveLogo from "@/assets/tenant/derive_logo.svg";
import delegateImage from "@/assets/tenant/derive_delegate.svg";
import successImage from "@/assets/tenant/derive_success.svg";
import pendingImage from "@/assets/tenant/derive_pending.svg";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";

const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
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

  customization: {
    primary: "232 231 255",
    secondary: "149 149 143",
    tertiary: "149 149 143",
    neutral: "9 10 10",
    wash: "20 20 20",
    line: "38 41 41",
    positive: "19 238 154",
    negative: "246 62 88",
    brandPrimary: "244 62 88",
    brandSecondary: "251 165 42",
  },

  links: [
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.com/invite/Derive",
    },
  ],

  smartAccountConfig: {
    bundlerUrl: "https://bundler-prod-testnet-0eakp60405.t.conduit.xyz",
    entryPointAddress: isProd
      ? "0x0"
      : "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factoryAddress: isProd
      ? "0x0"
      : "0x000000893A26168158fbeaDD9335Be5bC96592E2",
    paymasterAddress: isProd
      ? "0x0"
      : "0x5a6499b442711feeA0Aa73C6574042EC5E2e5945",
    paymasterUrl: "https://derive.xyz/api/paymaster",
    salt: BigInt(0),
    type: "LightAccount",
    version: "v1.0.0",
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
