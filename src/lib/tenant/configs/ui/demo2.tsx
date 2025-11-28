import { TenantUI } from "@/lib/tenant/tenantUI";
import demoHero from "@/assets/tenant/demo_hero.png";
import demoHeroV2 from "@/assets/tenant/demo_logo.svg";
import demoDelegate from "@/assets/tenant/demo_delegate.svg";
import demoDocs from "@/assets/tenant/demo_docs.png";
import demoVision from "@/assets/tenant/demo_vision.png";
import demoForum from "@/assets/tenant/demo_forum.png";
import demoDiscord from "@/assets/tenant/demo_discord.png";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import DelegatingSectionContent from "@/app/info/components/DelegatingSectionContent";

export const demo2TenantUIConfig = new TenantUI({
  title: "Canopy Agora",
  logo: demoHeroV2,

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
      name: "delegates",
      enabled: true,
    },
    {
      name: "delegation-encouragement",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: false,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "info",
      enabled: true,
    },
    {
      name: "info/governance-charts",
      enabled: false,
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
                ## Proposal checklist
- Make sure that you have simulated and review your transactions before seeking sponsorship.
- Check your markdown previews to ensure you didn't break any links.
- Review your description and make sure it's clear and concise.
- Remember that everything lasts forever onchain, check your spelling and grammar and make this one count. You got this.
`.trim(),
        },
        gatingType: ProposalGatingType?.TOKEN_THRESHOLD,
      },
    },
    {
      name: "use-archive-for-proposals",
      enabled: true,
    },
    {
      name: "use-archive-for-proposal-details",
      enabled: true,
    },
    {
      name: "use-daonode-for-proposals",
      enabled: false,
    },
    {
      name: "use-daonode-for-votable-supply",
      enabled: false,
    },
    {
      name: "use-daonode-for-proposal-types",
      enabled: false,
    },
    {
      name: "duna",
      enabled: true,
    },
    {
      name: "forums",
      enabled: true,
    },
    {
      name: "has-eas-oodao",
      enabled: true,
    },
    {
      name: "coming-soon",
      enabled: false,
    },
    {
      name: "admin",
      enabled: false,
    },
    {
      name: "snapshotVotes",
      enabled: false,
    },
    {
      name: "coming-soon/show-static-proposals",
      enabled: true,
    },
    {
      name: "hide-governor-settings",
      enabled: true,
    },
    {
      name: "hide-hero",
      enabled: false,
    },
    {
      name: "hide-hero-image",
      enabled: true,
    },
    {
      name: "footer/hide-total-supply",
      enabled: true,
    },
    {
      name: "footer/hide-votable-supply",
      enabled: true,
    },
    {
      name: "footer/hide-changelog",
      enabled: true,
    },
    {
      name: "changelog/simplified-view",
      enabled: true,
    },
    {
      name: "syndicate-hero-content",
      enabled: true,
    },
    {
      name: "duna/use-community-dialogue-label",
      enabled: true,
    },
    {
      name: "syndicate-duna-disclosures",
      enabled: true,
    },
    {
      name: "show-delegate-badges",
      enabled: true,
    },
    {
      name: "easv2-govlessvoting",
      enabled: true,
    },
    {
      name: "syndicate-colours-fix-delegate-pages",
      enabled: false,
    },
    {
      name: "syndicate-proposals-page-content",
      enabled: false,
    },
    {
      name: "proposals-page-info-banner",
      enabled: true,
      config: {
        text: "Learn more about the voting process",
        link: "/info#voting-process",
        storageKey: "syndicate-voting-process-banner-dismissed",
      },
    },
    {
      name: "use-archive-for-vote-history",
      enabled: false,
    },
    {
      name: "syndicate-voters-page-content",
      enabled: false,
    },
    {
      name: "delegates-page-info-banner",
      enabled: true,
      config: {
        text: "Learn more about voting power & delegation",
        link: "/info#voting-power",
        storageKey: "syndicate-voting-power-banner-dismissed",
      },
    },
    {
      name: "delegates-layout-list",
      enabled: true,
    },
    {
      name: "info/governance-sections",
      enabled: true,
      config: {
        title: "Voting in the Canopy Agora",
        sections: [
          {
            id: "voting-process",
            title: "Voting process",
            content: (
              <ul className="list-disc list-outside space-y-2 ml-6">
                <li>
                  In order for a <strong>Governance Proposal</strong> to be
                  enacted, it must:
                  <ul className="list-[circle] list-outside space-y-2 ml-6 mt-2 text-sm leading-relaxed">
                    <li>
                      first be submitted as a <strong>Temp-Check</strong>, which
                      is a five-day period during which <strong>Members</strong>{" "}
                      can utilize their TKN token to indicate support for a
                      proposal. In order for a proposal to transition from a{" "}
                      <strong>Temp-Check</strong> to a vote of the membership,
                      the <strong>Temp-Check</strong> must attain the support of
                      5% of the TKN tokens in circulation, except as limited by
                      Article 13 of the Association Agreement.
                    </li>
                    <li>
                      upon a successful <strong>Temp-Check</strong>, the{" "}
                      <strong>Governance Proposal</strong> period is open for
                      seven days, during which time
                      <strong> Members</strong> can utilize their TKN token to
                      affirm, deny, or participate without voting on the
                      proposal. A proposal:
                      <ul className="list-[square] list-outside space-y-1 ml-6 mt-2 text-sm leading-relaxed">
                        <li>
                          <strong>passes</strong> if the majority of votes
                          affirm the proposal and 10% of the TKN tokens in
                          circulation participate in the vote; and
                        </li>
                        <li>
                          <strong>fails</strong> if the majority of votes deny
                          the proposal or 10% of the TKN tokens in circulation
                          did not participate in the vote.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  A passed <strong>Governance Proposal</strong> can be reverted
                  for further consideration and modification pursuant to Article
                  14 of the Association Agreement if it is determined by the{" "}
                  <strong>Rules Committee</strong> within 3-days of passage to
                  be violative of legal requirements, technically unfeasible, or
                  malicious. If the 3-day period expires without reversion or
                  the <strong>Rules Committee</strong> affirms the{" "}
                  <strong>Governance Proposal</strong>, it is enacted.
                </li>
                <li>
                  Upon enactment of a <strong>Governance Proposal</strong>, any
                  recipients of funds must complete a tax reporting intake
                  through tooling provided by the
                  <strong> Rules Committee Administrator</strong> within 15
                  days, or the payment will expire, and the recipient shall not
                  be eligible to receive the funds absent future{" "}
                  <strong>Governance Proposal</strong>.
                </li>
              </ul>
            ),
          },
          {
            id: "voting-power",
            title: "How voting power works",
            content: (
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-col space-y-3">
                    <p>
                      The TKN token uses OpenZeppelin&apos;s ERC20Votes. Your
                      tokens don&apos;t count as votes until you choose where
                      your voting power should live:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                      <li>
                        <strong>Self-delegate</strong> to vote directly from
                        your own wallet.
                      </li>
                      <li>
                        <strong>Delegate to someone you trust</strong> so they
                        can vote on your behalf.
                      </li>
                    </ul>
                    <p>
                      Either way, you keep full ownership of your tokens.
                      Delegation <strong>does not</strong> let anyone move your
                      tokens or claim them; it only points your voting power.
                      You can change or revoke delegation at any time by making
                      a new delegation.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <h3 className="text-[15px] font-semibold text-primary">
                    Why it&apos;s designed this way:
                  </h3>
                  <p>
                    This model keeps everyday transfers cheaper and lets
                    governance use reliable onchain snapshots of voting power at
                    specific blocks.
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: "delegating",
            title: "Delegating to yourself and others",
            content: <DelegatingSectionContent />,
          },
        ],
      },
    },
  ],
});
