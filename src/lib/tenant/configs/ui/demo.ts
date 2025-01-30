import { TenantUI } from "@/lib/tenant/tenantUI";
import demoHero from "@/assets/tenant/demo_hero.png";
import demoHeroV2 from "@/assets/tenant/demo_hero_v2.svg";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";

export const demoTenantUIConfig = new TenantUI({
  title: "{Brand name} Agora",
  logo: demoHeroV2,

  assets: {
    success: demoHeroV2,
    pending: demoHeroV2,
    delegate: demoHeroV2,
  },

  organization: {
    title: "{Brand name}",
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
    neutral: "250 250 250",
    wash: "255 255 255",
    line: "223 223 223",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "174 11 229",
    brandSecondary: "242 242 242",
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

  governanceIssues: [
    {
      icon: "piggyBank",
      title: "Grants",
      key: "grants",
    },
    {
      icon: "ballot",
      title: "Decentralization",
      key: "decentralization",
    },
    {
      icon: "globe",
      title: "Ecosystem development",
      key: "ecosystemDevelopment",
    },
    {
      icon: "sparks",
      title: "Public Goods",
      key: "publicGoods",
    },
    {
      icon: "community",
      key: "daoWorkingGroups",
      title: "DAO working groups",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Welcome to the Community",
      hero: demoHero,
      description:
        "Agora is your home for onchain proposals, voting, and governance",
      meta: {
        title: "Welcome to {Brand name} governance",
        description: "Home of token governance",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "delegates",
      title: "Welcome to {Brand name} governance",
      description:
        "L. Cassius ille, quem populus Romanus verissimum et sapientissimum iudicem putabat, identidem in causis quaerere solebat, cui bono fuisset",
      hero: demoHero,
      meta: {
        title: "Contribute to {Brand name} with your staked {Token name}",
        description:
          "{Brand name} is a unified and dedicated delegate portal for {Brand name} governance. {Brand name} is where all protocol improvement votes are executed. After the discussion phase, all official {Brand name} governance activities occur on the {Brand name} portal. This includes member delegation, voting, and other matters related to {Brand name}'s decentralized governance.",
        imageTitle: "{Brand name} Governance",
        imageDescription: "Participate in {Brand name}",
      },
    },
    {
      route: "proposals",
      title: "Welcome to {Brand name} governance",
      description:
        "L. Cassius ille, quem populus Romanus verissimum et sapientissimum iudicem putabat, identidem in causis quaerere solebat, cui bono fuisset",
      hero: demoHero,
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "info",
      title: "Welcome to the Community",
      description:
        "Agora is your home for onchain proposals, voting, and governance",
      meta: {
        title: "{Brand name} Agora",
        description: "Home of {Brand name} governance",
        imageTitle: "{Brand name} Agora",
        imageDescription: "Home of {Brand name} governance",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://www.agora.xyz/deploy",
          image: demoHero,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://www.agora.xyz/deploy",
          image: demoHero,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://www.agora.xyz/deploy",
          image: demoHero,
        },
        {
          name: "Protocol Vision",
          title: "Protocol Vision",
          url: "https://www.agora.xyz/deploy",
          image: demoHero,
        },
      ],
    },
    {
      route: "info/about",
      title: "About {Brand name}",
      hero: demoHero,
      description:
        "At vero eos et accusamus et iust odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
      meta: {
        title: "Info of Agora",
        description: "Welcome to the {Brand name} Agora",
        imageTitle: "",
        imageDescription: "",
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
      name: "delegates/endorsed-filter",
      enabled: true,
      config: {
        tooltip: "Endorsed by {Brand name} team",
        showFilterLabel: "Endorsed Delegates",
        hideFilterLabel: "All Delegates",
        defaultFilter: true,
      },
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
            prodAddress: "0x05a9C4a400cfA64C9639cc2f00B2CF95710f9af1",
            testnetAddress: "0x05a9C4a400cfA64C9639cc2f00B2CF95710f9af1",
          },
          {
            type: ProposalType?.OPTIMISTIC,
            prodAddress: "0x368723068b6C762b416e5A7d506a605E8b816C22",
            testnetAddress: "0x368723068b6C762b416e5A7d506a605E8b816C22",
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
  ],
});
