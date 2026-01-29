import React from "react";
import { TenantUI } from "@/lib/tenant/tenantUI";
// 0g brand assets
import ogLogo from "@/assets/tenant/0g_logo.svg";
import ogHero from "@/assets/tenant/0g_hero.svg";
import syndicateSuccess from "@/assets/tenant/syndicate_success.svg";
import syndicatePending from "@/assets/tenant/syndicate_pending.svg";
import ogInfoCard1 from "@/assets/tenant/0g_info_1.svg";
import ogInfoCard2 from "@/assets/tenant/0g_info_2.svg";
import ogInfoCard3 from "@/assets/tenant/0g_info_3.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const ogTenantUIConfig = new TenantUI({
  title: "0G Agora",
  logo: ogLogo,
  logoSize: "24px",
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.DEMO)],

  assets: {
    success: syndicateSuccess,
    pending: syndicatePending,
    delegate: delegateAvatar,
  },

  organization: {
    title: "0G Network",
  },

  dunaDisclaimers:
    "* DUNA Administration Docs will archive upon the release of financial statements and tax update.",

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
    font: "font-regola",
    tokenAmountFont: "font-chivoMono",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[80px] sm:w-[80px] lg:h-[100px] lg:w-[100px]",
    infoTabBackground: "#FFFBF5",
    buttonBackground: "#FAFAFA",
    infoSectionBackground: "#FFFFFF",
    cardBackground: "#FFFFFF",
    customIconBackground: "#FBFBFB",
    footerBackground: "255 251 245", // #FFFBF5
    customAboutSubtitle: "About 0G",
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
      title: "Agora is the home of 0G governance",
      description:
        "0G governance is a collective of contributors and token holders working together to steward the network.",
      hero: ogHero,
      meta: {
        title: "0G Agora",
        description: "Home of token governance",
        imageTitle: "0G Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of 0G delegates",
      description:
        "0G governance is a collective of contributors and token holders working together to steward the network.",
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
      title: "Agora is the home of 0G delegates",
      description:
        "0G governance is a collective of contributors and token holders working together to steward the network.",
      hero: ogHero,
      meta: {
        title: "0G Agora",
        description: "Home of token governance",
        imageTitle: "0G Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Welcome to 0G DUNA",
      description: [
        "This dashboard provides information related to 0G DUNA, a Wyoming Decentralized Unincorporated Nonprofit Association. As a taxpaying U.S. entity, it is essential that members are aware of the financial inflows and outflows (and related tax consequences) of the DUNA Treasury in a clear and concise manner.",
        "The 0G token governance provides members the ability to have input and certain control over how decisions should be made in support of the 0G Protocol.",
        "0G DUNA is established as an organizational framework for community engagement and collective decision-making for the 0G decentralized AI ecosystem.",
      ],
      meta: {
        title: "0G Governance",
        description: "0G is governed by its community.",
        imageTitle: "0G Governance",
        imageDescription: "0G is governed by its community.",
      },
      links: [
        {
          name: "0G Discord",
          title: "0G Discord",
          url: "https://discord.com/invite/0glabs",
          image: ogInfoCard1,
        },
        {
          name: "Build",
          title: "Build",
          url: "https://build.0g.ai/",
          image: ogInfoCard2,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://docs.0g.ai/",
          image: ogInfoCard3,
        },
        {
          name: "0G",
          title: "0G",
          url: "https://0g.ai/",
          image: ogInfoCard1,
        },
      ],
    },
    {
      route: "info/about",
      title: "0G Roadmap",
      hero: ogHero,
      description: [
        "0G is the largest AI-first blockchain.  It features an infinitely scalable data availability layer, a modular storage system, and a flexible serving framework.  Scale your AI and unlock new on-chain use cases—50,000x faster and 100x cheaper.",
        "0G provides the full-stack infrastructure needed to build, run, and scale AI-native applications onchain, including fast data availability, decentralized storage, and a permissionless compute network.",
        "Unlike traditional L1s, 0G is purpose-built for AI. Its architecture is optimized for high-throughput data handling, real-time inference, and open access to verifiable AI models, making it possible to develop apps that were previously infeasible. Whether training autonomous agents, deploying intelligent NFTs, or launching high-performance games, 0G is the foundational layer where it all becomes possible.",
      ],
      sectionTitle: "0G Roadmap",
      tabs: [
        {
          icon: <CoinsIcon className="w-[24px] h-[24px]" stroke="#737373" />,
          title: "February 2026",
          description:
            "Dashboard launched for community optimistic governance discussion",
        },
        {
          icon: (
            <NotificationIcon className="w-[24px] h-[24px]" stroke="#737373" />
          ),
          title: "March 2026",
          description: "Optimistic governance mechanics released",
        },
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#737373"
            />
          ),
          title: "April 2026",
          description: "Optimistic governance launched",
        },
      ],
      meta: {
        title: "0G Governance",
        description: "0G is governed by its community.",
        imageTitle: "0G Governance",
        imageDescription: "0G is governed by its community.",
      },
    },
    {
      route: "coming-soon",
      title: "Welcome to 0G governance",
      description: `0G governance is a collective of companies, communities, and token holders working together to steward the future of the 0G protocol`,
      meta: {
        title: "0G Governance",
        description: "0G governance coming soon",
        imageTitle: "0G Governance",
        imageDescription: "0G governance coming soon",
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
    { name: "forums", enabled: false },
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
    {
      name: "duna-disclosures",
      enabled: true,
      config: {
        content: (
          <>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px] mb-4">
              0G DUNA — DUNA DISCLOSURES
            </div>

            <div className="space-y-6 text-justify">
              <div>
                <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
                  By owning the token and engaging in the 0G Governance
                  Protocol, you acknowledge and agree that you are electing to
                  become a member of a Wyoming Decentralized Unincorporated
                  Nonprofit Association ("Association"). Your participation is
                  subject to the terms and conditions set forth in the
                  Association Agreement. You further acknowledge and agree that
                  any dispute, claim, or controversy arising out of or relating
                  to the Association Agreement, any governance proposal, or the
                  rights and obligations of members or administrators shall be
                  submitted exclusively to the Wyoming Chancery Court. In the
                  event that the Wyoming Chancery Court declines to exercise
                  jurisdiction over any such dispute, the parties agree that
                  such dispute shall be resolved exclusively in the District
                  Court of Laramie County, Wyoming, or in the United States
                  District Court for the District of Wyoming, as appropriate.
                </div>
              </div>

              <div>
                <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
                  By becoming a member, you further agree that any dispute,
                  claim, or proceeding arising out of or relating to the
                  Association Agreement shall be resolved solely on an
                  individual basis. You expressly waive any right to participate
                  as a plaintiff or class member in any purported class,
                  collective, consolidated, or representative action, whether in
                  arbitration or in court. No class, collective, consolidated,
                  or representative actions or arbitrations shall be permitted,
                  and you expressly waive any right to participate in or recover
                  relief under any such action or proceeding.
                </div>
              </div>
            </div>
          </>
        ),
        disclaimer: (
          <p className="text-secondary text-sm opacity-75">
            * DUNA Administration Docs will archive upon the release of the
            year-end financial statements and tax update.
          </p>
        ),
      },
    },
  ],
});
