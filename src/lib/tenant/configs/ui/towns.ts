import { TenantUI } from "@/lib/tenant/tenantUI";
import townsLogo from "@/assets/tenant/towns_logo.svg";
import townsHero from "@/assets/tenant/towns_hero.svg";
import townsSuccess from "@/assets/tenant/towns_success.svg";
import townsPending from "@/assets/tenant/towns_pending.svg";
import townsInfoHero from "@/assets/tenant/towns_info_hero.svg";
import townsInfoCard1 from "@/assets/tenant/towns_info_1.svg";
import townsInfoCard2 from "@/assets/tenant/towns_info_2.svg";
import townsInfoCard3 from "@/assets/tenant/towns_info_3.svg";
import townsInfoCard4 from "@/assets/tenant/towns_info_4.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";

export const townsTenantUIConfig = new TenantUI({
  title: "Towns Protocol",
  logo: townsLogo,
  tokens: [],

  assets: {
    success: townsSuccess,
    pending: townsPending,
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
      title: "Towns Protocol Governance",
      description:
        "Towns is experimenting with minimal, onchain governance. This page is the canonical home for Towns governance info.",
      hero: townsHero,
      links: [
        {
          name: "Documentation",
          title: "Documentation",
          url: "https://docs.towns.com",
          image: townsInfoCard1,
        },
        {
          name: "Community",
          title: "Community",
          url: "https://discord.gg/towns",
          image: townsInfoCard2,
        },
        {
          name: "Governance",
          title: "Governance",
          url: "https://gov.towns.com",
          image: townsInfoCard3,
        },
        {
          name: "Updates",
          title: "Updates",
          url: "https://twitter.com/towns",
          image: townsInfoCard4,
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
      title: "About Towns",
      hero: townsInfoHero,
      description:
        "Towns Protocol is a decentralized platform for creating and governing digital communities. Built on blockchain technology, Towns enables transparent, community-driven decision making through innovative governance mechanisms. The protocol empowers communities to self-organize, manage resources, and make collective decisions in a trustless environment.",
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
