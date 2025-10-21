import { TenantUI } from "@/lib/tenant/tenantUI";
import pguildLogo from "@/assets/tenant/pguild_logo.svg";
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

export const protocolGuildTenantUIConfig = new TenantUI({
  title: "Protocol Guild",
  logo: pguildLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.PGUILD)],

  assets: {
    success: pguildSuccess,
    pending: pguildHero,
    delegate: delegateAvatar,
  },

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "255 255 255",
    wash: "250 250 250",
    line: "229 229 229",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "255 255 255",
    tokenAmountFont: "font-chivoMono",
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
      title: "Protocol Guild Governance",
      hero: pguildHero,
      description:
        "Protocol Guild is the leading independent organization dedicated to sustainable funding for Ethereum’s core protocol development. Our mission is to secure Ethereum’s future by funding core contributors.",
      meta: {
        title: "Protocol Guild Agora",
        description: "Home of Ethereum L1 R&D governance",
        imageTitle: "Protocol Guild Agora",
        imageDescription: "Home of Ethereum L1 R&D governance",
      },
    },
    {
      route: "proposals",
      title: "Protocol Guild Governance",
      description:
        "Protocol Guild is the leading independent organization dedicated to sustainable funding for Ethereum’s core protocol development. Our mission is to secure Ethereum’s future by funding core contributors.",
      meta: {
        title: "Protocol Guild Agora",
        description: "Home of Ethereum L1 R&D governance",
        imageTitle: "Protocol Guild Agora",
        imageDescription: "Home of Ethereum L1 R&D governance",
      },
    },
    {
      route: "delegates",
      title: "Protocol Guild Governance",
      description:
        "Protocol Guild is the leading independent organization dedicated to sustainable funding for Ethereum’s core protocol development. Our mission is to secure Ethereum’s future by funding core contributors.",
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
      title: "Protocol Guild Governance",
      description:
        "Protocol Guild is the leading independent organization dedicated to sustainable funding for Ethereum’s core protocol development. Our mission is to secure Ethereum’s future by funding core contributors.",
      hero: pguildHero,
      meta: {
        title: "Info of Agora",
        description: "Welcome to Protocol Guild",
        imageTitle: "Info of Agora",
        imageDescription: "Welcome to Protocol Guild",
      },
      links: [
        {
          name: "Website",
          title: "Website",
          url: "https://www.protocolguild.org/",
          image: pguildInfo1,
        },
        {
          name: "Documentation",
          title: "Documentation",
          url: "https://protocol-guild.readthedocs.io/",
          image: pguildInfo2,
        },
        {
          name: "Dune",
          title: "Dune",
          url: "https://dune.com/protocolguild/protocol-guild",
          image: pguildInfo3,
        },
        {
          name: "Other links",
          title: "Other links",
          url: "https://linktr.ee/protocolguild",
          image: pguildInfo4,
        },
      ],
    },
    {
      route: "info/about",
      title: "About Protocol Guild",
      hero: pguildHero,
      description: (
        <>
          Protocol Guild’s Agora DAO includes{" "}
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
            "All Protocol Guild members are given one voting share, which they must delegate to themselves or other members.",
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
        title: "About Protocol Guild",
        description:
          "The Protocol Guild is a collective funding mechanism for +180 Ethereum L1 R&D maintainers 🌿. Supported by donors who have taken the Protocol Guild Pledge, the Protocol Guild's mission is to make contributing to Ethereum L1 R&D economically rational on a risk-adjusted basis, while avoiding capture.",
        imageTitle: "About Protocol Guild",
        imageDescription:
          "The Protocol Guild is a collective funding mechanism for +180 Ethereum L1 R&D maintainers 🌿. Supported by donors who have taken the Protocol Guild Pledge, the Protocol Guild's mission is to make contributing to Ethereum L1 R&D economically rational on a risk-adjusted basis, while avoiding capture.",
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
      enabled: false,
    },
    {
      name: "forums",
      enabled: false,
    },
    {
      name: "proposalsFromArchive",
      enabled: true,
    },
  ],
});
