import React from "react";
import { TenantUI } from "@/lib/tenant/tenantUI";
import zeroGLogo from "@/assets/tenant/zeroG_logo.svg";
import zeroGHero from "@/assets/tenant/zeroG_hero.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";

export const zeroGTenantUIConfig = new TenantUI({
  title: "0G",
  logo: zeroGLogo,
  logoSize: "36px",
  tokens: [],
  hideAgoraBranding: true,

  assets: {
    success: zeroGHero,
    pending: zeroGHero,
    delegate: delegateAvatar,
  },

  customization: {
    primary: "26 26 26",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "252 251 247",
    wash: "255 255 255",
    line: "223 223 223",
    positive: "34 197 94",
    negative: "239 68 68",
    brandPrimary: "151 71 255",
    brandSecondary: "243 232 255",
    tokenAmountFont: "font-chivoMono",
    infoSectionBackground: "255 255 255",
    headerBackground: "255 255 255",
    infoTabBackground: "255 255 255",
    buttonBackground: "243 232 255",
    cardBackground: "255 255 255",
    cardBorder: "223 223 223",
    hoverBackground: "243 232 255",
    textSecondary: "115 115 115",
    footerBackground: "255 255 255",
    innerFooterBackground: "255 255 255",
    customHeroImageSize: "w-auto h-auto",
    customIconBackground: "bg-transparent",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    customAboutSubtitle: "About 0G",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    customIconColor: "#9747FF",
  },

  theme: "light",

  organization: {
    title: "0G",
  },

  links: [
    {
      name: "0g-twitter",
      title: "Twitter",
      url: "https://x.com/0G_labs",
    },
    {
      name: "0g-website",
      title: "Website",
      url: "https://0g.ai",
    },
    {
      name: "0g-discord",
      title: "Discord",
      url: "https://discord.gg/0glabs",
    },
  ],

  pages: [
    {
      route: "/",
      title: "0G Governance",
      description:
        "0G is the largest AI-first blockchain. This page is the canonical home for 0G governance info.",
      hero: zeroGHero,
      meta: {
        title: "0G Agora",
        description: "Home of 0G governance",
        imageTitle: "0G Agora",
        imageDescription: "Home of 0G governance",
      },
    },
    {
      route: "proposals",
      title: "0G Proposals",
      description:
        "0G is currently setting up its governance infrastructure. Proposal functionality will be available soon.",
      meta: {
        title: "0G Proposals",
        description: "View and vote on 0G proposals",
        imageTitle: "0G Proposals",
        imageDescription: "View and vote on 0G proposals",
      },
    },
    {
      route: "info",
      title: "Welcome to\n0G",
      description:
        "Your home for information about 0G governance and community. Member dashboard for documents, onchain proposals, voting and governance.",
      hero: zeroGHero,
      links: [
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://docs.0g.ai",
        },
        {
          name: "0G Build",
          title: "0G Build",
          url: "https://0g.ai/build",
        },
        {
          name: "0G Discord",
          title: "0G Discord",
          url: "https://discord.gg/0glabs",
        },
      ],
      meta: {
        title: "0G Agora",
        description: "Home of 0G governance",
        imageTitle: "0G Agora",
        imageDescription: "Home of 0G governance",
      },
    },
    {
      route: "delegates",
      title: "0G Delegates",
      description:
        "0G is currently setting up its governance infrastructure. Delegate functionality will be available soon.",
      meta: {
        title: "0G Delegates",
        description: "Delegate your voting power in 0G",
        imageTitle: "0G Delegates",
        imageDescription: "Delegate your voting power in 0G",
      },
    },
    {
      route: "info/about",
      title: "0G Roadmap",
      hero: zeroGHero,
      description:
        "0G is the largest AI-first blockchain. It features an infinitely scalable data availability layer, a modular storage system, and a flexible serving framework. Scale your AI and unlock new on-chain use cases—50,000× faster and 100× cheaper.\n\n0G provides the full-stack infrastructure needed to build, run, and scale AI-native applications onchain, including fast data availability, decentralized storage, and a permissionless compute network.\n\nUnlike traditional L1s, 0G is purpose-built for AI. Its architecture is optimized for high-throughput data handling, real-time inference, and open access to verifiable AI models, making it possible to develop apps that were previously infeasible.",
      sectionTitle: "0G Roadmap",
      tabs: [
        {
          icon: <CoinsIcon className="w-[24px] h-[24px]" stroke="#9747FF" />,
          title: "February 2026",
          description:
            "Dashboard launched for community optimistic governance discussion.",
        },
        {
          icon: (
            <NotificationIcon className="w-[24px] h-[24px]" stroke="#9747FF" />
          ),
          title: "March 2026",
          description: "Optimistic governance mechanics released.",
        },
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#9747FF"
            />
          ),
          title: "April 2026",
          description: "Optimistic governance launched.",
        },
      ],
      meta: {
        title: "About 0G",
        description: "Learn about 0G and decentralized AI governance",
        imageTitle: "About 0G",
        imageDescription: "Learn about 0G and decentralized AI governance",
      },
    },
    {
      route: "coming-soon",
      title: "0G governance is\ncoming soon",
      description:
        "0G voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      hero: zeroGHero,
      meta: {
        title: "0G Governance",
        description: "0G governance coming soon",
        imageTitle: "0G Governance",
        imageDescription: "0G governance coming soon",
      },
    },
  ],

  toggles: [
    { name: "admin", enabled: false },
    { name: "proposals", enabled: false },
    { name: "info", enabled: true },
    { name: "delegates", enabled: false },
    { name: "delegates/edit", enabled: false },
    { name: "snapshotVotes", enabled: false },
    { name: "proposal-execute", enabled: false },
    { name: "proposal-lifecycle", enabled: false },
    { name: "use-daonode-for-proposals", enabled: false },
    { name: "use-daonode-for-votable-supply", enabled: false },
    { name: "use-daonode-for-proposal-types", enabled: false },
    { name: "forums", enabled: true },
    {
      name: "duna",
      enabled: true,
      config: {
        title: "0G DUNA",
      },
    },
    { name: "coming-soon", enabled: true },
    { name: "hide-governor-settings", enabled: true },
    { name: "hide-hero", enabled: true },
    { name: "hide-hero-image", enabled: true },
    { name: "footer/hide-changelog", enabled: true },
    { name: "changelog/simplified-view", enabled: true },
    { name: "footer/hide-votable-supply", enabled: true },
    { name: "footer/hide-total-supply", enabled: true },
    { name: "coming-soon/show-static-proposals", enabled: true },
    {
      name: "duna-disclosures",
      enabled: true,
      config: {
        content: (
          <>
            <div className="mb-6 text-base font-semibold text-tertiary uppercase tracking-wide">
              0G DUNA DISCLOSURES
            </div>

            <div className="font-medium">
              <p className="mt-2">
                By owning the token and engaging in the 0G Governance Protocol,
                you acknowledge and agree that you are electing to become a
                member of a Wyoming Decentralized Unincorporated Nonprofit
                Association (&quot;Association&quot;). Your participation is
                subject to the terms and conditions set forth in the Association
                Agreement. You further acknowledge and agree that any dispute,
                claim, or controversy arising out of or relating to the
                Association Agreement, any governance proposal, or the rights
                and obligations of members or administrators shall be submitted
                exclusively to the Wyoming Chancery Court. In the event that the
                Wyoming Chancery Court declines to exercise jurisdiction over
                any such dispute, the parties agree that such dispute shall be
                resolved exclusively in the District Court of Laramie County,
                Wyoming, or in the United States District Court for the District
                of Wyoming, as appropriate.
              </p>
              <p className="mt-4">
                By becoming a member, you further agree that any dispute, claim,
                or proceeding arising out of or relating to the Association
                Agreement shall be resolved solely on an individual basis. You
                expressly waive any right to participate as a plaintiff or class
                member in any purported class, collective, consolidated, or
                representative action, whether in arbitration or in court. No
                class, collective, consolidated, or representative actions or
                arbitrations shall be permitted, and you expressly waive any
                right to participate in or recover relief under any such action
                or proceeding.
              </p>
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
    { name: "ui/use-dark-theme-styling", enabled: false },
  ],
});
