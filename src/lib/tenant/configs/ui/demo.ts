import { TenantUI, UITaxFormConfig } from "@/lib/tenant/tenantUI";
import demoHero from "@/assets/tenant/demo_hero.png";
import demoHeroV2 from "@/assets/tenant/demo_logo.svg";
import demoDelegate from "@/assets/tenant/demo_delegate.svg";
import demoDocs from "@/assets/tenant/demo_docs.png";
import demoVision from "@/assets/tenant/demo_vision.png";
import demoForum from "@/assets/tenant/demo_forum.png";
import demoDiscord from "@/assets/tenant/demo_discord.png";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const demoTenantUIConfig = new TenantUI({
  title: "Canopy Agora",
  logo: demoHeroV2,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.DEMO)],

  assets: {
    success: demoHeroV2,
    pending: demoHeroV2,
    delegate: demoDelegate,
  },

  organization: {
    title: "Canopy Agora",
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
      title: "Welcome to TKN governance",
      hero: demoHero,
      description:
        "L. Cassius ille, quem populus Romanus verissimum et sapientissimum iudicem putabat, identidem in causis quaerere solebat, cui bono fuisset",
      meta: {
        title: "Welcome to Canopy governance",
        description: "Home of token governance",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "delegates",
      title: "Welcome to TKN governance",
      description:
        "L. Cassius ille, quem populus Romanus verissimum et sapientissimum iudicem putabat, identidem in causis quaerere solebat, cui bono fuisset",
      hero: demoHero,
      meta: {
        title: "Contribute to Canopy with your staked TKN",
        description:
          "L. Cassius ille, quem populus Romanus verissimum et sapientissimum iudicem putabat, identidem in causis quaerere solebat, cui bono fuisset",
        imageTitle: "Canopy Governance",
        imageDescription: "Participate in Canopy Governance",
      },
    },
    {
      route: "proposals",
      title: "Welcome to TKN governance",
      description:
        "L. Cassius ille, quem populus Romanus verissimum et sapientissimum iudicem putabat, identidem in causis quaerere solebat, cui bono fuisset",
      hero: demoHero,
      meta: {
        title: "Voter on Canopy",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Canopy Governance",
        imageDescription: "Participate in Canopy Governance",
      },
    },
    {
      route: "info",
      title: "Welcome to the Community",
      description:
        "Canopy is your home for onchain proposals, voting, and governance",
      meta: {
        title: "Canopy Agora",
        description: "Home of Canopy governance",
        imageTitle: "Canopy Agora",
        imageDescription: "Home of Canopy governance",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://www.agora.xyz/deploy",
          image: demoDiscord,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://www.agora.xyz/deploy",
          image: demoForum,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://www.agora.xyz/deploy",
          image: demoDocs,
        },
        {
          name: "Protocol Vision",
          title: "Protocol Vision",
          url: "https://www.agora.xyz/deploy",
          image: demoVision,
        },
      ],
    },
    {
      route: "info/about",
      title: "About Canopy",
      hero: demoHero,
      description:
        "At vero eos et accusamus et iust odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
      meta: {
        title: "Info about Canopy",
        description: "Welcome to the Canopy Agora",
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
    {
      name: "use-daonode-for-proposal-types",
      enabled: false,
    },
    {
      name: "use-archive-for-vote-history",
      enabled: false,
    },
    {
      name: "duna",
      enabled: true,
    },
    {
      name: "forums",
      enabled: false,
    },
    {
      name: "tax-form",
      enabled: true,
      config: {
        payeeFormUrl: "http://cowrie.io/tax",
        provider: "cowrie",
      } as UITaxFormConfig,
    },
  ],
});
