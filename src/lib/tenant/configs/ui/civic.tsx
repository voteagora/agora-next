import { TenantUI } from "@/lib/tenant/tenantUI";
import civicLogo from "@/assets/tenant/civic_logo.png";
import civicHero from "@/assets/tenant/civic_hero.svg";
import civicInfo1 from "@/assets/tenant/civic_info_1.svg";
import civicInfo2 from "@/assets/tenant/civic_info_2.svg";
import civicInfo3 from "@/assets/tenant/civic_info_3.svg";
import civicInfo4 from "@/assets/tenant/civic_info_4.svg";
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
    success: civicHero,
    pending: civicHero,
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
    // Hero image
    customHeroImageSize: "h-auto w-auto",
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
      hero: civicHero,
      description:
        "CIVIC works globally to improve protection for civilians caught in armed conflict, engaging with armed actors, governments, and international institutions.",
      meta: {
        title: "CIVIC Governance",
        description: "Home of CIVIC community engagement",
        imageTitle: "CIVIC Governance",
        imageDescription: "Home of CIVIC community engagement",
      },
    },
    {
      route: "proposals",
      title: "CIVIC Governance",
      description:
        "CIVIC works globally to improve protection for civilians caught in armed conflict, engaging with armed actors, governments, and international institutions.",
      meta: {
        title: "CIVIC Proposals",
        description: "View and vote on CIVIC community proposals",
        imageTitle: "CIVIC Proposals",
        imageDescription: "View and vote on CIVIC community proposals",
      },
    },
    {
      route: "delegates",
      title: "CIVIC Voters",
      description:
        "CIVIC supporters participate in community decisions through voting and delegation. Delegate your voting power to a trusted representative.",
      meta: {
        title: "CIVIC Voters",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "CIVIC Voters",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "info",
      title: "CIVIC Governance",
      description:
        "CIVIC works globally to improve protection for civilians caught in armed conflict, engaging with armed actors, governments, and international institutions.",
      hero: civicHero,
      meta: {
        title: "About CIVIC Governance",
        description: "Learn about CIVIC community engagement",
        imageTitle: "About CIVIC Governance",
        imageDescription: "Learn about CIVIC community engagement",
      },
      links: [
        {
          name: "Website",
          title: "Website",
          url: "https://civiliansinconflict.org/",
          image: civicInfo1,
        },
        {
          name: "Donate",
          title: "Donate",
          url: "https://civiliansinconflict.org/give/",
          image: civicInfo2,
        },
        {
          name: "Community",
          title: "Community",
          url: "/",
          image: civicInfo3,
        },
        {
          name: "NFT Claim",
          title: "NFT Claim",
          url: "/claim",
          image: civicInfo4,
        },
      ],
    },
    {
      route: "info/about",
      title: "About CIVIC",
      hero: civicHero,
      description: (
        <>
          Center for Civilians in Conflict (CIVIC) promotes the protection of
          civilians in armed conflict across Africa, Europe, the Middle East,
          and through peacekeeping operations worldwide. CIVIC engages directly
          with armed actors, governments, and international institutions to
          develop practical guidance and policies that reduce civilian harm.
          This community engagement platform enables supporters to provide input
          on proposals, delegate voting power, and help shape CIVIC&apos;s
          strategic direction.
        </>
      ),
      sectionTitle: "How it works",
      tabs: [
        {
          icon: <CoinsIcon className="w-[24px] h-[24px]" stroke="#000" />,
          title: "Voting power",
          description:
            "CIVIC supporters can claim a free Supporter NFT that grants voting rights. Each member has equal voting power in all decisions.",
        },
        {
          icon: (
            <NotificationIcon className="w-[24px] h-[24px]" stroke="#000" />
          ),
          title: "Proposals",
          description:
            "Proposals are submitted for community input. Members can vote directly or delegate to representatives they trust.",
        },
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#000"
            />
          ),
          title: "Thresholds",
          description:
            "Community decisions require a quorum and approval threshold to pass, ensuring broad consensus.",
        },
      ],
      meta: {
        title: "About CIVIC",
        description:
          "Center for Civilians in Conflict (CIVIC) is an international organization dedicated to promoting the protection of civilians caught in conflict.",
        imageTitle: "About CIVIC",
        imageDescription:
          "Center for Civilians in Conflict (CIVIC) is an international organization dedicated to promoting the protection of civilians caught in conflict.",
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
      enabled: true,
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
    {
      name: "footer/hide-changelog",
      enabled: true,
    },
    {
      name: "hide-governor-settings",
      enabled: true,
    },
  ],
});
