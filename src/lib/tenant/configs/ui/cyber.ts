import { TenantUI } from "@/lib/tenant/tenantUI";
import cyberHero from "@/assets/tenant/cyber_hero.svg";
import cyberLogo from "@/assets/tenant/cyber_logo.svg";
import delegateImage from "@/assets/tenant/cyber_delegate.svg";
import successImage from "@/assets/tenant/cyber_success.svg";
import pendingImage from "@/assets/tenant/cyber_pending.svg";

export const cyberTenantUIConfig = new TenantUI({
  title: "Cyber Agora",
  color: "#2F38FF",
  hero: cyberHero,
  logo: cyberLogo,

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Cyber DAO",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  pages: [
    {
      route: "/",
      title: "Welcome to Cyber governance",
      description:
        "Cyber delegates are the stewards of the Cyber DAO, appointed by token holders to make governance decisions on their behalf.",
      meta: {
        title: "Welcome to Cyber governance",
        description: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Welcome to Cyber governance",
      description:
        "Cyber delegates are the stewards of the Cyber DAO, appointed by token holders to make governance decisions on their behalf.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      title: "Welcome to Cyber governance",
      description:
        "Cyber delegates are the stewards of the Cyber DAO, appointed by token holders to make governance decisions on their behalf.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
  ],
});
