import { TenantUI } from "@/lib/tenant/tenantUI";
import etherfiHero from "@/assets/tenant/etherfi_hero.svg";
import etherfiLogo from "@/assets/tenant/etherfi_logo.svg";
import delegateImage from "@/assets/tenant/etherfi_delegate.svg";
import successImage from "@/assets/tenant/etherfi_success.svg";
import pendingImage from "@/assets/tenant/etherfi_pending.svg";

export const cyberTenantUIConfig = new TenantUI({
  title: "Cyber Agora",
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
    title: "Cyber",
  },

  delegates: {
    allowed: [],
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
  ],
});
