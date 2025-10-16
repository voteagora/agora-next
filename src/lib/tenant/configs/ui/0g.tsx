import React from "react";
import { TenantUI } from "@/lib/tenant/tenantUI";
// 0g brand assets
import ogLogo from "@/assets/tenant/0g_logo.svg";
import ogHero from "@/assets/tenant/0g_hero.svg";
import syndicateSuccess from "@/assets/tenant/syndicate_success.svg";
import syndicatePending from "@/assets/tenant/syndicate_pending.svg";
import ogInfoCard1 from "@/assets/tenant/0g_info_1.svg";
import ogInfoCard2 from "@/assets/tenant/0g_info_2.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const ogTenantUIConfig = new TenantUI({
  title: "0g Agora",
  logo: ogLogo,
  logoSize: "24px",
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.DEMO)],

  assets: {
    success: syndicateSuccess,
    pending: syndicatePending,
    delegate: delegateAvatar,
  },

  organization: {
    title: "0g Network",
  },

  dunaDisclaimers:
    "* DUNA Administration Docs will archive upon the release of Q3 financial statements and tax update.",

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64", // #404040
    tertiary: "115 115 115",
    neutral: "255 255 255",
    wash: "255 251 245", // #FFFBF5
    line: "200 200 200",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "255 251 245", // #FFFBF5
    font: "font-familjen-grotesk",
    tokenAmountFont: "font-chivoMono",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    infoTabBackground: "#FFFBF5",
    buttonBackground: "#FAFAFA",
    infoSectionBackground: "#FFFFFF",
    cardBackground: "#FFFFFF",
    customIconBackground: "#FBFBFB",
    footerBackground: "255 251 245", // #FFFBF5
    customAboutSubtitle: "About 0g",
    customIconColor: "#87819F",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    noReportsFound: "Quarterly Reports will be posted soon.",
  },

  links: [
    { name: "ogtwitter", title: "Twitter", url: "https://x.com" },
    { name: "ogfarcaster", title: "Farcaster", url: "https://farcaster.xyz" },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of 0g governance",
      description:
        "0g governance is a collective of contributors and token holders working together to steward the network.",
      hero: ogHero,
      meta: {
        title: "0g Agora",
        description: "Home of token governance",
        imageTitle: "0g Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of 0g delegates",
      description:
        "0g governance is a collective of contributors and token holders working together to steward the network.",
      hero: ogHero,
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
      title: "Agora is the home of 0g delegates",
      description:
        "0g governance is a collective of contributors and token holders working together to steward the network.",
      hero: ogHero,
      meta: {
        title: "0g Agora",
        description: "Home of token governance",
        imageTitle: "0g Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Welcome to 0g",
      description:
        "Your home for information about 0g, a Wyoming DUNA. Member dashboard for DUNA documents, onchain proposals, voting and governance.",
      meta: {
        title: "0g Governance",
        description: "0g is governed by its community.",
        imageTitle: "0g Governance",
        imageDescription: "0g is governed by its community.",
      },
      links: [
        {
          name: "0g Protocol",
          title: "0g Protocol",
          url: "https://example.org",
          image: ogInfoCard1,
        },
        {
          name: "Governance",
          title: "Governance",
          url: "https://example.org",
          image: ogInfoCard2,
        },
        {
          name: "Document Archive",
          title: "Document Archive*",
          url: "",
          image: ogInfoCard1,
        },
      ],
    },
    {
      route: "info/about",
      title: "0g Roadmap",
      hero: ogHero,
      description:
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita.",
      sectionTitle: "0g Roadmap",
      tabs: [
        {
          icon: <CoinsIcon className="w-[24px] h-[24px]" stroke="#737373" />,
          title: "September 2025",
          description: "Community dialogue launches.",
        },
        {
          icon: (
            <NotificationIcon className="w-[24px] h-[24px]" stroke="#737373" />
          ),
          title: "October 2025",
          description: "Financial statements and tax updates posted.",
        },
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#737373"
            />
          ),
          title: "November 2025",
          description: "Token governance live.",
        },
      ],
      meta: {
        title: "0g Governance",
        description: "0g is governed by its community.",
        imageTitle: "0g Governance",
        imageDescription: "0g is governed by its community.",
      },
    },
    {
      route: "coming-soon",
      title: "Welcome to 0g governance",
      description: `Cassius ille, quem populus Romanus verissimum et sapientissimum iudicem putabat, identidem in causis quaerere solebat, cui bono fuisset`,
      meta: {
        title: "0g Governance",
        description: "0g governance coming soon",
        imageTitle: "0g Governance",
        imageDescription: "0g governance coming soon",
      },
    },
  ],

  toggles: [
    { name: "delegates", enabled: false },
    { name: "delegates/edit", enabled: false },
    { name: "proposals", enabled: false },
    { name: "info", enabled: true },
    { name: "info/governance-charts", enabled: false },
    { name: "proposal-execute", enabled: false },
    { name: "proposal-lifecycle", enabled: false },
    { name: "use-daonode-for-proposals", enabled: false },
    { name: "use-daonode-for-votable-supply", enabled: false },
    { name: "forums", enabled: true },
    { name: "use-daonode-for-proposal-types", enabled: false },
    { name: "duna", enabled: true },
    { name: "coming-soon", enabled: true },
    { name: "admin", enabled: false },
    { name: "snapshotVotes", enabled: false },
    { name: "coming-soon/show-static-proposals", enabled: true },
    { name: "hide-governor-settings", enabled: true },
    { name: "hide-hero", enabled: true },
    { name: "hide-hero-image", enabled: true },
    { name: "footer/hide-total-supply", enabled: true },
    { name: "footer/hide-votable-supply", enabled: true },
    { name: "footer/hide-changelog", enabled: true },
    { name: "changelog/simplified-view", enabled: true },
    { name: "0g-hero-content", enabled: true },
    { name: "duna/use-community-dialogue-label", enabled: true },
    { name: "0g-duna-administration", enabled: true },
  ],
});
