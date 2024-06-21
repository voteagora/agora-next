import { TenantUI } from "@/lib/tenant/tenantUI";
import etherfiHero from "@/assets/tenant/etherfi_hero.svg";
import etherfiLogo from "@/assets/tenant/etherfi_logo.svg";
import delegateImage from "@/assets/tenant/etherfi_delegate.svg";
import successImage from "@/assets/tenant/optimism_success.svg";
import pendingImage from "@/assets/tenant/optimism_pending.svg";

export const etherfiTenantUIConfig = new TenantUI({
  title: "ether.fi Agora",
  color: "#2F38FF",
  hero: etherfiHero,
  logo: etherfiLogo,

  assets: {
    // TODO: Replace success and pending images
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "ether.fi DAO",
  },

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
      name: "bugs",
      title: "Report bugs & feedback",
      url: "https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc",
    },
    {
      name: "governanceForum",
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
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Agora is the home of ether.fi governance",
      description:
        "ether.fi governance is launching now. Start by claiming your token and joining Discourse to engage in the discussion. Delegation and voting are coming soon.",
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of ether.fi delegates",
      description:
        "ether.fi voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      href: "https://snapshot.org/#/etherfi-dao.eth",
      title: "Agora is the home of ether.fi delegates",
      description:
        "ETHER.FI voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
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
  ],
});
