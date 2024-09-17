import { TenantUI } from "@/lib/tenant/tenantUI";
import ensLogo from "@/assets/tenant/ens_logo.svg";
import successImage from "@/assets/tenant/ens_success.svg";
import pendingImage from "@/assets/tenant/ens_pending.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

export const ensTenantUIConfig = new TenantUI({
  title: "ENS Agora",
  logo: ensLogo,

  assets: {
    // TODO: Replace success and pending images
    success: successImage,
    pending: pendingImage,
    delegate: delegateAvatar,
  },

  organization: {
    title: "ENS Foundation",
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
      title: "Agora is the home of ENS voters",
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "ENS Agora",
        description: "Home of token governance",
        imageTitle: "ENS Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of ENS voters",
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "ENS Agora",
        description: "Home of token governance",
        imageTitle: "ENS Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of ENS voters",
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Voter on Agora",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
  ],

  toggles: [
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
      name: "snapshotVotes",
      enabled: true,
    },
    {
      name: "sponsoredVote",
      enabled: true,
    },
    {
      name: "proposal-lifecycle",
      enabled: true,
      config: {
        stages: [
          {
            stage: PrismaProposalStage.ADDING_TEMP_CHECK,
            order: 0,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.DRAFTING,
            order: 1,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.ADDING_GITHUB_PR,
            order: 2,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.AWAITING_SUBMISSION,
            order: 3,
            isPreSubmission: true,
          },
          {
            stage: PrismaProposalStage.PENDING,
            order: 4,
            isPreSubmission: false,
          },
          {
            stage: PrismaProposalStage.QUEUED,
            order: 5,
            isPreSubmission: false,
          },
          {
            stage: PrismaProposalStage.EXECUTED,
            order: 6,
            isPreSubmission: false,
          },
        ],
        proposalTypes: [ProposalType?.BASIC, ProposalType?.SOCIAL],
        snapshotConfig: {
          domain: "ens.eth",
        },
        copy: {
          helperText: `
## Proposal checklist

**1. Select proposal type**

Proposal types set the quorum and approval thresholds for your proposal. You can view, edit, or create a new one via the [admin panel](https://vote.optimism.io/admin).

**2. Choose your vote type**

This determines if your proposal will be a simple yes/no or a multiple choice.

**3. Create your proposal**

Now that the vote and proposal type are set, you can use this form to create your proposal. Proposed transactions are optional, as the Token House governor is not executable for now.

**4. Get signatures for your SAFE**

If you're using the OP Foundation multisig, you can queue several proposals at once so that your co-signers can sign all the transactions in one sitting. Proposals will appear in chronological order in the final UI, so the last proposal you put in will show up on top for voters. Note that the order is not guaranteed if you batch all the proposal creation transactions into a single block, as then there is no timing difference.

**5. Learn more**

For a full walkthrough of the proposal process, check out the [ENS DAO docs](https://docs.ens.domains/dao/proposals/submit)
`.trim(),
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
      },
    },
  ],
});
