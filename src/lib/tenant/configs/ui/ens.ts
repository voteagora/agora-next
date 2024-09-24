import { TenantUI } from "@/lib/tenant/tenantUI";
import ensLogo from "@/assets/tenant/ens_logo.svg";
import ensHero from "@/assets/tenant/ens_hero.svg";
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
      hero: ensHero,
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

**1. Post a temp check on Discourse**

The purpose of the Temperature Check is to determine if there is sufficient will to make changes to the status quo. To create a Temperature Check, ask a general, non-biased question to the community on discuss.ens.domains about a potential change.

**2. Create a draft proposal on Github**

This determines if your proposal will be a simple yes/no or a multiple choice. To create a Draft Proposal, create a new governance proposal in the governance-docs repository on GitHub. Start by copying the template for an executable proposal, social proposal, or constitutional amendment, as appropriate. Once you have written your proposal, create a Draft Pull Request for it. Start a new post in the DAO-wide -> Draft Proposals category with a link to the PR for discussion.

**3. Create your proposal**

Now you're ready to use this form to create your proposal. Choose whether your proposal is a Social Proposal or Executable. If your proposal is a Social Proposal, that's it! If the vote passes, the proposal is passed and you are done. If it's the latter, once the propose() function has been called, a seven day voting period is started. Ongoing discussion can take place on your proposal post. If the proposal passes successfully, a two day timelock will follow before the proposed code is executed.

**4. Learn more**

For a full walkthrough of the proposal process, check out the [ENS DAO docs](https://docs.ens.domains/dao/proposals/submit)
`.trim(),
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
      },
    },
  ],
});
