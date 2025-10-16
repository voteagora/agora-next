import React from "react";
import { TenantUI } from "@/lib/tenant/tenantUI";
import townsLogo from "@/assets/tenant/towns_logo.svg";
import townsHero from "@/assets/tenant/towns_hero.svg";
import townsSuccess from "@/assets/tenant/towns_success.svg";
import townsPending from "@/assets/tenant/towns_pending.svg";
import townsInfoHero from "@/assets/tenant/towns_hero.svg";
import townsInfoCard1 from "@/assets/tenant/towns_info_1.svg";
import townsInfoCard2 from "@/assets/tenant/towns_info_2.svg";
import townsInfoCard3 from "@/assets/tenant/towns_info_3.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";

export const townsTenantUIConfig = new TenantUI({
  title: "Towns Protocol",
  logo: townsLogo,
  logoSize: "36px",
  tokens: [
    {
      address: "0x000000Fa00b200406de700041CFc6b19BbFB4d13",
      symbol: "TOWNS",
      decimals: 18,
      name: "Towns (ETH)",
      chainId: 1,
    },
    {
      address: "0x00000000bcA93b25a6694ca3d2109d545988b13B",
      symbol: "TOWNS",
      decimals: 18,
      name: "Towns (BNB)",
      chainId: 56,
    },
    {
      address: "0x00000000A22C618fd6b4D7E9A335C4B96B189a38",
      symbol: "TOWNS",
      decimals: 18,
      name: "Towns (Base)",
      chainId: 8453,
    },
  ],
  hideAgoraBranding: true,

  assets: {
    success: townsSuccess,
    pending: townsPending,
    delegate: delegateAvatar,
  },

  customization: {
    primary: "255 255 255",
    secondary: "222 220 229",
    tertiary: "135 129 159",
    neutral: "23 20 34",
    wash: "23 20 34",
    line: "43 36 73",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "31 234 154", // #31EA9A
    brandSecondary: "23 20 34",
    tokenAmountFont: "font-chivoMono",
    infoSectionBackground: "30 26 47", // #1E1A2F
    headerBackground: "30 26 47", // #1E1A2F
    infoTabBackground: "19 12 47", // #130C2F
    buttonBackground: "25 16 62", // #19103E
    cardBackground: "30 26 47", // #1E1A2F
    cardBorder: "43 36 73", // #2B2449
    hoverBackground: "42 35 56", // #2A2338
    textSecondary: "135 129 159", // #87819F
    footerBackground: "19 12 47", // #130C2F
    innerFooterBackground: "19 12 47", // #130C2F
    customHeroImageSize: "w-auto h-auto",
    customIconBackground: "bg-transparent",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    customAboutSubtitle: "About Towns Lodge",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    customIconColor: "#87819F",
    customButtonBackground: "#130C2F",
    customHeroTitleWidth: "max-w-none",
  },

  theme: "dark",

  dunaDisclaimers:
    "* DUNA Administration Docs will archive upon the release of the year-end financial statements and tax update.",

  organization: {
    title: "Towns Protocol",
  },

  links: [
    {
      name: "townstwitter",
      title: "Twitter",
      url: "https://x.com/TownsProtocol",
    },
    {
      name: "townsfarcaster",
      title: "Farcaster",
      url: "https://farcaster.xyz/towns",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Towns Protocol Governance",
      description:
        "Towns is experimenting with minimal, onchain governance. This page is the canonical home for Towns governance info.",
      hero: townsHero,
      meta: {
        title: "Towns Protocol Agora",
        description: "Home of Towns Protocol governance",
        imageTitle: "Towns Protocol Agora",
        imageDescription: "Home of Towns Protocol governance",
      },
    },
    {
      route: "proposals",
      title: "Towns Protocol Proposals",
      description:
        "Towns Protocol is currently setting up its governance infrastructure. Proposal functionality will be available soon.",
      meta: {
        title: "Towns Protocol Proposals",
        description: "View and vote on Towns Protocol proposals",
        imageTitle: "Towns Protocol Proposals",
        imageDescription: "View and vote on Towns Protocol proposals",
      },
    },
    {
      route: "info",
      title: "Welcome to\nTowns Lodge",
      description:
        "Your home for information about Towns Lodge, a Wyoming DUNA.\nMember dashboard for DUNA documents, onchain proposals, voting and governance.",
      hero: townsHero,
      links: [
        {
          name: "Deploy a vault",
          title: "Towns Protocol",
          url: "https://docs.towns.com",
          image: townsInfoCard1,
        },
        {
          name: "Governance Forums",
          title: "Governance",
          url: "/coming-soon",
          image: townsInfoCard2,
        },
        {
          name: "Protocol Docs",
          title: "Document Archive*",
          url: "/document-archive",
          image: townsInfoCard3,
        },
      ],
      meta: {
        title: "Towns Protocol Agora",
        description: "Home of Towns Protocol governance",
        imageTitle: "Towns Protocol Agora",
        imageDescription: "Home of Towns Protocol governance",
      },
    },
    {
      route: "delegates",
      title: "Towns Protocol Delegates",
      description:
        "Towns Protocol is currently setting up its governance infrastructure. Delegate functionality will be available soon.",
      meta: {
        title: "Towns Protocol Delegates",
        description: "Delegate your voting power in Towns Protocol",
        imageTitle: "Towns Protocol Delegates",
        imageDescription: "Delegate your voting power in Towns Protocol",
      },
    },
    {
      route: "info/about",
      title: "Towns Lodge Roadmap",
      hero: townsInfoHero,
      description:
        "This dashboard is the focal point for information related to the Towns Lodge DUNA.  As a tax-paying U.S. entity, it is essential that members are aware of the financial inflows and outflows (and related tax consequences) of the DUNA Treasury in a clear and concise manner.\n\nThe Towns Protocol is supported by both a Swiss Association and the Towns Lodge DUNA – with the TOWNS governance token providing the members ultimate control over how the Treasury should be utilized.  While the initial funding of the Swiss Association allows it to operate within established parameters, its role and funding will ultimately be decided by the members of the DUNA who, through their voting power, control whether to extend additional funding to the Swiss Association, redirect that funding to another entity, or take on more responsibilities within the DUNA.\n\nThe DUNA Governance does not go live until January 1, 2026, to allow the members of the community time to familiarize themselves with the Swiss Association and the Protocol.",
      sectionTitle: "Towns Lodge Roadmap",
      tabs: [
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#87819F"
            />
          ),
          title: "January 1, 2026",
          description:
            "Token governance is live, with a temperature check and tax reporting intake (via Cowrie – Administrator Services tooling) completed before a proposal is brought to a final vote.",
        },
      ],
      meta: {
        title: "About Towns Protocol",
        description:
          "Learn about Towns Protocol and decentralized community governance",
        imageTitle: "About Towns Protocol",
        imageDescription:
          "Learn about Towns Protocol and decentralized community governance",
      },
    },
    {
      route: "coming-soon",
      title: "Towns Lodge governance goes live on January 1, 2026.",
      description: "",
      hero: townsHero,
      meta: {
        title: "Towns Protocol Governance",
        description: "Towns Protocol governance coming soon",
        imageTitle: "Towns Protocol Governance",
        imageDescription: "Towns Protocol governance coming soon",
      },
    },
  ],

  toggles: [
    {
      name: "admin",
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
      name: "delegates",
      enabled: false,
    },
    {
      name: "delegates/edit",
      enabled: false,
    },
    {
      name: "snapshotVotes",
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
      name: "forums",
      enabled: true,
    },
    {
      name: "coming-soon",
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
      name: "towns-hero-content",
      enabled: true,
    },
    {
      name: "towns-duna-administration",
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
      name: "footer/hide-votable-supply",
      enabled: true,
    },
    {
      name: "footer/hide-total-supply",
      enabled: true,
    },
    {
      name: "coming-soon/show-static-proposals",
      enabled: true,
    },
    {
      name: "duna/use-community-dialogue-label",
      enabled: true,
    },
    {
      name: "ui/use-dark-theme-styling",
      enabled: true,
    },
  ],
});

// Custom content component for towns coming-soon page
export function TownsComingSoonContent() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-wash border border-line rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">
          🏗️ Governance Infrastructure
        </h3>
        <p className="text-secondary mb-4">
          Towns Protocol is currently setting up its governance infrastructure.
          Proposal functionality will be available soon as the protocol evolves.
        </p>
        <ul className="text-secondary space-y-2">
          <li>• Minimal onchain governance design</li>
          <li>• Community-driven decision making</li>
          <li>• Transparent proposal process</li>
        </ul>
      </div>

      <div className="bg-wash border border-line rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">
          📋 What&apos;s Coming
        </h3>
        <p className="text-secondary mb-4">
          The Towns governance system will include:
        </p>
        <ul className="text-secondary space-y-2">
          <li>• Proposal creation and submission</li>
          <li>• Community voting mechanisms</li>
          <li>• Delegation system</li>
          <li>• Execution and implementation</li>
        </ul>
      </div>
    </div>
  );
}
