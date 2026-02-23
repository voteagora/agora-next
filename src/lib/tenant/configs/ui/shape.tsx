import React from "react";
import { TenantUI } from "@/lib/tenant/tenantUI";
import shapeLogo from "@/assets/tenant/shape_logo.svg";
import shapeHero from "@/assets/tenant/shape_hero.svg";
import shapeSuccess from "@/assets/tenant/shape_hero.svg";
import shapePending from "@/assets/tenant/shape_hero.svg";
import shapeInfoHero from "@/assets/tenant/shape_hero.svg";
import shapeInfoCard1 from "@/assets/tenant/shape_info_1.svg";
import shapeInfoCard2 from "@/assets/tenant/shape_info_2.svg";
import shapeInfoCard3 from "@/assets/tenant/shape_info_3.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";

// Note: Using Towns UI as a template for Shape (no-gov client)
export const shapeTenantUIConfig = new TenantUI({
  title: "Shape Protocol",
  logo: shapeLogo,
  logoSize: "36px",
  tokens: [],
  hideAgoraBranding: true,

  assets: {
    success: shapeSuccess,
    pending: shapePending,
    delegate: delegateAvatar,
  },

  customization: {
    primary: "23 23 23",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "252 251 247",
    wash: "255 255 255",
    line: "223 223 223",
    positive: "34 197 94",
    negative: "239 68 68",
    brandPrimary: "23 23 23",
    brandSecondary: "245 245 245",
    tokenAmountFont: "font-chivoMono",
    infoSectionBackground: "255 255 255",
    headerBackground: "255 255 255",
    infoTabBackground: "255 255 255",
    buttonBackground: "240 240 240",
    cardBackground: "255 255 255",
    cardBorder: "223 223 223",
    hoverBackground: "245 245 245",
    textSecondary: "115 115 115",
    footerBackground: "255 255 255",
    innerFooterBackground: "255 255 255",
    customHeroImageSize: "w-auto h-auto",
    customIconBackground: "bg-transparent",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    customAboutSubtitle: "About Shape",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    customIconColor: "#87819F",
  },

  theme: "light",

  organization: {
    title: "Shape Protocol",
  },

  links: [
    {
      name: "shape-twitter",
      title: "Twitter",
      url: "#",
    },
    {
      name: "shape-website",
      title: "Website",
      url: "#",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Shape Protocol Governance",
      description:
        "Shape is experimenting with minimal, onchain governance. This page is the canonical home for Shape governance info.",
      hero: shapeHero,
      meta: {
        title: "Shape Protocol Agora",
        description: "Home of Shape Protocol governance",
        imageTitle: "Shape Protocol Agora",
        imageDescription: "Home of Shape Protocol governance",
      },
    },
    {
      route: "proposals",
      title: "Shape Protocol Proposals",
      description:
        "Shape Protocol is currently setting up its governance infrastructure. Proposal functionality will be available soon.",
      meta: {
        title: "Shape Protocol Proposals",
        description: "View and vote on Shape Protocol proposals",
        imageTitle: "Shape Protocol Proposals",
        imageDescription: "View and vote on Shape Protocol proposals",
      },
    },
    {
      route: "info",
      title: "Welcome to\nShape",
      description:
        "Your home for information about Shape governance and community. Member dashboard for documents, onchain proposals, voting and governance.",
      hero: shapeHero,
      links: [
        {
          name: "Docs",
          title: "Docs",
          url: "#",
          image: shapeInfoCard1,
        },
        {
          name: "Governance Forums",
          title: "Governance",
          url: "/coming-soon",
          image: shapeInfoCard2,
        },
        {
          name: "Document Archive",
          title: "Document Archive",
          url: "#",
          image: shapeInfoCard3,
        },
      ],
      meta: {
        title: "Shape Protocol Agora",
        description: "Home of Shape Protocol governance",
        imageTitle: "Shape Protocol Agora",
        imageDescription: "Home of Shape Protocol governance",
      },
    },
    {
      route: "delegates",
      title: "Shape Protocol Delegates",
      description:
        "Shape Protocol is currently setting up its governance infrastructure. Delegate functionality will be available soon.",
      meta: {
        title: "Shape Protocol Delegates",
        description: "Delegate your voting power in Shape Protocol",
        imageTitle: "Shape Protocol Delegates",
        imageDescription: "Delegate your voting power in Shape Protocol",
      },
    },
    {
      route: "info/about",
      title: "Shape Roadmap",
      hero: shapeInfoHero,
      description:
        "This dashboard is a focal point for Shape governance information and roadmap.",
      sectionTitle: "Shape Roadmap",
      tabs: [
        {
          icon: <CoinsIcon className="w-[24px] h-[24px]" stroke="#87819F" />,
          title: "Milestone 1",
          description: "Community setup and token claims.",
        },
        {
          icon: (
            <NotificationIcon className="w-[24px] h-[24px]" stroke="#87819F" />
          ),
          title: "Milestone 2",
          description: "Docs and tax updates posted with messaging enabled.",
        },
        {
          icon: (
            <CheckCircleBrokenIcon
              className="w-[24px] h-[24px]"
              stroke="#87819F"
            />
          ),
          title: "Milestone 3",
          description: "Token governance goes live.",
        },
      ],
      meta: {
        title: "About Shape Protocol",
        description:
          "Learn about Shape Protocol and decentralized community governance",
        imageTitle: "About Shape Protocol",
        imageDescription:
          "Learn about Shape Protocol and decentralized community governance",
      },
    },
    {
      route: "coming-soon",
      title: "Shape governance is\ncoming soon",
      description:
        "Shape voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      hero: shapeHero,
      meta: {
        title: "Shape Protocol Governance",
        description: "Shape Protocol governance coming soon",
        imageTitle: "Shape Protocol Governance",
        imageDescription: "Shape Protocol governance coming soon",
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
    { name: "duna", enabled: true },
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
            <div className="mb-6 font-medium">
              SHAPE PROTOCOL - DUNA DISCLOSURES
            </div>

            <div className="font-medium">
              <p className="mt-2">
                By owning the token and participating in the governance of Shape
                on this forum, you acknowledge and agree that you are electing
                to become a member of a Wyoming Decentralized Unincorporated
                Nonprofit Association (&quot;Association&quot;). Your
                participation is subject to the terms and conditions set forth
                in the Association Agreement. You further acknowledge and agree
                that any dispute, claim, or controversy arising out of or
                relating to the Association Agreement, any governance proposal,
                or the rights and obligations of members or administrators shall
                be submitted exclusively to the Wyoming Chancery Court. In the
                event that the Wyoming Chancery Court declines to exercise
                jurisdiction over any such dispute, the parties agree that such
                dispute shall be resolved exclusively in the District Court of
                Laramie County, Wyoming, or in the United States District Court
                for the District of Wyoming, as appropriate.
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
      },
    },
    { name: "ui/use-dark-theme-styling", enabled: false },
  ],
});
