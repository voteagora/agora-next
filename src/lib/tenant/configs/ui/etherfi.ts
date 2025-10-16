import { TenantUI } from "@/lib/tenant/tenantUI";
import etherfiHero from "@/assets/tenant/etherfi_hero.svg";
import etherfiLogo from "@/assets/tenant/etherfi_logo.svg";
import delegateImage from "@/assets/tenant/etherfi_delegate.svg";
import successImage from "@/assets/tenant/etherfi_success.svg";
import pendingImage from "@/assets/tenant/etherfi_pending.svg";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const etherfiTenantUIConfig = new TenantUI({
  title: "ether.fi Agora",
  logo: etherfiLogo,
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.ETHERFI)],

  assets: {
    // TODO: Replace success and pending images
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  customization: {
    primary: "23 23 23",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "250 250 250",
    wash: "255 255 255",
    line: "229 229 229",
    positive: "0 153 43",
    negative: "197 47 0",
    brandPrimary: "23 23 23",
    brandSecondary: "255 255 255",
    tokenAmountFont: "font-chivoMono",
  },

  organization: {
    title: "ether.fi DAO",
  },

  // THESE NEED TO BE LOWER CASE
  delegates: {
    allowed: [
      "0x454b5f1458782a06da4656de844e019f26e3280a",
      "0x5610b146978c4864d603a855fdea54e6a2c1c803",
      "0x57ab7ee15ce5ecacb1ab84ee42d5a9d0d8112922",
      "0x648aa14e4424e0825a5ce739c8c68610e143fb79",
      "0x83108a0653a14eaeb8301e7b10a37cfac39c82f6",
      "0x9506429a421757711806c5caf25ba1830e349b09",
      "0xaeb24ebe192c2f1c12a940d00fe853558a5edc04",
      "0x9ee69759585aa3a9379b066f3caecbbd62420f9d",
      "0xfdfc6e1bbec01288447222fc8f1aee55a7c72b7b",
      "0xe2f6659e0209c3f79132abdeb95abeba0f1f672f",
      "0x27c7ced729280060577a68a54a94075d18614d19",
      "0x4f894bfc9481110278c356ade1473ebe2127fd3c",
      "0x3fb19771947072629c8eee7995a2ef23b72d4c8a",
      "0xc6f089ef91a31d354731490189b076a4cedfdbe9",
    ],
    advanced: [],
    retired: [],
  },

  links: [
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.gg/vBJkUYBuwX",
    },
    {
      name: "governance-forum",
      title: "Governance Forum",
      url: "https://governance.ether.fi/",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of ether.fi governance",
      description:
        "ether.fi governance is launching now. Start by claiming your token and joining Discourse to engage in the discussion. Delegation and voting are coming soon.",
      hero: etherfiHero,
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
        imageTitle: "ether.fi Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Agora is the home of ether.fi governance",
      description:
        "ether.fi governance is launching now. Start by claiming your token and joining Discourse to engage in the discussion. Delegation and voting are coming soon.",
      hero: etherfiHero,
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
        imageTitle: "ether.fi Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of ether.fi delegates",
      description:
        "ether.fi voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      hero: etherfiHero,
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
      title: "Agora is the home of ether.fi delegates",
      description:
        "ETHER.FI voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      hero: etherfiHero,
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
        imageTitle: "ether.fi Agora",
        imageDescription: "Home of token governance",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "info",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: false,
    },
    {
      name: "snapshotVotes", // This has no effect if DAO Node is off
      enabled: true,
    },
    {
      name: "use-daonode-for-proposals", // Etherfi has no DAO Node instance, yet.
      enabled: false, // TODO - Migrate Etherfi to DAO Node
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
      name: "show-participation",
      enabled: false,
    },
    {
      name: "forums",
      enabled: false,
    },
  ],
});
