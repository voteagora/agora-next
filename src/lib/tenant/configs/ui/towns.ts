import { TenantUI } from "@/lib/tenant/tenantUI";
import etherfiLogo from "@/assets/tenant/etherfi_logo.svg";
import etherfiHero from "@/assets/tenant/etherfi_hero.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";

// TODO: update to towns assets
export const townsTenantUIConfig = new TenantUI({
  title: "Towns Protocol",
  logo: etherfiLogo,
  tokens: [],

  assets: {
    success: etherfiHero,
    pending: etherfiHero,
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
      route: "proposals",
      title: "Towns Protocol Governance",
      description:
        "Towns is experimenting with minimal, onchain governance. This page is the canonical home for Towns governance info.",
      hero: etherfiHero,
      meta: {
        title: "Towns Protocol Agora",
        description: "Home of Towns Protocol governance",
        imageTitle: "Towns Protocol Agora",
        imageDescription: "Home of Towns Protocol governance",
      },
    },
    {
      route: "info",
      title: "Towns Protocol Governance",
      description:
        "Towns is experimenting with minimal, onchain governance. This page is the canonical home for Towns governance info.",
      hero: etherfiHero,
      links: [],
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
        "Towns is experimenting with minimal, onchain governance. This page is the canonical home for Towns governance info.",
      hero: etherfiHero,
      meta: {
        title: "Towns Protocol Delegates",
        description: "Home of Towns Protocol delegates",
        imageTitle: "Towns Protocol Delegates",
        imageDescription: "Home of Towns Protocol delegates",
      },
    },
    {
      route: "info/about",
      title: "Towns Protocol About",
      description:
        "Towns is experimenting with minimal, onchain governance. This page is the canonical home for Towns governance info.",
      hero: etherfiHero,
      meta: {
        title: "Towns Protocol About",
        description: "About Towns Protocol governance",
        imageTitle: "Towns Protocol About",
        imageDescription: "About Towns Protocol governance",
      },
    },
    {
      route: "/",
      title: "Towns Protocol",
      description:
        "Towns is experimenting with minimal, onchain governance. This page is the canonical home for Towns governance info.",
      hero: etherfiHero,
      meta: {
        title: "Towns Protocol",
        description: "Home of Towns Protocol",
        imageTitle: "Towns Protocol",
        imageDescription: "Home of Towns Protocol",
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
      enabled: true,
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
