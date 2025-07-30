import { TenantUI } from "@/lib/tenant/tenantUI";
import townsLogo from "@/assets/tenant/towns_logo.svg";
import townsHero from "@/assets/tenant/towns_hero.svg";
import townsSuccess from "@/assets/tenant/towns_success.svg";
import townsPending from "@/assets/tenant/towns_pending.svg";
import townsInfoHero from "@/assets/tenant/towns_hero.svg";
import townsInfoCard1 from "@/assets/tenant/towns_info_1.svg";
import townsInfoCard2 from "@/assets/tenant/towns_info_2.svg";
import townsInfoCard3 from "@/assets/tenant/towns_info_3.svg";
import townsInfoCard4 from "@/assets/tenant/towns_info_4.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";

export const townsTenantUIConfig = new TenantUI({
  title: "Towns Protocol",
  logo: townsLogo,
  logoSize: "36px",
  tokens: [],

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
    brandPrimary: "255 255 255",
    brandSecondary: "23 20 34",
    tokenAmountFont: "font-chivoMono",
    customInfoSectionBackground: "#1E1A2F",
    customInfoTabBackground: "#130C2F",
    customButtonBackground: "#19103E",
    customHeroImageSize: "w-auto h-auto",
    customIconBackground: "bg-transparent",
    customInfoLayout: "flex-col sm:flex-row gap-2",
    customTextContainer: "max-w-[80%]",
    customAboutSubtitle: "About Towns Governance",
    customTitleSize: "text-5xl leading-[48px] sm:text-[56px] sm:leading-[56px]",
    customCardSize: "sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]",
    customIconColor: "#87819F",
    customInfoTabs: [
      {
        title: "Phase 1: Lorem Ipsum",
        description:
          "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.",
      },
      {
        title: "Phase 2: Lorem Ipsum",
        description:
          "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium",
      },
      {
        title: "Phase 3: Lorem Ipsum",
        description:
          "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium",
      },
    ],
  },

  theme: "dark",

  organization: {
    title: "Towns Protocol",
  },

  links: [],

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
      title: "Welcome to\nTowns Governance",
      description:
        "Agora is your home for onchain proposals, voting, and governance",
      hero: townsHero,
      links: [
        {
          name: "Deploy a vault",
          title: "Deploy a vault",
          url: "https://docs.towns.com",
          image: townsInfoCard1,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://discord.gg/towns",
          image: townsInfoCard2,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://gov.towns.com",
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
      title: "Governance Roadmap",
      hero: townsInfoHero,
      description:
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
      meta: {
        title: "About Towns Protocol",
        description:
          "Learn about Towns Protocol and decentralized community governance",
        imageTitle: "About Towns Protocol",
        imageDescription:
          "Learn about Towns Protocol and decentralized community governance",
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
  ],
});
