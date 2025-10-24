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
  tokens: [
    {
      address: "0x1bAB804803159aD84b8854581AA53AC72455614E",
      symbol: "SYND",
      decimals: 18,
      name: "Syndicate (ETH)",
      chainId: 1,
    },
    {
      address: "0x11dC28D01984079b7efE7763b533e6ed9E3722B9",
      symbol: "SYND",
      decimals: 18,
      name: "Syndicate (Base)",
      chainId: 8453,
    },
  ],

  assets: {
    success: syndicateSuccess,
    pending: syndicatePending,
    delegate: delegateAvatar,
  },

  organization: {
    title: "Syndicate Network",
  },

  dunaDisclaimers:
    "* DUNA Administration Docs will archive upon the release of the year-end financial statements and tax update.",

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "255 255 255", // #FFFFFF - main background
    wash: "236 237 229", // #ECEDE5 - main background
    line: "200 200 200",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "236 237 229", // #ECEDE5 - header background
    tokenAmountFont: "font-chivoMono",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    infoTabBackground: "#FFFFFF",
    buttonBackground: "#FAFAFA",
    infoSectionBackground: "255 255 255",
    // cardBackground: "#FFFFFF", // removing this for now since this causes text to be white in duna content rendere
    customIconBackground: "#FBFBFB",
    footerBackground: "236 237 229",
    customAboutSubtitle: "About Syndicate Network Collective",
    customIconColor: "#87819F",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    noReportsFound: "Quarterly Reports will be posted on October 15th, 2025.",
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
        "Syndicate governance is a collective of companies, communities, and token holders working together to steward the future of the Syndicate Network",
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
        "Syndicate governance is a collective of companies, communities, and token holders working together to steward the future of the Syndicate Network",
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
        "Syndicate governance is a collective of companies, communities, and token holders working together to steward the future of the Syndicate Network",
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
      title: "Welcome to Syndicate Network Collective",
      description:
        "The Syndicate Network Collective, a Wyoming DUNA. Member Dashboard for DUNA documents, onchain proposals, voting and governance.",
      meta: {
        title: "Syndicate Network Governance",
        description:
          "The Syndicate Network Collective, a Wyoming DUNA. Member Dashboard for DUNA documents, onchain proposals, voting and governance.",
        imageTitle: "Syndicate Network Governance",
        imageDescription:
          "The Syndicate Network Collective, a Wyoming DUNA. Member Dashboard for DUNA documents, onchain proposals, voting and governance.",
      },
      links: [
        {
          name: "Syndicate Network",
          title: "Syndicate Network",
          url: "https://docs.syndicate.io/",
          image: syndicateInfoCard1,
        },
        {
          name: "Grants Program",
          title: "Grants Program",
          url: "https://bronze-abundant-swift-398.mypinata.cloud/ipfs/QmSQn9P7LzGPa2RJsTDVMaKPw9UoqJTMRoxJTiABpi6YAR",
          image: syndicateInfoCard2,
        },
        {
          name: "Governance",
          title: "Governance",
          url: "https://www.syndicatecollective.org/coming-soon", // TODO: Update with actual URL
          image: syndicateInfoCard3,
        },
        {
          name: "Document Archive",
          title: "Document Archive*",
          url: "/document-archive",
          image: syndicateInfoCard3,
        },
      ],
    },
    {
      route: "info/about",
      title: "Syndicate Network Collective Roadmap",
      hero: syndicateHero,
      description:
        "This dashboard is the focal point for information related to the Syndicate Network Collective DUNA. As a taxpaying U.S. entity, it is essential that members are aware of the financial inflows and outflows (and related tax consequences) of the DUNA Treasury in a clear and concise manner.\n\nThe SYND governance token provides the members with ultimate control over how the Treasury should be utilized in support of the Syndicate Network.\n\nThe Syndicate Network Collective is established as an organizational framework for collective decision-making and innovation to pursue the common, nonprofit purpose of providing a foundation for community-aligned platforms to reshape how participation and contribution is valued on the internet.",
      sectionTitle: "Syndicate Network Collective Roadmap",
      tabs: [
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#737373"
            />
          ),
          title: "November 3, 2025",
          description:
            "Token governance is live, with a temp-check and tax reporting intake (via Cowrie – Administrator Services tooling) completed upon passage of the governance proposal.",
        },
      ],
      meta: {
        title: "Syndicate Network Governance",
        description:
          "The Syndicate Network Collective, a Wyoming DUNA. Member Dashboard for DUNA documents, onchain proposals, voting and governance.",
        imageTitle: "Syndicate Network Governance",
        imageDescription:
          "The Syndicate Network Collective, a Wyoming DUNA. Member Dashboard for DUNA documents, onchain proposals, voting and governance.",
      },
    },
    {
      route: "coming-soon",
      title: "Welcome to Syndicate governance",
      description: `Syndicate governance goes live on November 3rd, 2025.
`,
      meta: {
        title: "Syndicate Network Governance",
        description: "Syndicate Network governance coming soon",
        imageTitle: "Syndicate Network Governance",
        imageDescription: "Syndicate Network governance coming soon",
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
      name: "use-archive-for-proposals",
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
      name: "forums",
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
      enabled: true,
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
      name: "easv2-govlessvoting",
      enabled: false,
    },
  ],
});
