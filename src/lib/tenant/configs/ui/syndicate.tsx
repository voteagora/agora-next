import React from "react";
import { TenantUI } from "@/lib/tenant/tenantUI";
// TODO: Replace with actual syndicate assets
import syndicateLogo from "@/assets/tenant/syndicate_logo.svg";
import syndicateHero from "@/assets/tenant/syndicate_hero.svg";
import syndicateSuccess from "@/assets/tenant/syndicate_success.svg";
import syndicatePending from "@/assets/tenant/syndicate_pending.svg";
import syndicateInfoCard1 from "@/assets/tenant/syndicate_info_1.svg";
import syndicateInfoCard2 from "@/assets/tenant/syndicate_info_2.svg";
import syndicateInfoCard3 from "@/assets/tenant/syndicate_info_3.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";

export const syndicateTenantUIConfig = new TenantUI({
  title: "Syndicate Agora",
  logo: syndicateLogo,
  tokens: [],

  assets: {
    success: syndicateSuccess,
    pending: syndicatePending,
    delegate: delegateAvatar,
  },

  organization: {
    title: "Syndicate Protocol",
  },

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "236 237 229", // #ECEDE5 - main background
    wash: "236 237 229", // #ECEDE5 - main background
    line: "200 200 200",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "236 237 229", // #ECEDE5 - header background
    tokenAmountFont: "font-chivoMono",
    hideGovernorSettings: true,
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    customInfoTabBackground: "#FFFFFF",
    customButtonBackground: "#FAFAFA",
    customInfoSectionBackground: "#FFFFFF",
    customCardBackground: "#FFFFFF",
    customFooterHideChangelog: true,
    customFooterHideVotableSupply: true,
    customFooterHideTotalSupply: true,
    customFooterBackground: "#ECEDE5",
  },

  links: [
    {
      name: "syndicatetwitter",
      title: "Twitter",
      url: "https://x.com/SyndicateProtocol",
    },
    {
      name: "syndicatefarcaster",
      title: "Farcaster",
      url: "https://farcaster.xyz/syndicate",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Syndicate governance",
      description:
        "Syndicate governance is a collective of companies, communities, and token holders working together to steward the future of the Syndicate protocol",
      hero: syndicateHero,
      meta: {
        title: "Syndicate Agora",
        description: "Home of token governance",
        imageTitle: "Syndicate Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Syndicate delegates",
      description:
        "Syndicate governance is a collective of companies, communities, and token holders working together to steward the future of the Syndicate protocol",
      hero: syndicateHero,
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
      title: "Agora is the home of Syndicate delegates",
      description:
        "Syndicate governance is a collective of companies, communities, and token holders working together to steward the future of the Syndicate protocol",
      hero: syndicateHero,
      meta: {
        title: "Syndicate Agora",
        description: "Home of token governance",
        imageTitle: "Syndicate Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Welcome to the Syndicate Community",
      description:
        "Agora is your home for onchain proposals, voting, and governance",
      meta: {
        title: "Syndicate Protocol Governance",
        description:
          "Syndicate is a public good owned and governed by SYNDICATE token holders.",
        imageTitle: "Syndicate Protocol Governance",
        imageDescription:
          "Syndicate is a public good owned and governed by SYNDICATE token holders.",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://discord.gg/syndicate", // TODO: Update with actual URL
          image: syndicateInfoCard1,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://docs.syndicate.io", // TODO: Update with actual URL
          image: syndicateInfoCard3,
        },
      ],
    },
    {
      route: "info/about",
      title: "About Syndicate",
      hero: syndicateHero,
      description:
        "The Syndicate Protocol is an infrastructure system for creating and managing onchain investment vehicles, DAOs, and collective coordination tools. It is implemented through smart contracts designed to prioritize transparency, accessibility, and trustless collaboration, enabling users to pool resources and deploy capital without centralized intermediaries. The Syndicate Protocol is a public good owned and governed by its community of participants.",
      tabs: [
        {
          icon: <CoinsIcon className="w-[24px] h-[24px]" stroke="#000000" />,
          title: "Delegate voting power",
          description:
            "The collective is governed by the project's token holders.",
        },
        {
          icon: (
            <NotificationIcon className="w-[24px] h-[24px]" stroke="#000000" />
          ),
          title: "Browse proposals",
          description: "Governance decisions begin as proposals.",
        },
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#000000"
            />
          ),
          title: "Vote on proposals",
          description:
            "Proposals that move to a vote are accepted or rejected.",
        },
      ],
      meta: {
        title: "Syndicate Protocol Governance",
        description:
          "Syndicate is a public good owned and governed by SYNDICATE token holders.",
        imageTitle: "Syndicate Protocol Governance",
        imageDescription:
          "Syndicate is a public good owned and governed by SYNDICATE token holders.",
      },
    },
    {
      route: "coming-soon",
      title: "Welcome to Syndicate governance",
      description:
        "Syndicate voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "Syndicate Protocol Governance",
        description: "Syndicate Protocol governance coming soon",
        imageTitle: "Syndicate Protocol Governance",
        imageDescription: "Syndicate Protocol governance coming soon",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: false,
    },
    {
      name: "delegates/edit",
      enabled: false,
    },
    {
      name: "proposals",
      enabled: false,
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
      enabled: false,
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
      name: "coming-soon",
      enabled: true,
    },
    {
      name: "admin",
      enabled: false,
    },
    {
      name: "snapshotVotes",
      enabled: false,
    },
  ],
});
