import { TenantUI } from "@/lib/tenant/tenantUI";
import civicLogo from "@/assets/tenant/civic_logo.png";
import pguildHero from "@/assets/tenant/pguild_hero.svg";
import pguildInfo1 from "@/assets/tenant/pguild_info_1.svg";
import pguildInfo2 from "@/assets/tenant/pguild_info_2.svg";
import pguildInfo3 from "@/assets/tenant/pguild_info_3.svg";
import pguildInfo4 from "@/assets/tenant/pguild_info_4.svg";
import pguildSuccess from "@/assets/tenant/pguild_success.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { ProposalGatingType, ProposalType } from "@/app/proposals/draft/types";
import { ProposalStage as PrismaProposalStage } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";
import React from "react";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";

export const civicTenantUIConfig = new TenantUI({
  title: "CIVIC",
  logo: civicLogo,
  logoSize: "52px",
  // CIVIC brand colors: Red #FF0D05, Teal #003246
  documentColors: ["#FF0D05", "#003246", "#FFFFFF", "#1A1A1A"],
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.CIVIC)],

  assets: {
    success: pguildSuccess,
    pending: pguildHero,
    delegate: delegateAvatar,
  },

  customization: {
    // Text colors
    primary: "26 26 26", // Near-black for readability
    secondary: "64 64 64",
    tertiary: "115 115 115",
    // Backgrounds
    neutral: "255 255 255", // White main background
    wash: "250 250 250", // Light grey wash
    line: "229 229 229", // Border color
    // Status colors
    positive: "97 209 97",
    negative: "255 13 5", // CIVIC Red for errors
    // Brand colors
    brandPrimary: "255 13 5", // CIVIC Red #FF0D05
    brandSecondary: "255 255 255", // White
    // Layout backgrounds
    headerBackground: "255 255 255", // White header
    footerBackground: "255 255 255", // White footer
    infoSectionBackground: "255 255 255", // White info sections
    infoTabBackground: "#FFFFFF",
    buttonBackground: "#FAFAFA",
    // Font
    font: "font-inter",
    tokenAmountFont: "font-chivoMono",
  },

  organization: {
    title: "CIVIC",
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
      title: "CIVIC Governance",
      hero: pguildHero,
      description:
        "CIVIC is the leading independent organization dedicated to sustainable funding for Ethereum’s core protocol development. Our mission is to secure Ethereum’s future by funding core contributors.",
      meta: {
        title: "CIVIC Agora",
        description: "Home of CIVIC Governance",
        imageTitle: "CIVIC Agora",
        imageDescription: "Home of CIVIC Governance",
      },
    },
    {
      route: "proposals",
      title: "CIVIC Governance",
      description:
        "CIVIC is the leading independent organization dedicated to sustainable funding for Ethereum’s core protocol development. Our mission is to secure Ethereum’s future by funding core contributors.",
      meta: {
        title: "CIVIC Agora",
        description: "Home of CIVIC Governance",
        imageTitle: "CIVIC Agora",
        imageDescription: "Home of CIVIC Governance",
      },
    },
    {
      route: "delegates",
      title: "CIVIC Governance",
      description:
        "CIVIC is the leading independent organization dedicated to sustainable funding for Ethereum’s core protocol development. Our mission is to secure Ethereum’s future by funding core contributors.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Voter on Agora",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "info",
      title: "CIVIC Governance",
      description:
        "CIVIC is the leading independent organization dedicated to sustainable funding for Ethereum’s core protocol development. Our mission is to secure Ethereum’s future by funding core contributors.",
      hero: pguildHero,
      meta: {
        title: "Info of Agora",
        description: "Welcome to CIVIC",
        imageTitle: "Info of Agora",
        imageDescription: "Welcome to CIVIC",
      },
      links: [
        {
          name: "Website",
          title: "Website",
          url: "https://civiliansinconflict.org/",
          image: pguildInfo1,
        },
        {
          name: "Approach",
          title: "Approach",
          url: "https://civiliansinconflict.org/approach/",
          image: pguildInfo2,
        },
        {
          name: "About CIVIC",
          title: "About CIVIC",
          url: "https://civiliansinconflict.org/about-us/",
          image: pguildInfo3,
        },
        {
          name: "History",
          title: "History",
          url: "https://civiliansinconflict.org/our-history/",
          image: pguildInfo4,
        },
      ],
    },
    {
      route: "info/about",
      title: "About CIVIC",
      hero: pguildHero,
      description: (
        <>
          CIVIC&apos;s Agora DAO includes{" "}
          <a
            href="https://protocol-guild.readthedocs.io/en/latest/01-membership.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary"
          >
            all Guild members
          </a>
          , with one person one vote, including vote delegation. The DAO is used
          to ratify changes to the membership on a quarterly basis. It does not
          keep track of{" "}
          <a
            href="https://protocol-guild.readthedocs.io/en/latest/01-membership.html#split-share"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary"
          >
            member weights
          </a>
          , nor does it hold any{" "}
          <a
            href="https://protocol-guild.readthedocs.io/en/latest/02-onchain-architecture.html#vesting-contract"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary"
          >
            funds
          </a>
          .
        </>
      ),
      sectionTitle: "How it works",
      tabs: [
        {
          icon: <CoinsIcon className="w-[24px] h-[24px]" stroke="#000" />,
          title: "Voting power",
          description:
            "All CIVIC members are given one voting share, which they must delegate to themselves or other members.",
        },
        {
          icon: (
            <NotificationIcon className="w-[24px] h-[24px]" stroke="#000" />
          ),
          title: "Proposal cadence",
          description: (
            <>
              Membership updates are batched onchain on a quarterly basis to
              minimize governance overhead.
            </>
          ),
        },
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#000"
            />
          ),
          title: "Proposal thresholds",
          description:
            "Membership updates require a quorum of 33% and an approval threshold of 51% to pass.",
        },
      ],
      meta: {
        title: "About CIVIC",
        description:
          "The CIVIC is a collective funding mechanism for +180 Ethereum L1 R&D maintainers 🌿. Supported by donors who have taken the CIVIC Pledge, the CIVIC's mission is to make contributing to Ethereum L1 R&D economically rational on a risk-adjusted basis, while avoiding capture.",
        imageTitle: "About CIVIC",
        imageDescription:
          "The CIVIC is a collective funding mechanism for +180 Ethereum L1 R&D maintainers 🌿. Supported by donors who have taken the CIVIC Pledge, the CIVIC's mission is to make contributing to Ethereum L1 R&D economically rational on a risk-adjusted basis, while avoiding capture.",
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
      name: "proposals/pretty-view",
      enabled: true,
    },
    {
      name: "info",
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
      name: "use-daonode-for-proposals",
      enabled: false,
    },
    {
      name: "use-daonode-for-votable-supply",
      enabled: true,
    },
    {
      name: "use-daonode-for-proposal-types",
      enabled: true,
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
      name: "use-archive-for-vote-history",
      enabled: false,
    },
    {
      name: "forums",
      enabled: false,
    },
    {
      name: "notifications",
      enabled: true,
    },
    {
      name: "mirador",
      enabled: true,
      config: {
        proposalCreation: true,
        siweLoginTracing: true,
        governanceVote: true,
        governanceDelegation: true,
        staking: true,
        governanceAdmin: true,
        proposalAttestation: true,
        membershipAdmin: true,
      },
    },
    {
      name: "safe-proposal-choice",
      enabled: true,
    },
    {
      name: "safe-tracking",
      enabled: true,
      config: {
        offchainMessageTracking: true,
        onchainTransactionTracking: true,
      },
    },
  ],
});
