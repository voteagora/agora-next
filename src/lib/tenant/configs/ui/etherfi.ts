import { TenantUI } from "@/lib/tenant/tenantUI";
import etherfiHero from "@/assets/tenant/etherfi_hero.svg";
import etherfiLogo from "@/assets/tenant/etherfi_logo.svg";

export const etherfiTenantUIConfig = new TenantUI({
  title: "ETHER.FI Agora",
  color: "#2F38FF",
  hero: etherfiHero,
  logo: etherfiLogo,

  delegate: {
    logo: etherfiLogo,
  },

  organization: {
    title: "Ether.fi Foundation",
  },

  pages: [
    {
      route: "/",
      title: "Agora is the home of ETHER.FI governance",
      description:
        "ETHFI governance is launching now. Start by claiming your token and joining Discourse to engage in the discussion. Delegation and voting are coming soon.",
      meta: {
        title: "Ether.fi Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of ETHER.FI delegates",
      description:
        "ETHER.FI voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of ETHER.FI delegates",
      description:
        "ETHER.FI voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "Ether.fi Agora",
        description: "Home of token governance",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: false,
    },
    {
      name: "proposals",
      enabled: false,
    },
  ],
});
